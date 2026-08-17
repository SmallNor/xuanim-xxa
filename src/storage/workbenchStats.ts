import {Platform} from 'react-native';
import {File, Paths} from 'expo-file-system';
import {normalizeCustomerContactData} from '../api/xuan';
import type {XuanCustomerContactData, XuanWorkbenchStats} from '../api/types';

const STORAGE_FILE = 'workbench-stats.json';
const STORAGE_KEY = 'xxa.workbench-stats';
type StoredStats = Record<string, XuanCustomerContactData>;

const makeStorageKey = (server: string, account: string) => `${server.trim().replace(/\/+$/, '').toLowerCase()}::${account.trim()}`;

const readStoredStats = async (): Promise<StoredStats> => {
    try {
        let raw = '';
        if (Platform.OS === 'web') {
            if (typeof window === 'undefined') return {};
            raw = window.localStorage.getItem(STORAGE_KEY) || '';
        } else {
            const file = new File(Paths.document, STORAGE_FILE);
            if (!file.exists) return {};
            raw = await file.text();
        }
        const parsed = JSON.parse(raw) as unknown;
        if (!parsed || typeof parsed !== 'object') return {};
        return parsed as StoredStats;
    } catch {
        return {};
    }
};

const writeStoredStats = async (stored: StoredStats) => {
    const serialized = JSON.stringify(stored);
    if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, serialized);
        return;
    }
    const file = new File(Paths.document, STORAGE_FILE);
    file.write(serialized);
};

export const getCustomerContactDataCache = async (
    server: string,
    account: string,
    fallbackStats: XuanWorkbenchStats,
): Promise<XuanCustomerContactData | null> => {
    const stored = await readStoredStats();
    const data = stored[makeStorageKey(server, account)];
    return data && typeof data === 'object' ? normalizeCustomerContactData(data, fallbackStats) : null;
};

export const saveCustomerContactDataCache = async (server: string, account: string, data: XuanCustomerContactData) => {
    const normalized = normalizeCustomerContactData(data, data);
    const stored = await readStoredStats();
    stored[makeStorageKey(server, account)] = normalized;
    await writeStoredStats(stored);
};
