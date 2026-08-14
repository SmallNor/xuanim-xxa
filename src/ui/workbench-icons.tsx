import type {ReactNode} from 'react';
import Svg, {Circle, Defs, G, LinearGradient, Path, Rect, Stop} from 'react-native-svg';

type IconProps = {
    size?: number;
};

function GreenTile({size, children}: {size: number; children: ReactNode}) {
    return <Svg width={size} height={size} viewBox="0 0 48 48">
        <Defs>
            <LinearGradient id="workbenchGreen" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#6bc66f" />
                <Stop offset="1" stopColor="#5aba59" />
            </LinearGradient>
        </Defs>
        <Rect width="48" height="48" rx="9.5" fill="url(#workbenchGreen)" />
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
        <Circle cx="19" cy="21.3" r="1.8" fill="#61bd60" />
        <Circle cx="29" cy="21.3" r="1.8" fill="#61bd60" />
    </GreenTile>;
}

export function CustomerGroupIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Circle cx="19" cy="18" r="6" fill="#fff" />
        <Path d="M7.5 38c.8-7.4 5-11.7 11.5-11.7S29.7 30.6 30.5 38z" fill="#fff" />
        <Circle cx="31.5" cy="21" r="4.5" fill="#fff" />
        <Path d="M29.4 28.3c6.4 0 10.1 3.1 11.1 8.3H31c-.8-3.6-2.6-6.4-5.2-8a15 15 0 0 1 3.6-.3z" fill="#fff" />
    </GreenTile>;
}

export function CustomerMomentsIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <G fill="#fff" stroke="#61bd60" strokeWidth="1.2" strokeLinejoin="round">
            <Path d="M20.1 7.5h7.8l3.2 13.1-7-4.6z" />
            <Path d="M20.1 7.5h7.8l3.2 13.1-7-4.6z" transform="rotate(45 24 24)" />
            <Path d="M20.1 7.5h7.8l3.2 13.1-7-4.6z" transform="rotate(90 24 24)" />
            <Path d="M20.1 7.5h7.8l3.2 13.1-7-4.6z" transform="rotate(135 24 24)" />
            <Path d="M20.1 7.5h7.8l3.2 13.1-7-4.6z" transform="rotate(180 24 24)" />
            <Path d="M20.1 7.5h7.8l3.2 13.1-7-4.6z" transform="rotate(225 24 24)" />
            <Path d="M20.1 7.5h7.8l3.2 13.1-7-4.6z" transform="rotate(270 24 24)" />
            <Path d="M20.1 7.5h7.8l3.2 13.1-7-4.6z" transform="rotate(315 24 24)" />
        </G>
        <Circle cx="24" cy="24" r="4.9" fill="#61bd60" />
    </GreenTile>;
}

export function WechatServiceIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Path d="M9.2 22.5c0-8.2 6.6-13.8 15.4-13.8S40 14.3 40 22.5s-6.6 13.8-15.4 13.8c-2.7 0-5.2-.5-7.4-1.5l-6.5 2.7 1.7-6c-2-2.4-3.2-5.4-3.2-9z" fill="#fff" />
        <Path d="M17.4 25.4c1.5 2.9 4 4.4 7.5 4.4s6-1.5 7.5-4.4z" fill="#33c461" />
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
        <Path d="M17 18h13l-3.2-3.2M31 29H18l3.2 3.2" fill="none" stroke="#31c15d" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </GreenTile>;
}

export function MassSendIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Path d="M10.5 17.7L38 9.5v23L10.5 25z" fill="#fff" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        <Path d="M14 24.5h8.2L19 36h-5.2z" fill="#fff" />
    </GreenTile>;
}

export function ExternalPaymentIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Path d="M11.2 10h25.6v14.3c0 8.4-4.5 13.6-12.8 17-8.3-3.4-12.8-8.6-12.8-17z" fill="#fff" />
        <Path d="M18 16l6 6 6-6M18.2 23h11.6M18.2 27h11.6M24 22v11" fill="none" stroke="#31c15d" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </GreenTile>;
}

export function BusinessCardIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Rect x="9" y="11" width="30" height="26" rx="5" fill="#fff" />
        <Path d="M17 29V19.5h5V29zm7 0V15h5v14zm7 0v-7h3v7z" fill="#31c15d" />
    </GreenTile>;
}

export function OfficeDocumentIcon({size = 48}: IconProps) {
    return <GreenTile size={size}>
        <Path d="M13 8h16l7 7v25H13z" fill="#fff" />
        <Path d="M29 8v8h7" fill="#d8f6e2" />
        <Path d="M18 23h13M18 28h13M18 33h9" fill="none" stroke="#31c15d" strokeWidth="2" strokeLinecap="round" />
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
        <Path d="M16 32v-7h4v7zm7 0V16h4v16zm7 0V21h4v11z" fill="#31c15d" />
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
