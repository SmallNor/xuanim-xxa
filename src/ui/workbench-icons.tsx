import type {ReactNode} from 'react';
import Svg, {Circle, Defs, G, LinearGradient, Path, Rect, Stop} from 'react-native-svg';

type IconProps = {
    size?: number;
};

function GreenTile({size, children}: {size: number; children: ReactNode}) {
    return <Svg width={size} height={size} viewBox="0 0 48 48">
        <Defs>
            <LinearGradient id="workbenchGreen" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#55c668" />
                <Stop offset="1" stopColor="#43bc4c" />
            </LinearGradient>
        </Defs>
        <Rect width="48" height="48" rx="9.5" fill="url(#workbenchGreen)" />
        {children}
    </Svg>;
}

function SoftTile({size, background, children}: {size: number; background: string; children: ReactNode}) {
    return <Svg width={size} height={size} viewBox="0 0 48 48">
        <Rect width="48" height="48" rx="9.5" fill={background} />
        {children}
    </Svg>;
}

function OrangeTile({size, children}: {size: number; children: ReactNode}) {
    return <Svg width={size} height={size} viewBox="0 0 48 48">
        <Defs>
            <LinearGradient id="orangeTile" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#ffc51d" />
                <Stop offset="1" stopColor="#ffb70f" />
            </LinearGradient>
        </Defs>
        <Rect width="48" height="48" rx="9.5" fill="url(#orangeTile)" />
        {children}
    </Svg>;
}

function BlueTile({size, children}: {size: number; children: ReactNode}) {
    return <Svg width={size} height={size} viewBox="0 0 48 48">
        <Defs>
            <LinearGradient id="blueTile" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#69aaf0" />
                <Stop offset="1" stopColor="#5798e8" />
            </LinearGradient>
        </Defs>
        <Rect width="48" height="48" rx="9.5" fill="url(#blueTile)" />
        {children}
    </Svg>;
}

export function WorkbenchSettingsIcon({size = 30}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d="M4.5 7.5h21M4.5 15.7h9.2M4.5 24h9.2" fill="none" stroke="#050b12" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M21.9 13.8l5 2.8v5.7l-5 2.8-5-2.8v-5.7z" fill="none" stroke="#050b12" strokeWidth="2.25" strokeLinejoin="round" />
        <Circle cx="21.9" cy="19.45" r="1.55" fill="#050b12" />
    </Svg>;
}

export function ManageEnterpriseIcon({size = 30}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 40 40">
        <Defs>
            <LinearGradient id="enterpriseBlue" x1="0" y1="0" x2="0.8" y2="1">
                <Stop offset="0" stopColor="#76b7f8" />
                <Stop offset="1" stopColor="#468eea" />
            </LinearGradient>
        </Defs>
        <Path d="M20 3.8l12.8 7.4v14.7L20 33.3 7.2 25.9V11.2z" fill="url(#enterpriseBlue)" />
        <Circle cx="20" cy="18.55" r="5.15" fill="#fff" />
    </Svg>;
}

export function ChooseAppsIcon({size = 30}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 40 40">
        <Defs>
            <LinearGradient id="appBlue" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#7cc4ed" /><Stop offset="1" stopColor="#54a9df" /></LinearGradient>
            <LinearGradient id="appGreen" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#83d993" /><Stop offset="1" stopColor="#4cc77c" /></LinearGradient>
            <LinearGradient id="appYellow" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#ffd75d" /><Stop offset="1" stopColor="#f8b91f" /></LinearGradient>
            <LinearGradient id="appRed" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#ff9f98" /><Stop offset="1" stopColor="#f36e6c" /></LinearGradient>
        </Defs>
        <Rect x="7" y="7" width="11.5" height="11.5" rx="2.8" fill="url(#appBlue)" />
        <Rect x="21.5" y="7" width="11.5" height="11.5" rx="2.8" fill="url(#appGreen)" />
        <Rect x="7" y="21.5" width="11.5" height="11.5" rx="2.8" fill="url(#appYellow)" />
        <Rect x="21.5" y="21.5" width="11.5" height="11.5" rx="2.8" fill="url(#appRed)" />
    </Svg>;
}

