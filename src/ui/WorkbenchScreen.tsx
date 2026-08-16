import type {ComponentType, ReactNode} from 'react';
import {Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {XuanWorkbenchStats} from '../api/types';
import {WecomSearchIcon} from './wecom-icons';
import {
    AiChatIcon, AiDocumentIcon, AiRobotIcon, AiServiceSummaryIcon, AiSpreadsheetIcon, AiSummaryIcon,
    BusinessCardIcon, ChooseAppsIcon, CustomerContactIcon, CustomerGroupIcon, CustomerMomentsIcon,
    EfficiencyCalendarIcon, EfficiencyCubeIcon, EfficiencyLiveIcon, EfficiencyPictureIcon,
    ExternalPaymentIcon, FindServiceIcon, InternalAnnouncementIcon, InternalApprovalIcon,
    InternalColleagueIcon, InternalHrIcon, InternalIndustryIcon, InternalLearningIcon, InternalLocationIcon,
    InternalMeetingIcon, InternalMoreIcon, InternalPayrollIcon, InternalReportIcon, LeadAssistantIcon,
    ManageEnterpriseIcon, MassSendIcon, PromoFeatureIcon, PromoPlayIcon, ResignationTransferIcon,
    ServiceSummaryIcon, WechatServiceIcon,
    WorkbenchSettingsIcon,
} from './workbench-icons';

type IconComponent = ComponentType<{size?: number}>;

type AppItem = {
    label: string;
    icon: IconComponent;
};

const quickApps: AppItem[] = [
    {label: '管理企业', icon: ManageEnterpriseIcon},
    {label: '选应用', icon: ChooseAppsIcon},
    {label: '找服务', icon: FindServiceIcon},
];

const customerApps: AppItem[] = [
    {label: '客户群', icon: CustomerGroupIcon},
    {label: '客户朋友圈', icon: CustomerMomentsIcon},
    {label: '微信客服', icon: WechatServiceIcon},
    {label: '获客助手', icon: LeadAssistantIcon},
    {label: '离职继承', icon: ResignationTransferIcon},
    {label: '群发助手', icon: MassSendIcon},
    {label: '对外收款', icon: ExternalPaymentIcon},
    {label: '企业名片', icon: BusinessCardIcon},
];

const officeApps: AppItem[] = [
    {label: '智能文档', icon: AiDocumentIcon},
    {label: '智能表格', icon: AiSpreadsheetIcon},
    {label: '智能总结', icon: AiSummaryIcon},
    {label: '智能机器人', icon: AiRobotIcon},
    {label: '记录面聊', icon: AiChatIcon},
    {label: '服务总结', icon: AiServiceSummaryIcon},
];

const internalApps: AppItem[] = [
    {label: '打卡', icon: InternalLocationIcon},
    {label: '审批', icon: InternalApprovalIcon},
    {label: '汇报', icon: InternalReportIcon},
    {label: '会议室', icon: InternalMeetingIcon},
    {label: '公告', icon: InternalAnnouncementIcon},
    {label: '工资条', icon: InternalPayrollIcon},
    {label: '人事助手', icon: InternalHrIcon},
    {label: '同事吧', icon: InternalColleagueIcon},
    {label: '行业资讯', icon: InternalIndustryIcon},
    {label: '学习园地', icon: InternalLearningIcon},
    {label: '其他', icon: InternalMoreIcon},
];

const efficiencyApps: AppItem[] = [
    {label: '日程', icon: EfficiencyCalendarIcon},
    {label: '微盘', icon: EfficiencyPictureIcon},
    {label: '直播', icon: EfficiencyLiveIcon},
    {label: '文档空间', icon: EfficiencyCubeIcon},
];

function AppGrid({items}: {items: AppItem[]}) {
    return <View style={styles.grid}>{items.map((item) => {
        const Icon = item.icon;
        return <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            style={({pressed}) => [styles.gridItem, pressed && styles.pressed]}
        >
            <View style={styles.gridIcon}><Icon size={48} /></View>
            <Text numberOfLines={1} style={styles.gridLabel}>{item.label}</Text>
        </Pressable>;
    })}</View>;
}

function WorkbenchHeader() {
    return <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>工作台</Text>
            <View style={styles.headerActions}>
                <Pressable accessibilityRole="button" accessibilityLabel="搜索" style={styles.headerButton}>
                    <WecomSearchIcon size={29} color="#050b12" />
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="工作台设置" style={styles.headerButton}>
                    <WorkbenchSettingsIcon size={30} />
                </Pressable>
            </View>
        </View>
    </SafeAreaView>;
}

function PromoBanner() {
    return <Pressable
        accessibilityRole="button"
        accessibilityLabel="服务总结 AI 宣传"
        style={({pressed}) => [styles.promoCard, pressed && styles.pressed]}
    >
        <View style={styles.promoCopy}>
            <View style={styles.promoEyebrow}>
                <ServiceSummaryIcon size={16} />
                <Text style={styles.promoEyebrowText}>服务总结</Text>
            </View>
            <Text style={styles.promoTitle}>AI自动总结客户需求与意向，推荐重点客户</Text>
            <View style={styles.promoSubTitleRow}>
                <PromoFeatureIcon size={12} />
                <Text style={styles.promoSubTitle}>智能助理·大圆  开启内测</Text>
            </View>
            <View style={styles.watchButton}>
                <PromoPlayIcon size={15} />
                <Text style={styles.watchButtonText}>观看讲解</Text>
            </View>
        </View>
        <View style={styles.promoPreview}>
            <View style={styles.previewTopLine}>
                <View style={styles.previewDot} />
                <Text style={styles.previewTitle}>服务总结 AI+</Text>
                <View style={styles.previewChevron} />
            </View>
            <View style={styles.previewSheet}>
                <View style={styles.previewUserLine}>
                    <View style={styles.previewAvatar} />
                    <Text style={styles.previewUser}>李至之</Text>
                    <Text style={styles.previewTag}>微信</Text>
                </View>
                <Text style={styles.previewLabel}>客户需求</Text>
                <Text numberOfLines={1} style={styles.previewText}>7座SUV，纵向长续航版</Text>
                <Text style={styles.previewLabel}>客户意向</Text>
                <Text numberOfLines={1} style={styles.previewText}>高</Text>
                <Text style={styles.previewLabel}>跟进建议</Text>
                <Text numberOfLines={2} style={styles.previewText}>建议优先跟客户沟通，了解未定</Text>
            </View>
        </View>
    </Pressable>;
}

function ContactStatsCard({stats}: {stats: XuanWorkbenchStats}) {
    const customerTotal = String(stats.customerTotal);
    const todayNewCustomers = String(stats.todayNewCustomers);
    const todayPayment = `¥${stats.todayPayment.toFixed(2)}`;
    const valueStyle = (value: string) => value.length > 12
        ? styles.statValueCompact
        : value.length > 6 ? styles.statValueMedium : undefined;

    return <Pressable
        accessibilityRole="button"
        accessibilityLabel="客户联系"
        style={({pressed}) => [styles.statsCard, pressed && styles.pressed]}
    >
        <View style={styles.statsHeader}>
            <View style={styles.statsIcon}><CustomerContactIcon size={35} /></View>
            <Text style={styles.statsTitle}>客户联系</Text>
            <Text style={styles.arrowText}>›</Text>
        </View>
        <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.45} style={[styles.statValue, valueStyle(customerTotal)]}>{customerTotal}</Text>
                <Text style={styles.statLabel}>客户总数</Text>
            </View>
            <View style={styles.statItem}>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.45} style={[styles.statValue, valueStyle(todayNewCustomers)]}>{todayNewCustomers}</Text>
                <Text style={styles.statLabel}>今日新增客户</Text>
            </View>
            <View style={styles.statItem}>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.45} style={[styles.statValue, valueStyle(todayPayment)]}>{todayPayment}</Text>
                <Text style={styles.statLabel}>今日收款</Text>
            </View>
        </View>
    </Pressable>;
}

