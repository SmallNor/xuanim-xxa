export type DataTypeScheme = {
    type: string;
    name?: string;
    props?: DataTypeScheme[];
    extend?: string;
    arrType?: string;
    default?: unknown;
    map?: unknown[] | Record<string, unknown>;
    required?: boolean;
};

export type MappingScheme = Record<string, DataTypeScheme | string | boolean | number> & {
    $version: string;
    $encodeName?: boolean;
    $omitDefaultProps?: boolean;
};

export type XuanMember = {
    id: number;
    account: string;
    realname?: string;
    avatar?: string;
    gender?: string;
    status?: string;
    dept?: number;
    role?: string;
    email?: string;
    mobile?: string;
    phone?: string;
    address?: string;
    weixin?: string;
    qq?: string;
    deleted?: boolean;
};


export type XuanProfileUpdate = Partial<Pick<XuanMember,
    'realname' | 'gender' | 'mobile' | 'phone' | 'email' | 'address' | 'weixin' | 'qq'
>>;

export type XuanAvatarUpload = {
    uri: string;
    fileName?: string | null;
    mimeType?: string;
    file?: Blob;
};

export type XuanDepartment = {
    id: number;
    name: string;
    order?: number;
    parent?: number;
    path?: string;
    manager?: string;
};

export type XuanMessage = {
    id?: number;
    index?: number;
    gid: string;
    cgid: string;
    user: number;
    date: number;
    content: string;
    contentType?: string;
    type?: string;
    data?: unknown;
    deleted?: boolean;
};

export type XuanChat = {
    id?: number;
    gid: string;
    name?: string;
    type?: 'group' | 'one2one' | 'system' | 'robot' | string;
    members?: number[];
    avatar?: unknown;
    lastActiveTime?: number;
    lastMessage?: number;
    lastMessageInfo?: XuanMessage | null;
    lastReadMessageIndex?: number;
    freeze?: boolean;
    hide?: boolean;
};

export type XuanPacket<T = unknown> = {
    rid?: string;
    method: string;
    module?: string;
    device?: string;
    data?: T;
    result?: 'success' | 'fail';
    message?: string;
    sessionID?: string;
    userID?: number;
};

export type XuanServerInfo = {
    result: 'success' | 'fail';
    message?: string;
    data?: unknown;
    userID: number;
    token: string;
    chatPort: number;
    socketUrl?: string;
    backendURL?: string;
    requestType?: string;
    requestFix?: string;
    serverTime?: number;
    authToken?: string;
    authTokenAuthWindow?: number;
    enableClientAES?: number | boolean;
    apiScheme: MappingScheme;
    version: string;
    company?: string;
};

export type XuanSession = {
    server: string;
    account: string;
    user: XuanMember;
};

export type XuanWorkbenchStats = {
    customerTotal: number;
    todayNewCustomers: number;
    todayPayment: number;
};