export function FindServiceIcon({size = 30}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 40 40">
        <Defs>
            <LinearGradient id="serviceBlue" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#75b5f2" />
                <Stop offset="1" stopColor="#498eea" />
            </LinearGradient>
        </Defs>
        <Path d="M14.7 5.2h10.6l-2.7 6.2h-5.2zM17.2 13.3h5.6l3.5 14.3L20 35l-6.3-7.4z" fill="url(#serviceBlue)" />
    </Svg>;
}

export function ServiceSummaryIcon({size = 17}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 20 20">
        <Path d="M9.1 5.2L2.8 2.8v10.6l6.3-2.5zM10.9 5.2l6.3-2.4v10.6l-6.3-2.5z" fill="#19b961" />
        <Path d="M8.6 7.2h2.8v7.5H8.6z" fill="#19b961" />
    </Svg>;
}

export function PromoFeatureIcon({size = 13}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 14 14">
        <Circle cx="7" cy="7" r="5" fill="none" stroke="#58cae8" strokeWidth="2.8" />
        <Circle cx="7" cy="7" r="1.45" fill="#439ee9" />
    </Svg>;
}

export function PromoPlayIcon({size = 15}: IconProps) {
    return <Svg width={size} height={size} viewBox="0 0 16 16">
        <Circle cx="8" cy="8" r="6.2" fill="none" stroke="#347bdc" strokeWidth="1.8" />
        <Path d="M6.7 5.2l4.1 2.8-4.1 2.8z" fill="#347bdc" />
    </Svg>;
}

export function CustomerContactIcon({size = 35}: IconProps) {
    return <GreenTile size={size}>
        <Path d="M9.5 22.3c0-7.6 6.3-12.8 14.5-12.8s14.5 5.2 14.5 12.8S32.2 35.1 24 35.1c-2.6 0-5-.5-7-1.5l-5.9 2.5 1.6-5.5a12.3 12.3 0 0 1-3.2-8.3z" fill="#fff" />
        <Circle cx="19" cy="21.3" r="1.8" fill="#5fc162" />
        <Circle cx="29" cy="21.3" r="1.8" fill="#5fc162" />
    </GreenTile>;
}

export function ContactsCustomerIcon({size = 36}: IconProps) {
    return <GreenTile size={size}>
        <Path d="M8.5 21.5c0-7.1 5.9-12.2 13.9-12.2s13.9 5.1 13.9 12.2-5.9 12.2-13.9 12.2c-2.2 0-4.3-.4-6.2-1.1l-5.6 2.3 1.5-5.1c-2.2-2.2-3.6-5.1-3.6-8.3z" fill="#fff" />
        <Path d="M20.3 28c0-6.4 5.4-10.9 12.3-10.9S44.9 21.6 44.9 28s-5.4 10.9-12.3 10.9c-1.9 0-3.7-.3-5.3-.9l-4.5 1.9 1.2-4c-2.3-1.9-3.7-4.5-3.7-7.9z" fill="#fff" />
        <Circle cx="17.5" cy="20.3" r="1.55" fill="#5fc162" />
        <Circle cx="25.7" cy="20.3" r="1.55" fill="#5fc162" />
        <Circle cx="29.2" cy="26.9" r="1.5" fill="#5fc162" />
        <Circle cx="37.2" cy="26.9" r="1.5" fill="#5fc162" />
    </GreenTile>;
}

export function ContactsAddCustomerIcon({size = 36}: IconProps) {
    return <GreenTile size={size}>
        <Circle cx="20" cy="14.5" r="5.5" fill="#fff" />
        <Path d="M8.5 37.5c.7-7.5 5-12.1 11.5-12.1s10.8 4.6 11.5 12.1z" fill="#fff" />
        <Path d="M34.5 14.5v12M28.5 20.5h12" fill="none" stroke="#fff" strokeWidth="3.1" strokeLinecap="round" />
    </GreenTile>;
}

export function AiDocumentIcon({size = 48}: IconProps) {
    return <SoftTile size={size} background="#f1f8ff">
        <Rect x="10" y="10" width="28" height="28" rx="6" fill="#5ab3e5" />
        <Path d="M16.2 15.2c.5 2.7 1.6 3.8 4.3 4.3-2.7.5-3.8 1.6-4.3 4.3-.5-2.7-1.6-3.8-4.3-4.3 2.7-.5 3.8-1.6 4.3-4.3z" fill="#fff" />
        <Path d="M23 17.3h9M23 23.8h9M23 30.3h9" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
    </SoftTile>;
}

