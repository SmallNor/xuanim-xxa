import {useEffect, useMemo, useRef, useState} from 'react';
import {
    ActivityIndicator, Alert, BackHandler, FlatList, Image, Keyboard, KeyboardAvoidingView, Modal, Platform,
    Pressable, RefreshControl, StyleSheet, Text, TextInput, View,
} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
    Check, ChevronDown, Coffee, Eye, EyeOff, LockKeyhole, MessageCircle, MessageSquareCode,
    MessagesSquare, RefreshCw, ScanLine, Search, Server, Sparkles, UserRound, X,
} from 'lucide-react-native';
import appConfig from '../../app.json';
import {DEFAULT_WORKBENCH_STATS, loginXuan, normalizeMessages, XuanChat, XuanClient, XuanDepartment, XuanImageAsset, XuanMember, XuanMessage, XuanSession, XuanWorkbenchStats} from '../api/xuan';
import AccountScreen from './AccountScreen';
import ContactsScreen from './ContactsScreen';
import MemberProfileScreen from './MemberProfileScreen';
import WorkbenchScreen from './WorkbenchScreen';
import {
    AttachmentCalendarIcon, AttachmentCallIcon, AttachmentCameraIcon, AttachmentDocumentIcon,
    AttachmentFavoriteIcon, AttachmentImageIcon, AttachmentMeetingIcon, AttachmentRedPacketIcon,
    ChatOutlineIcon, MeetingIcon, MenuDeviceIcon, QuickTodoIcon, WecomAddIcon,
    WecomChatBackIcon, WecomChatMoreIcon, WecomChatPlusIcon, WecomChatSmileIcon,
    WecomChatSparkleIcon, WecomChatVoiceIcon, WecomContactsIcon, WecomDocsIcon, WecomMailIcon,
    WecomMessageIcon, WecomSearchIcon, WecomWorkbenchIcon,
} from './wecom-icons';

const avatarColors = ['#4d9de0', '#48b97d', '#e49b45', '#8e78d4', '#55a9a2'];

const bottomTabs = [
    {key: 'message', label: '消息', icon: WecomMessageIcon},
    {key: 'mail', label: '邮件', icon: WecomMailIcon},
    {key: 'docs', label: '文档', icon: WecomDocsIcon},
    {key: 'work', label: '工作台', icon: WecomWorkbenchIcon},
    {key: 'contacts', label: '通讯录', icon: WecomContactsIcon},
];

const chatAttachmentActions = [
    {key: 'image', label: '图片', icon: AttachmentImageIcon},
    {key: 'camera', label: '拍摄', icon: AttachmentCameraIcon},
    {key: 'favorite', label: '收藏', icon: AttachmentFavoriteIcon},
    {key: 'call', label: '语音通话', icon: AttachmentCallIcon},
    {key: 'red-packet', label: '红包', icon: AttachmentRedPacketIcon},
    {key: 'document', label: '文档', icon: AttachmentDocumentIcon},
    {key: 'calendar', label: '日程', icon: AttachmentCalendarIcon},
    {key: 'meeting', label: '快速会议', icon: AttachmentMeetingIcon},
];

const getTimestamp = (value?: number) => value && value < 1_000_000_000_000 ? value * 1000 : value || 0;

const configuredXuanServer = Platform.OS === 'web'
    ? appConfig.expo.extra.xuanWebServer
    : appConfig.expo.extra.xuanServer;

const workbenchPreview = __DEV__ && Platform.OS === 'web' &&
    typeof window !== 'undefined' && window.location.search.includes('workbenchPreview=1');

