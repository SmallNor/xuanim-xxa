import AES from 'aes-js';
import {File as ExpoFile} from 'expo-file-system';
import md5 from 'md5';
import JSONOptimizer from './json-optimizer';
import {XuanAvatarUpload, XuanChat, XuanCustomerContactData, XuanDepartment, XuanMember, XuanMessage, XuanPacket, XuanProfileUpdate, XuanServerInfo, XuanSession, XuanWorkbenchStats} from './types';

const CLIENT_VERSION = '10.4';
const REQUEST_TIMEOUT = 15000;
const HEARTBEAT_INTERVAL = 60000;
const MAX_RECONNECT_DELAY = 30000;

export const DEFAULT_WORKBENCH_STATS: XuanWorkbenchStats = {
    customerTotal: 2,
    todayNewCustomers: 0,
    todayPayment: 0,
};

export const DEFAULT_CUSTOMER_CONTACT_DATA: XuanCustomerContactData = {
    ...DEFAULT_WORKBENCH_STATS,
    externalContactScale: 2000,
    businessCategory: '\u672a\u77e5',
    weeklyOnlineRevenue: 0,
    weeklyOfflineRevenue: 0,
};

const CUSTOMER_CONTACT_SETTINGS_KEY = 'xxaCustomerContact';

const normalizeWorkbenchStats = (value: unknown): XuanWorkbenchStats => {
    const stats = value && typeof value === 'object' ? value as Partial<XuanWorkbenchStats> : {};
    const count = (input: unknown, fallback: number) => {
        const parsed = Number(input);
        return Number.isInteger(parsed) && parsed >= 0 && parsed <= 999999999 ? parsed : fallback;
    };
    const payment = Number(stats.todayPayment);
    return {
        customerTotal: count(stats.customerTotal, DEFAULT_WORKBENCH_STATS.customerTotal),
        todayNewCustomers: count(stats.todayNewCustomers, DEFAULT_WORKBENCH_STATS.todayNewCustomers),
        todayPayment: Number.isFinite(payment) && payment >= 0 && payment <= 999999999999.99
            ? Math.round(payment * 100) / 100
            : DEFAULT_WORKBENCH_STATS.todayPayment,
    };
};

export const normalizeCustomerContactData = (
    value: unknown,
    fallbackStats: XuanWorkbenchStats = DEFAULT_WORKBENCH_STATS,
): XuanCustomerContactData => {
    const data = value && typeof value === 'object' ? value as Partial<XuanCustomerContactData> : {};
    const count = (input: unknown, fallback: number) => {
        const parsed = Number(input);
        return Number.isInteger(parsed) && parsed >= 0 && parsed <= 999999999 ? parsed : fallback;
    };
    const amount = (input: unknown, fallback: number) => {
        const parsed = Number(input);
        return Number.isFinite(parsed) && parsed >= 0 && parsed <= 999999999999.99
            ? Math.round(parsed * 100) / 100
            : fallback;
    };
    const businessCategory = typeof data.businessCategory === 'string'
        ? data.businessCategory.trim().slice(0, 30)
        : '';
    return {
        externalContactScale: count(data.externalContactScale, DEFAULT_CUSTOMER_CONTACT_DATA.externalContactScale),
        businessCategory: businessCategory || DEFAULT_CUSTOMER_CONTACT_DATA.businessCategory,
        customerTotal: count(data.customerTotal, fallbackStats.customerTotal),
        todayNewCustomers: count(data.todayNewCustomers, fallbackStats.todayNewCustomers),
        todayPayment: amount(data.todayPayment, fallbackStats.todayPayment),
        weeklyOnlineRevenue: amount(data.weeklyOnlineRevenue, DEFAULT_CUSTOMER_CONTACT_DATA.weeklyOnlineRevenue),
        weeklyOfflineRevenue: amount(data.weeklyOfflineRevenue, DEFAULT_CUSTOMER_CONTACT_DATA.weeklyOfflineRevenue),
    };
};

export type XuanImageAsset = {
    uri: string;
    width: number;
    height: number;
    fileName?: string | null;
    fileSize?: number;
    mimeType?: string;
    file?: File;
};

type UploadedFile = {
    id: number;
    time: number;
    name: string;
    hasThumb?: boolean;
    thumbnailWidth?: number;
    thumbnailHeight?: number;
};

type PendingRequest = {
    resolve: (value: unknown) => void;
    reject: (reason: Error) => void;
    timer: ReturnType<typeof setTimeout>;
};

type PacketListener = (packet: XuanPacket) => void;

const appendFormFile = (
    form: FormData,
    field: string,
    image: {uri: string; file?: Blob},
    fileName: string,
) => {
    if (image.file) {
        form.append(field, image.file, fileName);
        return;
    }
    form.append(field, new ExpoFile(image.uri) as unknown as Blob);
};

const normalizeServer = (input: string) => {
    let server = input.trim();
    if (!/^https?:\/\//i.test(server)) {
        server = `http://${server}`;
    }
    return server.replace(/\/+$/, '');
};