export function AiSpreadsheetIcon({size = 48}: IconProps) {
    return <SoftTile size={size} background="#eafaf7">
        <Rect x="10" y="10" width="28" height="28" rx="6" fill="#32c5ad" />
        <Path d="M17.3 14.7l4.5 4.5-4.5 4.5-4.5-4.5zm13.4 0l4.5 4.5-4.5 4.5-4.5-4.5zM17.3 24.3l4.5 4.5-4.5 4.5-4.5-4.5zm13.4 0l4.5 4.5-4.5 4.5-4.5-4.5z" fill="#fff" />
    </SoftTile>;
}

export function AiSummaryIcon({size = 48}: IconProps) {
    return <SoftTile size={size} background="#f8f3ff">
        <Defs>
            <LinearGradient id="aiSummary" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#5b9ceb" />
                <Stop offset="1" stopColor="#9a70e6" />
            </LinearGradient>
        </Defs>
        <Path d="M24 7.2c1.7 9.2 5 12.5 14.2 14.2C29 23.1 25.7 26.4 24 35.6c-1.7-9.2-5-12.5-14.2-14.2C19 19.7 22.3 16.4 24 7.2z" fill="url(#aiSummary)" />
    </SoftTile>;
}

export function AiRobotIcon({size = 48}: IconProps) {
    return <SoftTile size={size} background="#f8f3ff">
        <Defs>
            <LinearGradient id="aiRobot" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#3e9ef0" />
                <Stop offset="1" stopColor="#9a72df" />
            </LinearGradient>
        </Defs>
        <Circle cx="24" cy="25" r="11.5" fill="url(#aiRobot)" />
        <Circle cx="11.5" cy="25" r="3" fill="#3e9ef0" />
        <Circle cx="36.5" cy="25" r="3" fill="#9474df" />
        <Rect x="14.5" y="19" width="19" height="13" rx="6.5" fill="#fff" />
        <Circle cx="20" cy="25.5" r="1.8" fill="#4d9bec" />
        <Circle cx="28" cy="25.5" r="1.8" fill="#8d73df" />
        <Path d="M24 13.5v-3.2M21.8 10.3h4.4" fill="none" stroke="#9674df" strokeWidth="2" strokeLinecap="round" />
    </SoftTile>;
}

export function AiChatIcon({size = 48}: IconProps) {
    return <SoftTile size={size} background="#f6f2ff">
        <Path d="M11 15.5c0-2.8 2.2-5 5-5h9c2.8 0 5 2.2 5 5v10c0 2.8-2.2 5-5 5h-4.2l-5.3 4.5v-4.5C13 30.2 11 28.2 11 25.7z" fill="#4f8ce9" />
        <Path d="M22 17c0-2.8 2.2-5 5-5h5c2.8 0 5 2.2 5 5v10c0 2.8-2.2 5-5 5h-3.3L24 36v-4.3c-1.2-.9-2-2.4-2-4.2z" fill="#9676df" />
        <Path d="M17.5 18v7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <Circle cx="29.5" cy="20.2" r="1.7" fill="#fff" />
    </SoftTile>;
}

export function AiServiceSummaryIcon({size = 48}: IconProps) {
    return <SoftTile size={size} background="#effbf7">
        <Path d="M10.5 14l13 6.2-4.2 3.8 4.2 3.8-13 6.2c1.8-5 1.8-15 0-20zM37.5 14l-13 6.2 4.2 3.8-4.2 3.8 13 6.2c-1.8-5-1.8-15 0-20z" fill="#20bd60" />
        <Path d="M24 19.4c.7 2.8 1.8 3.9 4.6 4.6-2.8.7-3.9 1.8-4.6 4.6-.7-2.8-1.8-3.9-4.6-4.6 2.8-.7 3.9-1.8 4.6-4.6z" fill="#fff" />
    </SoftTile>;
}

export function InternalLocationIcon({size = 48}: IconProps) {
    return <OrangeTile size={size}><Path d="M24 9c-6 0-10 4.4-10 10.1 0 7.7 10 19.5 10 19.5s10-11.8 10-19.5C34 13.4 30 9 24 9z" fill="#fff" /><Circle cx="24" cy="19" r="4" fill="#ffbc13" /></OrangeTile>;
}