const formatListTime = (value?: number) => {
    const timestamp = getTimestamp(value);
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    if (dateStart === dayStart) return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    if (dateStart === dayStart - 86400000) return '昨天';
    if (dayStart - dateStart < 7 * 86400000) return `星期${'日一二三四五六'[date.getDay()]}`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatChatTime = (value?: number) => {
    const timestamp = getTimestamp(value);
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    if (dateStart === dayStart) return time;
    if (dateStart === dayStart - 86400000) return `昨天 ${time}`;
    if (dayStart - dateStart < 7 * 86400000) return `星期${'日一二三四五六'[date.getDay()]} ${time}`;
    return `${date.getMonth() + 1}月${date.getDate()}日 ${time}`;
};

const messagePreview = (message?: XuanMessage | null) => {
    if (!message) return '';
    if (message.deleted) return '[消息已撤回]';
    if (message.contentType === 'image') return '[图片]';
    if (message.contentType === 'file') return '[文件]';
    if (message.contentType === 'emoticon') return '[表情]';
    if (message.contentType === 'code') return '[代码]';
    if (message.contentType === 'object') {
        try {
            const data = JSON.parse(message.content);
            if (data.type === 'url') return data.url;
        } catch {}
        return '[消息]';
    }
    return (message.content || '').replace(/\s+/g, ' ').trim();
};

const chatMessageText = (message: XuanMessage) => {
    if (!message.deleted && (!message.contentType || message.contentType === 'plain' || message.contentType === 'text')) {
        return message.content || '';
    }
    return messagePreview(message);
};

const mergeMessages = (current: XuanMessage[], incoming: XuanMessage[]) => {
    const map = new Map<string, XuanMessage>();
    [...current, ...incoming].forEach((message) => map.set(String(message.id || message.gid), message));
    return [...map.values()].sort((left, right) => getTimestamp(left.date) - getTimestamp(right.date));
};

const getUnreadCount = (chat: XuanChat) => {
    const lastMessageIndex = chat.lastMessageInfo?.index || 0;
    const lastReadMessageIndex = chat.lastReadMessageIndex || 0;
    return Number.isInteger(lastMessageIndex) && Number.isInteger(lastReadMessageIndex) ? Math.max(0, lastMessageIndex - lastReadMessageIndex) : 0;
};

function LoginScreen({onLogin, initialAccount}: {onLogin: (server: string, account: string, password: string) => Promise<void>; initialAccount?: string}) {
    const [server, setServer] = useState(configuredXuanServer.trim());
    const [account, setAccount] = useState(initialAccount || '');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submit = async () => {
        if (loading) return;
        setLoading(true);
        setError('');
        try {
            await onLogin(server, account, password);
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return <KeyboardAvoidingView style={styles.loginScreen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.loginSafe}>
            <View style={styles.loginBrand}>
                <Image source={require('../../assets/wecom-icon.png')} style={styles.loginLogo} />
                <Text style={styles.loginTitle}>企业微信</Text>
            </View>
            <View style={styles.loginForm}>
                {appConfig.expo.extra.showServerInput &&
                <View style={styles.loginField}>
                    <Server size={21} color="#7b838b" />
                    <TextInput value={server} onChangeText={setServer} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="服务器" placeholderTextColor="#a5abb1" style={styles.loginInput} />
                </View>
                }
                <View style={styles.loginField}>
                    <UserRound size={21} color="#7b838b" />
                    <TextInput value={account} onChangeText={setAccount} autoCapitalize="none" autoCorrect={false} placeholder="账号" placeholderTextColor="#a5abb1" style={styles.loginInput} />
                </View>
                <View style={styles.loginField}>
                    <LockKeyhole size={21} color="#7b838b" />
                    <TextInput value={password} onChangeText={setPassword} secureTextEntry={!passwordVisible} autoCapitalize="none" placeholder="密码" placeholderTextColor="#a5abb1" style={styles.loginInput} onSubmitEditing={submit} />
                    <Pressable hitSlop={10} onPress={() => setPasswordVisible((visible) => !visible)} accessibilityLabel={passwordVisible ? '隐藏密码' : '显示密码'}>
                        {passwordVisible ? <EyeOff size={21} color="#7b838b" /> : <Eye size={21} color="#7b838b" />}
                    </Pressable>
                </View>
                {!!error && <Text style={styles.loginError}>{error}</Text>}
                <Pressable onPress={submit} disabled={loading} style={({pressed}) => [styles.loginButton, pressed && !loading && styles.loginButtonPressed, loading && styles.loginButtonDisabled]}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>登录</Text>}
                </Pressable>
            </View>
        </SafeAreaView>
    </KeyboardAvoidingView>;
}

function Header({searching, receiving, query, setQuery, setSearching, openAdd, openAccount}: {
    receiving: boolean;
    searching: boolean; query: string; setQuery: (value: string) => void;
    setSearching: (value: boolean) => void; openAdd: () => void; openAccount: () => void;
}) {
    if (searching) {
        return <View style={styles.searchHeader}>
            <View style={styles.searchField}>
                <Search size={19} color="#6c747d" />
                <TextInput autoFocus value={query} onChangeText={setQuery} placeholder="搜索" placeholderTextColor="#9ca3aa" style={styles.searchInput} />
                {!!query && <Pressable hitSlop={10} onPress={() => setQuery('')}><X size={18} color="#8d949b" /></Pressable>}
            </View>
            <Pressable style={styles.cancel} onPress={() => {setSearching(false); setQuery('')}}><Text>取消</Text></Pressable>
        </View>;
    }
    return <View style={styles.header}>
        <Pressable style={styles.accountButtonOverlay} onPress={openAccount} accessibilityLabel={'\u4e2a\u4eba\u4fe1\u606f'} />
        <Pressable style={styles.headerButton} accessibilityLabel="菜单"><MenuDeviceIcon size={28} color="#050a11" /></Pressable>
        <Text style={styles.headerTitle}>{receiving ? '收取中...' : '消息'}</Text>
        <View style={styles.headerActions}>
            <Pressable style={styles.headerButton} onPress={() => setSearching(true)} accessibilityLabel="搜索"><WecomSearchIcon size={29} color="#050a11" /></Pressable>
            <Pressable style={styles.headerButton} onPress={openAdd} accessibilityLabel="新建">
                <WecomAddIcon size={29} color="#050a11" /><View style={styles.newDot} />
            </Pressable>
        </View>
    </View>;
}

function QuickBar({filter, openFilter}: {filter: string; openFilter: () => void}) {
    const actions = [
        {label: filter, icon: ChatOutlineIcon, dropdown: true, onPress: openFilter},
        {label: '待办', icon: QuickTodoIcon},
        {label: '会议', icon: MeetingIcon},
    ];
    return <View style={styles.quickBar}>{actions.map(({label, icon: Icon, dropdown, onPress}, index) =>
        <Pressable key={label} style={styles.quickItem} onPress={onPress}>
            <Icon size={23} color="#747476" />
            <Text style={styles.quickText}>{label}</Text>
            {dropdown && <ChevronDown size={15} color="#62686f" />}
            {index < actions.length - 1 && <View style={styles.quickDivider} />}
        </Pressable>
    )}</View>;
}

function ConversationRow({chat, index, client, onPress}: {chat: XuanChat; index: number; client: XuanClient; onPress: () => void}) {
    const remoteAvatar = client.resolveAsset(chat.avatar);
    const [avatarFailed, setAvatarFailed] = useState(false);
    useEffect(() => setAvatarFailed(false), [remoteAvatar]);
    const initial = (chat.name || '?').trim().slice(0, 1).toUpperCase();
    const unreadCount = getUnreadCount(chat);
    return <Pressable style={({pressed}) => [styles.conversation, pressed && styles.rowPressed]} onPress={onPress}>
        <View>
            {remoteAvatar && !avatarFailed
                ? <Image source={{uri: remoteAvatar}} style={styles.avatar} onError={() => setAvatarFailed(true)} />
                : <View style={[styles.avatar, styles.fallbackAvatar, {backgroundColor: avatarColors[index % avatarColors.length]}]}><Text style={styles.fallbackAvatarText}>{initial}</Text></View>}
            {!!unreadCount && <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text></View>}
        </View>
        <View style={styles.conversationBody}>
            <View style={styles.titleLine}>
                <Text numberOfLines={1} style={styles.conversationTitle}>{chat.name || '未命名会话'}</Text>
                <Text style={styles.time}>{formatListTime(chat.lastMessageInfo?.date || chat.lastActiveTime)}</Text>
            </View>
            <Text numberOfLines={1} style={styles.preview}>{messagePreview(chat.lastMessageInfo)}</Text>
            <View style={styles.rowDivider} />
        </View>
    </Pressable>;
}

function BottomNav({active, unreadCount, contactsCount = 0, onChange}: {
    active: string; unreadCount: number; contactsCount?: number; onChange: (tab: string) => void;
}) {
    return <SafeAreaView edges={['bottom']} style={styles.bottomSafe}><View style={styles.bottomNav}>
        {bottomTabs.map(({key, label, icon: Icon}) => {
            const selected = active === key;
            const badgeCount = key === 'message' ? unreadCount : key === 'contacts' ? contactsCount : 0;
            return <Pressable key={key} style={styles.bottomItem} onPress={() => onChange(key)}>
                <View style={styles.bottomIconWrap}>
                    <Icon size={28} color={selected ? '#437be8' : '#707072'} active={selected} />
                    {badgeCount > 0 && <View style={styles.bottomUnreadBadge}><Text style={styles.bottomUnreadBadgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text></View>}
                </View>
                <Text style={[styles.bottomLabel, selected && styles.bottomLabelActive]}>{label}</Text>
            </Pressable>;
        })}
    </View></SafeAreaView>;
}

function PopupMenus({filterOpen, addOpen, filter, close, setFilter}: {
    filterOpen: boolean; addOpen: boolean; filter: string; close: () => void; setFilter: (value: string) => void;
}) {
    const {top} = useSafeAreaInsets();
    const addItems = [
        {label: '发起群聊', icon: MessageCircle, filled: true, onPress: close},
        {label: '记录面聊', icon: MessageSquareCode, showDot: true, onPress: close},
        {label: '添加客户', icon: MessagesSquare, onPress: close},
        {label: '智能总结', icon: Sparkles, onPress: close},
        {label: '扫一扫', icon: ScanLine, onPress: close},
        {label: '休息一下', icon: Coffee, filled: true, onPress: close},
    ];
    return <>
        <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={close}>
            <Pressable style={styles.scrim} onPress={close}><View style={styles.filterMenu}>
                {['全部', '未读', '群聊', '单聊'].map((item) =>
                    <Pressable key={item} style={styles.menuRow} onPress={() => {setFilter(item); close()}}>
                        <Text style={styles.menuText}>{item}</Text>{filter === item && <Check size={18} color="#287dd7" />}
                    </Pressable>
                )}
            </View></Pressable>
        </Modal>
        <Modal visible={addOpen} transparent animationType="fade" onRequestClose={close}>
            <Pressable style={[styles.scrim, styles.addScrim]} onPress={close}><View style={[styles.addMenu, {top: top + 56}]}>
                {addItems.map(({label, icon: Icon, filled, showDot, onPress}, index) =>
                    <Pressable key={label} style={styles.addRow} onPress={onPress}>
                        <Icon size={22} color={'#3974e8'} fill={filled ? '#3974e8' : 'none'} strokeWidth={1.8} />
                        <Text style={styles.addMenuText}>{label}</Text>
                        {showDot && <View style={styles.addItemDot} />}
                        {index < addItems.length - 1 && <View style={styles.addDivider} />}
                    </Pressable>
                )}
            </View></Pressable>
        </Modal>
    </>;
}

function MessageScreen({chats, client, loading, refreshing, receiving, unreadCount, refresh, openChat, openAccount, changeTab}: {
    chats: XuanChat[]; client: XuanClient; loading: boolean; refreshing: boolean; receiving: boolean;
    unreadCount: number;
    refresh: () => void; openChat: (chat: XuanChat) => void; openAccount: () => void; changeTab: (tab: string) => void;
}) {
    const [searching, setSearching] = useState(false);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('全部');
    const [filterOpen, setFilterOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const data = useMemo(() => {
        const keyword = query.trim().toLocaleLowerCase();
        return chats.filter((chat) => {
            if (filter === '未读' && (chat.lastMessageInfo?.index || 0) <= (chat.lastReadMessageIndex || 0)) return false;
            if (filter === '群聊' && chat.type === 'one2one') return false;
            if (filter === '单聊' && chat.type !== 'one2one') return false;
            return !keyword || `${chat.name || ''}${messagePreview(chat.lastMessageInfo)}`.toLocaleLowerCase().includes(keyword);
        });
    }, [chats, filter, query]);
    const closeMenus = () => {setFilterOpen(false); setAddOpen(false)};

    return <View style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.topSafe}>
            <Header searching={searching} receiving={receiving} query={query} setQuery={setQuery} setSearching={setSearching} openAdd={() => setAddOpen(true)} openAccount={openAccount} />
        </SafeAreaView>
        <QuickBar filter={filter} openFilter={() => setFilterOpen(true)} />
        {loading && !chats.length
            ? <View style={styles.centerState}><ActivityIndicator color="#287dd7" /><Text style={styles.stateText}>正在获取消息</Text></View>
            : <FlatList
                data={data}
                keyExtractor={(item) => item.gid}
                renderItem={({item, index}) => <ConversationRow chat={item} index={index} client={client} onPress={() => openChat(item)} />}
                showsVerticalScrollIndicator
                contentContainerStyle={[styles.listContent, !data.length && styles.emptyList]}
                ListEmptyComponent={<Text style={styles.stateText}>暂无消息</Text>}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#287dd7" colors={['#287dd7']} />}
            />}
        <BottomNav active="message" unreadCount={unreadCount} onChange={changeTab} />
        <PopupMenus filterOpen={filterOpen} addOpen={addOpen} filter={filter} close={closeMenus} setFilter={setFilter} />
    </View>;
}

function ChatAvatar({uri, label, own}: {uri?: string; label: string; own: boolean}) {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [uri]);
    if (uri && !failed) return <Image source={{uri}} style={styles.chatAvatar} onError={() => setFailed(true)} />;
    return <View style={[styles.chatAvatar, styles.chatAvatarFallback, own ? styles.chatAvatarOwn : styles.chatAvatarOther]}>
        {own
            ? <UserRound size={21} color="#fff" strokeWidth={1.8} />
            : <Text style={styles.chatAvatarText}>{label.trim().slice(0, 1).toUpperCase() || '?'}</Text>}
    </View>;
}

const fitMessageImage = (width: number, height: number) => {
    if (!width || !height) return {width: 140, height: 140};
    const scale = Math.min(160 / width, 140 / height, 1);
    return {width: Math.round(width * scale), height: Math.round(height * scale)};
};

function ChatMessageRow({message, image, own, showTime, ownAvatar, peerAvatar, ownName, peerName, showSenderName, onImagePress}: {
    message: XuanMessage; image?: {uri: string; width: number; height: number}; own: boolean; showTime: boolean; ownAvatar?: string; peerAvatar?: string;
    ownName: string; peerName: string; showSenderName: boolean; onImagePress: (image: {uri: string; width: number; height: number}) => void;
}) {
    const [imageFailed, setImageFailed] = useState(false);
    const senderName = peerName;
    const visibleImage = imageFailed ? undefined : image;
    const imageSize = visibleImage ? fitMessageImage(visibleImage.width, visibleImage.height) : undefined;
    return <>
        {showTime && <Text style={styles.chatTimeDivider}>{formatChatTime(message.date)}</Text>}
        <View style={[styles.messageRow, own ? styles.messageRowOwn : styles.messageRowOther]}>
            {!own && <ChatAvatar uri={peerAvatar} label={senderName} own={false} />}
            <View style={[styles.messageContent, own && styles.messageContentOwn]}>
                {!own && showSenderName && <Text style={styles.senderName}>{senderName}</Text>}
                <View style={styles.messageBubbleWrap}>
                    {!visibleImage && <View style={[styles.messageTail, own ? styles.messageTailOwn : styles.messageTailOther]} />}
                    <View style={[styles.messageBubble, own ? styles.messageBubbleOwn : styles.messageBubbleOther, visibleImage && styles.messageImageBubble]}>
                        {visibleImage
                            ? <Pressable onPress={() => onImagePress(visibleImage)} accessibilityRole="button" accessibilityLabel="查看大图">
                                <Image source={{uri: visibleImage.uri}} style={[styles.messageImage, imageSize]} resizeMode="contain" onError={() => setImageFailed(true)} accessibilityLabel="图片消息" />
                            </Pressable>
                            : <Text selectable style={styles.messageText}>{chatMessageText(message)}</Text>}
                    </View>
                </View>
            </View>
            {own && <ChatAvatar uri={ownAvatar} label={ownName} own />}
        </View>
    </>;
}

function ChatScreen({chat, client, session, messages, chatMembers, loading, error, sending, back, retry, send, sendImage}: {
    chat: XuanChat; client: XuanClient; session: XuanSession; messages: XuanMessage[]; chatMembers: XuanMember[]; loading: boolean; error: string; sending: boolean;
    back: () => void; retry: () => void; send: (content: string) => Promise<void>; sendImage: (image: XuanImageAsset) => Promise<void>;
}) {
    const [content, setContent] = useState('');
    const [composerFocused, setComposerFocused] = useState(false);
    const [attachmentOpen, setAttachmentOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<{uri: string; width: number; height: number} | null>(null);
    const listRef = useRef<FlatList<XuanMessage>>(null);
    const ownAvatar = client.resolveAsset(session.user.avatar);
    const peerAvatar = client.resolveAsset(chat.avatar);
    const ownName = session.user.realname || session.account;
    const peerName = chat.name || '未命名会话';
    const isGroup = chat.type === 'group';
    const chatMemberMap = useMemo(() => new Map(chatMembers.map((member) => [member.id, member])), [chatMembers]);
    const hasContent = !!content.trim();
    const submit = async () => {
        const text = content.trim();
        if (!text || sending) return;
        setContent('');
        try {
            await send(text);
        } catch {
            setContent(text);
        }
    };
    const pickImage = async () => {
        if (sending) return;
        setAttachmentOpen(false);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 1,
            });
            if (!result.canceled) await sendImage(result.assets[0]);
        } catch (reason) {
            Alert.alert('图片发送失败', reason instanceof Error ? reason.message : '请选择其他图片后重试');
        }
    };
    return <KeyboardAvoidingView style={styles.chatScreen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView edges={['top']} style={styles.chatTopSafe}>
            <View style={styles.chatHeader}>
                <Pressable style={styles.chatIconButton} onPress={back} accessibilityLabel="返回"><WecomChatBackIcon /></Pressable>
                <Text numberOfLines={1} style={styles.chatTitle}>{peerName}</Text>
                <View style={styles.chatHeaderActions}>
                    <View style={styles.chatIconButton}><WecomChatSparkleIcon /></View>
                    <View style={styles.chatIconButton}><WecomChatMoreIcon /></View>
                </View>
            </View>
        </SafeAreaView>
        {loading
            ? <View style={[styles.centerState, styles.chatCenterState]}><ActivityIndicator color="#437be8" /><Text style={styles.stateText}>正在获取聊天记录</Text></View>
            : error
                ? <Pressable style={[styles.centerState, styles.chatCenterState]} onPress={retry}><Text style={styles.errorStateText}>{error}</Text><RefreshCw size={22} color="#437be8" /></Pressable>
                : <FlatList
                    ref={listRef}
                    data={messages}
                    style={styles.messages}
                    keyExtractor={(item) => String(item.id || item.gid)}
                    renderItem={({item, index}) => {
                        const sender = isGroup ? chatMemberMap.get(item.user) : undefined;
                        return <ChatMessageRow
                            message={item}
                            image={client.resolveMessageImage(item)}
                            own={item.user === session.user.id}
                            showTime={index === 0 || getTimestamp(item.date) - getTimestamp(messages[index - 1]?.date) > 5 * 60 * 1000}
                            ownAvatar={ownAvatar}
                            peerAvatar={isGroup ? client.resolveAsset(sender?.avatar) : peerAvatar}
                            ownName={ownName}
                            peerName={isGroup ? sender?.realname || sender?.account || `\u7528\u6237 ${item.user}` : peerName}
                            showSenderName={isGroup}
                            onImagePress={setPreviewImage}
                        />;
                    }}
                    contentContainerStyle={[styles.messagesList, !messages.length && styles.emptyList]}
                    onContentSizeChange={() => messages.length && listRef.current?.scrollToEnd({animated: false})}
                />}
        <Modal
            visible={!!previewImage}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={() => setPreviewImage(null)}
        >
            <View style={styles.imageViewer}>
                <StatusBar style="light" />
                <Pressable style={StyleSheet.absoluteFill} onPress={() => setPreviewImage(null)} accessibilityLabel="关闭大图" />
                {previewImage && <Pressable style={styles.imageViewerContent} onPress={(event) => event.stopPropagation()} accessibilityRole="image" accessibilityLabel="图片大图">
                    <Image source={{uri: previewImage.uri}} style={styles.imageViewerImage} resizeMode="contain" />
                </Pressable>}
            </View>
        </Modal>
        <SafeAreaView edges={['bottom']} style={styles.composerSafe}>
            <View style={[styles.composer, hasContent && styles.composerSending]}>
                <View style={[styles.composerIcon, styles.composerVoiceIcon]}><WecomChatVoiceIcon /></View>
                <TextInput value={content} onChangeText={setContent} onFocus={() => {setComposerFocused(true); setAttachmentOpen(false)}} onBlur={() => setComposerFocused(false)} placeholder={composerFocused ? '' : '发消息或按住说...'} placeholderTextColor="#92969b" multiline maxLength={4000} style={styles.composerInput} />
                <View style={[styles.composerIcon, styles.composerSmileIcon, hasContent && styles.composerSmileIconSending]}><WecomChatSmileIcon /></View>
                {hasContent
                    ? <Pressable onPress={submit} disabled={sending} accessibilityLabel="发送" style={styles.sendButton}>
                        {sending ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.sendButtonText}>发送</Text>}
                    </Pressable>
                    : sending
                        ? <View style={styles.composerIcon}><ActivityIndicator size="small" color="#437be8" /></View>
                        : <Pressable style={styles.composerIcon} onPress={() => {Keyboard.dismiss(); setAttachmentOpen((open) => !open)}} accessibilityLabel={attachmentOpen ? '收起更多功能' : '更多功能'} accessibilityState={{expanded: attachmentOpen}}><WecomChatPlusIcon /></Pressable>}
            </View>
            {attachmentOpen && <View style={styles.attachmentPanel}>
                <View style={styles.attachmentGrid}>
                    {chatAttachmentActions.map(({key, label, icon: Icon}) => {
                        const enabled = key === 'image';
                        return <Pressable key={key} style={({pressed}) => [styles.attachmentItem, pressed && enabled && styles.attachmentItemPressed]} onPress={enabled ? pickImage : undefined} disabled={!enabled || sending} accessibilityLabel={label} accessibilityState={{disabled: !enabled}}>
                            <View style={styles.attachmentIconBox}><Icon /></View>
                            <Text style={styles.attachmentLabel}>{label}</Text>
                        </Pressable>;
                    })}
                </View>
                <View style={styles.attachmentPager}>
                    <View style={[styles.attachmentPageDot, styles.attachmentPageDotActive]} />
                    <View style={styles.attachmentPageDot} />
                    <View style={styles.attachmentPageDot} />
                </View>
            </View>}
        </SafeAreaView>
    </KeyboardAvoidingView>;
}