const loadCompanyName = async (info: XuanServerInfo, server: string) => {
    if (info.company?.trim() || !info.backendURL) return;
    try {
        const backend = new URL(info.backendURL);
        const xuanServer = new URL(server);
        if (['127.0.0.1', 'localhost', '::1'].includes(backend.hostname)) {
            backend.hostname = xuanServer.hostname;
        }
        backend.pathname = backend.pathname.endsWith('/') ? backend.pathname + 'index.php' : backend.pathname + '/index.php';
        backend.search = 'm=im&f=company';
        const response = await fetch(backend.toString(), {headers: {Accept: 'application/json'}});
        if (!response.ok) return;
        const result = await response.json() as {company?: unknown};
        if (typeof result.company === 'string' && result.company.trim()) {
            info.company = result.company.trim();
        }
    } catch {
        // Older servers may not expose company information.
    }
};
const randomGid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const value = Math.floor(Math.random() * 16);
    return (char === 'x' ? value : (value & 0x3) | 0x8).toString(16);
});

const normalizeMessage = (message: XuanMessage): XuanMessage => {
    const deleted = message.deleted as unknown;
    return {...message, deleted: deleted === true || deleted === 1 || deleted === '1' || deleted === 'true'};
};


const normalizeMember = (member: XuanMember): XuanMember => {
    const deleted = member.deleted as unknown;
    return {
        ...member,
        id: Number(member.id),
        dept: member.dept ? Number(member.dept) : 0,
        deleted: deleted === true || deleted === 1 || deleted === '1' || deleted === 'true',
    };
};

const normalizeMembers = (value: unknown): XuanMember[] => {
    const members = Array.isArray(value)
        ? value
        : value && typeof value === 'object' ? Object.values(value) : [];
    return members
        .filter((member): member is XuanMember => !!member && typeof member === 'object' && Number((member as XuanMember).id) > 0)
        .map(normalizeMember);
};

const getPeerMemberID = (chat: XuanChat, currentUserID: number) => {
    const memberID = (Array.isArray(chat.members) ? chat.members : [])
        .map(Number)
        .find((id) => id > 0 && id !== Number(currentUserID));
    return memberID || chat.gid.split('&')
        .map(Number)
        .find((id) => id > 0 && id !== Number(currentUserID));
};

const normalizeMessages = (value: unknown): XuanMessage[] => {
    if (Array.isArray(value)) {
        return value.map((message) => normalizeMessage(message as XuanMessage));
    }
    if (value && typeof value === 'object') {
        const message = value as XuanMessage;
        return message.cgid
            ? [normalizeMessage(message)]
            : Object.values(value as Record<string, XuanMessage>).map(normalizeMessage);
    }
    return [];
};

export class XuanClient {
    readonly server: string;
    readonly account: string;
    readonly info: XuanServerInfo;
    user: XuanMember;

    private readonly passwordHash: string;
    private readonly optimizer: JSONOptimizer;
    private readonly pending = new Map<string, PendingRequest>();
    private readonly listeners = new Set<PacketListener>();
    private socket: WebSocket | null = null;
    private connecting: Promise<XuanSession> | null = null;
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private sequence = 0;
    private manuallyClosed = false;
    private connectedOnce = false;
    private reconnectAttempts = 0;
    private sessionID = '';
    private readonly serverTimeOffset: number;
    private contactScope?: Promise<{ok: boolean; userIds: number[]; departments: XuanDepartment[]}>;

    constructor(server: string, account: string, passwordHash: string, info: XuanServerInfo) {
        this.server = server;
        this.account = account;
        this.passwordHash = passwordHash;
        this.info = info;
        this.user = {id: info.userID, account};
        this.optimizer = new JSONOptimizer(info.apiScheme);
        const serverTime = Number(info.serverTime || 0);
        this.serverTimeOffset = serverTime ? (serverTime < 1_000_000_000_000 ? serverTime * 1000 : serverTime) - Date.now() : 0;
    }

    get serverRoot() {
        return `${new URL(this.server).origin}/`;
    }