export function InternalApprovalIcon({size = 48}: IconProps) {
    return <OrangeTile size={size}>
        <Path d="M24 9.2c-2.5 0-4.3 2-4.3 4.5v5.1c0 2.5-.9 4.8-2.6 6.6l-2 2.2h17.8l-2-2.2a9.7 9.7 0 0 1-2.6-6.6v-5.1c0-2.5-1.8-4.5-4.3-4.5z" fill="#fff" />
        <Rect x="13" y="29.4" width="22" height="3.8" rx="1" fill="#fff" />
        <Rect x="11" y="35" width="26" height="3" rx="1" fill="#fff" />
    </OrangeTile>;
}

export function InternalReportIcon({size = 48}: IconProps) {
    return <OrangeTile size={size}><Rect x="12" y="9" width="24" height="30" rx="4" fill="#fff" /><Circle cx="18" cy="17" r="2" fill="#ffbc13" /><Path d="M22 17h8M17 24h14M17 29h10" fill="none" stroke="#ffbc13" strokeWidth="2" strokeLinecap="round" /></OrangeTile>;
}

export function InternalMeetingIcon({size = 48}: IconProps) {
    return <OrangeTile size={size}>
        <Path d="M11.5 13l19-3v28l-19-3z" fill="#fff" />
        <Rect x="31.5" y="14" width="5" height="20" rx="1.4" fill="#fff" />
        <Rect x="25.8" y="21" width="2.3" height="6" rx="1.1" fill="#ffbc13" />
    </OrangeTile>;
}

export function InternalAnnouncementIcon({size = 48}: IconProps) {
    return <OrangeTile size={size}>
        <Path d="M10.5 19h8L34 12v24l-15.5-7h-8z" fill="#fff" />
        <Path d="M14 28h7l-1.5 10h-5z" fill="#fff" />
        <Path d="M36.5 18c1.9 2.8 1.9 9.2 0 12" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </OrangeTile>;
}

export function InternalPayrollIcon({size = 48}: IconProps) {
    return <OrangeTile size={size}>
        <Path d="M13 9h22v30l-3-2.2-3 2.2-3-2.2-3 2.2-3-2.2-3 2.2-4-2.2z" fill="#fff" />
        <Path d="M18.2 14.5l5.8 6 5.8-6M18.4 21.5h11.2M18.4 26h11.2M24 21v10" fill="none" stroke="#ffbc13" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </OrangeTile>;
}

export function InternalHrIcon({size = 48}: IconProps) {
    return <OrangeTile size={size}>
        <Circle cx="24" cy="14.5" r="5.5" fill="#fff" />
        <Path d="M12.5 37c.8-8.2 4.9-12.6 11.5-12.6S34.7 28.8 35.5 37z" fill="#fff" />
        <Path d="M21.3 24.8L24 28l2.7-3.2L25.3 35h-2.6z" fill="#ffbc13" />
    </OrangeTile>;
}

export function InternalColleagueIcon({size = 48}: IconProps) {
    return <OrangeTile size={size}>
        <G fill="#fff">
            <Circle cx="24" cy="10.8" r="3.3" />
            <Circle cx="37.2" cy="24" r="3.3" />
            <Circle cx="24" cy="37.2" r="3.3" />
            <Circle cx="10.8" cy="24" r="3.3" />
            <Path d="M16.4 20.1c.6-4.2 3.4-6.6 7.6-6.6s7 2.4 7.6 6.6L24 24z" />
            <Path d="M27.9 16.4c4.2.6 6.6 3.4 6.6 7.6s-2.4 7-6.6 7.6L24 24z" />
            <Path d="M31.6 27.9c-.6 4.2-3.4 6.6-7.6 6.6s-7-2.4-7.6-6.6L24 24z" />
            <Path d="M20.1 31.6c-4.2-.6-6.6-3.4-6.6-7.6s2.4-7 6.6-7.6L24 24z" />
        </G>
    </OrangeTile>;
}

export function InternalIndustryIcon({size = 48}: IconProps) {
    return <OrangeTile size={size}>
        <Path d="M11 10h24v25H18l-7 4z" fill="#fff" />
        <Path d="M17 17h12M17 23h12M17 29h8" fill="none" stroke="#ffbc13" strokeWidth="2.2" strokeLinecap="round" />
        <Rect x="34" y="27" width="4" height="10" rx="1.4" fill="#fff" />
    </OrangeTile>;
}

