import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const registryPath = fileURLToPath(new URL(
    '../node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/activityresult/AppContextActivityResultRegistry.kt',
    import.meta.url,
));
const before = `        Lifecycle.Event.ON_DESTROY -> {
          unregister(key)
        }`;
const after = `        Lifecycle.Event.ON_DESTROY -> {
          // AppContext can outlive a recreated Activity. Keep the launcher mapping so
          // modules such as expo-image-picker can launch against the next Activity.
          keyToLifecycleContainers[key]?.clearObservers()
          keyToLifecycleContainers.remove(key)
        }`;

const source = await readFile(registryPath, 'utf8');
if (source.includes(after)) {
    process.exit(0);
}
if (!source.includes(before)) {
    throw new Error('Unsupported expo-modules-core ActivityResultRegistry implementation');
}
await writeFile(registryPath, source.replace(before, after));