    get isConnected() {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    private get socketUrl() {
        if (this.info.socketUrl) {
            return this.info.socketUrl;
        }
        const url = new URL(this.server);
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        url.port = String(this.info.chatPort);
        url.pathname = '/ws';
        url.search = '';
        return url.toString();
    }

    private encrypt(text: string): ArrayBuffer {
        const key = AES.utils.utf8.toBytes(this.info.token);
        const iv = AES.utils.utf8.toBytes(this.info.token.substring(0, 16));
        const cbc = new AES.ModeOfOperation.cbc(key, iv);
        const padded = AES.padding.pkcs7.pad(AES.utils.utf8.toBytes(text));
        const encrypted = new Uint8Array(cbc.encrypt(padded));
        return encrypted.buffer as ArrayBuffer;
    }

    private decrypt(data: ArrayBuffer | ArrayBufferView): string {
        const bytes = ArrayBuffer.isView(data)
            ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
            : new Uint8Array(data);
        const key = AES.utils.utf8.toBytes(this.info.token);
        const iv = AES.utils.utf8.toBytes(this.info.token.substring(0, 16));
        const cbc = new AES.ModeOfOperation.cbc(key, iv);
        return AES.utils.utf8.fromBytes(AES.padding.pkcs7.strip(cbc.decrypt(bytes)));
    }

    private encode(method: string, params: unknown[] | undefined, rid: string) {
        const request: Record<string, unknown> = {
            version: CLIENT_VERSION,
            device: 'mobile',
            lang: 'zh-cn',
            method: method.toLowerCase(),
            rid,
            userID: this.user.id || this.info.userID,
        };
        if (params !== undefined) {
            request.params = params;
        }
        return JSON.stringify(this.optimizer.encode(`${method.toLowerCase()}Request`, request, 'requestPack'));
    }

    private send(method: string, params: unknown[] | undefined, rid: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            throw new Error('消息服务器尚未连接');
        }
        this.socket.send(this.encrypt(this.encode(method, params, rid)));
    }

    private async handleData(raw: unknown) {
        try {
            let data: ArrayBuffer | ArrayBufferView;
            if (raw instanceof ArrayBuffer || ArrayBuffer.isView(raw)) {
                data = raw;
            } else if (typeof Blob !== 'undefined' && raw instanceof Blob) {
                data = await raw.arrayBuffer();
            } else {
                throw new Error('收到不支持的消息格式');
            }
            const decoded = JSON.parse(this.decrypt(data));
            const packet = (Array.isArray(decoded)
                ? this.optimizer.decode(decoded, undefined, 'responsePack')
                : decoded) as XuanPacket;
            packet.method = String(packet.method || '').toLowerCase();
            if (packet.sessionID) this.sessionID = packet.sessionID;
            if (packet.method === 'syssessionid' && typeof packet.data === 'string') {
                this.sessionID = packet.data;
            }

            if (['userlogin', 'userupdate'].includes(packet.method) && packet.result !== 'fail' && packet.data) {
                this.user = {...this.user, ...normalizeMember(packet.data as XuanMember)};
            }

            const pending = packet.rid ? this.pending.get(packet.rid) : undefined;
            if (pending) {
                clearTimeout(pending.timer);
                this.pending.delete(packet.rid!);
                if (packet.result === 'fail') {
                    pending.reject(new Error(packet.message || `${packet.method} 请求失败`));
                } else {
                    pending.resolve(packet.data ?? true);
                }
            }
            this.listeners.forEach((listener) => listener(packet));
        } catch (error) {
            this.listeners.forEach((listener) => listener({
                method: 'clienterror',
                result: 'fail',
                message: error instanceof Error ? error.message : '消息解析失败',
            }));
        }
    }

