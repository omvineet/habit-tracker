const {
  AndroidConfig,
  createRunOncePlugin,
  withAndroidManifest,
  withDangerousMod,
  withStringsXml,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SHORTCUT_STRINGS = [
  { name: 'shortcut_quick_log_short', value: 'Quick Log' },
  { name: 'shortcut_quick_log_long', value: 'Log a habit' },
  { name: 'shortcut_add_habit_short', value: 'Add habit' },
  { name: 'shortcut_add_habit_long', value: 'Create a new habit' },
];

function upsertString(resources, name, value) {
  if (!resources.string) resources.string = [];
  const existing = resources.string.find((item) => item.$.name === name);
  if (existing) {
    existing._ = value;
  } else {
    resources.string.push({ $: { name }, _: value });
  }
}

function withShortcutsMetaData(config) {
  return withAndroidManifest(config, (config) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults);
    if (!mainActivity['meta-data']) mainActivity['meta-data'] = [];
    const already = mainActivity['meta-data'].some(
      (item) => item.$['android:name'] === 'android.app.shortcuts'
    );
    if (!already) {
      mainActivity['meta-data'].push({
        $: {
          'android:name': 'android.app.shortcuts',
          'android:resource': '@xml/shortcuts',
        },
      });
    }
    return config;
  });
}

function withShortcutLabels(config) {
  return withStringsXml(config, (config) => {
    for (const { name, value } of SHORTCUT_STRINGS) {
      upsertString(config.modResults.resources, name, value);
    }
    return config;
  });
}

function withShortcutResources(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const pluginDir = path.join(__dirname, 'android-app-actions');
      const resDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res');
      const xmlDir = path.join(resDir, 'xml');
      const valuesDir = path.join(resDir, 'values');
      await fs.promises.mkdir(xmlDir, { recursive: true });
      await fs.promises.mkdir(valuesDir, { recursive: true });
      await fs.promises.copyFile(
        path.join(pluginDir, 'shortcuts.xml'),
        path.join(xmlDir, 'shortcuts.xml')
      );
      await fs.promises.copyFile(
        path.join(pluginDir, 'arrays.xml'),
        path.join(valuesDir, 'app_actions_arrays.xml')
      );
      return config;
    },
  ]);
}

function withAndroidAppActions(config) {
  config = withShortcutsMetaData(config);
  config = withShortcutLabels(config);
  config = withShortcutResources(config);
  return config;
}

module.exports = createRunOncePlugin(withAndroidAppActions, 'withAndroidAppActions', '1.0.0');
