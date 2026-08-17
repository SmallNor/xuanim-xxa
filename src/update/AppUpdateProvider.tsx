import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
    ActivityIndicator, Alert, Modal, Platform, Pressable,
    StyleSheet, Text, View,
} from 'react-native';
import {Download, RefreshCw} from 'lucide-react-native';
import appConfig from '../../app.json';
import nativeAppUpdate, {CurrentVersion, DownloadProgress} from '../../modules/app-update';

type AndroidUpdateManifest = {
    versionCode: number;
    versionName: string;
    apkUrl: string;
    sha256: string;
    forceUpdate: boolean;
    releaseNotes: string;
};

type UpdateStatus = 'idle' | 'checking' | 'current' | 'available' | 'downloading' | 'ready' | 'installing' | 'error';

type AppUpdateContextValue = {
    supported: boolean;
    status: UpdateStatus;
    progress: number;
    currentVersionName: string;
    latestVersion: AndroidUpdateManifest | null;
    checkForUpdate: () => Promise<void>;
};

const configuredVersion: CurrentVersion = {
    versionCode: appConfig.expo.android.versionCode,
    versionName: appConfig.expo.version,
};

const AppUpdateContext = createContext<AppUpdateContextValue>({
    supported: false,
    status: 'idle',
    progress: 0,
    currentVersionName: configuredVersion.versionName,
    latestVersion: null,
    checkForUpdate: async () => {},
});

const updateManifestUrl = appConfig.expo.extra.androidUpdateManifestUrl;

