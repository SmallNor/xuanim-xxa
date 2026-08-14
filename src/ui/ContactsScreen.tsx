import {ReactNode, useEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator, FlatList, Image, ImageSourcePropType, Pressable, RefreshControl, StyleSheet, Text, TextInput, View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
    ChevronLeft, ChevronRight, RefreshCw, Search, UserRound, X,
} from 'lucide-react-native';
import {XuanClient, XuanDepartment, XuanMember} from '../api/xuan';

const contactIcons = {
    robot: require('../../assets/icons/contacts-robot.png'),
    customer: require('../../assets/icons/contacts-customer.png'),
    addCustomer: require('../../assets/icons/contacts-add-customer.png'),
    directory: require('../../assets/icons/contacts-directory.png'),
    invite: require('../../assets/icons/contacts-invite.png'),
    headerSearch: require('../../assets/icons/contacts-header-search.png'),
    headerAdd: require('../../assets/icons/contacts-header-add.png'),
} satisfies Record<string, ImageSourcePropType>;

const contactColors = ['#4d9de0', '#48b97d', '#e49b45', '#8e78d4', '#55a9a2'];

const memberName = (member: XuanMember) => member.realname || member.account || '用户 ' + member.id;

function ContactAvatar({member, client, compact = false}: {member: XuanMember; client: XuanClient; compact?: boolean}) {
    const uri = client.resolveAsset(member.avatar);
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [uri]);
    const avatarStyle = compact ? [styles.avatar, styles.departmentAvatar] : styles.avatar;
    if (uri && !failed) return <Image source={{uri}} style={avatarStyle} onError={() => setFailed(true)} />;
    const initial = memberName(member).trim().slice(0, 1).toUpperCase();
    return <View style={[avatarStyle, styles.avatarFallback, {backgroundColor: contactColors[member.id % contactColors.length]}]}>
        {initial ? <Text style={[styles.avatarText, compact && styles.departmentAvatarText]}>{initial}</Text> : <UserRound size={compact ? 19 : 22} color="#fff" />}
    </View>;
}

function ReferenceIcon({source, size}: {source: ImageSourcePropType; size: number}) {
    return <Image source={source} resizeMode="contain" style={{width: size, height: size}} accessibilityIgnoresInvertColors />;
}

