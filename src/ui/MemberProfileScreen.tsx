import {useEffect, useState} from 'react';
import {ActivityIndicator, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CalendarDays, ChevronLeft, ChevronRight, ShieldCheck, UserRound} from 'lucide-react-native';
import {XuanClient, XuanDepartment, XuanMember} from '../api/xuan';

const profileColors = ['#4d9de0', '#48b97d', '#e49b45', '#8e78d4', '#55a9a2'];

const displayName = (member: XuanMember) => member.realname || member.account || `用户 ${member.id}`;

function ProfileAvatar({member, client}: {member: XuanMember; client: XuanClient}) {
    const uri = client.resolveAsset(member.avatar);
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [uri]);
    if (uri && !failed) return <Image source={{uri}} style={styles.avatar} onError={() => setFailed(true)} />;
    return <View style={[styles.avatar, styles.avatarFallback, {backgroundColor: profileColors[member.id % profileColors.length]}]}>
        <Text style={styles.avatarText}>{displayName(member).trim().slice(0, 1).toUpperCase()}</Text>
    </View>;
}

export default function MemberProfileScreen({
    member, departments, company, client, sending, error, back, sendMessage,
}: {
    member: XuanMember; departments: XuanDepartment[]; company?: string; client: XuanClient;
    sending: boolean; error: string; back: () => void; sendMessage: () => void;
}) {
    const department = departments.find((item) => item.id === Number(member.dept || 0));
    const companyName = company?.trim() || '企业通讯录';
    const phone = member.mobile?.trim() || member.phone?.trim() || '未填写';

    return <View style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.topSafe}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={back} accessibilityLabel="返回通讯录">
                    <ChevronLeft size={31} color="#11151a" strokeWidth={1.8} />
                </Pressable>
                <Text style={styles.headerTitle}>个人信息</Text>
            </View>
        </SafeAreaView>

        <View style={styles.content}>
            <View style={styles.card}>
                <View style={styles.identity}>
                    <ProfileAvatar member={member} client={client} />
                    <View style={styles.nameLine}>
                        <Text numberOfLines={1} style={styles.name}>{displayName(member)}</Text>
                        <UserRound size={19} color="#63aff7" fill="#63aff7" strokeWidth={1.8} />
                    </View>
                </View>
                <View style={styles.scheduleRow}>
                    <CalendarDays size={20} color="#747a80" strokeWidth={1.7} />
                    <Text style={styles.scheduleText}>查看日程</Text>
                    <ChevronRight size={24} color="#c8ccd0" strokeWidth={1.6} />
                </View>
            </View>

            <View style={[styles.card, styles.cardGap]}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>手机</Text>
                    <Text numberOfLines={1} style={[styles.value, phone !== '未填写' && styles.phone]}>{phone}</Text>
                </View>
                <View style={[styles.infoRow, styles.departmentRow]}>
                    <Text style={styles.label}>部门</Text>
                    <View style={styles.valueColumn}>
                        <Text numberOfLines={1} style={styles.value}>{department?.name || '未设置'}</Text>
                        <Text numberOfLines={1} style={styles.subValue}>{companyName}</Text>
                    </View>
                    <ChevronRight size={24} color="#c8ccd0" strokeWidth={1.6} />
                </View>
            </View>

            <View style={[styles.card, styles.cardGap, styles.enterpriseRow]}>
                <Text style={styles.label}>企业</Text>
                <View style={styles.enterpriseValue}>
                    <Text numberOfLines={1} style={styles.value}>{companyName}</Text>
                    <ShieldCheck size={18} color="#25bd62" fill="#25bd62" stroke="white" strokeWidth={1.8} />
                </View>
                <ChevronRight size={24} color="#c8ccd0" strokeWidth={1.6} />
            </View>

            <View style={styles.flexSpace} />
            {!!error && <Text numberOfLines={2} style={styles.errorText}>{error}</Text>}
            <Text numberOfLines={1} style={styles.inviteText}>
                <Text style={styles.inviteLink}>{companyName}</Text>
                <Text> 邀请加入</Text>
            </Text>
        </View>

        <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
            <Pressable style={({pressed}) => [styles.sendButton, pressed && !sending && styles.sendButtonPressed]} onPress={sendMessage} disabled={sending}>
                {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>发消息</Text>}
            </Pressable>
        </SafeAreaView>
    </View>;
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: '#f0f3f9'},
    topSafe: {backgroundColor: '#f0f3f9'},
    header: {height: 56, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center'},
    backButton: {width: 44, height: 52, alignItems: 'center', justifyContent: 'center'},
    headerTitle: {marginLeft: -5, color: '#11151a', fontSize: 21, fontWeight: '400'},
    content: {minHeight: 0, paddingTop: 0, flex: 1},
    card: {marginHorizontal: 11, overflow: 'hidden', borderRadius: 8, backgroundColor: '#fff'},
    cardGap: {marginTop: 11},
    identity: {height: 86, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center'},
    avatar: {width: 57, height: 57, borderRadius: 8, backgroundColor: '#e9edf1'},
    avatarFallback: {alignItems: 'center', justifyContent: 'center'},
    avatarText: {color: '#fff', fontSize: 23, fontWeight: '600'},
    nameLine: {minWidth: 0, marginLeft: 13, flex: 1, flexDirection: 'row', alignItems: 'center', columnGap: 7},
    name: {minWidth: 0, flexShrink: 1, color: '#111418', fontSize: 19, fontWeight: '500'},
    scheduleRow: {height: 42, marginLeft: 15, paddingRight: 12, flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eceeef'},
    scheduleText: {marginLeft: 14, flex: 1, color: '#15191d', fontSize: 16},
    infoRow: {height: 44, marginLeft: 15, paddingRight: 12, flexDirection: 'row', alignItems: 'center'},
    departmentRow: {height: 56, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eceeef'},
    label: {width: 56, color: '#15191d', fontSize: 16},
    value: {minWidth: 0, color: '#15191d', fontSize: 16},
    phone: {color: '#5575a2'},
    valueColumn: {minWidth: 0, flex: 1, justifyContent: 'center'},
    subValue: {marginTop: 2, color: '#a2a7ad', fontSize: 12},
    enterpriseRow: {height: 44, paddingLeft: 15, paddingRight: 12, flexDirection: 'row', alignItems: 'center'},
    enterpriseValue: {minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', columnGap: 7},
    flexSpace: {flex: 1},
    errorText: {paddingHorizontal: 24, marginBottom: 8, color: '#b24c42', fontSize: 13, textAlign: 'center'},
    inviteText: {marginHorizontal: 24, marginBottom: 20, color: '#858b92', fontSize: 14, textAlign: 'center'},
    inviteLink: {color: '#2482d8'},
    footerSafe: {paddingHorizontal: 11, paddingTop: 11, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#dfe3e8', backgroundColor: '#f8f9fb'},
    sendButton: {height: 44, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2f80e9'},
    sendButtonPressed: {backgroundColor: '#236fd2'},
    sendButtonText: {color: '#fff', fontSize: 18, fontWeight: '500'},
});
