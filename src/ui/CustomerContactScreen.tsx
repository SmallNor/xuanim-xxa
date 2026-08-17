import type {ComponentType} from 'react';
import {Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {XuanCustomerContactData} from '../api/types';
import {
    AlbumIcon,
    BackIcon,
    ChevronIcon,
    ConfigTabIcon,
    ContactHeaderIcon,
    ContactMeIcon,
    ContactTabIcon,
    DashboardIcon,
    FilterIcon,
    MoreIcon,
    OffWorkReplyIcon,
    PlusCircleIcon,
    QuickReplyIcon,
    RecommendServiceIcon,
    ToolbarIcon,
    VideoChannelIcon,
    WelcomeIcon,
} from './customer-contact-icons';

type ToolItem = {
    label: string;
    color: string;
    icon: ComponentType<{size?: number; color?: string}>;
};

const tools: ToolItem[] = [
    {label: '\u300c\u8054\u7cfb\u6211\u300d', color: '#35c469', icon: ContactMeIcon},
    {label: '\u6b22\u8fce\u8bed', color: '#35c469', icon: WelcomeIcon},
    {label: '\u5feb\u6377\u56de\u590d', color: '#f5b91c', icon: QuickReplyIcon},
    {label: '\u804a\u5929\u5de5\u5177\u680f', color: '#f5b91c', icon: ToolbarIcon},
    {label: '\u5546\u54c1\u56fe\u518c', color: '#f5b91c', icon: AlbumIcon},
    {label: '\u89c6\u9891\u53f7', color: '#f5b91c', icon: VideoChannelIcon},
    {label: '\u63a8\u8350\u5ba2\u670d', color: '#f5b91c', icon: RecommendServiceIcon},
    {label: '\u4e0b\u73ed\u540e\u56de\u590d', color: '#f5b91c', icon: OffWorkReplyIcon},
];

const formatMoney = (value: number) => `\u00a5${value.toFixed(2)}`;

function Header({data, back, openSettings}: {
    data: XuanCustomerContactData;
    back: () => void;
    openSettings: () => void;
}) {
    return <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
            <View style={styles.topBar}>
                <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={back} style={styles.topButton}>
                    <BackIcon />
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="更多设置" onPress={openSettings} style={styles.topButton}>
                    <MoreIcon />
                </Pressable>
            </View>
            <View style={styles.identity}>
                <View style={styles.identityIcon}>
                    <ContactHeaderIcon />
                </View>
                <View style={styles.identityText}>
                    <Text style={styles.title}>客户联系</Text>
                    <View style={styles.subtitleRow}>
                        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={styles.subtitle}>
                            外部联系人规模: {data.externalContactScale}位
                        </Text>
                        <ChevronIcon size={15} color="rgba(255,255,255,0.72)" />
                    </View>
                </View>
            </View>
        </View>
    </SafeAreaView>;
}

function CategoryCard({category, openSettings}: {category: string; openSettings: () => void}) {
    return <>
        <View style={styles.card}>
            <View style={styles.limitRow}>
                <View style={styles.limitCopy}>
                    <Text style={styles.limitTitle}>外部联系人规模即将达上限</Text>
                    <Text style={styles.limitDescription}>达上限后，企业将无法管理客户，包括获取客户详情、离职继承、主动联系等。</Text>
                </View>
                <Pressable accessibilityRole="button" onPress={openSettings} style={({pressed}) => [styles.purchaseButton, pressed && styles.pressed]}>
                    <Text style={styles.purchaseButtonText}>去购买</Text>
                </Pressable>
            </View>
        </View>
        <Pressable accessibilityRole="button" onPress={openSettings} style={({pressed}) => [styles.card, styles.categorySummary, pressed && styles.pressed]}>
            <Text style={styles.categorySummaryTitle}>经营类目</Text>
            <View style={styles.categorySummaryValue}>
                <Text numberOfLines={1} style={styles.categorySummaryText}>{category}</Text>
                <ChevronIcon size={16} color="#d8dade" />
            </View>
        </Pressable>
    </>;
}

function StatisticsCard({data}: {data: XuanCustomerContactData}) {
    const values = [String(data.customerTotal), String(data.todayNewCustomers), formatMoney(data.todayPayment)];
    return <View style={[styles.card, styles.statisticsCard]}>
        <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>企业全部客户概况</Text>
            <FilterIcon />
        </View>
        <View style={styles.statsRow}>
            {[
                {value: values[0], label: '\u5ba2\u6237\u603b\u6570'},
                {value: values[1], label: '\u4eca\u65e5\u65b0\u589e\u5ba2\u6237'},
                {value: values[2], label: '\u4eca\u65e5\u6536\u6b3e'},
            ].map((item) => <View key={item.label} style={styles.statItem}>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.42} style={styles.statValue}>{item.value}</Text>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={styles.statLabel}>{item.label}</Text>
                {item.label === '\u4eca\u65e5\u6536\u6b3e' && <View style={styles.paymentLink}>
                    <PlusCircleIcon size={11} />
                    <Text style={styles.paymentLinkText}>开通对外收款</Text>
                </View>}
            </View>)}
        </View>
        <View style={styles.dashboardRow}>
            <View style={styles.dashboardTitle}>
                <DashboardIcon />
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.dashboardTitleText}>生成客户仪表盘</Text>
            </View>
            <View style={styles.dashboardHint}>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.dashboardHintText}>了解标签分布情况</Text>
                <ChevronIcon size={17} color="#e2e4e8" />
            </View>
        </View>
    </View>;
}

