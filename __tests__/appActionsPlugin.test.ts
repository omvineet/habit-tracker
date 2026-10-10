import appJson from '../app.json';

const { FEATURES, buildShortcutsXml, buildValuesXml } = require('../plugins/appActionsResources');

const app = appJson.expo;
const shortcuts: string = buildShortcutsXml({ packageName: 'com.example.app', scheme: 'myscheme' });
const values: string = buildValuesXml();

describe('App Actions resources', () => {
  it('declares the built-in intents the app handles', () => {
    for (const bii of ['OPEN_APP_FEATURE', 'GET_THING', 'CREATE_THING', 'RECORD_EXERCISE']) {
      expect(shortcuts).toContain(`<capability android:name="actions.intent.${bii}">`);
    }
    expect(shortcuts).toContain('custom.actions.intent.LOG_HABIT');
  });

  it('fulfils via deep links on the configured scheme and MainActivity', () => {
    expect(shortcuts).toContain('myscheme://open{?feature}');
    expect(shortcuts).toContain('myscheme://habit{?name}');
    expect(shortcuts).toContain('myscheme://log{?name,description}');
    expect(shortcuts).toContain('myscheme://log{?name,duration}');
    expect(shortcuts).toContain('myscheme://log{?habit,minutes}');
    expect(shortcuts).toContain('android:targetClass="com.example.app.MainActivity"');
    expect(shortcuts).not.toContain('habittracker');
  });

  it('defines every referenced string and array resource', () => {
    const refs = [...shortcuts.matchAll(/@(string|array)\/(\w+)/g)];
    expect(refs.length).toBeGreaterThan(0);
    for (const [, kind, name] of refs) {
      const tag = kind === 'string' ? 'string' : 'string-array';
      expect(values).toContain(`<${tag} name="${name}">`);
    }
  });

  it('gives each feature a launcher shortcut that matches the in-app link', () => {
    for (const f of FEATURES) {
      expect(shortcuts).toContain(`android:shortcutId="${f.id}"`);
      expect(shortcuts).toContain(`android:data="myscheme://open?feature=${f.deepLinkFeature}"`);
    }
  });

  it('is configured in app.json', () => {
    expect(app.scheme).toBe('habittracker');
    expect(app.plugins).toContain('./plugins/withAppActions');
    expect(typeof require('../plugins/withAppActions')).toBe('function');
  });
});