export function InternalLearningIcon({size = 48}: IconProps) {
    return <OrangeTile size={size}>
        <Circle cx="25" cy="23" r="10.5" fill="#fff" />
        <Path d="M8 29c5.6 2.2 14.2 1.1 22-2.6 7.8-2.8 12.7-6.4 12.2-9-.4-2.2-4.3-2.8-9.4-1.8" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
        <Circle cx="30.5" cy="17" r="1.5" fill="#ffbc13" />
    </OrangeTile>;
}

export function InternalMoreIcon({size = 48}: IconProps) {
    return <SoftTile size={size} background="#f6f7f9">
        <Rect x="10" y="10" width="12.5" height="12.5" rx="2.2" fill="#efb51d" />
        <Rect x="25.5" y="10" width="12.5" height="12.5" rx="2.2" fill="#579bea" />
        <Rect x="10" y="25.5" width="12.5" height="12.5" rx="2.2" fill="#35b86a" />
        <Rect x="25.5" y="25.5" width="12.5" height="12.5" rx="2.2" fill="#ed6f76" />
        <Path d="M16.2 13.5v5M13.7 16h5M28.7 15h6M28.7 18.5h6M13.5 29.5h5.5v5h-5.5zM29 29.5h5.5M29 32h5.5M29 34.5h5.5" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </SoftTile>;
}

export function EfficiencyCalendarIcon({size = 48}: IconProps) {
    return <BlueTile size={size}><Rect x="10" y="11" width="28" height="27" rx="4" fill="#fff" /><Path d="M16 9v6M32 9v6M10 19h28" fill="none" stroke="#5b9be9" strokeWidth="2.2" strokeLinecap="round" /><Circle cx="17" cy="25" r="1.65" fill="#5b9be9" /><Circle cx="24" cy="25" r="1.65" fill="#5b9be9" /><Circle cx="31" cy="25" r="1.65" fill="#5b9be9" /><Circle cx="17" cy="32" r="1.65" fill="#5b9be9" /><Circle cx="24" cy="32" r="1.65" fill="#5b9be9" /><Circle cx="31" cy="32" r="1.65" fill="#5b9be9" /></BlueTile>;
}

export function EfficiencyPictureIcon({size = 48}: IconProps) {
    return <BlueTile size={size}><Rect x="10" y="10" width="28" height="28" rx="4" fill="#fff" /><Path d="M13.5 31.5l8-9 5.2 5 3.8-4.1 4 4.4v3.7h-7.2l-5.8-5.7-5 5.7z" fill="#5b9be9" /></BlueTile>;
}

export function EfficiencyLiveIcon({size = 48}: IconProps) {
    return <BlueTile size={size}>
        <Path d="M8.5 16.5v15h7M19 16.5v15M23 16.5l4.2 15 4.2-15M39.5 16.5h-5.2v15h5.2M34.3 24h4.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </BlueTile>;
}

export function EfficiencyCubeIcon({size = 48}: IconProps) {
    return <BlueTile size={size}><Path d="M24 8.5L37 16v16L24 39.5 11 32V16z" fill="#fff" /><Path d="M24 24L11 16M24 24l13-8M24 24v15.5M17.5 12.2l13 7.6" fill="none" stroke="#5b9be9" strokeWidth="2" strokeLinejoin="round" /></BlueTile>;
}

export function CustomerGroupIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Circle cx="19" cy="17.3" r="6" fill="#fff" />
        <Path d="M7.8 38c.7-7.6 4.8-12.1 11.2-12.1S29.5 30.4 30.2 38z" fill="#fff" />
        <Circle cx="31.5" cy="21" r="4.6" fill="#fff" />
        <Path d="M27.1 28.9c1.3-.7 2.8-1.1 4.4-1.1 5.2 0 8.5 3.5 9.1 9.1h-9.8c-.5-3.3-1.8-6-3.7-8z" fill="#fff" />
    </GreenTile>;
}

