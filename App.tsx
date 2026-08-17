import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import XuanApp from './src/ui/XuanApp';
import {AppUpdateProvider} from './src/update/AppUpdateProvider';

export default function App() {
    return <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppUpdateProvider><XuanApp /></AppUpdateProvider>
    </SafeAreaProvider>;
}

