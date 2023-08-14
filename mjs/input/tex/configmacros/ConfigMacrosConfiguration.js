import { Configuration } from '../Configuration.js';
import { expandable } from '../../../util/Options.js';
import { CommandMap, EnvironmentMap, MacroMap } from '../SymbolMap.js';
import ParseMethods from '../ParseMethods.js';
import { Macro } from '../Symbol.js';
import NewcommandMethods from '../newcommand/NewcommandMethods.js';
import { BeginEnvItem } from '../newcommand/NewcommandItems.js';
import BaseMethods from '../base/BaseMethods.js';
const MACROSMAP = 'configmacros-map';
const ACTIVEMAP = 'configmacros-active-map';
const ENVIRONMENTMAP = 'configmacros-env-map';
function configmacrosInit(config) {
    new MacroMap(ACTIVEMAP, {}, BaseMethods);
    new CommandMap(MACROSMAP, {}, {});
    new EnvironmentMap(ENVIRONMENTMAP, ParseMethods.environment, {}, {});
    config.append(Configuration.local({
        handler: {
            character: [ACTIVEMAP],
            macro: [MACROSMAP],
            environment: [ENVIRONMENTMAP]
        },
        priority: 3
    }));
}
function configmacrosConfig(_config, jax) {
    configActives(jax);
    configMacros(jax);
    configEnvironments(jax);
}
function setMacros(name, map, jax) {
    const handler = jax.parseOptions.handlers.retrieve(map);
    const macros = jax.parseOptions.options[name];
    for (const cs of Object.keys(macros)) {
        const def = (typeof macros[cs] === 'string' ? [macros[cs]] : macros[cs]);
        const macro = Array.isArray(def[2]) ?
            new Macro(cs, NewcommandMethods.MacroWithTemplate, def.slice(0, 2).concat(def[2])) :
            new Macro(cs, NewcommandMethods.Macro, def);
        handler.add(cs, macro);
    }
}
function configActives(jax) {
    setMacros('active', ACTIVEMAP, jax);
}
function configMacros(jax) {
    setMacros('macros', MACROSMAP, jax);
}
function configEnvironments(jax) {
    const handler = jax.parseOptions.handlers.retrieve(ENVIRONMENTMAP);
    const environments = jax.parseOptions.options.environments;
    for (const env of Object.keys(environments)) {
        handler.add(env, new Macro(env, NewcommandMethods.BeginEnv, [true].concat(environments[env])));
    }
}
export const ConfigMacrosConfiguration = Configuration.create('configmacros', {
    init: configmacrosInit,
    config: configmacrosConfig,
    items: {
        [BeginEnvItem.prototype.kind]: BeginEnvItem,
    },
    options: {
        active: expandable({}),
        macros: expandable({}),
        environments: expandable({})
    }
});
//# sourceMappingURL=ConfigMacrosConfiguration.js.map