export function CustomerMomentsIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <G fill="#fff" stroke="#5fc162" strokeWidth="1.2" strokeLinejoin="round">
            <Path d="M21 7.3h6l2.7 12.8-6-3.8z" />
            <Path d="M21 7.3h6l2.7 12.8-6-3.8z" transform="rotate(45 24 24)" />
            <Path d="M21 7.3h6l2.7 12.8-6-3.8z" transform="rotate(90 24 24)" />
            <Path d="M21 7.3h6l2.7 12.8-6-3.8z" transform="rotate(135 24 24)" />
            <Path d="M21 7.3h6l2.7 12.8-6-3.8z" transform="rotate(180 24 24)" />
            <Path d="M21 7.3h6l2.7 12.8-6-3.8z" transform="rotate(225 24 24)" />
            <Path d="M21 7.3h6l2.7 12.8-6-3.8z" transform="rotate(270 24 24)" />
            <Path d="M21 7.3h6l2.7 12.8-6-3.8z" transform="rotate(315 24 24)" />
        </G>
        <Circle cx="24" cy="24" r="4.7" fill="#5fc162" />
    </GreenTile>;
}

export function WechatServiceIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Path d="M9.2 22.5c0-8.2 6.6-13.8 15.4-13.8S40 14.3 40 22.5s-6.6 13.8-15.4 13.8c-2.7 0-5.2-.5-7.4-1.5l-6.5 2.7 1.7-6c-2-2.4-3.2-5.4-3.2-9z" fill="#fff" />
        <Path d="M17.4 25.4c1.5 2.9 4 4.4 7.5 4.4s6-1.5 7.5-4.4z" fill="#5fc162" />
    </GreenTile>;
}

export function LeadAssistantIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Path d="M23.2 6.8h10.2l-5.9 13h7.2L17.2 41l3.2-15h-7.1z" fill="#fff" />
    </GreenTile>;
}

export function ResignationTransferIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Rect x="10" y="8.5" width="28" height="31" rx="5.5" fill="#fff" />
        <Path d="M16 16.7h12.2l-2.7-2.8 2-2 6.2 6.2-6.2 6.2-2-2 2.7-2.8H16zM32 31.3H19.8l2.7 2.8-2 2-6.2-6.2 6.2-6.2 2 2-2.7 2.8H32z" fill="#5fc162" />
    </GreenTile>;
}

export function MassSendIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Path d="M10.5 18h8L37.5 10v22l-19-7.2h-8z" fill="#fff" />
        <Path d="M14 24h8l-3 12h-5z" fill="#fff" />
    </GreenTile>;
}

export function ExternalPaymentIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Path d="M11.2 10h25.6v14.3c0 8.4-4.5 13.6-12.8 17-8.3-3.4-12.8-8.6-12.8-17z" fill="#fff" />
        <Path d="M18 16l6 6 6-6M18.2 23h11.6M18.2 27h11.6M24 22v11" fill="none" stroke="#5fc162" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </GreenTile>;
}

export function BusinessCardIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Rect x="9" y="11" width="30" height="26" rx="5" fill="#fff" />
        <Path d="M17 29V19.5h5V29zm7 0V15h5v14zm7 0v-7h3v7z" fill="#5fc162" />
    </GreenTile>;
}

export function OfficeDocumentIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Path d="M13 8h16l7 7v25H13z" fill="#fff" />
        <Path d="M29 8v8h7" fill="#d8f6e2" />
        <Path d="M18 23h13M18 28h13M18 33h9" fill="none" stroke="#5fc162" strokeWidth="2" strokeLinecap="round" />
    </GreenTile>;
}

export function OfficeAssistantIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Path d="M24 7c1.5 9.4 5.6 13.5 15 15-9.4 1.5-13.5 5.6-15 15-1.5-9.4-5.6-13.5-15-15 9.4-1.5 13.5-5.6 15-15z" fill="#fff" />
        <Path d="M36 7c.5 3 1.8 4.3 4.8 4.8-3 .5-4.3 1.8-4.8 4.8-.5-3-1.8-4.3-4.8-4.8 3-.5 4.3-1.8 4.8-4.8z" fill="#fff" />
    </GreenTile>;
}

export function OfficeDataIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Rect x="9" y="9" width="30" height="30" rx="5" fill="#fff" />
        <Path d="M16 32v-7h4v7zm7 0V16h4v16zm7 0V21h4v11z" fill="#5fc162" />
    </GreenTile>;
}

export function OfficeMoreIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Rect x="12" y="12" width="9" height="9" rx="2" fill="#fff" />
        <Rect x="27" y="12" width="9" height="9" rx="2" fill="#fff" />
        <Rect x="12" y="27" width="9" height="9" rx="2" fill="#fff" />
        <Rect x="27" y="27" width="9" height="9" rx="2" fill="#fff" />
    </GreenTile>;
}
