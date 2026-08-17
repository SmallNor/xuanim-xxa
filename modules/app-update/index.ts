import {NativeModule, requireOptionalNativeModule} from 'expo-modules-core';

export type CurrentVersion = {
    versionCode: number;
    versionName: string;
};

export type DownloadProgress = {
    progress: number;
    downloadedBytes: number;
    totalBytes: number;
};

type AppUpdateEvents = {
    appUpdateDownloadProgress: (event: DownloadProgress) => void;
};

declare class AppUpdateNativeModule extends NativeModule<AppUpdateEvents> {
    getCurrentVersion(): Promise<CurrentVersion>;
    downloadApk(url: string, sha256: string, versionCode: number): Promise<void>;
    installApk(): Promise<'permissionRequired' | 'installerOpened'>;
}

export default requireOptionalNativeModule<AppUpdateNativeModule>('AppUpdate');