function WeeklyPerformance({data, openSettings}: {data: XuanCustomerContactData; openSettings: () => void}) {
    return <View style={styles.card}>
        <View style={styles.performanceHeading}>
            <Text style={styles.sectionTitle}>企业本周业绩</Text>
            <Pressable accessibilityRole="button" onPress={openSettings} style={({pressed}) => [styles.performanceLink, pressed && styles.pressed]}>
                <PlusCircleIcon size={12} />
                <Text style={styles.performanceLinkText}>计入业绩</Text>
                <ChevronIcon size={14} />
            </Pressable>
        </View>
        <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={styles.performanceValue}>线上 {data.weeklyOnlineRevenue.toFixed(2)}元</Text>
                <Text style={styles.performanceSubtext}>含小程序、网页等</Text>
            </View>
            <View style={styles.performanceItem}>
                <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={styles.performanceValue}>线下 {data.weeklyOfflineRevenue.toFixed(2)}元</Text>
                <Text style={styles.performanceSubtext}>含门店POS、收款码</Text>
            </View>
        </View>
    </View>;
}

function ToolsCard() {
    return <View style={[styles.card, styles.toolsCard]}>
        <Text style={styles.toolsTitle}>工具</Text>
        <View style={styles.toolsGrid}>
            {tools.map((item) => {
                const Icon = item.icon;
                return <View key={item.label} style={styles.toolItem}>
                    <Icon size={21} color={item.color} />
                    <Text numberOfLines={1} style={styles.toolLabel}>{item.label}</Text>
                </View>;
            })}
        </View>
    </View>;
}

function BottomBar({openSettings}: {openSettings: () => void}) {
    return <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
        <View style={styles.bottomBar}>
            <View style={styles.bottomItem}>
                <ContactTabIcon />
                <Text style={[styles.bottomLabel, styles.bottomLabelActive]}>客户联系</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={openSettings} style={({pressed}) => [styles.bottomItem, pressed && styles.pressed]}>
                <ConfigTabIcon />
                <Text style={styles.bottomLabel}>配置</Text>
            </Pressable>
        </View>
    </SafeAreaView>;
}

export default function CustomerContactScreen({data, back, openSettings}: {
    data: XuanCustomerContactData;
    back: () => void;
    openSettings: () => void;
}) {
    return <View style={styles.screen}>
        <StatusBar style="light" />
        <Header data={data} back={back} openSettings={openSettings} />
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.content}>
            <CategoryCard category={data.businessCategory} openSettings={openSettings} />
            <StatisticsCard data={data} />
            <WeeklyPerformance data={data} openSettings={openSettings} />
            <ToolsCard />
        </ScrollView>
        <BottomBar openSettings={openSettings} />
    </View>;
}

