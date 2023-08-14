import { Configuration, ConfigurationHandler } from '../Configuration.js';
import { CommandMap } from '../SymbolMap.js';
import TexError from '../TexError.js';
import { MathJax } from '../../../components/global.js';
import { Package } from '../../../components/package.js';
import { Loader, CONFIG as LOADERCONFIG } from '../../../components/loader.js';
import { mathjax } from '../../../mathjax.js';
import { expandable } from '../../../util/Options.js';
const MJCONFIG = MathJax.config;
function RegisterExtension(jax, name) {
    const require = jax.parseOptions.options.require;
    const required = jax.parseOptions.packageData.get('require').required;
    const extension = name.substr(require.prefix.length);
    if (required.indexOf(extension) < 0) {
        required.push(extension);
        RegisterDependencies(jax, LOADERCONFIG.dependencies[name]);
        const handler = ConfigurationHandler.get(extension);
        if (handler) {
            let options = MJCONFIG[name] || {};
            if (handler.options && Object.keys(handler.options).length === 1 && handler.options[extension]) {
                options = { [extension]: options };
            }
            jax.configuration.add(extension, jax, options);
            const configured = jax.parseOptions.packageData.get('require').configured;
            if (handler.preprocessors.length && !configured.has(extension)) {
                configured.set(extension, true);
                mathjax.retryAfter(Promise.resolve());
            }
        }
    }
}
function RegisterDependencies(jax, names = []) {
    const prefix = jax.parseOptions.options.require.prefix;
    for (const name of names) {
        if (name.substr(0, prefix.length) === prefix) {
            RegisterExtension(jax, name);
        }
    }
}
export function RequireLoad(parser, name) {
    const options = parser.options.require;
    const allow = options.allow;
    const extension = (name.substr(0, 1) === '[' ? '' : options.prefix) + name;
    const allowed = (allow.hasOwnProperty(extension) ? allow[extension] :
        allow.hasOwnProperty(name) ? allow[name] : options.defaultAllow);
    if (!allowed) {
        throw new TexError('BadRequire', 'Extension "%1" is not allowed to be loaded', extension);
    }
    if (Package.packages.has(extension)) {
        RegisterExtension(parser.configuration.packageData.get('require').jax, extension);
    }
    else {
        mathjax.retryAfter(Loader.load(extension));
    }
}
function config(_config, jax) {
    jax.parseOptions.packageData.set('require', {
        jax: jax,
        required: [...jax.options.packages],
        configured: new Map()
    });
    const options = jax.parseOptions.options.require;
    const prefix = options.prefix;
    if (prefix.match(/[^_a-zA-Z0-9]/)) {
        throw Error('Illegal characters used in \\require prefix');
    }
    if (!LOADERCONFIG.paths[prefix]) {
        LOADERCONFIG.paths[prefix] = '[mathjax]/input/tex/extensions';
    }
    options.prefix = '[' + prefix + ']/';
}
export const RequireMethods = {
    Require(parser, name) {
        const required = parser.GetArgument(name);
        if (required.match(/[^_a-zA-Z0-9]/) || required === '') {
            throw new TexError('BadPackageName', 'Argument for %1 is not a valid package name', name);
        }
        RequireLoad(parser, required);
    }
};
export const options = {
    require: {
        allow: expandable({
            base: false,
            'all-packages': false,
            autoload: false,
            configmacros: false,
            tagformat: false,
            setoptions: false,
            texhtml: false
        }),
        defaultAllow: true,
        prefix: 'tex'
    }
};
new CommandMap('require', { require: 'Require' }, RequireMethods);
export const RequireConfiguration = Configuration.create('require', { handler: { macro: ['require'] }, config, options });
//# sourceMappingURL=RequireConfiguration.js.map