import {useEffect, useState} from 'react';
import {
    ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable,
    ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Camera, ChevronLeft, ChevronRight, LogOut, ShieldCheck, UserRound} from 'lucide-react-native';
import {XuanAvatarUpload, XuanClient, XuanCustomerContactData, XuanDepartment, XuanMember, XuanProfileUpdate} from '../api/xuan';
import {useAppUpdate} from '../update/AppUpdateProvider';

const profileColors = ['#4d9de0', '#48b97d', '#e49b45', '#8e78d4', '#55a9a2'];

type ProfileDraft = {
    realname: string;
    gender: string;
    mobile: string;
    phone: string;
    email: string;
    address: string;
};

type CustomerContactDraft = {
    externalContactScale: string;
    businessCategory: string;
    customerTotal: string;
    todayNewCustomers: string;
    todayPayment: string;
    weeklyOnlineRevenue: string;
    weeklyOfflineRevenue: string;
};

const displayName = (member: XuanMember) => member.realname || member.account || `\u7528\u6237 ${member.id}`;
const makeDraft = (member: XuanMember): ProfileDraft => ({
    realname: member.realname || '',
    gender: member.gender || '',
    mobile: member.mobile || '',
    phone: member.phone || '',
    email: member.email || '',
    address: member.address || '',
});
const makeCustomerContactDraft = (data: XuanCustomerContactData): CustomerContactDraft => ({
    externalContactScale: String(data.externalContactScale),
    businessCategory: data.businessCategory,
    customerTotal: String(data.customerTotal),
    todayNewCustomers: String(data.todayNewCustomers),
    todayPayment: data.todayPayment.toFixed(2),
    weeklyOnlineRevenue: data.weeklyOnlineRevenue.toFixed(2),
    weeklyOfflineRevenue: data.weeklyOfflineRevenue.toFixed(2),
});

function ProfileAvatar({member, client, previewUri}: {member: XuanMember; client: XuanClient; previewUri?: string}) {
    const uri = previewUri || client.resolveAsset(member.avatar);
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [uri]);
    if (uri && !failed) return <Image source={{uri}} style={styles.avatar} onError={() => setFailed(true)} />;
    return <View style={[styles.avatar, styles.avatarFallback, {backgroundColor: profileColors[member.id % profileColors.length]}]}>
        <Text style={styles.avatarText}>{displayName(member).trim().slice(0, 1).toUpperCase()}</Text>
    </View>;
}

function ProfileRow({label, value, last = false}: {label: string; value: string; last?: boolean}) {
    return <View style={[styles.profileRow, last && styles.lastRow]}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text numberOfLines={2} style={styles.rowValue}>{value || '\u672a\u8bbe\u7f6e'}</Text>
    </View>;
}

function EditField({label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false}: {
    label: string; value: string; onChangeText: (value: string) => void; placeholder: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric' | 'decimal-pad'; multiline?: boolean;
}) {
    return <View style={[styles.editRow, multiline && styles.editRowMultiline]}>
        <Text style={styles.rowLabel}>{label}</Text>
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#a3a8ae"
            keyboardType={keyboardType}
            autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
            autoCorrect={false}
            multiline={multiline}
            maxLength={multiline ? 120 : 60}
            style={[styles.editInput, multiline && styles.editInputMultiline]}
        />
    </View>;
}