export default function ContactsScreen({
    members, departments, company, client, loading, refreshing, error, deptStack,
    refresh, openMember, updateDeptStack, footer,
}: {
    members: XuanMember[]; departments: XuanDepartment[]; company?: string; client: XuanClient;
    loading: boolean; refreshing: boolean; error: string; refresh: () => void;
    deptStack: number[]; openMember: (member: XuanMember) => void; updateDeptStack: (updater: (stack: number[]) => number[]) => void; footer: ReactNode;
}) {
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);

    const [departmentMembers, setDepartmentMembers] = useState<Record<number, XuanMember[]>>({});
    const [loadingDepartment, setLoadingDepartment] = useState<number | null>(null);
    const [departmentError, setDepartmentError] = useState('');
    const [notice, setNotice] = useState('');
    const currentDeptID = deptStack.at(-1) || 0;
    const departmentMap = useMemo(() => new Map(departments.map((department) => [department.id, department])), [departments]);
    const keyword = query.trim().toLocaleLowerCase();
    const activeMembers = useMemo(() => {
        const source = currentDeptID && departmentMembers[currentDeptID]
            ? departmentMembers[currentDeptID]
            : members;
        return source.filter((member) => !member.deleted);
    }, [currentDeptID, departmentMembers, members]);
    const visibleDepartments = useMemo(() => departments.filter((department) => {
        if (keyword) return department.name.toLocaleLowerCase().includes(keyword);
        return (department.parent || 0) === currentDeptID;
    }), [currentDeptID, departments, keyword]);
    const visibleMembers = useMemo(() => activeMembers.filter((member) => {
        const department = member.dept ? departmentMap.get(member.dept) : undefined;
        if (keyword) {
            return [
                memberName(member), member.account || '', member.mobile || '', member.email || '', department?.name || '',
            ].join(' ').toLocaleLowerCase().includes(keyword);
        }
        return departmentMembers[currentDeptID] ? true : Number(member.dept || 0) === currentDeptID;
    }).sort((left, right) => memberName(left).localeCompare(memberName(right), 'zh-CN')), [activeMembers, currentDeptID, departmentMap, keyword]);
    const currentDepartment = currentDeptID ? departmentMap.get(currentDeptID) : undefined;
    const robotMember = useMemo(() => activeMembers.find((member) => /机器人|robot|bot|system/i.test([memberName(member), member.account || ''].join(' '))), [activeMembers]);

    const closeSearch = () => {
        setQuery('');
        setSearching(false);
    };
    const showUnavailable = (message: string) => setNotice(message);
    const openRobot = () => {
        if (robotMember) void openMember(robotMember);
        else showUnavailable('当前系统暂未配置智能机器人');
    };
    const loadDepartment = async (departmentID: number, force = false) => {
        if (!force && departmentMembers[departmentID]) return;
        setLoadingDepartment(departmentID);
        setDepartmentError('');
        try {
            const loadedMembers = await client.getDepartmentMembers(departmentID);
            setDepartmentMembers((current) => ({...current, [departmentID]: loadedMembers}));
        } catch (loadError) {
            setDepartmentError(loadError instanceof Error ? loadError.message : '部门成员获取失败');
        } finally {
            setLoadingDepartment((current) => current === departmentID ? null : current);
        }
    };
    const enterDepartment = (department: XuanDepartment) => {
        setQuery('');
        setSearching(false);
        updateDeptStack((stack) => [...stack, department.id]);
        void loadDepartment(department.id);
    };
    const leaveDepartment = () => {
        setQuery('');
        setSearching(false);
        setDepartmentError('');
        updateDeptStack((stack) => stack.slice(0, -1));
    };

    const departmentRows = visibleDepartments.map((department) => {
        const memberCount = activeMembers.filter((member) => member.dept === department.id).length;
        return <Pressable key={department.id} style={({pressed}) => [styles.actionRow, pressed && styles.rowPressed]} onPress={() => enterDepartment(department)}>
            <ReferenceIcon source={contactIcons.directory} size={36} />
            <View style={styles.actionBody}>
                <Text numberOfLines={1} style={styles.actionLabel}>{department.name}</Text>
                {!!memberCount && <Text style={styles.departmentCount}>{memberCount}</Text>}
                <ChevronRight size={19} color="#b5b9be" strokeWidth={1.8} />
            </View>
        </Pressable>;
    });

    const listHeader = <>
        {keyword ? <>
            <View style={styles.sectionLabel}><Text style={styles.sectionLabelText}>搜索结果</Text></View>
            {departmentRows}
        </> : currentDeptID ? <>
            <View style={styles.departmentBreadcrumb}>
                <Text numberOfLines={1} style={styles.breadcrumbText}>企业通讯录</Text>
                <ChevronRight size={15} color="#a1a6ab" strokeWidth={1.7} style={styles.breadcrumbChevron} />
                <Text numberOfLines={1} style={styles.breadcrumbCurrent}>{currentDepartment?.name || '部门'}</Text>
            </View>
            {departmentRows}

        </> : <>
            <Pressable style={({pressed}) => [styles.actionRow, pressed && styles.rowPressed]} onPress={openRobot}>
                <ReferenceIcon source={contactIcons.robot} size={36} />
                <View style={styles.actionBody}><Text style={styles.actionLabel}>智能机器人</Text><ChevronRight size={19} color="#b5b9be" /></View>
            </Pressable>
            <View style={styles.sectionLabel}><Text style={styles.sectionLabelText}>我的客户</Text></View>
            <Pressable style={({pressed}) => [styles.actionRow, pressed && styles.rowPressed]} onPress={() => showUnavailable('当前系统暂未接入客户管理功能')}>
                <ReferenceIcon source={contactIcons.customer} size={36} />
                <View style={styles.actionBody}><Text style={styles.actionLabel}>我的客户</Text><ChevronRight size={19} color="#b5b9be" /></View>
            </Pressable>
            <Pressable style={({pressed}) => [styles.actionRow, pressed && styles.rowPressed]} onPress={() => showUnavailable('请在管理平台中添加客户')}>
                <ReferenceIcon source={contactIcons.addCustomer} size={36} />
                <View style={styles.actionBody}><Text style={styles.actionLabel}>添加客户</Text><ChevronRight size={19} color="#b5b9be" /></View>
            </Pressable>
            <View style={styles.sectionLabel}><Text style={styles.sectionLabelText}>企业通讯录</Text></View>
            {departmentRows}
            <Pressable style={({pressed}) => [styles.actionRow, pressed && styles.rowPressed]} onPress={() => showUnavailable('请在管理平台的组织架构中添加同事')}>
                <ReferenceIcon source={contactIcons.invite} size={36} />
                <View style={styles.actionBody}><Text style={[styles.actionLabel, styles.inviteLabel]}>邀请同事</Text><ChevronRight size={19} color="#b5b9be" /></View>
            </Pressable>
            {!!visibleMembers.length && <View style={styles.sectionLabel}><Text style={styles.sectionLabelText}>联系人</Text></View>}
        </>}
    </>;

    return <View style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.topSafe}>
            {searching ? <View style={styles.searchHeader}>
                <Pressable style={styles.searchBackButton} onPress={closeSearch} accessibilityLabel="关闭搜索"><ChevronLeft size={28} color="#11161c" /></Pressable>
                <View style={styles.searchField}>
                    <Search size={18} color="#858c93" />
                    <TextInput value={query} onChangeText={setQuery} placeholder="搜索" placeholderTextColor="#989ea4" autoFocus autoCapitalize="none" autoCorrect={false} style={styles.searchInput} />
                    {!!query && <Pressable hitSlop={10} onPress={() => setQuery('')} accessibilityLabel="清除搜索"><X size={17} color="#92989e" /></Pressable>}
                </View>
            </View> : <View style={styles.header}>
                {currentDeptID
                    ? <Pressable style={styles.headerBackButton} onPress={leaveDepartment} accessibilityLabel="返回上一级"><ChevronLeft size={29} color="#11161c" strokeWidth={1.8} /></Pressable>
                    : <View style={styles.headerLeft} />}
                <Text numberOfLines={1} style={styles.headerTitle}>{currentDepartment?.name || company?.trim() || '企业通讯录'}</Text>
                <View style={styles.headerActions}>
                    {!currentDeptID && <Pressable style={styles.headerButton} onPress={() => setSearching(true)} accessibilityLabel="搜索通讯录"><ReferenceIcon source={contactIcons.headerSearch} size={35} /></Pressable>}
                    <Pressable style={styles.headerButton} onPress={() => showUnavailable('请在管理平台的组织架构中添加同事')} accessibilityLabel="邀请同事"><ReferenceIcon source={contactIcons.headerAdd} size={35} /></Pressable>
                </View>
            </View>}
        </SafeAreaView>
        {!!(departmentError || error) && <Pressable style={styles.errorBanner} onPress={() => currentDeptID ? void loadDepartment(currentDeptID, true) : refresh()}><Text numberOfLines={1} style={styles.errorText}>{departmentError || error}</Text><RefreshCw size={17} color="#b24c42" /></Pressable>}
        {!!notice && <Pressable style={styles.noticeBanner} onPress={() => setNotice('')}><Text numberOfLines={2} style={styles.noticeText}>{notice}</Text><X size={16} color="#65717d" /></Pressable>}
        {loading && !members.length
            ? <View style={styles.centerState}><ActivityIndicator color="#437be8" /><Text style={styles.stateText}>正在获取通讯录</Text></View>
            : <FlatList
                data={visibleMembers}
                keyExtractor={(item) => String(item.id)}
                ListHeaderComponent={listHeader}
                renderItem={({item}) => {
                    const department = item.dept ? departmentMap.get(item.dept) : undefined;
                    const isOnline = item.status && !['offline', 'disconnect'].includes(item.status);
                    const inDepartment = !!currentDeptID && !keyword;
                    return <Pressable style={({pressed}) => [styles.contactRow, inDepartment && styles.departmentContactRow, pressed && styles.rowPressed]} onPress={() => openMember(item)}>
                        <View>
                            <ContactAvatar member={item} client={client} compact={inDepartment} />
                            {!!isOnline && !inDepartment && <View style={styles.onlineDot} />}
                        </View>
                        <View style={[styles.contactBody, inDepartment && styles.departmentContactBody]}>
                            <View style={styles.contactText}>
                                <Text numberOfLines={1} style={[styles.contactName, inDepartment && styles.departmentContactName]}>{memberName(item)}</Text>
                                {!inDepartment && <Text numberOfLines={1} style={styles.contactMeta}>{department?.name || item.account}</Text>}
                            </View>

                        </View>
                    </Pressable>;
                }}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={visibleDepartments.length ? null : loadingDepartment === currentDeptID
                    ? <View style={styles.departmentLoading}><ActivityIndicator color="#437be8" /></View>
                    : <Text style={styles.emptyText}>{keyword ? '没有找到联系人或部门' : currentDeptID ? '该部门暂无联系人' : '暂无联系人'}</Text>}
                refreshControl={<RefreshControl refreshing={refreshing || loadingDepartment === currentDeptID} onRefresh={() => currentDeptID ? void loadDepartment(currentDeptID, true) : refresh()} tintColor="#437be8" colors={['#437be8']} />}
                showsVerticalScrollIndicator
            />}
        {footer}
    </View>;
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: '#fff'},
    topSafe: {backgroundColor: '#e7f1fd'},
    header: {height: 56, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center'},
    headerLeft: {width: 100},
    headerBackButton: {width: 100, height: 56, paddingLeft: 5, alignItems: 'flex-start', justifyContent: 'center'},
    headerTitle: {minWidth: 0, flex: 1, color: '#090d11', fontSize: 18, fontWeight: '400', textAlign: 'center'},
    headerActions: {width: 100, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'},
    headerButton: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center'},
    searchHeader: {height: 56, paddingRight: 12, flexDirection: 'row', alignItems: 'center', columnGap: 2},
    searchBackButton: {width: 46, height: 46, alignItems: 'center', justifyContent: 'center'},
    searchField: {height: 36, minWidth: 0, paddingHorizontal: 11, flex: 1, flexDirection: 'row', alignItems: 'center', columnGap: 8, borderRadius: 5, backgroundColor: '#fff'},
    searchInput: {height: 36, minWidth: 0, paddingVertical: 0, flex: 1, color: '#15191d', fontSize: 15},
    errorBanner: {minHeight: 38, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', columnGap: 10, backgroundColor: '#fff1ef'},
    errorText: {minWidth: 0, flex: 1, color: '#b24c42', fontSize: 13},
    noticeBanner: {minHeight: 40, paddingHorizontal: 15, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', columnGap: 10, backgroundColor: '#eef5fc'},
    noticeText: {minWidth: 0, flex: 1, color: '#65717d', fontSize: 13},
    centerState: {flex: 1, alignItems: 'center', justifyContent: 'center', rowGap: 12},
    stateText: {color: '#92999f', fontSize: 14},
    listContent: {paddingBottom: 2, flexGrow: 1, backgroundColor: '#fff'},
    sectionLabel: {height: 38, paddingHorizontal: 16, justifyContent: 'center', backgroundColor: '#fff'},
    sectionLabelText: {color: '#656b72', fontSize: 13},
    departmentBreadcrumb: {height: 42, marginLeft: 14, paddingRight: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eceeef'},
    breadcrumbText: {color: '#4f555b', fontSize: 13},
    breadcrumbChevron: {marginLeft: 6},
    breadcrumbCurrent: {minWidth: 0, flexShrink: 1, color: '#4f555b', fontSize: 13},
    actionRow: {height: 61, paddingLeft: 16, flexDirection: 'row', alignItems: 'center', columnGap: 16, backgroundColor: '#fff'},


    actionBody: {height: '100%', minWidth: 0, paddingRight: 13, flex: 1, flexDirection: 'row', alignItems: 'center', columnGap: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e7e9eb'},
    actionLabel: {minWidth: 0, flex: 1, color: '#15191d', fontSize: 16},
    inviteLabel: {color: '#3476ca'},
    departmentCount: {color: '#a0a5aa', fontSize: 13},
    rowPressed: {backgroundColor: '#f4f5f6'},
    contactRow: {height: 61, paddingLeft: 16, flexDirection: 'row', alignItems: 'center', columnGap: 16, backgroundColor: '#fff'},
    avatar: {width: 40, height: 40, borderRadius: 4, backgroundColor: '#edf0f2'},
    departmentAvatar: {width: 32, height: 32, borderRadius: 3},
    avatarFallback: {alignItems: 'center', justifyContent: 'center'},
    avatarText: {color: '#fff', fontSize: 17, fontWeight: '600'},
    departmentAvatarText: {fontSize: 14},
    onlineDot: {position: 'absolute', right: -2, bottom: -2, width: 10, height: 10, borderWidth: 2, borderColor: '#fff', borderRadius: 5, backgroundColor: '#39b86b'},
    contactBody: {height: '100%', minWidth: 0, paddingRight: 14, flex: 1, flexDirection: 'row', alignItems: 'center', columnGap: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e7e9eb'},
    departmentContactBody: {paddingRight: 14},
    departmentContactRow: {height: 56, paddingLeft: 14, columnGap: 11},
    contactText: {minWidth: 0, flex: 1, justifyContent: 'center'},
    contactName: {color: '#111418', fontSize: 16, fontWeight: '500', lineHeight: 22},
    departmentContactName: {fontWeight: '400'},
    contactMeta: {marginTop: 1, color: '#9ba1a7', fontSize: 12, lineHeight: 16},
    emptyText: {paddingVertical: 40, color: '#969ca2', fontSize: 14, textAlign: 'center'},
    departmentLoading: {height: 70, alignItems: 'center', justifyContent: 'center'},
});