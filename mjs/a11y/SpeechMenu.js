import { MJContextMenu } from '../ui/menu/MJContextMenu.js';
import { Sre } from './sre.js';
let csPrefsSetting = {};
function csPrefsVariables(menu, prefs) {
    let srVariable = menu.pool.lookup('speechRules');
    let previous = Sre.clearspeakPreferences.currentPreference();
    csPrefsSetting = Sre.clearspeakPreferences.fromPreference(previous);
    for (let pref of prefs) {
        menu.factory.get('variable')(menu.factory, {
            name: 'csprf_' + pref,
            setter: (value) => {
                csPrefsSetting[pref] = value;
                srVariable.setValue('clearspeak-' +
                    Sre.clearspeakPreferences.toPreference(csPrefsSetting));
            },
            getter: () => { return csPrefsSetting[pref] || 'Auto'; }
        }, menu.pool);
    }
}
function csSelectionBox(menu, locale) {
    let prefs = Sre.clearspeakPreferences.getLocalePreferences();
    let props = prefs[locale];
    if (!props) {
        let csEntry = menu.findID('Accessibility', 'Speech', 'Clearspeak');
        if (csEntry) {
            csEntry.disable();
        }
        return null;
    }
    csPrefsVariables(menu, Object.keys(props));
    let items = [];
    for (const prop of Object.getOwnPropertyNames(props)) {
        items.push({
            'title': prop,
            'values': props[prop].map(x => x.replace(RegExp('^' + prop + '_'), '')),
            'variable': 'csprf_' + prop
        });
    }
    let sb = menu.factory.get('selectionBox')(menu.factory, {
        'title': 'Clearspeak Preferences',
        'signature': '',
        'order': 'alphabetic',
        'grid': 'square',
        'selections': items
    }, menu);
    return { 'type': 'command',
        'id': 'ClearspeakPreferences',
        'content': 'Select Preferences',
        'action': () => sb.post(0, 0) };
}
function basePreferences(previous) {
    const items = [
        {
            type: 'radio',
            content: 'No Preferences',
            id: 'clearspeak-default',
            variable: 'speechRules'
        },
        {
            type: 'radio',
            content: 'Current Preferences',
            id: 'clearspeak-' + previous,
            variable: 'speechRules'
        },
        {
            type: 'rule'
        },
    ];
    return items;
}
function smartPreferences(previous, smart, locale) {
    const prefs = Sre.clearspeakPreferences.getLocalePreferences();
    const loc = prefs[locale];
    if (!loc) {
        return [];
    }
    const items = [
        { type: 'label', content: 'Preferences for ' + smart },
        { type: 'rule' }
    ];
    return items.concat(loc[smart].map(function (x) {
        const [key, value] = x.split('_');
        return {
            type: 'radioCompare',
            content: value,
            id: 'clearspeak-' + Sre.clearspeakPreferences.addPreference(previous, key, value),
            variable: 'speechRules',
            comparator: (x, y) => {
                if (x === y) {
                    return true;
                }
                if (value !== 'Auto') {
                    return false;
                }
                let [dom1, pref] = x.split('-');
                let [dom2] = y.split('-');
                return dom1 === dom2 && !Sre.clearspeakPreferences.fromPreference(pref)[key];
            }
        };
    }));
}
export function clearspeakMenu(menu, sub) {
    var _a, _b, _c, _d;
    let locale = menu.pool.lookup('locale').getValue();
    const box = csSelectionBox(menu, locale);
    let items = [];
    let explorer = (_c = (_b = (_a = menu.mathItem) === null || _a === void 0 ? void 0 : _a.explorers) === null || _b === void 0 ? void 0 : _b.explorers) === null || _c === void 0 ? void 0 : _c.speech;
    if (explorer === null || explorer === void 0 ? void 0 : explorer.walker) {
        let semantic = (_d = explorer.walker.getFocus()) === null || _d === void 0 ? void 0 : _d.getSemanticPrimary();
        if (semantic) {
            const previous = Sre.clearspeakPreferences.currentPreference();
            const smart = Sre.clearspeakPreferences.relevantPreferences(semantic);
            items = items.concat(basePreferences(previous));
            items = items.concat(smartPreferences(previous, smart, locale));
        }
    }
    if (box) {
        items.splice(2, 0, box);
    }
    return menu.factory.get('subMenu')(menu.factory, {
        items: items,
        id: 'Clearspeak'
    }, sub);
}
MJContextMenu.DynamicSubmenus.set('Clearspeak', clearspeakMenu);
let LOCALE_MENU = null;
export function localeMenu(menu, sub) {
    if (LOCALE_MENU) {
        return LOCALE_MENU;
    }
    let radios = [];
    for (let lang of Sre.locales.keys()) {
        if (lang === 'nemeth' || lang === 'euro')
            continue;
        radios.push({ type: 'radio', id: lang,
            content: Sre.locales.get(lang) || lang, variable: 'locale' });
    }
    radios.sort((x, y) => x.content.localeCompare(y.content, 'en'));
    LOCALE_MENU = menu.factory.get('subMenu')(menu.factory, {
        items: radios, id: 'Language'
    }, sub);
    return LOCALE_MENU;
}
MJContextMenu.DynamicSubmenus.set('A11yLanguage', localeMenu);
//# sourceMappingURL=SpeechMenu.js.map