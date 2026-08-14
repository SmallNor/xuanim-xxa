import {DataTypeScheme, MappingScheme} from './types';

const builtInSchemes: Record<string, DataTypeScheme> = {
    any: {type: 'any'},
    string: {type: 'string'},
    number: {type: 'number'},
    boolean: {type: 'boolean', map: [false, true, null]},
    array: {type: 'array'},
    object: {type: 'object'},
};

const equalJSON = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

export default class JSONOptimizer {
    private readonly schemes: MappingScheme;
    private readonly cache: Record<string, DataTypeScheme> = {};

    constructor(mappingScheme: MappingScheme) {
        this.schemes = {...builtInSchemes, ...mappingScheme};
    }

    private getScheme(name: string, fallbackName?: string): DataTypeScheme {
        if (this.cache[name]) {
            return this.cache[name];
        }
        const source = (this.schemes[name] || (fallbackName && this.schemes[fallbackName])) as DataTypeScheme | undefined;
        if (!source || typeof source !== 'object') {
            throw new Error(`喧喧协议缺少 ${name} 数据定义`);
        }

        let scheme: DataTypeScheme = {...source, props: source.props?.map((item) => ({...item}))};
        if (!(scheme.type in builtInSchemes) || name !== scheme.type) {
            const base = this.getScheme(scheme.type);
            scheme = {...base, ...scheme, type: base.type, props: scheme.props || base.props};
        }
        if (scheme.extend) {
            const base = this.getScheme(scheme.extend);
            const props = base.props?.map((item) => ({...item})) || [];
            for (const prop of scheme.props || []) {
                const index = props.findIndex((item) => item.name === prop.name);
                if (index >= 0) {
                    props[index] = prop;
                } else {
                    props.push(prop);
                }
            }
            scheme = {...base, ...scheme, type: base.type, props};
        }
        if (scheme.props) {
            scheme.props = scheme.props.map((prop) => {
                const base = this.getScheme(prop.type);
                return {...base, ...prop, type: base.type};
            });
        }
        this.cache[name] = scheme;
        return scheme;
    }

    private encodeWithScheme(scheme: DataTypeScheme, data: unknown): unknown {
        const value = data === undefined ? scheme.default : data;
        if (scheme.map) {
            const entries = Array.isArray(scheme.map) ? scheme.map.entries() : Object.entries(scheme.map);
            for (const [index, mappedValue] of entries) {
                if (equalJSON(mappedValue, value)) {
                    return Array.isArray(scheme.map) ? index : String(index);
                }
            }
        }
        if (value == null) {
            return value;
        }
        if (scheme.type === 'object') {
            const object = value as Record<string, unknown>;
            const encoded = (scheme.props || []).map((prop) => this.encodeWithScheme(prop, object[prop.name || '']));
            if (this.schemes.$omitDefaultProps) {
                while (encoded.length && equalJSON(encoded.at(-1), scheme.props?.at(encoded.length - 1)?.default)) {
                    encoded.pop();
                }
            }
            return encoded;
        }
        if (scheme.type === 'array' && Array.isArray(value) && scheme.arrType) {
            const itemScheme = this.getScheme(scheme.arrType);
            return value.map((item) => this.encodeWithScheme(itemScheme, item));
        }
        return value;
    }

    private decodeWithScheme(scheme: DataTypeScheme, data: unknown): unknown {
        if (data != null && scheme.map && (typeof data === 'number' || typeof data === 'string')) {
            const mapped = Array.isArray(scheme.map) ? scheme.map[Number(data)] : scheme.map[String(data)];
            if (mapped !== undefined) {
                return mapped;
            }
        }
        if (data == null) {
            return data;
        }
        if (scheme.type === 'object') {
            if (!Array.isArray(data)) {
                throw new Error('喧喧协议返回了无效对象');
            }
            const result: Record<string, unknown> = {};
            (scheme.props || []).forEach((prop, index) => {
                const value = index < data.length ? this.decodeWithScheme(prop, data[index]) : prop.default;
                if (value !== undefined && prop.name) {
                    result[prop.name] = value;
                }
            });
            return result;
        }
        if (scheme.type === 'array') {
            if (!Array.isArray(data) || !scheme.arrType) {
                return data;
            }
            const itemScheme = this.getScheme(scheme.arrType);
            return data.map((item) => this.decodeWithScheme(itemScheme, item));
        }
        if (scheme.type === 'number' && typeof data === 'string') {
            return data ? Number(data) : 0;
        }
        if (scheme.type === 'boolean' && typeof data !== 'boolean') {
            return data === 1 || data === '1' || data === 'true';
        }
        if (scheme.type === 'string' && typeof data !== 'string') {
            return String(data);
        }
        return data;
    }

    encode(name: string, data: unknown, fallbackName?: string): unknown {
        const encoded = this.encodeWithScheme(this.getScheme(name, fallbackName), data);
        return this.schemes.$encodeName === false ? encoded : [name, encoded];
    }

    decode(data: unknown, name?: string, fallbackName?: string): unknown {
        let encoded = data;
        let schemeName = name;
        if (this.schemes.$encodeName !== false) {
            if (!Array.isArray(encoded) || encoded.length < 2) {
                throw new Error('喧喧协议返回格式无效');
            }
            schemeName = String(encoded[0]);
            encoded = encoded[1];
        }
        if (!schemeName) {
            throw new Error('喧喧协议返回缺少数据类型');
        }
        return this.decodeWithScheme(this.getScheme(schemeName, fallbackName), encoded);
    }
}
