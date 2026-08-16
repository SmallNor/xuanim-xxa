import {Image, ImageSourcePropType} from 'react-native';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

type IconProps = {
    size?: number;
    color?: string;
    strokeWidth?: number;
    active?: boolean;
};

const icons = {
    menu: require('../../assets/icons/header-menu.png'),
    search: require('../../assets/icons/header-search.png'),
    add: require('../../assets/icons/header-plus.png'),
    quickChat: require('../../assets/icons/quick-chat.png'),
    quickCalendar: require('../../assets/icons/quick-calendar.png'),
    quickTodo: require('../../assets/icons/quick-todo.png'),
    quickMeeting: require('../../assets/icons/quick-meeting.png'),
    mail: require('../../assets/icons/nav-mail.png'),
    docs: require('../../assets/icons/nav-docs.png'),
    contacts: require('../../assets/icons/nav-contacts.png'),
    chatBack: require('../../assets/icons/chat-back.png'),
    chatSparkle: require('../../assets/icons/chat-sparkle.png'),
    chatMore: require('../../assets/icons/chat-more.png'),
    chatVoice: require('../../assets/icons/chat-voice.png'),
    chatSmile: require('../../assets/icons/chat-smile.png'),
    chatPlus: require('../../assets/icons/chat-plus.png'),
} satisfies Record<string, ImageSourcePropType>;

function RasterIcon({source, size, color}: {source: ImageSourcePropType; size: number; color: string}) {
    return <Image
        source={source}
        resizeMode="contain"
        style={{width: size, height: size, tintColor: color}}
        accessibilityIgnoresInvertColors
    />;
}

export function MenuDeviceIcon({size = 28, color = '#111418'}: IconProps) {
    return <RasterIcon source={icons.menu} size={size} color={color} />;
}

export function WecomSearchIcon({size = 29, color = '#111418'}: IconProps) {
    return <RasterIcon source={icons.search} size={size} color={color} />;
}

export function WecomAddIcon({size = 29, color = '#111418'}: IconProps) {
    return <RasterIcon source={icons.add} size={size} color={color} />;
}

export function ChatOutlineIcon({size = 23, color = '#62686f'}: IconProps) {
    return <RasterIcon source={icons.quickChat} size={size} color={color} />;
}

export function CalendarGridIcon({size = 23, color = '#62686f'}: IconProps) {
    return <RasterIcon source={icons.quickCalendar} size={size} color={color} />;
}

export function QuickTodoIcon({size = 23, color = '#62686f'}: IconProps) {
    return <RasterIcon source={icons.quickTodo} size={size} color={color} />;
}

export function MeetingIcon({size = 23, color = '#62686f'}: IconProps) {
    return <RasterIcon source={icons.quickMeeting} size={size} color={color} />;
}

export function WecomMessageIcon({size = 28, color = '#62686e', strokeWidth = 2}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path
            d="M28 15.4c0 6.4-5.3 11.3-12.1 11.3-1.9 0-3.7-.4-5.3-1.1L4.3 28.3l1.8-5.9a10.7 10.7 0 0 1-2.2-7C3.9 9 9.1 4.2 15.9 4.2S28 9 28 15.4z"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>;
}

export function WecomMailIcon({size = 28, color = '#62686e'}: IconProps) {
    return <RasterIcon source={icons.mail} size={size} color={color} />;
}

export function WecomDocsIcon({size = 28, color = '#62686e'}: IconProps) {
    return <RasterIcon source={icons.docs} size={size} color={color} />;
}

