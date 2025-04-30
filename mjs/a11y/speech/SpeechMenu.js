import { MJContextMenu } from '../../ui/menu/MJContextMenu.js';
import * as Sre from '../sre.js';
let csPrefsSetting = {};
function csPrefsVariables(menu, prefs) {
    const srVariable = menu.pool.lookup('speechRules');
    const previous = Sre.clearspeakPreferences.currentPreference();
    csPrefsSetting = Sre.clearspeakPreferences.fromPreference(previous);
    for (const pref of prefs) {
        menu.factory.get('variable')(menu.factory, {
            name: 'csprf_' + pref,
            setter: (value) => {
                csPrefsSetting[pref] = value;
                srVariable.setValue('clearspeak-' +
                    Sre.clearspeakPreferences.toPreference(csPrefsSetting));
            },
            getter: () => {
                return csPrefsSetting[pref] || 'Auto';
            },
        }, menu.pool);
    }
}
function csSelectionBox(menu, locale) {
    const prefs = Sre.clearspeakPreferences.getLocalePreferences();
    const props = prefs[locale];
    if (!props) {
        const csEntry = menu.findID('Accessibility', 'Speech', 'Clearspeak');
        if (csEntry) {
            csEntry.disable();
        }
        return null;
    }
    csPrefsVariables(menu, Object.keys(props));
    const items = [];
    for (const prop of Object.getOwnPropertyNames(props)) {
        items.push({
            title: prop,
            values: props[prop].map((x) => x.replace(RegExp('^' + prop + '_'), '')),
            variable: 'csprf_' + prop,
        });
    }
    const sb = menu.factory.get('selectionBox')(menu.factory, {
        title: 'Clearspeak Preferences',
        signature: '',
        order: 'alphabetic',
        grid: 'square',
        selections: items,
    }, menu);
    return {
        type: 'command',
        id: 'ClearspeakPreferences',
        content: 'Select Preferences',
        action: () => sb.post(0, 0),
    };
}
function basePreferences(previous) {
    const items = [
        {
            type: 'radio',
            content: 'No Preferences',
            id: 'clearspeak-default',
            variable: 'speechRules',
        },
        {
            type: 'radio',
            content: 'Current Preferences',
            id: 'clearspeak-' + previous,
            variable: 'speechRules',
        },
        {
            type: 'rule',
        },
    ];
    return items;
}
export function clearspeakMenu(menu, sub) {
    const locale = menu.pool.lookup('locale').getValue();
    const box = csSelectionBox(menu, locale);
    let items = [];
    if (menu.settings.speech) {
        const previous = Sre.clearspeakPreferences.currentPreference();
        items = items.concat(basePreferences(previous));
        if (box) {
            items.splice(2, 0, box);
        }
    }
    return menu.factory.get('subMenu')(menu.factory, {
        items: items,
        id: 'Clearspeak',
    }, sub);
}
MJContextMenu.DynamicSubmenus.set('Clearspeak', [clearspeakMenu, 'speech']);
let LOCALE_MENU = null;
export function localeMenu(menu, sub) {
    if (LOCALE_MENU) {
        return LOCALE_MENU;
    }
    const radios = [];
    for (const lang of Sre.locales.keys()) {
        if (lang === 'nemeth' || lang === 'euro')
            continue;
        radios.push({
            type: 'radio',
            id: lang,
            content: Sre.locales.get(lang) || lang,
            variable: 'locale',
        });
    }
    radios.sort((x, y) => x.content.localeCompare(y.content, 'en'));
    LOCALE_MENU = menu.factory.get('subMenu')(menu.factory, {
        items: radios,
        id: 'Language',
    }, sub);
    return LOCALE_MENU;
}
MJContextMenu.DynamicSubmenus.set('A11yLanguage', [localeMenu, 'speech']);
//# sourceMappingURL=SpeechMenu.js.map