export default function AccountScreen({
    member, departments, company, client, customerContactData, back, save, saveCustomerContactData, logout,
}: {
    member: XuanMember;
    departments: XuanDepartment[];
    company?: string;
    client: XuanClient;
    customerContactData: XuanCustomerContactData;
    back: () => void;
    save: (update: XuanProfileUpdate, avatar?: XuanAvatarUpload) => Promise<XuanMember>;
    saveCustomerContactData: (data: XuanCustomerContactData) => Promise<void>;
    logout: () => Promise<void>;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(() => makeDraft(member));
    const [customerContactDraft, setCustomerContactDraft] = useState(() => makeCustomerContactDraft(customerContactData));
    const [avatarDraft, setAvatarDraft] = useState<XuanAvatarUpload | null>(null);
    const [pickingAvatar, setPickingAvatar] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [error, setError] = useState('');
    const appUpdate = useAppUpdate();
    const department = departments.find((item) => item.id === Number(member.dept || 0));
    const companyName = company?.trim() || '\u4f01\u4e1a\u901a\u8baf\u5f55';
    const genderText = member.gender === 'm' ? '\u7537' : member.gender === 'f' ? '\u5973' : '\u672a\u8bbe\u7f6e';
    const showCustomerContact = member.admin === 'super' || member.admin === 'common';

    useEffect(() => {
        if (!editing) {
            setDraft(makeDraft(member));
            setCustomerContactDraft(makeCustomerContactDraft(customerContactData));
            setAvatarDraft(null);
        }
    }, [editing, member, customerContactData]);

    const updateDraft = (key: keyof ProfileDraft, value: string) => {
        setDraft((current) => ({...current, [key]: value}));
    };

    const updateCustomerContactDraft = (key: keyof CustomerContactDraft, value: string) => {
        setCustomerContactDraft((current) => ({...current, [key]: value}));
    };

    const cancelOrBack = () => {
        setError('');
        if (editing) {
            setDraft(makeDraft(member));
            setCustomerContactDraft(makeCustomerContactDraft(customerContactData));
            setAvatarDraft(null);
            setEditing(false);
        } else {
            back();
        }
    };

    const pickAvatar = async () => {
        if (pickingAvatar || saving) return;
        setPickingAvatar(true);
        setError('');
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
            });
            if (result.canceled) return;
            const asset = result.assets[0];
            if (!asset?.uri) {
                throw new Error('\u65e0\u6cd5\u8bfb\u53d6\u9009\u4e2d\u7684\u56fe\u7247');
            }
            setAvatarDraft({
                uri: asset.uri,
                fileName: asset.fileName,
                mimeType: asset.mimeType,
                file: asset.file,
            });
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : '\u5934\u50cf\u9009\u62e9\u5931\u8d25');
        } finally {
            setPickingAvatar(false);
        }
    };

    const submit = async () => {
        const update: XuanProfileUpdate = {
            realname: draft.realname.trim(),
            gender: draft.gender,
            mobile: draft.mobile.trim(),
            phone: draft.phone.trim(),
            email: draft.email.trim(),
            address: draft.address.trim(),
        };
        if (!update.realname) {
            setError('\u59d3\u540d\u4e0d\u80fd\u4e3a\u7a7a');
            return;
        }
        if (update.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.email)) {
            setError('\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u90ae\u7bb1\u5730\u5740');
            return;
        }
        const clearing = [
            {label: '\u624b\u673a', before: member.mobile, after: update.mobile},
            {label: '\u7535\u8bdd', before: member.phone, after: update.phone},
            {label: '\u90ae\u7bb1', before: member.email, after: update.email},
            {label: '\u5730\u5740', before: member.address, after: update.address},
        ].find((item) => item.before?.trim() && !item.after);
        if (clearing) {
            setError(`\u5f53\u524d\u670d\u52a1\u5668\u4e0d\u652f\u6301\u6e05\u7a7a${clearing.label}\uff0c\u53ef\u4ee5\u4fee\u6539\u4e3a\u65b0\u7684\u5185\u5bb9`);
            return;
        }
        let nextCustomerContactData: XuanCustomerContactData | null = null;
        if (showCustomerContact) {
        if (customerContactDraft.businessCategory.trim().length > 30) {
            setError('\u7ecf\u8425\u7c7b\u76ee\u4e0d\u80fd\u8d85\u8fc730\u4e2a\u5b57');
            return;
        }
        const externalContactScale = Number(customerContactDraft.externalContactScale.trim());
        const customerTotal = Number(customerContactDraft.customerTotal.trim());
        const todayNewCustomers = Number(customerContactDraft.todayNewCustomers.trim());
        const todayPayment = Number(customerContactDraft.todayPayment.trim());
        const weeklyOnlineRevenue = Number(customerContactDraft.weeklyOnlineRevenue.trim());
        const weeklyOfflineRevenue = Number(customerContactDraft.weeklyOfflineRevenue.trim());
        const validCount = (value: string, parsed: number) => /^\d+$/.test(value.trim()) && Number.isInteger(parsed) && parsed <= 999999999;
        const validAmount = (value: string, parsed: number) => /^\d+(\.\d{1,2})?$/.test(value.trim()) && Number.isFinite(parsed) && parsed <= 999999999999.99;
        if (!validCount(customerContactDraft.externalContactScale, externalContactScale)) {
            setError('\u5916\u90e8\u8054\u7cfb\u4eba\u89c4\u6a21\u5fc5\u987b\u662f0-999999999\u7684\u6574\u6570');
            return;
        }
        if (!validCount(customerContactDraft.customerTotal, customerTotal)) {
            setError('\u5ba2\u6237\u603b\u6570\u5fc5\u987b\u662f0-999999999\u7684\u6574\u6570');
            return;
        }
        if (!validCount(customerContactDraft.todayNewCustomers, todayNewCustomers)) {
            setError('\u4eca\u65e5\u65b0\u589e\u5ba2\u6237\u5fc5\u987b\u662f0-999999999\u7684\u6574\u6570');
            return;
        }
        if (!validAmount(customerContactDraft.todayPayment, todayPayment)) {
            setError('\u4eca\u65e5\u6536\u6b3e\u5fc5\u987b\u662f0-999999999999.99\u7684\u91d1\u989d');
            return;
        }
        if (!validAmount(customerContactDraft.weeklyOnlineRevenue, weeklyOnlineRevenue) || !validAmount(customerContactDraft.weeklyOfflineRevenue, weeklyOfflineRevenue)) {
            setError('\u672c\u5468\u4e1a\u7ee9\u5fc5\u987b\u662f0-999999999999.99\u7684\u91d1\u989d');
            return;
        }
        nextCustomerContactData = {
            externalContactScale,
            businessCategory: customerContactDraft.businessCategory.trim() || '\u672a\u77e5',
            customerTotal,
            todayNewCustomers,
            todayPayment: Math.round(todayPayment * 100) / 100,
            weeklyOnlineRevenue: Math.round(weeklyOnlineRevenue * 100) / 100,
            weeklyOfflineRevenue: Math.round(weeklyOfflineRevenue * 100) / 100,
        };
        }
        setSaving(true);
        setError('');
        try {
            const updated = await save(update, avatarDraft || undefined);
            if (nextCustomerContactData) {
                await saveCustomerContactData(nextCustomerContactData);
                setCustomerContactDraft(makeCustomerContactDraft(nextCustomerContactData));
            }
            setDraft(makeDraft(updated));
            setAvatarDraft(null);
            setEditing(false);
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : '\u4e2a\u4eba\u4fe1\u606f\u4fdd\u5b58\u5931\u8d25');
        } finally {
            setSaving(false);
        }
    };

    const confirmLogout = async () => {
        setLoggingOut(true);
        setError('');
        try {
            await logout();
        } catch (reason) {
            setConfirmOpen(false);
            setError(reason instanceof Error ? reason.message : '\u9000\u51fa\u767b\u5f55\u5931\u8d25');
        } finally {
            setLoggingOut(false);
        }
    };

    return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView edges={['top']} style={styles.topSafe}>
            <View style={styles.header}>
                <Pressable style={styles.headerSide} onPress={cancelOrBack} accessibilityLabel={editing ? '\u53d6\u6d88\u7f16\u8f91' : '\u8fd4\u56de'}>
                    <ChevronLeft size={31} color="#11151a" strokeWidth={1.8} />
                </Pressable>
                <Text style={styles.headerTitle}>{editing ? '\u7f16\u8f91\u4e2a\u4eba\u4fe1\u606f' : '\u4e2a\u4eba\u4fe1\u606f'}</Text>
                <Pressable
                    style={styles.headerSide}
                    onPress={editing ? submit : () => {setError(''); setEditing(true)}}
                    disabled={saving}
                    accessibilityLabel={editing ? '\u4fdd\u5b58\u4e2a\u4eba\u4fe1\u606f' : '\u7f16\u8f91\u4e2a\u4eba\u4fe1\u606f'}
                >
                    {saving ? <ActivityIndicator size="small" color="#2f7fe7" /> : <Text style={styles.headerAction}>{editing ? '\u4fdd\u5b58' : '\u7f16\u8f91'}</Text>}
                </Pressable>
            </View>
        </SafeAreaView>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.identityCard}>
                <Pressable
                    style={({pressed}) => [styles.avatarButton, pressed && editing && styles.avatarButtonPressed]}
                    onPress={pickAvatar}
                    disabled={!editing || saving || pickingAvatar}
                    accessibilityRole={editing ? 'button' : undefined}
                    accessibilityLabel={editing ? '\u4fee\u6539\u5934\u50cf' : undefined}
                >
                    <ProfileAvatar member={member} client={client} previewUri={avatarDraft?.uri} />
                    {editing && <View style={styles.avatarEditBadge}>
                        {pickingAvatar
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Camera size={14} color="#fff" strokeWidth={2.2} />}
                    </View>}
                </Pressable>
                <View style={styles.identityText}>
                    <View style={styles.nameLine}>
                        <Text numberOfLines={1} style={styles.name}>{displayName(member)}</Text>
                        <UserRound size={18} color="#63aff7" fill="#63aff7" strokeWidth={1.8} />
                    </View>
                    <Text numberOfLines={1} style={styles.account}>{'\u8d26\u53f7\uff1a'}{member.account}</Text>
                </View>
            </View>

            {editing ? <>
                <View style={styles.card}>
                    <EditField label={'\u59d3\u540d'} value={draft.realname} onChangeText={(value) => updateDraft('realname', value)} placeholder={'\u8bf7\u8f93\u5165\u59d3\u540d'} />
                    <View style={styles.editRow}>
                        <Text style={styles.rowLabel}>{'\u6027\u522b'}</Text>
                        <View style={styles.genderControl}>
                            {[{label: '\u7537', value: 'm'}, {label: '\u5973', value: 'f'}].map((item) => {
                                const selected = draft.gender === item.value;
                                return <Pressable key={item.value} style={[styles.genderOption, selected && styles.genderOptionSelected]} onPress={() => updateDraft('gender', item.value)}>
                                    <Text style={[styles.genderText, selected && styles.genderTextSelected]}>{item.label}</Text>
                                </Pressable>;
                            })}
                        </View>
                    </View>
                    <EditField label={'\u624b\u673a'} value={draft.mobile} onChangeText={(value) => updateDraft('mobile', value)} placeholder={'\u8bf7\u8f93\u5165\u624b\u673a\u53f7\u7801'} keyboardType="phone-pad" />
                    <EditField label={'\u7535\u8bdd'} value={draft.phone} onChangeText={(value) => updateDraft('phone', value)} placeholder={'\u8bf7\u8f93\u5165\u529e\u516c\u7535\u8bdd'} keyboardType="phone-pad" />
                    <EditField label={'\u90ae\u7bb1'} value={draft.email} onChangeText={(value) => updateDraft('email', value)} placeholder={'\u8bf7\u8f93\u5165\u90ae\u7bb1'} keyboardType="email-address" />
                    <EditField label={'\u5730\u5740'} value={draft.address} onChangeText={(value) => updateDraft('address', value)} placeholder={'\u8bf7\u8f93\u5165\u5730\u5740'} multiline />
                </View>
            </> : <View style={styles.card}>
                <ProfileRow label={'\u59d3\u540d'} value={displayName(member)} />
                <ProfileRow label={'\u6027\u522b'} value={genderText} />
                <ProfileRow label={'\u624b\u673a'} value={member.mobile || ''} />
                <ProfileRow label={'\u7535\u8bdd'} value={member.phone || ''} />
                <ProfileRow label={'\u90ae\u7bb1'} value={member.email || ''} />
                <ProfileRow label={'\u5730\u5740'} value={member.address || ''} last />
            </View>}

            {showCustomerContact && (editing ? <View style={styles.card}>
                <EditField label={'\u5916\u90e8\u8054\u7cfb\u4eba\u89c4\u6a21'} value={customerContactDraft.externalContactScale} onChangeText={(value) => updateCustomerContactDraft('externalContactScale', value)} placeholder={'\u8bf7\u8f93\u5165\u89c4\u6a21'} keyboardType="numeric" />
                <EditField label={'\u7ecf\u8425\u7c7b\u76ee'} value={customerContactDraft.businessCategory} onChangeText={(value) => updateCustomerContactDraft('businessCategory', value)} placeholder={'\u8bf7\u8f93\u5165\u7ecf\u8425\u7c7b\u76ee'} />
                <EditField label={'\u5ba2\u6237\u603b\u6570'} value={customerContactDraft.customerTotal} onChangeText={(value) => updateCustomerContactDraft('customerTotal', value)} placeholder={'\u8bf7\u8f93\u5165\u5ba2\u6237\u603b\u6570'} keyboardType="numeric" />
                <EditField label={'\u4eca\u65e5\u65b0\u589e'} value={customerContactDraft.todayNewCustomers} onChangeText={(value) => updateCustomerContactDraft('todayNewCustomers', value)} placeholder={'\u8bf7\u8f93\u5165\u4eca\u65e5\u65b0\u589e\u5ba2\u6237'} keyboardType="numeric" />
                <EditField label={'\u4eca\u65e5\u6536\u6b3e'} value={customerContactDraft.todayPayment} onChangeText={(value) => updateCustomerContactDraft('todayPayment', value)} placeholder={'\u8bf7\u8f93\u5165\u4eca\u65e5\u6536\u6b3e'} keyboardType="decimal-pad" />
                <EditField label={'\u672c\u5468\u7ebf\u4e0a'} value={customerContactDraft.weeklyOnlineRevenue} onChangeText={(value) => updateCustomerContactDraft('weeklyOnlineRevenue', value)} placeholder={'\u8bf7\u8f93\u5165\u7ebf\u4e0a\u4e1a\u7ee9'} keyboardType="decimal-pad" />
                <EditField label={'\u672c\u5468\u7ebf\u4e0b'} value={customerContactDraft.weeklyOfflineRevenue} onChangeText={(value) => updateCustomerContactDraft('weeklyOfflineRevenue', value)} placeholder={'\u8bf7\u8f93\u5165\u7ebf\u4e0b\u4e1a\u7ee9'} keyboardType="decimal-pad" />
            </View> : <View style={styles.card}>
                <ProfileRow label={'\u5916\u90e8\u8054\u7cfb\u4eba\u89c4\u6a21'} value={String(customerContactData.externalContactScale)} />
                <ProfileRow label={'\u7ecf\u8425\u7c7b\u76ee'} value={customerContactData.businessCategory} />
                <ProfileRow label={'\u5ba2\u6237\u603b\u6570'} value={String(customerContactData.customerTotal)} />
                <ProfileRow label={'\u4eca\u65e5\u65b0\u589e'} value={String(customerContactData.todayNewCustomers)} />
                <ProfileRow label={'\u4eca\u65e5\u6536\u6b3e'} value={`\u00a5${customerContactData.todayPayment.toFixed(2)}`} />
                <ProfileRow label={'\u672c\u5468\u7ebf\u4e0a'} value={`\u00a5${customerContactData.weeklyOnlineRevenue.toFixed(2)}`} />
                <ProfileRow label={'\u672c\u5468\u7ebf\u4e0b'} value={`\u00a5${customerContactData.weeklyOfflineRevenue.toFixed(2)}`} last />
            </View>)}

            <View style={styles.card}>
                <ProfileRow label={'\u90e8\u95e8'} value={department?.name || '\u672a\u8bbe\u7f6e'} />
                <View style={[styles.profileRow, styles.lastRow]}>
                    <Text style={styles.rowLabel}>{'\u4f01\u4e1a'}</Text>
                    <View style={styles.companyValue}>
                        <Text numberOfLines={1} style={styles.rowValue}>{companyName}</Text>
                        <ShieldCheck size={18} color="#25bd62" fill="#25bd62" stroke="white" strokeWidth={1.8} />
                    </View>
                </View>
            </View>

            {!editing && <View style={styles.card}>
                <Pressable
                    style={({pressed}) => [styles.updateRow, pressed && styles.updateRowPressed]}
                    onPress={() => void appUpdate.checkForUpdate()}
                    accessibilityRole="button"
                    accessibilityLabel={'\u68c0\u67e5\u5e94\u7528\u66f4\u65b0'}
                >
                    <Text style={styles.rowLabel}>{'\u7248\u672c\u66f4\u65b0'}</Text>
                    <View style={styles.updateValue}>
                        <Text style={[styles.rowValue, appUpdate.latestVersion && styles.updateAvailable]}>
                            {appUpdate.status === 'checking'
                                ? '\u68c0\u67e5\u4e2d...'
                                : appUpdate.status === 'downloading'
                                    ? `\u4e0b\u8f7d ${appUpdate.progress}%`
                                    : appUpdate.latestVersion
                                        ? `\u65b0\u7248\u672c v${appUpdate.latestVersion.versionName}`
                                        : `v${appUpdate.currentVersionName}`}
                        </Text>
                        <ChevronRight size={18} color="#a1a6ac" strokeWidth={1.8} />
                    </View>
                </Pressable>
            </View>}

            {!!error && <Text style={styles.errorText}>{error}</Text>}
            {!editing && <Pressable style={({pressed}) => [styles.logoutButton, pressed && styles.logoutButtonPressed]} onPress={() => setConfirmOpen(true)}>
                <LogOut size={20} color="#d64c46" strokeWidth={1.8} />
                <Text style={styles.logoutText}>{'\u9000\u51fa\u767b\u5f55'}</Text>
            </Pressable>}
        </ScrollView>

        <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => !loggingOut && setConfirmOpen(false)}>
            <View style={styles.modalScrim}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => !loggingOut && setConfirmOpen(false)} />
                <View style={styles.confirmCard}>
                    <Text style={styles.confirmTitle}>{'\u9000\u51fa\u767b\u5f55'}</Text>
                    <Text style={styles.confirmText}>{'\u9000\u51fa\u540e\u5c06\u8fd4\u56de\u767b\u5f55\u9875\uff0c\u53ef\u4f7f\u7528\u5176\u4ed6\u8d26\u53f7\u91cd\u65b0\u767b\u5f55\u3002'}</Text>
                    <View style={styles.confirmActions}>
                        <Pressable style={styles.confirmButton} onPress={() => setConfirmOpen(false)} disabled={loggingOut}>
                            <Text style={styles.cancelText}>{'\u53d6\u6d88'}</Text>
                        </Pressable>
                        <View style={styles.confirmDivider} />
                        <Pressable style={styles.confirmButton} onPress={confirmLogout} disabled={loggingOut}>
                            {loggingOut ? <ActivityIndicator size="small" color="#d64c46" /> : <Text style={styles.confirmLogoutText}>{'\u9000\u51fa'}</Text>}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: '#f0f3f9'},
    topSafe: {backgroundColor: '#f0f3f9'},
    header: {height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    headerSide: {width: 58, height: 52, alignItems: 'center', justifyContent: 'center'},
    headerTitle: {color: '#11151a', fontSize: 20, fontWeight: '400'},
    headerAction: {color: '#287dd7', fontSize: 16, fontWeight: '500'},
    content: {width: '100%', maxWidth: 640, paddingHorizontal: 11, paddingBottom: 30, alignSelf: 'center'},
    identityCard: {height: 94, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', borderRadius: 8, backgroundColor: '#fff'},
    avatarButton: {width: 62, height: 62, position: 'relative', borderRadius: 9},
    avatarButtonPressed: {opacity: 0.82},
    avatar: {width: 62, height: 62, borderRadius: 9, backgroundColor: '#e9edf1'},
    avatarEditBadge: {position: 'absolute', right: -4, bottom: -4, width: 24, height: 24, borderWidth: 2, borderColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2f80e9'},
    avatarFallback: {alignItems: 'center', justifyContent: 'center'},
    avatarText: {color: '#fff', fontSize: 25, fontWeight: '600'},
    identityText: {minWidth: 0, marginLeft: 14, flex: 1},
    nameLine: {minWidth: 0, flexDirection: 'row', alignItems: 'center', columnGap: 7},
    name: {minWidth: 0, flexShrink: 1, color: '#111418', fontSize: 20, fontWeight: '600'},
    account: {marginTop: 7, color: '#92979d', fontSize: 13},
    card: {marginTop: 11, paddingLeft: 15, overflow: 'hidden', borderRadius: 8, backgroundColor: '#fff'},
    profileRow: {minHeight: 50, paddingRight: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e8eaec'},
    updateRow: {minHeight: 50, paddingRight: 12, flexDirection: 'row', alignItems: 'center'},
    updateRowPressed: {backgroundColor: '#f5f7f9'},
    updateValue: {minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', columnGap: 5},
    updateAvailable: {color: '#287dd7', fontWeight: '500'},
    lastRow: {borderBottomWidth: 0},
    rowLabel: {width: 112, color: '#15191d', fontSize: 16},
    rowValue: {minWidth: 0, flex: 1, color: '#555b62', fontSize: 16, lineHeight: 21, textAlign: 'right'},
    companyValue: {minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', columnGap: 7},
    editRow: {minHeight: 54, paddingRight: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e8eaec'},
    editRowMultiline: {minHeight: 82, alignItems: 'flex-start', paddingTop: 16},
    editInput: {minWidth: 0, height: 52, paddingVertical: 0, flex: 1, color: '#15191d', fontSize: 16, textAlign: 'right'},
    editInputMultiline: {height: 64, paddingTop: 0, textAlignVertical: 'top'},
    genderControl: {height: 34, marginLeft: 'auto', flexDirection: 'row', overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: '#cfd3d7', borderRadius: 5},
    genderOption: {width: 58, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'},
    genderOptionSelected: {backgroundColor: '#2f80e9'},
    genderText: {color: '#5e646a', fontSize: 15},
    genderTextSelected: {color: '#fff', fontWeight: '500'},
    errorText: {marginTop: 12, paddingHorizontal: 14, color: '#b8423a', fontSize: 14, lineHeight: 20, textAlign: 'center'},
    logoutButton: {height: 50, marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 9, borderRadius: 8, backgroundColor: '#fff'},
    logoutButtonPressed: {backgroundColor: '#f8eeee'},
    logoutText: {color: '#d64c46', fontSize: 17, fontWeight: '500'},
    modalScrim: {flex: 1, paddingHorizontal: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.36)'},
    confirmCard: {width: '100%', maxWidth: 360, overflow: 'hidden', borderRadius: 8, backgroundColor: '#fff'},
    confirmTitle: {paddingTop: 22, color: '#171b20', fontSize: 18, fontWeight: '600', textAlign: 'center'},
    confirmText: {paddingHorizontal: 24, paddingTop: 11, paddingBottom: 21, color: '#6f757b', fontSize: 14, lineHeight: 21, textAlign: 'center'},
    confirmActions: {height: 49, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e4e6e8'},
    confirmButton: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    confirmDivider: {width: StyleSheet.hairlineWidth, backgroundColor: '#e4e6e8'},
    cancelText: {color: '#43494f', fontSize: 16},
    confirmLogoutText: {color: '#d64c46', fontSize: 16, fontWeight: '500'},
});