export function WecomWorkbenchIcon({size = 28, color = '#62686e'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect x="5" y="5" width="8.2" height="8.2" rx="2" fill="none" stroke={color} strokeWidth="2.1" />
        <Rect x="18.8" y="5" width="8.2" height="8.2" rx="2" fill="none" stroke={color} strokeWidth="2.1" />
        <Rect x="5" y="18.8" width="8.2" height="8.2" rx="2" fill="none" stroke={color} strokeWidth="2.1" />
        <Rect x="18.8" y="18.8" width="8.2" height="8.2" rx="2" fill="none" stroke={color} strokeWidth="2.1" />
    </Svg>;
}

export function WecomContactsIcon({size = 28, color = '#62686e'}: IconProps) {
    return <RasterIcon source={icons.contacts} size={size} color={color} />;
}
export function WecomChatBackIcon({size = 30, color = '#090d12'}: IconProps) {
    return <RasterIcon source={icons.chatBack} size={size} color={color} />;
}

export function WecomChatSparkleIcon({size = 30, color = '#090d12'}: IconProps) {
    return <RasterIcon source={icons.chatSparkle} size={size} color={color} />;
}

export function WecomChatMoreIcon({size = 30, color = '#090d12'}: IconProps) {
    return <RasterIcon source={icons.chatMore} size={size} color={color} />;
}

export function WecomChatVoiceIcon({size = 28, color = '#090d12'}: IconProps) {
    return <RasterIcon source={icons.chatVoice} size={size} color={color} />;
}

export function WecomChatSmileIcon({size = 28, color = '#090d12'}: IconProps) {
    return <RasterIcon source={icons.chatSmile} size={size} color={color} />;
}

export function WecomChatPlusIcon({size = 28, color = '#090d12'}: IconProps) {
    return <RasterIcon source={icons.chatPlus} size={size} color={color} />;
}

export function AttachmentImageIcon({size = 32, color = '#414246'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect x="5" y="6" width="22" height="20" rx="2.8" fill={color} />
        <Circle cx="20.8" cy="11.2" r="2" fill="#fff" />
        <Path d="M7.7 22.9l5.4-6.2 4.1 4.1 3.4-3.8 3.7 4.2v2.1H7.7z" fill="#fff" />
    </Svg>;
}

export function AttachmentCameraIcon({size = 32, color = '#414246'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d="M10.5 7.2h11l2 2.8h2.1a2.4 2.4 0 0 1 2.4 2.4v10.8a2.6 2.6 0 0 1-2.6 2.6H6.6A2.6 2.6 0 0 1 4 23.2V12.4A2.4 2.4 0 0 1 6.4 10h2.1z" fill={color} />
        <Circle cx="16" cy="17.8" r="4.1" fill="#fff" />
    </Svg>;
}

export function AttachmentFavoriteIcon({size = 32, color = '#414246'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d="M15 3.7a2 2 0 0 1 2 0l9.3 5.4a2 2 0 0 1 1 1.7v10.7a2 2 0 0 1-1 1.8L17 28.7a2 2 0 0 1-2 0l-9.3-5.4a2 2 0 0 1-1-1.8V10.8a2 2 0 0 1 1-1.7z" fill={color} />
        <Path d="M16 6.1l8.1 4.7-8.1 4.7-8.1-4.7z" fill="#fff" />
    </Svg>;
}

export function AttachmentCallIcon({size = 32, color = '#414246'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d="M9.2 4.5l4.2 5.5a1.8 1.8 0 0 1-.2 2.4l-2.1 1.9a25.8 25.8 0 0 0 9.7 8.6l1.8-2.3a1.8 1.8 0 0 1 2.4-.4l5.2 3.6a1.8 1.8 0 0 1 .6 2.3l-1 2c-.6 1.2-1.9 1.9-3.3 1.7C14.7 28.3 5.8 19.4 4.3 7.7a3.3 3.3 0 0 1 1.8-3.3l1.1-.5a1.6 1.6 0 0 1 2 .6z" fill={color} />
    </Svg>;
}

export function AttachmentRedPacketIcon({size = 32, color = '#414246'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect x="6" y="3" width="20" height="26" rx="3.5" fill={color} />
        <Path d="M7 8.4c5 4.2 13 4.2 18 0" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>;
}

export function AttachmentDocumentIcon({size = 32, color = '#414246'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect x="6" y="3" width="20" height="26" rx="3.5" fill={color} />
        <Path d="M11 11h10M11 16h10M11 21h7" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
    </Svg>;
}

export function AttachmentCalendarIcon({size = 32, color = '#414246'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect x="5" y="4" width="22" height="25" rx="3.5" fill={color} />
        <Path d="M9 11h14" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="10.5" cy="17" r="1.25" fill="#fff" />
        <Circle cx="16" cy="17" r="1.25" fill="#fff" />
        <Circle cx="21.5" cy="17" r="1.25" fill="#fff" />
        <Circle cx="10.5" cy="22.5" r="1.25" fill="#fff" />
        <Circle cx="16" cy="22.5" r="1.25" fill="#fff" />
        <Circle cx="21.5" cy="22.5" r="1.25" fill="#fff" />
    </Svg>;
}

export function AttachmentMeetingIcon({size = 32, color = '#414246'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d="M19 2.5L5.5 17.2h9.1l-2 12.3L26.5 13h-9.2z" fill={color} />
    </Svg>;
}