    private requestOnSocket<T>(method: string, params?: unknown[], fixedRid?: string): Promise<T> {
        const rid = fixedRid || method.toLowerCase() + '_' + Date.now() + '_' + ++this.sequence;
        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pending.delete(rid);
                reject(new Error(method + ' 请求超时'));
            }, REQUEST_TIMEOUT);
            this.pending.set(rid, {resolve: resolve as (value: unknown) => void, reject, timer});
            try {
                this.send(method, params, rid);
            } catch (error) {
                clearTimeout(timer);
                this.pending.delete(rid);
                reject(error);
            }
        });
    }

    private stopHeartbeat() {
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            const socket = this.socket;
            void this.request('ping').catch(() => {
                if (this.socket === socket) socket?.close();
            });
        }, HEARTBEAT_INTERVAL);
    }

    private scheduleReconnect() {
        if (this.manuallyClosed || this.reconnectTimer) return;
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts++, MAX_RECONNECT_DELAY);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            void this.connect(true).catch(() => this.scheduleReconnect());
        }, delay);
    }

    private async openAndLogin(simple: boolean): Promise<XuanSession> {
        this.manuallyClosed = false;
        await new Promise<void>((resolve, reject) => {
            const socket = new WebSocket(this.socketUrl);
            let opened = false;
            socket.binaryType = 'arraybuffer';
            this.socket = socket;
            const timer = setTimeout(() => {
                socket.close();
                reject(new Error('连接消息服务器超时'));
            }, REQUEST_TIMEOUT);
            socket.onopen = () => {
                opened = true;
                clearTimeout(timer);
                resolve();
            };
            socket.onerror = () => {
                clearTimeout(timer);
                if (!opened) reject(new Error('无法连接消息服务器'));
            };
            socket.onmessage = (event) => void this.handleData(event.data);
            socket.onclose = () => {
                clearTimeout(timer);
                const isCurrentSocket = this.socket === socket;
                if (isCurrentSocket) this.socket = null;
                if (!opened) reject(new Error('无法连接消息服务器'));
                if (!isCurrentSocket) return;
                this.stopHeartbeat();
                this.pending.forEach((pending) => {
                    clearTimeout(pending.timer);
                    pending.reject(new Error('消息服务器连接已断开'));
                });
                this.pending.clear();
                if (!this.manuallyClosed) {
                    this.listeners.forEach((listener) => listener({method: 'disconnect', result: 'fail', message: '消息服务器连接已断开'}));
                    if (this.connectedOnce) this.scheduleReconnect();
                }
            };
        });

        try {
            const user = await this.requestOnSocket<XuanMember>('userLogin', [
                '',
                this.account,
                this.passwordHash,
                {status: 'online', simple},
            ], 'login_mobile_' + this.account);
            this.user = {...this.user, ...normalizeMember(user)};
        } catch (error) {
            this.socket?.close();
            throw error;
        }
        this.connectedOnce = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        if (simple) {
            this.listeners.forEach((listener) => listener({method: 'reconnect', result: 'success'}));
        }
        return {server: this.server, account: this.account, user: this.user};
    }

    connect(simple = false): Promise<XuanSession> {
        if (this.connecting) return this.connecting;
        if (this.isConnected && this.connectedOnce) {
            return Promise.resolve({server: this.server, account: this.account, user: this.user});
        }
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
        const connecting = this.openAndLogin(simple);
        this.connecting = connecting;
        return connecting.finally(() => {
            if (this.connecting === connecting) this.connecting = null;
        });
    }

    request<T>(method: string, params?: unknown[], fixedRid?: string): Promise<T> {
        if (this.connecting) {
            return this.connecting.then(() => this.requestOnSocket<T>(method, params, fixedRid));
        }
        if (!this.isConnected && this.connectedOnce && !this.manuallyClosed) {
            return this.connect(true).then(() => this.requestOnSocket<T>(method, params, fixedRid));
        }
        return this.requestOnSocket<T>(method, params, fixedRid);
    }

    subscribe(listener: PacketListener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    async getChats(): Promise<XuanChat[]> {
        const chats = await this.request<XuanChat[]>('chatGetList');
        const normalized = (Array.isArray(chats) ? chats : []).map((chat) => ({
            ...chat,
            lastMessageInfo: chat.lastMessageInfo ? normalizeMessage(chat.lastMessageInfo) : chat.lastMessageInfo,
        }));
        const peerIDs = [...new Set(normalized
            .filter((chat) => chat.type === 'one2one' && !chat.name?.trim())
            .map((chat) => getPeerMemberID(chat, this.user.id))
            .filter((id): id is number => id !== undefined))];
        if (!peerIDs.length) return normalized;
        const members = await this.getMembers(peerIDs);
        const memberMap = new Map(members.map((member) => [member.id, member]));
        return normalized.map((chat) => {
            if (chat.type !== 'one2one' || chat.name?.trim()) return chat;
            const peer = memberMap.get(getPeerMemberID(chat, this.user.id) || 0);
            return peer ? {...chat, name: peer.realname || peer.account, avatar: peer.avatar || chat.avatar} : chat;
        });
    }

    async deleteChat(cgid: string): Promise<void> {
        await this.request('chatFreeze', [true, cgid]);
    }

    async setChatStar(cgid: string, star: boolean): Promise<void> {
        await this.request('chatStar', [star, cgid]);
    }

    async markChatUnread(cgid: string): Promise<void> {
        await this.request('chatSetLastReadMessageByIndex', [cgid, 0]);
    }

    async hideChat(cgid: string): Promise<void> {
        await this.request('chatHide', [true, cgid]);
    }

    private getContactScope() {
        if (!this.contactScope) {
            this.contactScope = this.fetchContactScope().finally(() => {
                queueMicrotask(() => { this.contactScope = undefined; });
            });
        }
        return this.contactScope;
    }

    private httpAuthParams() {
        let authToken = this.info.authToken || this.passwordHash;
        if (this.info.authToken) {
            if (authToken.length === 64) {
                const window = this.info.authTokenAuthWindow || 20;
                authToken = md5(`${this.account}${authToken}${Math.round((Date.now() + this.serverTimeOffset) / 1000 / window)}`);
            } else if (authToken.length >= 32) {
                authToken = authToken.substring(0, 32);
            }
            authToken += md5(authToken);
        }
        return {
            auth_account: this.account,
            auth_token: authToken,
            auth_device: 'mobile',
        };
    }

    private async fetchContactScope(): Promise<{ok: boolean; userIds: number[]; departments: XuanDepartment[]}> {
        const empty = {ok: false, userIds: [] as number[], departments: [] as XuanDepartment[]};
        if (!this.info.backendURL) return empty;
        try {
            const backend = new URL(this.info.backendURL, this.serverRoot);
            const server = new URL(this.server);
            if (['127.0.0.1', 'localhost', '::1'].includes(backend.hostname)) {
                backend.hostname = server.hostname;
            }
            backend.pathname = backend.pathname.endsWith('/') ? backend.pathname + 'index.php' : backend.pathname + '/index.php';
            backend.search = '';
            backend.hash = '';
            backend.searchParams.set('m', 'im');
            backend.searchParams.set('f', 'contacts');
            Object.entries(this.httpAuthParams()).forEach(([key, value]) => backend.searchParams.set(key, value));
            const response = await fetch(backend.toString(), {headers: {Accept: 'application/json'}});
            if (!response.ok) return empty;
            const result = await response.json() as {result?: string; users?: unknown; depts?: Record<string, Omit<XuanDepartment, 'id'>>};
            if (result.result !== 'success') return empty;
            const userIds = (Array.isArray(result.users) ? result.users : [])
                .map(Number)
                .filter((id) => Number.isInteger(id) && id > 0);
            const departments = Object.entries(result.depts || {})
                .map(([id, department]) => ({...department, id: Number(id)}))
                .sort((left, right) => (left.order || 0) - (right.order || 0) || left.id - right.id);
            return {ok: true, userIds, departments};
        } catch {
            return empty;
        }
    }

    async getMembers(memberIDs: number[] = []): Promise<XuanMember[]> {
        let ids = (Array.isArray(memberIDs) ? memberIDs : [])
            .map(Number)
            .filter((id) => Number.isInteger(id) && id > 0);
        if (!ids.length) {
            const scoped = await this.getContactScope();
            ids = scoped.ok ? scoped.userIds : [];
            if (!ids.length) return [];
        }
        return normalizeMembers(await this.request<unknown>('userGetList', [ids]));
    }

    async searchMembers(search: string): Promise<XuanMember[]> {
        const keyword = search.trim();
        if (!keyword) return [];
        const pager = {pageID: 1, recPerPage: 50, recTotal: 0};
        const results = normalizeMembers(await this.request<unknown>('userSearch', [
            keyword,
            {dept: 0, limit: 50, ...pager, pager},
            false,
        ]));
        const scoped = await this.getContactScope();
        if (!scoped.ok) return [];
        const allowed = new Set(scoped.userIds);
        return results.filter((member) => allowed.has(member.id));
    }

    async getChatMembers(gid: string): Promise<XuanMember[]> {
        const response = await this.request<unknown>('chatgetmembers', [gid]);
        const memberData = response && typeof response === 'object' && 'members' in response
            ? (response as {members?: unknown}).members
            : response;
        const entries = Array.isArray(memberData)
            ? memberData
            : memberData && typeof memberData === 'object' ? Object.values(memberData) : [];
        const embedded = entries
            .filter((member): member is XuanMember => !!member && typeof member === 'object' && Number((member as XuanMember).id) > 0)
            .map(normalizeMember);
        const memberIDs = [...new Set(entries
            .map((member) => typeof member === 'object' && member
                ? Number((member as {id?: unknown; user?: unknown; userID?: unknown}).id
                    ?? (member as {user?: unknown}).user
                    ?? (member as {userID?: unknown}).userID)
                : Number(member))
            .filter((id) => Number.isInteger(id) && id > 0))];
        if (!memberIDs.length) return embedded;
        try {
            return await this.getMembers(memberIDs);
        } catch {
            return embedded;
        }
    }

    async getDepartmentMembers(departmentID: number): Promise<XuanMember[]> {
        const memberIDs = await this.request<number[]>('userGetListByDept', [
            departmentID,
            {pageID: 1, recPerPage: 2000},
            '',
            [],
            true,
        ]);
        const ids = (Array.isArray(memberIDs) ? memberIDs : [])
            .map(Number)
            .filter((id) => Number.isInteger(id) && id > 0);
        if (!ids.length) return [];
        const members = normalizeMembers(await this.request<unknown>('userGetList', [ids]));
        const scoped = await this.getContactScope();
        if (!scoped.ok) return [];
        const allowed = new Set(scoped.userIds);
        return members.filter((member) => allowed.has(member.id));
    }

    async getDepartments(): Promise<XuanDepartment[]> {
        const scoped = await this.getContactScope();
        if (scoped.ok) return scoped.departments;
        return [];
    }

    async getWorkbenchStats(): Promise<XuanWorkbenchStats> {
        if (this.user.admin !== 'super' && this.user.admin !== 'common') {
            throw new Error('当前账号没有工作台权限');
        }
        if (!this.info.authToken) {
            throw new Error('工作台登录凭证不可用');
        }
        const response = await fetch(`${this.serverRoot}workbenchStats`, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${this.info.authToken}`,
                'X-Account': this.account,
            },
        });
        const text = await response.text();
        let result: {result?: string; message?: string; data?: unknown};
        try {
            result = JSON.parse(text) as typeof result;
        } catch {
            throw new Error(text.trim() || `工作台数据返回异常（${response.status}）`);
        }
        if (!response.ok || result.result !== 'success') {
            throw new Error(result.message || '工作台数据获取失败');
        }
        return normalizeWorkbenchStats(result.data);
    }

    async getCustomerContactData(fallbackStats: XuanWorkbenchStats): Promise<XuanCustomerContactData | null> {
        const settings = await this.request<Record<string, unknown>>('userSyncSettings', ['', [CUSTOMER_CONTACT_SETTINGS_KEY]]);
        const data = settings?.[CUSTOMER_CONTACT_SETTINGS_KEY];
        return data && typeof data === 'object' ? normalizeCustomerContactData(data, fallbackStats) : null;
    }

    async saveCustomerContactData(data: XuanCustomerContactData): Promise<XuanCustomerContactData> {
        const normalized = normalizeCustomerContactData(data, data);
        await this.request('userSyncSettings', ['', {[CUSTOMER_CONTACT_SETTINGS_KEY]: normalized}]);
        return normalized;
    }

    async getDirectChat(member: XuanMember): Promise<XuanChat> {
        const gid = [this.user.id, member.id].sort((left, right) => left - right).join('&');
        const existing = (await this.getChats()).find((chat) => chat.gid === gid);
        if (existing) {
            return {...existing, name: existing.name || member.realname || member.account, avatar: existing.avatar || member.avatar};
        }
        const chat = await this.request<XuanChat>('chatCreate', [gid, '', 'one2one', [this.user.id, member.id], 0, false]);
        return {...chat, gid, type: 'one2one', name: member.realname || member.account, avatar: member.avatar};
    }

    async getMessages(cgid: string, limit = 40): Promise<XuanMessage[]> {
        const info = await this.request<{lastMessage: number; messageCount: number}>('chatGetMessageInfo', [cgid]);
        if (!info?.lastMessage || !info.messageCount) {
            return [];
        }
        const synced = await this.request<number[] | XuanMessage[]>('messageSync', [cgid, info.lastMessage, true, limit, true]);
        if (!synced.length) {
            return [];
        }
        const messages = typeof synced[0] === 'number'
            ? await this.request<XuanMessage[]>('messageGetList', [cgid, synced, 0])
            : synced as XuanMessage[];
        return normalizeMessages(messages).sort((left, right) => left.date - right.date);
    }

    async markChatRead(cgid: string, messageIndex: number): Promise<void> {
        await this.request('chatSetLastReadMessageByIndex', [cgid, messageIndex]);
    }

    async sendText(cgid: string, content: string): Promise<XuanMessage[]> {
        const message = {
            gid: randomGid(),
            cgid,
            user: this.user.id,

            content,
            contentType: 'plain',
            type: 'normal',
            data: '',
            deleted: false,
        };
        return normalizeMessages(await this.request<unknown>('messageSend', [[message]]));
    }

    async sendImage(cgid: string, image: XuanImageAsset): Promise<XuanMessage[]> {
        const messageGid = randomGid();
        const mimeType = image.mimeType || 'image/jpeg';
        const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
        const fileName = image.fileName || `image_${Date.now()}.${extension}`;
        const form = new FormData();
        appendFormFile(form, 'file', image, fileName);
        form.append('userID', String(this.user.id));
        form.append('gid', cgid);

        const headers: Record<string, string> = {Authorization: this.info.token};
        if (this.serverName) headers.ServerName = this.serverName;
        const response = await fetch(`${this.serverRoot}fileUpload`, {method: 'POST', headers, body: form});
        const text = await response.text();
        let result: {result?: string; message?: string; data?: UploadedFile};
        try {
            result = JSON.parse(text) as typeof result;
        } catch {
            throw new Error(text.trim() || `图片上传异常（${response.status}）`);
        }
        if (!response.ok || result.result !== 'success' || !result.data?.id) {
            throw new Error(result.message || '图片上传失败');
        }

        const uploaded = result.data;
        const message = {
            gid: messageGid,
            cgid,
            user: this.user.id,
            content: JSON.stringify({
                gid: messageGid,
                id: uploaded.id,
                name: uploaded.name || fileName,
                senderId: this.user.id,
                send: true,
                height: image.height,
                width: image.width,
                size: image.fileSize,
                time: uploaded.time * 1000,
                type: mimeType,
                hasThumb: !!uploaded.hasThumb,
                thumbnailWidth: uploaded.thumbnailWidth || 0,
                thumbnailHeight: uploaded.thumbnailHeight || 0,
                isImage: true,
                mediaType: 'image',
            }),
            contentType: 'image',
            type: 'normal',
            data: '',
            deleted: false,
        };
        return normalizeMessages(await this.request<unknown>('messageSend', [[message]]));
    }

    async updateProfile(update: XuanProfileUpdate): Promise<XuanMember> {
        await this.request<XuanMember>('userUpdate', [{
            account: this.user.account,
            status: '',
            ...update,
        }]);
        const [persisted] = await this.getMembers([this.user.id]);
        if (!persisted) {
            throw new Error('\u4e2a\u4eba\u4fe1\u606f\u5df2\u63d0\u4ea4\uff0c\u4f46\u670d\u52a1\u5668\u8bfb\u53d6\u5931\u8d25');
        }
        const mismatch = (Object.keys(update) as (keyof XuanProfileUpdate)[]).find((key) => (
            update[key] !== undefined && String(persisted[key] ?? '') !== String(update[key] ?? '')
        ));
        if (mismatch) {
            throw new Error('\u4e2a\u4eba\u4fe1\u606f\u672a\u4fdd\u5b58\u5230\u670d\u52a1\u5668\uff0c\u8bf7\u91cd\u8bd5');
        }
        this.user = {...this.user, ...persisted};
        return this.user;
    }

    async uploadAvatar(image: XuanAvatarUpload): Promise<XuanMember> {
        if (!this.info.backendURL) {
            throw new Error('\u5f53\u524d\u670d\u52a1\u5668\u4e0d\u652f\u6301\u4fee\u6539\u5934\u50cf');
        }
        const backend = new URL(this.info.backendURL, this.serverRoot);
        const server = new URL(this.server);
        if (['127.0.0.1', 'localhost', '::1'].includes(backend.hostname)) {
            backend.hostname = server.hostname;
        }
        backend.search = '';
        backend.hash = '';

        let authToken = this.info.authToken || this.passwordHash;
        if (this.info.authToken) {
            if (authToken.length === 64) {
                const window = this.info.authTokenAuthWindow || 20;
                authToken = md5(`${this.account}${authToken}${Math.round((Date.now() + this.serverTimeOffset) / 1000 / window)}`);
            } else if (authToken.length >= 32) {
                authToken = authToken.substring(0, 32);
            }
            authToken += md5(authToken);
        }

        const params = {
            lite: '0',
            auth_account: this.account,
            auth_token: authToken,
            auth_device: 'mobile',
        };
        const backendRoot = backend.toString().replace(/\/+$/, '');
        let uploadURL: string;
        if (this.info.requestType === 'PATH_INFO') {
            const fix = this.info.requestFix ?? '-';
            const values = Object.values(params).map((value) => encodeURIComponent(value));
            uploadURL = `${backendRoot}/user${fix}uploadAvatar${values.length ? `${fix}${values.join(fix)}` : ''}.html`;
        } else {
            const url = new URL(`${backendRoot}/index.php`);
            url.searchParams.set('m', 'user');
            url.searchParams.set('f', 'uploadAvatar');
            Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
            uploadURL = url.toString();
        }

        const form = new FormData();
        const mimeType = image.mimeType || 'image/jpeg';
        const fileName = image.fileName || `avatar.${mimeType === 'image/png' ? 'png' : 'jpg'}`;
        appendFormFile(form, 'files', image, fileName);

        const webOrigin = typeof globalThis.location?.origin === 'string' ? globalThis.location.origin : '';
        const isWebCrossOrigin = !!webOrigin && new URL(uploadURL).origin !== webOrigin;
        let response: Response;
        try {
            response = await fetch(uploadURL, {
                method: 'POST',
                headers: isWebCrossOrigin ? undefined : {'X-Requested-With': 'XMLHttpRequest'},
                body: form,
                mode: isWebCrossOrigin ? 'no-cors' : undefined,
            });
        } catch (reason) {
            const detail = reason instanceof Error ? reason.message : '';
            throw new Error(detail
                ? `\u5934\u50cf\u4e0a\u4f20\u5931\u8d25\uff1a${detail}`
                : '\u5934\u50cf\u4e0a\u4f20\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc');
        }
        if (!isWebCrossOrigin) {
            const text = await response.text();
            let result: {result?: string; message?: string};
            try {
                result = JSON.parse(text) as {result?: string; message?: string};
            } catch {
                throw new Error(text || `\u5934\u50cf\u4e0a\u4f20\u5931\u8d25\uff08${response.status}\uff09`);
            }
            if (!response.ok || result.result !== 'success') {
                throw new Error(result.message || `\u5934\u50cf\u4e0a\u4f20\u5931\u8d25\uff08${response.status}\uff09`);
            }
        }

        const [updated] = await this.getMembers([this.user.id]);
        if (!updated) {
            throw new Error('\u5934\u50cf\u5df2\u4e0a\u4f20\uff0c\u4f46\u7528\u6237\u8d44\u6599\u5237\u65b0\u5931\u8d25');
        }
        if (isWebCrossOrigin && updated.avatar === this.user.avatar) {
            throw new Error('\u5934\u50cf\u4e0a\u4f20\u672a\u751f\u6548\uff0c\u8bf7\u91cd\u8bd5');
        }
        const avatarURL = this.resolveAsset(updated.avatar);
        if (avatarURL && /^https?:\/\//i.test(avatarURL)) {
            const freshAvatar = new URL(avatarURL);
            freshAvatar.searchParams.set('v', String(Date.now()));
            updated.avatar = freshAvatar.toString();
        }
        this.user = {...this.user, ...updated};
        return this.user;
    }

    async logout() {
        this.manuallyClosed = true;
        try {
            await Promise.race([
                this.request<XuanMember>('userLogout', [true], `logout_mobile_${this.user.id}`),
                new Promise<void>((resolve) => setTimeout(resolve, 1200)),
            ]);
        } catch {
            // The server closes the socket immediately after a normal logout request.
        } finally {
            this.close();
        }
    }

    resolveAsset(path: unknown): string | undefined {
        if (path && typeof path === 'object') {
            const avatar = (path as {avatar?: unknown}).avatar;
            const data = (path as {data?: unknown}).data;
            if (typeof avatar === 'string') {
                path = avatar;
            } else if (data && typeof data === 'object') {
                path = (data as {imgUrl?: unknown; url?: unknown}).imgUrl
                    ?? (data as {url?: unknown}).url;
            }
        }
        if (typeof path !== 'string' || !path) {
            return undefined;
        }
        const assetPath = path.startsWith('$') ? path.substring(1) : path;
        if (/^(data:|file:)/i.test(assetPath)) return assetPath;
        if (/^https?:\/\//i.test(assetPath)) {
            const url = new URL(assetPath);
            if (['127.0.0.1', 'localhost', '::1'].includes(url.hostname)) {
                url.hostname = new URL(this.server).hostname;
            }
            url.pathname = '/' + url.pathname.replace(/^\/+/, '');
            return url.toString();
        }
        return this.serverRoot + assetPath.replace(/^\/+/, '');
    }

    resolveMessageImage(message: XuanMessage) {
        if (message.contentType !== 'image') return undefined;
        let image: Record<string, unknown>;
        try {
            image = JSON.parse(message.content) as Record<string, unknown>;
        } catch {
            return undefined;
        }
        if (image.type === 'base64' && typeof image.content === 'string') {
            return {uri: image.content, width: Number(image.width) || 0, height: Number(image.height) || 0};
        }
        if (typeof image.url === 'string') {
            return {uri: this.resolveAsset(image.url)!, width: Number(image.width) || 0, height: Number(image.height) || 0};
        }
        if (!image.id || !image.name || !image.time || !this.sessionID) return undefined;
        const fileName = image.hasThumb ? `thumb_${image.name}` : String(image.name);
        const time = Number(image.time) >= 1_000_000_000_000 ? Math.floor(Number(image.time) / 1000) : Number(image.time);
        const params = [
            ['fileName', fileName],
            ['time', String(time)],
            ['id', String(image.id)],
            ['gid', String(this.user.id)],
            ['sid', md5(this.sessionID + fileName)],
            ['preview', '1'],
        ];
        if (this.serverName) params.push(['ServerName', this.serverName]);
        return {
            uri: `${this.serverRoot}fileDownload?${params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')}`,
            width: Number(image.width || image.thumbnailWidth) || 0,
            height: Number(image.height || image.thumbnailHeight) || 0,
        };
    }

    private get serverName() {
        const url = new URL(this.server);
        return url.username || url.pathname.replace(/^\/+|\/+$/g, '');
    }

    close() {
        this.manuallyClosed = true;
        this.stopHeartbeat();
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
        const socket = this.socket;
        this.socket = null;
        socket?.close();
        this.pending.forEach((pending) => {
            clearTimeout(pending.timer);
            pending.reject(new Error('消息服务器连接已关闭'));
        });
        this.pending.clear();
    }
}

export async function loginXuan(serverInput: string, accountInput: string, password: string) {
    const server = normalizeServer(serverInput);
    const account = accountInput.trim();
    if (!server || !account || !password) {
        throw new Error('请填写服务器、账号和密码');
    }
    const passwordHash = md5(password);
    let response: Response;
    try {
        response = await fetch(`${server}/serverInfo`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: JSON.stringify({
                method: 'sysgetserverinfo',
                params: ['', account, passwordHash, ''],
                version: CLIENT_VERSION,
                device: 'mobile',
                lang: 'zh-cn',
            }),
        });
    } catch {
        throw new Error('无法连接服务器，请检查地址和网络');
    }
    const text = await response.text();
    let info: XuanServerInfo;
    try {
        const responseInfo = JSON.parse(text) as XuanServerInfo;
        info = responseInfo.result === 'success' && responseInfo.data && typeof responseInfo.data === 'object'
            ? {...responseInfo, ...responseInfo.data as Partial<XuanServerInfo>}
            : responseInfo;
    } catch {
        throw new Error(text || `服务器返回异常（${response.status}）`);
    }
    if (!response.ok || info.result !== 'success' || !info.token || !info.apiScheme) {
        throw new Error(info.message || '账号或密码错误');
    }
    const client = new XuanClient(server, account, passwordHash, info);
    const session = await client.connect();
    await loadCompanyName(info, server);
    return {client, session};
}

export {normalizeMessages};
export type {XuanAvatarUpload, XuanChat, XuanCustomerContactData, XuanDepartment, XuanMember, XuanMessage, XuanPacket, XuanProfileUpdate, XuanSession, XuanWorkbenchStats};
