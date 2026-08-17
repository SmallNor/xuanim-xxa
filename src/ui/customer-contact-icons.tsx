import Svg, {Circle, G, Line, Path, Rect} from 'react-native-svg';

type IconProps = {
    size?: number;
    color?: string;
};

export function ContactHeaderIcon({size = 24}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M3.2 10.8c0-4.4 3.8-7.5 8.8-7.5s8.8 3.1 8.8 7.5-3.8 7.5-8.8 7.5c-1.5 0-2.9-.3-4.1-.8l-3.7 1.6 1-3.4a6.8 6.8 0 0 1-2-4.9z" fill="#fff" />
        <Circle cx="9" cy="10.2" r="1" fill="#4373d5" />
        <Circle cx="15" cy="10.2" r="1" fill="#4373d5" />
    </Svg>;
}

export function ContactTabIcon({size = 24, color = '#307ee8'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M2.7 10.7c0-4.6 3.9-7.8 9.3-7.8s9.3 3.2 9.3 7.8-3.9 7.8-9.3 7.8c-1.6 0-3-.3-4.3-.8l-4 1.7 1.1-3.6a7 7 0 0 1-2.1-5.1z" fill={color} />
        <Circle cx="8.9" cy="10.1" r="1.15" fill="#fff" />
        <Circle cx="15.1" cy="10.1" r="1.15" fill="#fff" />
    </Svg>;
}

export function BackIcon({size = 25, color = '#fff'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 25 25">
        <Path d="M10.8 4.2l-8.3 8.3 8.3 8.3M2.8 12.5h13" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>;
}

export function MoreIcon({size = 25, color = '#fff'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 25 25">
        <Circle cx="12.5" cy="4.2" r="1.7" fill={color} />
        <Circle cx="12.5" cy="12.5" r="1.7" fill={color} />
        <Circle cx="12.5" cy="20.8" r="1.7" fill={color} />
    </Svg>;
}

export function ChevronIcon({size = 16, color = '#e1e3e7'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 16 16">
        <Path d="M6 3.1L10.7 8 6 12.9" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>;
}

export function QuestionIcon({size = 16, color = '#ef6d68'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 16 16">
        <Circle cx="8" cy="8" r="6.4" fill="none" stroke={color} strokeWidth="1.45" />
        <Path d="M6.3 6.1A1.8 1.8 0 0 1 8.2 4.5c1.2 0 2 .7 2 1.8 0 1.8-2.1 1.8-2.1 3.3" fill="none" stroke={color} strokeWidth="1.35" strokeLinecap="round" />
        <Circle cx="8.1" cy="11.9" r=".75" fill={color} />
    </Svg>;
}

export function FilterIcon({size = 17, color = '#111'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 17 17">
        <Path d="M2.3 3.2h12.4L10 8.4v4.7l-3 1V8.4z" fill="none" stroke={color} strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>;
}

export function DashboardIcon({size = 20, color = '#111'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 20 20">
        <Path d="M9 1.9a8.1 8.1 0 1 0 8.9 8.9H9z" fill="none" stroke={color} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M11.2 1.8v6.9h6.9a8 8 0 0 0-6.9-6.9z" fill="none" stroke={color} strokeWidth="1.35" strokeLinejoin="round" />
    </Svg>;
}

export function PlusCircleIcon({size = 13, color = '#2f83e7'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 13 13">
        <Circle cx="6.5" cy="6.5" r="5.1" fill="none" stroke={color} strokeWidth="1.3" />
        <Path d="M6.5 3.8v5.4M3.8 6.5h5.4" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </Svg>;
}

export function ConfigTabIcon({size = 24, color = '#54585e'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 24 24">
        <G fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
            <Line x1="3" y1="6" x2="21" y2="6" />
            <Line x1="3" y1="12" x2="21" y2="12" />
            <Line x1="3" y1="18" x2="21" y2="18" />
        </G>
        <Circle cx="9" cy="6" r="2.2" fill="#fafbfd" stroke={color} strokeWidth="1.6" />
        <Circle cx="15.5" cy="12" r="2.2" fill="#fafbfd" stroke={color} strokeWidth="1.6" />
        <Circle cx="7" cy="18" r="2.2" fill="#fafbfd" stroke={color} strokeWidth="1.6" />
    </Svg>;
}

export function ContactMeIcon({size = 21, color = '#35c469'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M4.1 4.8h15.8v12.5H10l-4.7 3v-3H4.1z" fill="none" stroke={color} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8.3 9.1h7.4" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>;
}

export function WelcomeIcon({size = 21, color = '#35c469'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M3.4 10.9c0-4.5 3.7-7.7 8.7-7.7s8.6 3.2 8.6 7.7-3.6 7.7-8.6 7.7c-1.4 0-2.8-.3-3.9-.8l-3.6 1.6 1-3.4a7 7 0 0 1-2.2-5.1z" fill="none" stroke={color} strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M7.1 8.2v5.1M10 8.2v5.1M7.2 10.7h2.7M12.4 9.8v3.5M12.4 8.2v.1M15.1 10.2c.8-.5 1.8-.5 2.6 0v2.9" fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    </Svg>;
}

export function QuickReplyIcon({size = 21, color = '#f5b91c'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M4 5.2h12.5a3.2 3.2 0 0 1 3.2 3.2v5.5a3.2 3.2 0 0 1-3.2 3.2H9l-4.2 2.6v-3.4A3.2 3.2 0 0 1 4 14.1z" fill="none" stroke={color} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8.1 9.1h7.3M8.1 12.8h4.7" fill="none" stroke={color} strokeWidth="1.35" strokeLinecap="round" />
    </Svg>;
}

export function ToolbarIcon({size = 21, color = '#f5b91c'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M10.5 10.5C7.8 9.7 4 7.6 4.1 5.1c.1-1.6 1.5-2.2 2.7-1.5 2.2 1.2 3.3 4.9 3.7 6.9zM13.5 10.5c.4-2 1.5-5.7 3.7-6.9 1.2-.7 2.6-.1 2.7 1.5.1 2.5-3.7 4.6-6.4 5.4zM10.5 13.5c-2.7.8-6.5 2.9-6.4 5.4.1 1.6 1.5 2.2 2.7 1.5 2.2-1.2 3.3-4.9 3.7-6.9zM13.5 13.5c.4 2 1.5 5.7 3.7 6.9 1.2.7 2.6.1 2.7-1.5.1-2.5-3.7-4.6-6.4-5.4z" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>;
}

export function AlbumIcon({size = 21, color = '#f5b91c'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x="4.2" y="2.8" width="15.6" height="18.4" rx=".8" fill="none" stroke={color} strokeWidth="1.55" />
        <Path d="M7.5 7.1h3.8l-1.9 2.3zM7.5 13h8.7M7.5 16.5h6.2" fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>;
}

export function VideoChannelIcon({size = 21, color = '#f5b91c'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M11.2 11.8C9.3 6.6 6.8 3.5 4.9 3.6c-1.8.1-2.2 2.1-1.6 4.3 1 3.6 4.4 6.9 7.9 9.9M12.8 11.8c1.9-5.2 4.4-8.3 6.3-8.2 1.8.1 2.2 2.1 1.6 4.3-1 3.6-4.4 6.9-7.9 9.9" fill="none" stroke={color} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>;
}

export function RecommendServiceIcon({size = 21, color = '#f5b91c'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M3.5 10.7c0-4.4 3.7-7.5 8.6-7.5s8.5 3.1 8.5 7.5-3.6 7.5-8.5 7.5c-1.5 0-2.8-.3-4-.8l-3.6 1.5 1-3.3a6.8 6.8 0 0 1-2-4.9z" fill="none" stroke={color} strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8.1 11.6c1.1.9 2.4 1.3 4 1.3s2.9-.4 4-1.3M8.4 8.8h.1M15.6 8.8h.1" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </Svg>;
}

export function OffWorkReplyIcon({size = 21, color = '#f5b91c'}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M4 4.2h13.4v11H9.5l-4 2.6v-2.6H4z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <Path d="M9.3 9.6h6.3M13.6 7.5l2.1 2.1-2.1 2.1" fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M8.1 19.8h11.8v-9.7" fill="none" stroke={color} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>;
}