export default function XuanApp() {
    const [client, setClient] = useState<XuanClient | null>(null);
    const [session, setSession] = useState<XuanSession | null>(null);
    const [chats, setChats] = useState<XuanChat[]>([]);
    const [activeChat, setActiveChat] = useState<XuanChat | null>(null);
    const [messages, setMessages] = useState<XuanMessage[]>([]);
    const [chatMembers, setChatMembers] = useState<XuanMember[]>([]);
    const [members, setMembers] = useState<XuanMember[]>([]);
    const [departments, setDepartments] = useState<XuanDepartment[]>([]);
    const [activeTab, setActiveTab] = useState('message');
    const [accountOpen, setAccountOpen] = useState(false);
    const [lastLogin, setLastLogin] = useState<{server: string; account: string} | null>(null);
    const [loadingChats, setLoadingChats] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [refreshingContacts, setRefreshingContacts] = useState(false);
    const [openingMember, setOpeningMember] = useState<number | null>(null);
    const [activeMember, setActiveMember] = useState<XuanMember | null>(null);
    const [contactDeptStack, setContactDeptStack] = useState<number[]>([]);
    const [reconnecting, setReconnecting] = useState(false);
    const [messagesError, setMessagesError] = useState('');
    const [contactsError, setContactsError] = useState('');
    const [workbenchStats, setWorkbenchStats] = useState<XuanWorkbenchStats>(DEFAULT_WORKBENCH_STATS);
    const activeChatGid = useRef<string | null>(null);
    const unreadCount = chats.reduce((total, chat) => total + getUnreadCount(chat), 0);

    const sortChats = (items: XuanChat[]) => [...items]
        .filter((chat) => !chat.hide && !chat.freeze)
        .sort((left, right) => getTimestamp(right.lastMessageInfo?.date || right.lastActiveTime) - getTimestamp(left.lastMessageInfo?.date || left.lastActiveTime));

    const loadChats = async (target: XuanClient, refresh = false) => {
        refresh ? setRefreshing(true) : setLoadingChats(true);
        try {
            setChats(sortChats(await target.getChats()));
        } catch {} finally {
            setLoadingChats(false);
            setRefreshing(false);
        }
    };

    const loadContacts = async (target: XuanClient, refresh = false) => {
        refresh ? setRefreshingContacts(true) : setLoadingContacts(true);
        setContactsError('');
        try {
            const [memberList, departmentList] = await Promise.all([target.getMembers(), target.getDepartments()]);
            setMembers(memberList);
            setDepartments(departmentList);
        } catch (error) {
            setContactsError(error instanceof Error ? error.message : '通讯录获取失败');
        } finally {
            setLoadingContacts(false);
            setRefreshingContacts(false);
        }
    };

    const loadWorkbenchStats = async (target: XuanClient) => {
        try {
            setWorkbenchStats(await target.getWorkbenchStats());
        } catch {}
    };

    const handleLogin = async (server: string, account: string, password: string) => {
        const result = await loginXuan(server, account, password);
        setLastLogin({server: result.session.server, account: result.session.account});
        setClient(result.client);
        setSession(result.session);
        await loadChats(result.client);
    };

    useEffect(() => {
        if (!client) return;
        return client.subscribe((packet) => {
            if (packet.method === 'userupdate' && packet.result !== 'fail' && packet.data) {
                const updated = packet.data as XuanMember;
                if (!updated.id) return;
                setSession((current) => current && current.user.id === updated.id
                    ? {...current, user: {...current.user, ...updated}}
                    : current);
                setMembers((current) => current.map((member) => member.id === updated.id ? {...member, ...updated} : member));
                setActiveMember((current) => current?.id === updated.id ? {...current, ...updated} : current);
                return;
            }
            if (packet.method === 'reconnect') {
                setReconnecting(false);
                return;
            }
            if (packet.method === 'disconnect') {
                setReconnecting(true);
                return;
            }
            if (packet.method === 'clienterror') return;
            if (!['messagesend', 'messageupdate', 'messageretract'].includes(packet.method)) return;
            const incoming = normalizeMessages(packet.data);
            if (!incoming.length) return;
            setChats((current) => sortChats(current.map((chat) => {
                const latest = incoming.filter((message) => message.cgid === chat.gid).at(-1);
                const readIndex = chat.gid === activeChatGid.current && packet.method === 'messagesend' ? latest?.index || 0 : 0;
                return latest ? {...chat, lastMessageInfo: latest, lastActiveTime: latest.date, lastReadMessageIndex: Math.max(chat.lastReadMessageIndex || 0, readIndex)} : chat;
            })));
            if (activeChatGid.current) {
                const relevant = incoming.filter((message) => message.cgid === activeChatGid.current);
                if (relevant.length) {
                    setMessages((current) => mergeMessages(current, relevant));
                    const readIndex = packet.method === 'messagesend' ? relevant.at(-1)?.index || 0 : 0;
                    if (readIndex) void client.markChatRead(activeChatGid.current, readIndex).catch(() => {});
                }
            }
        });
    }, [client]);

    useEffect(() => () => client?.close(), [client]);

    useEffect(() => {
        if (Platform.OS !== 'android') return;
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (accountOpen) {
                setAccountOpen(false);
                return true;
            }
            if (activeChat) {
                activeChatGid.current = null;
                setActiveChat(null);
                return true;
            }
            if (activeMember) {
                setContactsError('');
                setActiveMember(null);
                return true;
            }
            if (contactDeptStack.length) {
                setContactDeptStack((stack) => stack.slice(0, -1));
                return true;
            }
            if (activeTab !== 'message') {
                setActiveTab('message');
                return true;
            }
            return false;
        });
        return () => subscription.remove();
    }, [accountOpen, activeChat, activeMember, activeTab, contactDeptStack.length]);

    const openChat = async (chat: XuanChat) => {
        if (!client) return;
        const readIndex = chat.lastMessageInfo?.index || 0;
        const openedChat = readIndex > (chat.lastReadMessageIndex || 0) ? {...chat, lastReadMessageIndex: readIndex} : chat;
        activeChatGid.current = chat.gid;
        setActiveChat(openedChat);
        if (openedChat !== chat) {
            setChats((current) => current.map((item) => item.gid === chat.gid ? {...item, lastReadMessageIndex: Math.max(item.lastReadMessageIndex || 0, readIndex)} : item));
            void client.markChatRead(chat.gid, readIndex).catch(() => {});
        }
        setMessages([]);
        setChatMembers([]);
        setMessagesError('');
        setLoadingMessages(true);
        if (chat.type === 'group') {
            void client.getChatMembers(chat.gid)
                .then((loadedMembers) => {
                    if (activeChatGid.current === chat.gid) setChatMembers(loadedMembers);
                })
                .catch(() => {});
        }
        try {
            setMessages(await client.getMessages(chat.gid));
        } catch (error) {
            setMessagesError(error instanceof Error ? error.message : '聊天记录获取失败');
        } finally {
            setLoadingMessages(false);
        }
    };

    const logout = async () => {
        await client?.logout();
        activeChatGid.current = null;
        setClient(null);
        setSession(null);
        setChats([]);
        setMembers([]);
        setDepartments([]);
        setActiveTab('message');
        setAccountOpen(false);
        setActiveChat(null);
        setActiveMember(null);
        setContactDeptStack([]);
        setMessages([]);
        setChatMembers([]);
        setReconnecting(false);
        setContactsError('');
        setWorkbenchStats(DEFAULT_WORKBENCH_STATS);
    };

    const changeTab = (tab: string) => {
        if (tab === 'message') {
            setActiveTab('message');
        } else if (tab === 'work') {
            setActiveTab('work');
            if (client) void loadWorkbenchStats(client);
        } else if (tab === 'contacts' && client) {
            setActiveTab('contacts');
            if (!members.length && !loadingContacts) void loadContacts(client);
        }
    };

    const openMemberChat = async (member: XuanMember) => {
        if (!client || openingMember !== null) return;
        setOpeningMember(member.id);
        setContactsError('');
        try {
            const chat = await client.getDirectChat(member);
            setChats((current) => sortChats([...current.filter((item) => item.gid !== chat.gid), chat]));
            await openChat(chat);
        } catch (error) {
            setContactsError(error instanceof Error ? error.message : '无法打开聊天');
        } finally {
            setOpeningMember(null);
        }
    };

    if (workbenchPreview) {
        return <WorkbenchScreen
            stats={DEFAULT_WORKBENCH_STATS}
            footer={<BottomNav active="work" unreadCount={0} contactsCount={1} onChange={() => {}} />}
        />;
    }
    if (!client || !session) return <LoginScreen onLogin={handleLogin} initialAccount={lastLogin?.account} />;
    if (accountOpen) {
        return <AccountScreen
            member={session.user}
            departments={departments}
            company={client.info.company}
            client={client}
            back={() => setAccountOpen(false)}
            save={async (update, avatar) => {
                let updated = await client.updateProfile(update);
                if (avatar) updated = await client.uploadAvatar(avatar);
                setSession((current) => current ? {...current, user: updated} : current);
                setMembers((current) => current.map((member) => member.id === updated.id ? {...member, ...updated} : member));
                setActiveMember((current) => current?.id === updated.id ? {...current, ...updated} : current);
                return updated;
            }}
            logout={logout}
        />;
    }
    if (activeChat) {
        return <ChatScreen
            chat={activeChat}
            client={client}
            session={session}
            messages={messages}
            chatMembers={chatMembers}
            loading={loadingMessages}
            error={messagesError}
            sending={sending}
            back={() => {activeChatGid.current = null; setActiveChat(null)}}
            retry={() => openChat(activeChat)}
            send={async (content) => {
                setSending(true);
                try {
                    const sent = await client.sendText(activeChat.gid, content);
                    if (sent.length) setMessages((current) => mergeMessages(current, sent));
                } finally {
                    setSending(false);
                }
            }}
            sendImage={async (image) => {
                setSending(true);
                try {
                    const sent = await client.sendImage(activeChat.gid, image);
                    if (sent.length) setMessages((current) => mergeMessages(current, sent));
                } finally {
                    setSending(false);
                }
            }}
        />;
    }
    if (activeMember) {

        return <MemberProfileScreen
            member={activeMember}
            departments={departments}
            company={client.info.company}
            client={client}
            sending={openingMember === activeMember.id}
            error={contactsError}
            back={() => {setContactsError(''); setActiveMember(null)}}
            sendMessage={() => {
                if (activeMember.id === session.user.id) {
                    setContactsError('不能给自己发消息');
                    return;
                }
                void openMemberChat(activeMember);
            }}
        />;
    }
    if (activeTab === 'work') {
        return <WorkbenchScreen
            stats={workbenchStats}
            footer={<BottomNav active="work" unreadCount={unreadCount} contactsCount={1} onChange={changeTab} />}
        />;
    }
    if (activeTab === 'contacts') {
        return <ContactsScreen
            members={members}
            departments={departments}
            company={client.info.company}
            client={client}
            loading={loadingContacts}
            refreshing={refreshingContacts}
            error={contactsError}
            refresh={() => loadContacts(client, true)}
            openMember={(member) => {
                setContactsError('');
                if (member.id === session.user.id) {
                    setAccountOpen(true);
                } else {
                    setActiveMember(member);
                }
            }}
            footer={<BottomNav active="contacts" unreadCount={unreadCount} onChange={changeTab} />}
            deptStack={contactDeptStack}
            updateDeptStack={setContactDeptStack}
        />;
    }
    return <MessageScreen
        chats={chats}
        client={client}
        loading={loadingChats}
        refreshing={refreshing}
        receiving={loadingChats || refreshing || reconnecting}
        unreadCount={unreadCount}
        refresh={() => loadChats(client, true)}
        openChat={openChat}
        openAccount={() => {
            setAccountOpen(true);
            if (!departments.length && !loadingContacts) void loadContacts(client);
        }}
        changeTab={changeTab}
    />;
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: '#fff'},
    topSafe: {backgroundColor: '#e7f1fd'},
    loginScreen: {flex: 1, backgroundColor: '#f6f8fa'},
    loginSafe: {flex: 1, paddingHorizontal: 30, justifyContent: 'center'},
    loginBrand: {alignItems: 'center', marginBottom: 44},
    loginLogo: {width: 72, height: 72, borderRadius: 14},
    loginTitle: {marginTop: 15, color: '#171b1f', fontSize: 24, fontWeight: '600'},
    loginForm: {width: '100%', maxWidth: 440, alignSelf: 'center'},
    loginField: {height: 54, paddingHorizontal: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', columnGap: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#d8dde2', borderRadius: 6, backgroundColor: '#fff'},
    loginInput: {minWidth: 0, height: 52, paddingVertical: 0, flex: 1, color: '#20252a', fontSize: 16},
    loginError: {marginTop: 2, marginBottom: 11, color: '#d2483f', fontSize: 14, lineHeight: 20},
    loginButton: {height: 50, marginTop: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: '#287dd7'},
    loginButtonPressed: {backgroundColor: '#216cbd'},
    loginButtonDisabled: {opacity: 0.68},
    loginButtonText: {color: '#fff', fontSize: 17, fontWeight: '600'},
    header: {height: 48, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e7f1fd'},
    headerButton: {width: 42, height: 42, alignItems: 'center', justifyContent: 'center'},
    accountButtonOverlay: {position: 'absolute', left: 4, top: 3, width: 42, height: 42, zIndex: 2},
    headerTitle: {position: 'absolute', left: 70, right: 70, color: '#090d11', fontSize: 18, fontWeight: '400', textAlign: 'center'},
    headerActions: {marginLeft: 'auto', flexDirection: 'row', columnGap: 2},
    newDot: {position: 'absolute', top: 6, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff5659'},
    searchHeader: {height: 48, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', columnGap: 10, backgroundColor: '#e7f1fd'},
    searchField: {height: 39, paddingHorizontal: 11, flex: 1, flexDirection: 'row', alignItems: 'center', columnGap: 8, borderRadius: 5, backgroundColor: '#fff'},
    searchInput: {height: 39, paddingVertical: 0, flex: 1, color: '#1d2227', fontSize: 15},
    cancel: {height: 39, justifyContent: 'center'},
    quickBar: {height: 50, paddingHorizontal: 5, flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#edf0f2', backgroundColor: '#f8f9fc'},
    quickItem: {position: 'relative', minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 7},
    quickText: {color: '#67686a', fontSize: 15},
    quickDivider: {position: 'absolute', top: 14, right: 0, width: StyleSheet.hairlineWidth, height: 22, backgroundColor: '#e8eaed'},
    centerState: {minHeight: 140, flex: 1, alignItems: 'center', justifyContent: 'center', rowGap: 12},
    stateText: {color: '#92999f', fontSize: 14},
    errorStateText: {paddingHorizontal: 30, color: '#7f858b', fontSize: 14, lineHeight: 21, textAlign: 'center'},
    listContent: {paddingBottom: 2},
    emptyList: {flexGrow: 1, alignItems: 'center', justifyContent: 'center'},
    conversation: {height: 60, paddingLeft: 14, paddingRight: 12, flexDirection: 'row', alignItems: 'center', columnGap: 12, backgroundColor: '#fff'},
    rowPressed: {backgroundColor: '#f4f5f6'},
    avatar: {width: 40, height: 40, flexShrink: 0, borderRadius: 5, backgroundColor: '#edf0f2'},
    fallbackAvatar: {alignItems: 'center', justifyContent: 'center'},
    fallbackAvatarText: {color: '#fff', fontSize: 17, fontWeight: '600'},
    unreadBadge: {position: 'absolute', top: -7, right: -8, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', borderRadius: 9, backgroundColor: '#fa5151'},
    unreadBadgeText: {color: '#fff', fontSize: 10, fontWeight: '600', lineHeight: 13},
    conversationBody: {position: 'relative', height: '100%', minWidth: 0, flex: 1, justifyContent: 'center'},
    titleLine: {flexDirection: 'row', alignItems: 'center', columnGap: 8},
    conversationTitle: {minWidth: 0, flex: 1, color: '#111315', fontSize: 16, fontWeight: '500', lineHeight: 23},
    time: {color: '#bec2c6', fontSize: 12},
    preview: {marginTop: 1, paddingRight: 8, color: '#a2a6ab', fontSize: 14, lineHeight: 20},
    rowDivider: {position: 'absolute', right: 0, bottom: 0, left: 0, height: StyleSheet.hairlineWidth, backgroundColor: '#e9ebed'},
    bottomSafe: {paddingBottom: Platform.OS === 'web' ? 14 : 0, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e6e7e9', backgroundColor: '#fafbfd'},
    bottomNav: {height: 56, paddingTop: 4, flexDirection: 'row', backgroundColor: '#fafbfd'},
    bottomItem: {minWidth: 0, flex: 1, alignItems: 'center', justifyContent: 'center', rowGap: 2},
    bottomIconWrap: {position: 'relative', width: 28, height: 28},
    bottomUnreadBadge: {position: 'absolute', top: -6, right: -5, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fafbfd', borderRadius: 9, backgroundColor: '#fa5151'},
    bottomUnreadBadgeText: {color: '#fff', fontSize: 10, fontWeight: '600', lineHeight: 13},
    bottomLabel: {color: '#5d6369', fontSize: 11, lineHeight: 16},
    bottomLabelActive: {color: '#437be8'},
    scrim: {flex: 1, backgroundColor: 'rgba(0,0,0,0.16)'},
    addScrim: {backgroundColor: 'transparent'},
    filterMenu: {position: 'absolute', top: Platform.OS === 'android' ? 123 : 130, left: 10, width: 148, paddingVertical: 4, borderRadius: 6, backgroundColor: '#fff', elevation: 7, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: {width: 0, height: 5}},
    addMenu: {position: 'absolute', right: 10, width: 158, borderRadius: 6, backgroundColor: '#fff', elevation: 7, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: {width: 0, height: 5}},
    menuRow: {height: 42, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    addRow: {position: 'relative', height: 55, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', columnGap: 13},
    addMenuText: {color: '#3974e8', fontSize: 16},
    addDivider: {position: 'absolute', right: 14, bottom: 0, left: 53, height: StyleSheet.hairlineWidth, backgroundColor: '#eceff3'},
    addItemDot: {position: 'absolute', top: 23, right: 15, width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#ff5659'},
    menuText: {color: '#30353a', fontSize: 15},
    chatScreen: {flex: 1, backgroundColor: '#ecedf1'},
    chatTopSafe: {backgroundColor: '#ecedf1'},
    chatHeader: {height: 48, paddingHorizontal: 7, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#dfe0e4', backgroundColor: '#ecedf1'},
    chatIconButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
    chatHeaderActions: {marginLeft: 'auto', flexDirection: 'row', columnGap: 2},
    chatTitle: {minWidth: 0, marginLeft: 8, marginRight: 4, flex: 1, color: '#080b0f', fontSize: 18, fontWeight: '400'},
    chatCenterState: {backgroundColor: '#ecedf1'},
    messages: {backgroundColor: '#ecedf1'},
    messagesList: {paddingHorizontal: 10, paddingTop: 4, paddingBottom: 24, flexGrow: 1, backgroundColor: '#ecedf1'},
    chatTimeDivider: {marginTop: 4, marginBottom: 18, color: '#9b9da3', fontSize: 13, lineHeight: 19, textAlign: 'center'},
    messageRow: {marginBottom: 18, flexDirection: 'row', alignItems: 'flex-start', columnGap: 9},
    messageRowOwn: {justifyContent: 'flex-end'},
    messageRowOther: {justifyContent: 'flex-start'},
    chatAvatar: {width: 36, height: 36, flexShrink: 0, borderRadius: 5, backgroundColor: '#dfe6ec'},
    chatAvatarFallback: {alignItems: 'center', justifyContent: 'center'},
    chatAvatarOwn: {backgroundColor: '#6f87a2'},
    chatAvatarOther: {backgroundColor: '#4d9de0'},
    chatAvatarText: {color: '#fff', fontSize: 15, fontWeight: '600'},
    messageContent: {maxWidth: '76%'},
    messageContentOwn: {alignItems: 'flex-end'},
    senderName: {marginBottom: 4, color: '#8a8d93', fontSize: 11},
    messageBubbleWrap: {position: 'relative'},
    messageBubble: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 7},
    messageBubbleOwn: {backgroundColor: '#d1e6fb'},
    messageBubbleOther: {backgroundColor: '#fff'},
    messageTail: {position: 'absolute', top: 11, width: 0, height: 0, borderTopWidth: 6, borderBottomWidth: 6, borderTopColor: 'transparent', borderBottomColor: 'transparent'},
    messageTailOther: {left: -6, borderRightWidth: 8, borderRightColor: '#fff'},
    messageTailOwn: {right: -6, borderLeftWidth: 8, borderLeftColor: '#d1e6fb'},
    messageText: {color: '#111418', fontSize: 16, lineHeight: 24},
    messageImageBubble: {paddingHorizontal: 0, paddingVertical: 0, overflow: 'hidden', backgroundColor: 'transparent'},
    messageImage: {borderRadius: 6, backgroundColor: '#dfe2e6'},
    imageViewer: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.92)'},
    imageViewerContent: {width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'},
    imageViewerImage: {width: '100%', height: '100%'},
    composerSafe: {borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#dedfe3', backgroundColor: '#f5f6f8'},
    composer: {minHeight: 43, paddingTop: 8, paddingRight: 3, paddingBottom: 1, flexDirection: 'row', alignItems: 'flex-end', columnGap: 1},
    composerSending: {paddingRight: 9},
    composerIcon: {width: 34, height: 34, flexShrink: 0, alignItems: 'center', justifyContent: 'center', transform: [{translateY: 3}]},
    composerVoiceIcon: {width: 36},
    composerSmileIcon: {marginLeft: 2},
    composerSmileIconSending: {marginLeft: 3},
    composerInput: {height: 34, maxHeight: 112, paddingHorizontal: 10, paddingTop: Platform.OS === 'web' ? 3 : 0, paddingBottom: 0, flex: 1, color: '#111418', fontSize: 16, lineHeight: 24, textAlignVertical: 'center', borderRadius: 4, backgroundColor: '#fff'},
    sendButton: {width: 44, height: 28, marginLeft: 2, marginBottom: 3, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: '#427ce8'},
    sendButtonText: {color: '#fff', fontSize: 16, fontWeight: '500'},
    attachmentPanel: {height: 236, paddingTop: 16, paddingBottom: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e1e2e5', backgroundColor: '#f5f6f8'},
    attachmentGrid: {flexDirection: 'row', flexWrap: 'wrap'},
    attachmentItem: {width: '25%', height: 98, alignItems: 'center'},
    attachmentItemPressed: {opacity: 0.62},
    attachmentIconBox: {width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: '#fff'},
    attachmentLabel: {marginTop: 7, color: '#62666b', fontSize: 14, lineHeight: 20},
    attachmentPager: {height: 15, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', columnGap: 10},
    attachmentPageDot: {width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#d7d9dd'},
    attachmentPageDotActive: {backgroundColor: '#8d9095'},
});