function validateManifest(value: unknown): AndroidUpdateManifest {
    if (!value || typeof value !== 'object') throw new Error('\u66f4\u65b0\u4fe1\u606f\u683c\u5f0f\u4e0d\u6b63\u786e');
    const manifest = value as Partial<AndroidUpdateManifest>;
    if (!Number.isInteger(manifest.versionCode) || Number(manifest.versionCode) <= 0) throw new Error('\u66f4\u65b0\u7248\u672c\u53f7\u65e0\u6548');
    if (typeof manifest.versionName !== 'string' || !manifest.versionName.trim()) throw new Error('\u66f4\u65b0\u7248\u672c\u540d\u65e0\u6548');
    if (typeof manifest.apkUrl !== 'string' || !/^https?:\/\//i.test(manifest.apkUrl)) throw new Error('APK \u4e0b\u8f7d\u5730\u5740\u65e0\u6548');
    if (typeof manifest.sha256 !== 'string' || !/^[0-9a-f]{64}$/i.test(manifest.sha256)) throw new Error('APK SHA-256 \u65e0\u6548');
    return {
        versionCode: Number(manifest.versionCode),
        versionName: manifest.versionName.trim(),
        apkUrl: manifest.apkUrl,
        sha256: manifest.sha256.toLowerCase(),
        forceUpdate: manifest.forceUpdate === true,
        releaseNotes: typeof manifest.releaseNotes === 'string' ? manifest.releaseNotes.trim() : '',
    };
}

async function fetchUpdateManifest(): Promise<AndroidUpdateManifest> {
    const separator = updateManifestUrl.includes('?') ? '&' : '?';
    const response = await fetch(`${updateManifestUrl}${separator}t=${Date.now()}`, {
        headers: {Accept: 'application/json'},
    });
    if (!response.ok) throw new Error(`\u7248\u672c\u670d\u52a1\u8fd4\u56de ${response.status}`);
    return validateManifest(await response.json());
}

export function AppUpdateProvider({children}: {children: ReactNode}) {
    const supported = Platform.OS === 'android' && !!nativeAppUpdate;
    const [currentVersion, setCurrentVersion] = useState(configuredVersion);
    const [latestVersion, setLatestVersion] = useState<AndroidUpdateManifest | null>(null);
    const [status, setStatus] = useState<UpdateStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => {
            toastTimer.current = null;
            setToastMessage('');
        }, 1800);
    }, []);

    useEffect(() => () => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
    }, []);

    useEffect(() => {
        if (!supported || !nativeAppUpdate) return;
        const subscription = nativeAppUpdate.addListener('appUpdateDownloadProgress', (event: DownloadProgress) => {
            setProgress(Math.max(0, Math.min(100, Math.round(event.progress || 0))));
        });
        return () => subscription.remove();
    }, [supported]);

    const check = useCallback(async (manual: boolean) => {
        if (!supported || !nativeAppUpdate) {
            if (manual) Alert.alert('\u68c0\u67e5\u66f4\u65b0', '\u8bf7\u5728 Android \u5b89\u88c5\u5305\u4e2d\u4f7f\u7528\u6b64\u529f\u80fd\u3002');
            return;
        }
        if (status === 'downloading') return;
        setStatus('checking');
        setError('');
        try {
            const [installed, manifest] = await Promise.all([
                nativeAppUpdate.getCurrentVersion(),
                fetchUpdateManifest(),
            ]);
            setCurrentVersion(installed);
            if (manifest.versionCode > installed.versionCode) {
                setLatestVersion(manifest);
                setStatus('available');
                setModalVisible(true);
                return;
            }
            setLatestVersion(null);
            setStatus('current');
            if (manual) showToast('\u5f53\u524d\u5df2\u662f\u6700\u65b0\u7248\u672c');
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : '\u68c0\u67e5\u66f4\u65b0\u5931\u8d25';
            setError(message);
            setStatus('error');
            if (manual) Alert.alert('\u68c0\u67e5\u66f4\u65b0\u5931\u8d25', message);
        }
    }, [showToast, status, supported]);

    useEffect(() => {
        if (supported) void check(false);
    // The startup check must run once for each native app launch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supported]);

    const openInstaller = async () => {
        if (!nativeAppUpdate) return;
        setError('');
        try {
            const result = await nativeAppUpdate.installApk();
            if (result === 'permissionRequired') {
                setStatus('ready');
                Alert.alert(
                    '\u9700\u8981\u5b89\u88c5\u6743\u9650',
                    '\u8bf7\u5141\u8bb8\u4f01\u4e1a\u5fae\u4fe1\u5b89\u88c5\u672a\u77e5\u5e94\u7528\uff0c\u8fd4\u56de\u540e\u70b9\u51fb\u201c\u7ee7\u7eed\u5b89\u88c5\u201d\u3002',
                );
            } else {
                setStatus('installing');
            }
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : '\u6253\u5f00\u5b89\u88c5\u9875\u5931\u8d25');
            setStatus('ready');
        }
    };

    const downloadAndInstall = async () => {
        if (!nativeAppUpdate || !latestVersion) return;
        if (status === 'ready' || status === 'installing') {
            await openInstaller();
            return;
        }
        setStatus('downloading');
        setProgress(0);
        setError('');
        try {
            await nativeAppUpdate.downloadApk(
                latestVersion.apkUrl,
                latestVersion.sha256,
                latestVersion.versionCode,
            );
            setProgress(100);
            setStatus('ready');
            await openInstaller();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'APK \u4e0b\u8f7d\u5931\u8d25');
            setStatus('error');
        }
    };

    const manualCheck = useCallback(() => check(true), [check]);
    const contextValue = useMemo<AppUpdateContextValue>(() => ({
        supported,
        status,
        progress,
        currentVersionName: currentVersion.versionName,
        latestVersion,
        checkForUpdate: manualCheck,
    }), [currentVersion.versionName, latestVersion, manualCheck, progress, status, supported]);

    const downloading = status === 'downloading';
    const canDismiss = !latestVersion?.forceUpdate && !downloading;
    const primaryLabel = status === 'ready'
        ? '\u7ee7\u7eed\u5b89\u88c5'
        : status === 'installing'
            ? '\u91cd\u65b0\u6253\u5f00\u5b89\u88c5\u9875'
            : status === 'error' && !latestVersion
                ? '\u91cd\u65b0\u68c0\u67e5'
                : '\u7acb\u5373\u66f4\u65b0';

    return <AppUpdateContext.Provider value={contextValue}>
        {children}
        {!!toastMessage && <View pointerEvents="none" style={styles.toastHost}>
            <View style={styles.toast}><Text style={styles.toastText}>{toastMessage}</Text></View>
        </View>}
        <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => canDismiss && setModalVisible(false)}
        >
            <View style={styles.scrim}>
                <View style={styles.card}>
                    <Text style={styles.title}>{'\u53d1\u73b0\u65b0\u7248\u672c'}</Text>
                    <Text style={styles.version}>
                        v{currentVersion.versionName} {'\u2192'} v{latestVersion?.versionName || ''}
                    </Text>
                    {!!latestVersion?.releaseNotes && <Text style={styles.notes}>{latestVersion.releaseNotes}</Text>}
                    {downloading && <View style={styles.progressArea}>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, {width: `${progress}%`}]} />
                        </View>
                        <Text style={styles.progressText}>{progress}%</Text>
                    </View>}
                    {status === 'installing' && <Text style={styles.hint}>{'\u5b89\u88c5\u9875\u5df2\u6253\u5f00\uff0c\u8bf7\u5728\u7cfb\u7edf\u9875\u9762\u786e\u8ba4\u5b89\u88c5\u3002'}</Text>}
                    {!!error && <Text style={styles.error}>{error}</Text>}
                    <View style={styles.actions}>
                        {canDismiss && <Pressable style={styles.secondaryButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.secondaryText}>{'\u7a0d\u540e'}</Text>
                        </Pressable>}
                        <Pressable
                            style={({pressed}) => [styles.primaryButton, pressed && !downloading && styles.primaryPressed]}
                            onPress={() => status === 'error' && !latestVersion ? void check(true) : void downloadAndInstall()}
                            disabled={downloading}
                        >
                            {downloading
                                ? <ActivityIndicator size="small" color="#fff" />
                                : status === 'error' && !latestVersion
                                    ? <RefreshCw size={17} color="#fff" strokeWidth={2} />
                                    : <Download size={17} color="#fff" strokeWidth={2} />}
                            <Text style={styles.primaryText}>{downloading ? `\u6b63\u5728\u4e0b\u8f7d ${progress}%` : primaryLabel}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    </AppUpdateContext.Provider>;
}