const styles = StyleSheet.create({
    screen: {flex: 1, backgroundColor: '#edf0f5'},
    headerSafe: {paddingTop: Platform.OS === 'web' ? 18 : 0, backgroundColor: '#4373d5'},
    header: {height: 151, backgroundColor: '#4373d5'},
    topBar: {height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    topButton: {width: 48, height: 42, transform: [{translateY: 18}], alignItems: 'center', justifyContent: 'center'},
    identity: {height: 95, paddingHorizontal: 23, paddingBottom: 31, flexDirection: 'row', alignItems: 'flex-end'},
    identityIcon: {width: 40, height: 40, borderRadius: 20, transform: [{translateY: -2}], alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.16)'},
    identityText: {minWidth: 0, marginLeft: 7, transform: [{translateY: -1}], flex: 1},
    title: {color: '#fff', fontSize: 20, lineHeight: 25, fontWeight: '400'},
    subtitleRow: {flexDirection: 'row', alignItems: 'center'},
    subtitle: {minWidth: 0, maxWidth: 220, color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 18},
    scroll: {flex: 1, marginTop: -24},
    content: {paddingHorizontal: 11, paddingBottom: 16},
    card: {marginBottom: 7, overflow: 'hidden', borderRadius: 6, backgroundColor: '#fff'},
    statisticsCard: {marginBottom: 8},
    limitRow: {minHeight: 96, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center'},
    limitCopy: {minWidth: 0, flex: 1, paddingRight: 10},
    limitTitle: {color: '#101214', fontSize: 16, lineHeight: 22, fontWeight: '500'},
    limitDescription: {marginTop: 2, color: '#777b81', fontSize: 12, lineHeight: 18},
    purchaseButton: {width: 61, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: '#307ee8'},
    purchaseButtonText: {color: '#fff', fontSize: 15},
    categorySummary: {height: 51, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    categorySummaryTitle: {color: '#111315', fontSize: 16, lineHeight: 22, fontWeight: '500'},
    categorySummaryValue: {minWidth: 0, maxWidth: '70%', flexDirection: 'row', alignItems: 'center'},
    categorySummaryText: {minWidth: 0, flexShrink: 1, color: '#74787e', fontSize: 13, lineHeight: 18},
    sectionHeading: {height: 50, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', columnGap: 7},
    sectionTitle: {color: '#111315', fontSize: 16, lineHeight: 22, fontWeight: '500'},
    statsRow: {height: 90, paddingHorizontal: 8, flexDirection: 'row'},
    statItem: {minWidth: 0, flex: 1, alignItems: 'center'},
    statValue: {width: '100%', color: '#050607', fontSize: 25, lineHeight: 34, fontWeight: '400', textAlign: 'center'},
    statLabel: {width: '100%', marginTop: 4, color: '#92969b', fontSize: 12, lineHeight: 17, textAlign: 'center'},
    paymentLink: {marginTop: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 2},
    paymentLinkText: {color: '#2f80e9', fontSize: 12, lineHeight: 16},
    dashboardRow: {height: 47, marginHorizontal: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eceef1', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    dashboardTitle: {minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', columnGap: 8},
    dashboardTitleText: {minWidth: 0, flexShrink: 1, color: '#151719', fontSize: 16, fontWeight: '500'},
    dashboardHint: {minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'},
    dashboardHintText: {minWidth: 0, flexShrink: 1, color: '#999da2', fontSize: 14},
    performanceHeading: {height: 47, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    performanceLink: {height: 38, flexDirection: 'row', alignItems: 'center', columnGap: 2},
    performanceLinkText: {color: '#2787ea', fontSize: 12},
    performanceGrid: {height: 78, paddingHorizontal: 16, paddingBottom: 14, flexDirection: 'row', columnGap: 10},
    performanceItem: {minWidth: 0, flex: 1, paddingHorizontal: 11, justifyContent: 'center', borderRadius: 7, backgroundColor: '#f8f8f9'},
    performanceValue: {color: '#111315', fontSize: 16, lineHeight: 22, fontWeight: '600'},
    performanceSubtext: {marginTop: 4, color: '#92969b', fontSize: 12, lineHeight: 17},
    toolsCard: {marginBottom: 0},
    toolsTitle: {height: 44, paddingHorizontal: 16, textAlignVertical: 'center', color: '#111315', fontSize: 18, lineHeight: 44, fontWeight: '500'},
    toolsGrid: {flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ebedf0'},
    toolItem: {width: '50%', height: 47, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', columnGap: 7, borderRightWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ebedf0'},
    toolLabel: {minWidth: 0, flex: 1, color: '#111315', fontSize: 16},
    bottomSafe: {borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e4e6e9', backgroundColor: '#fafbfd'},
    bottomBar: {height: Platform.OS === 'web' ? 67 : 50, flexDirection: 'row'},
    bottomItem: {flex: 1, paddingTop: 7, alignItems: 'center', justifyContent: 'flex-start', rowGap: 2},
    bottomLabel: {color: '#5c6168', fontSize: 12, lineHeight: 17},
    bottomLabelActive: {color: '#2f80e9'},
    pressed: {opacity: 0.68},
});