export default function WorkbenchScreen({footer, stats}: {footer: ReactNode; stats: XuanWorkbenchStats}) {
    return <View style={styles.screen}>
        <WorkbenchHeader />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.quickCard}>
                {quickApps.map((item) => {
                    const Icon = item.icon;
                    return <Pressable
                        key={item.label}
                        accessibilityRole="button"
                        accessibilityLabel={item.label}
                        style={({pressed}) => [styles.quickItem, pressed && styles.pressed]}
                    >
                        <View style={styles.quickIcon}><Icon size={30} /></View>
                        <Text style={styles.quickLabel}>{item.label}</Text>
                    </Pressable>;
                })}
            </View>
            <PromoBanner />
            <ContactStatsCard stats={stats} />
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>客户联系与管理</Text>
                <AppGrid items={customerApps} />
            </View>
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>智能办公 AI+</Text>
                <AppGrid items={officeApps} />
            </View>
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>内部管理</Text>
                <AppGrid items={internalApps} />
            </View>
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>效率工具</Text>
                <AppGrid items={efficiencyApps} />
            </View>
        </ScrollView>
        {footer}
    </View>;
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: '#f3f4f9'},
    headerSafe: {paddingTop: Platform.OS === 'web' ? 34 : 0, backgroundColor: '#eaf2ff'},
    header: {height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eaf2ff'},
    headerTitle: {color: '#0b0d10', fontSize: 22, fontWeight: '500', letterSpacing: 0},
    headerActions: {position: 'absolute', right: 12, bottom: 5, flexDirection: 'row', columnGap: 7},
    headerButton: {width: 39, height: 39, alignItems: 'center', justifyContent: 'center'},
    content: {paddingHorizontal: 10, paddingTop: 0, paddingBottom: 22},
    quickCard: {minHeight: 110, paddingHorizontal: 6, borderRadius: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff'},
    quickItem: {minHeight: 104, flex: 1, alignItems: 'center', justifyContent: 'center', rowGap: 13},
    quickIcon: {width: 38, height: 38, alignItems: 'center', justifyContent: 'center'},
    quickLabel: {color: '#121212', fontSize: 16, lineHeight: 22, fontWeight: '400'},
    promoCard: {height: 130, marginTop: 12, paddingLeft: 20, borderRadius: 17, overflow: 'hidden', flexDirection: 'row', backgroundColor: '#e6f2ff'},
    promoCopy: {minWidth: 0, flex: 1, paddingTop: 11, paddingRight: 8},
    promoEyebrow: {flexDirection: 'row', alignItems: 'center', columnGap: 7},
    promoEyebrowText: {color: '#1ab760', fontSize: 15, fontWeight: '700'},
    promoTitle: {marginTop: 4, color: '#2777d9', fontSize: 15, lineHeight: 19, fontWeight: '700'},
    promoSubTitleRow: {marginTop: 2, alignItems: 'center', flexDirection: 'row', columnGap: 5},
    promoSubTitle: {color: '#347ed7', fontSize: 11, lineHeight: 16},
    watchButton: {height: 23, marginTop: 2, paddingHorizontal: 7, alignSelf: 'flex-start', alignItems: 'center', flexDirection: 'row', columnGap: 4, borderRadius: 6, backgroundColor: '#fff'},
    watchButtonText: {color: '#3175cf', fontSize: 11, fontWeight: '500'},
    promoPreview: {width: '43%', marginTop: 13, marginRight: -11, paddingTop: 10, paddingHorizontal: 10, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: 'rgba(255,255,255,0.72)', transform: [{rotate: '-1deg'}]},
    previewTopLine: {height: 20, flexDirection: 'row', alignItems: 'center', columnGap: 4},
    previewDot: {width: 9, height: 9, borderRadius: 5, backgroundColor: '#37c68b'},
    previewTitle: {color: '#5c9be8', fontSize: 10, fontWeight: '700'},
    previewChevron: {marginLeft: 'auto', width: 9, height: 9, borderRightWidth: 2, borderBottomWidth: 2, borderColor: '#7c8790', transform: [{rotate: '45deg'}, {translateY: -2}]},
    previewSheet: {flex: 1, marginTop: 5, padding: 8, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: '#fff'},
    previewUserLine: {flexDirection: 'row', alignItems: 'center', columnGap: 4},
    previewAvatar: {width: 13, height: 13, borderRadius: 4, backgroundColor: '#86b8f5'},
    previewUser: {color: '#69a5e7', fontSize: 9, fontWeight: '600'},
    previewTag: {color: '#49bf83', fontSize: 8},
    previewLabel: {marginTop: 5, color: '#b5c1cf', fontSize: 8},
    previewText: {marginTop: 2, color: '#7990a4', fontSize: 8, lineHeight: 11},
    statsCard: {height: 148, marginTop: 12, paddingTop: 15, borderRadius: 18, backgroundColor: '#fff'},
    statsHeader: {height: 35, paddingHorizontal: 20, alignItems: 'center', flexDirection: 'row'},
    statsIcon: {width: 35, height: 35, alignItems: 'center', justifyContent: 'center'},
    statsTitle: {marginLeft: 10, color: '#9b9b9f', fontSize: 16, lineHeight: 21, fontWeight: '400'},
    arrowText: {marginLeft: 'auto', color: '#d8d9dc', fontSize: 36, fontWeight: '200', lineHeight: 34},
    statsRow: {flex: 1, marginTop: 7, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center'},
    statItem: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    statValue: {color: '#050505', fontSize: 26, lineHeight: 32, fontWeight: '400'},
    statValueMedium: {fontSize: 18},
    statValueCompact: {fontSize: 12},
    statLabel: {marginTop: 7, color: '#9b9b9f', fontSize: 14, lineHeight: 20},
    sectionCard: {marginTop: 12, paddingTop: 17, paddingHorizontal: 20, paddingBottom: 14, borderRadius: 18, backgroundColor: '#fff'},
    sectionTitle: {color: '#9b9b9f', fontSize: 15, lineHeight: 21, fontWeight: '400'},
    grid: {marginTop: 9, flexDirection: 'row', flexWrap: 'wrap'},
    gridItem: {width: '25%', minHeight: 88, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10},
    gridIcon: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center'},
    gridLabel: {maxWidth: '100%', marginTop: 7, color: '#131313', fontSize: 14, lineHeight: 20, textAlign: 'center'},
    pressed: {opacity: 0.72},
});