export const useAppUpdate = () => useContext(AppUpdateContext);

const styles = StyleSheet.create({
    scrim: {flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.42)'},
    card: {width: '100%', maxWidth: 360, padding: 22, borderRadius: 8, backgroundColor: '#fff'},
    title: {color: '#11151a', fontSize: 19, fontWeight: '600'},
    version: {marginTop: 8, color: '#287dd7', fontSize: 15, fontWeight: '500'},
    notes: {marginTop: 16, color: '#4d535a', fontSize: 15, lineHeight: 22},
    hint: {marginTop: 14, color: '#666c73', fontSize: 14, lineHeight: 20},
    error: {marginTop: 14, color: '#c83f3a', fontSize: 14, lineHeight: 20},
    progressArea: {marginTop: 18, flexDirection: 'row', alignItems: 'center', columnGap: 10},
    progressTrack: {height: 6, flex: 1, overflow: 'hidden', borderRadius: 3, backgroundColor: '#e8ebef'},
    progressFill: {height: 6, borderRadius: 3, backgroundColor: '#287dd7'},
    progressText: {width: 40, color: '#555b62', fontSize: 13, textAlign: 'right'},
    actions: {marginTop: 22, flexDirection: 'row', justifyContent: 'flex-end', columnGap: 10},
    secondaryButton: {height: 42, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center'},
    secondaryText: {color: '#5c6269', fontSize: 15, fontWeight: '500'},
    primaryButton: {minWidth: 126, height: 42, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 7, borderRadius: 5, backgroundColor: '#287dd7'},
    primaryPressed: {opacity: 0.84},
    primaryText: {color: '#fff', fontSize: 15, fontWeight: '600'},
    toastHost: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center'},
    toast: {maxWidth: '82%', paddingHorizontal: 29, paddingVertical: 14, borderRadius: 22, backgroundColor: '#656565'},
    toastText: {color: '#fff', fontSize: 18, lineHeight: 25, textAlign: 'center'},
});
