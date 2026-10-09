const fs = require('fs');
const path = require('path');
const { AndroidConfig, withAndroidManifest, withDangerousMod } = require('expo/config-plugins');
const { buildShortcutsXml, buildValuesXml } = require('./appActionsResources');

const SHORTCUTS_META = 'android.app.shortcuts';

// Registers Android App Actions (Google Assistant built-in intents) via
// shortcuts.xml. Assistant fulfils them by launching `<scheme>://...` deep
// links, which src/utils/appLink.ts turns into in-app navigation.
function withAppActions(config) {
  const packageName = config.android && config.android.package;
  const scheme = Array.isArray(config.scheme) ? config.scheme[0] : config.scheme;
  if (!packageName) throw new Error('withAppActions: set expo.android.package in app.json');
  if (!scheme) throw new Error('withAppActions: set expo.scheme in app.json');

  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const res = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res');
      fs.mkdirSync(path.join(res, 'xml'), { recursive: true });
      fs.mkdirSync(path.join(res, 'values'), { recursive: true });
      fs.writeFileSync(
        path.join(res, 'xml', 'shortcuts.xml'),
        buildShortcutsXml({ packageName, scheme })
      );
      fs.writeFileSync(path.join(res, 'values', 'app_actions.xml'), buildValuesXml());
      return cfg;
    },
  ]);

  return withAndroidManifest(config, (cfg) => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(cfg.modResults);
    const meta = (activity['meta-data'] = activity['meta-data'] || []);
    if (!meta.some((m) => m.$['android:name'] === SHORTCUTS_META)) {
      meta.push({
        $: { 'android:name': SHORTCUTS_META, 'android:resource': '@xml/shortcuts' },
      });
    }
    return cfg;
  });
}

module.exports = withAppActions;
