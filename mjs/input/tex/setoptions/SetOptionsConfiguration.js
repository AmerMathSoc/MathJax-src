import { Configuration, ConfigurationHandler } from '../Configuration.js';
import { CommandMap } from '../SymbolMap.js';
import TexError from '../TexError.js';
import ParseUtil from '../ParseUtil.js';
import { Macro } from '../Symbol.js';
import BaseMethods from '../base/BaseMethods.js';
import { expandable, isObject } from '../../../util/Options.js';
export const SetOptionsUtil = {
    filterPackage(parser, extension) {
        if (extension !== 'tex' && !ConfigurationHandler.get(extension)) {
            throw new TexError('NotAPackage', 'Not a defined package: %1', extension);
        }
        const config = parser.options.setoptions;
        const options = config.allowOptions[extension];
        if ((options === undefined && !config.allowPackageDefault) || options === false) {
            throw new TexError('PackageNotSettable', 'Options can\'t be set for package "%1"', extension);
        }
        return true;
    },
    filterOption(parser, extension, option) {
        var _a;
        const config = parser.options.setoptions;
        const options = config.allowOptions[extension] || {};
        const allow = (options.hasOwnProperty(option) && !isObject(options[option]) ? options[option] : null);
        if (allow === false || (allow === null && !config.allowOptionsDefault)) {
            throw new TexError('OptionNotSettable', 'Option "%1" is not allowed to be set', option);
        }
        if (!((_a = (extension === 'tex' ? parser.options : parser.options[extension])) === null || _a === void 0 ? void 0 : _a.hasOwnProperty(option))) {
            if (extension === 'tex') {
                throw new TexError('InvalidTexOption', 'Invalid TeX option "%1"', option);
            }
            else {
                throw new TexError('InvalidOptionKey', 'Invalid option "%1" for package "%2"', option, extension);
            }
        }
        return true;
    },
    filterValue(_parser, _extension, _option, value) {
        return value;
    }
};
const setOptionsMap = new CommandMap('setoptions', {
    setOptions: 'SetOptions'
}, {
    SetOptions(parser, name) {
        const extension = parser.GetBrackets(name) || 'tex';
        const options = ParseUtil.keyvalOptions(parser.GetArgument(name));
        const config = parser.options.setoptions;
        if (!config.filterPackage(parser, extension))
            return;
        for (const key of Object.keys(options)) {
            if (config.filterOption(parser, extension, key)) {
                (extension === 'tex' ? parser.options : parser.options[extension])[key] =
                    config.filterValue(parser, extension, key, options[key]);
            }
        }
    }
});
function setoptionsConfig(_config, jax) {
    const require = jax.parseOptions.handlers.get('macro').lookup('require');
    if (require) {
        setOptionsMap.add('Require', new Macro('Require', require._func));
        setOptionsMap.add('require', new Macro('require', BaseMethods.Macro, ['\\Require{#2}\\setOptions[#2]{#1}', 2, '']));
    }
}
export const SetOptionsConfiguration = Configuration.create('setoptions', {
    handler: { macro: ['setoptions'] },
    config: setoptionsConfig,
    priority: 3,
    options: {
        setoptions: {
            filterPackage: SetOptionsUtil.filterPackage,
            filterOption: SetOptionsUtil.filterOption,
            filterValue: SetOptionsUtil.filterValue,
            allowPackageDefault: true,
            allowOptionsDefault: true,
            allowOptions: expandable({
                tex: {
                    FindTeX: false,
                    formatError: false,
                    package: false,
                    baseURL: false,
                    tags: false,
                    maxBuffer: false,
                    maxMaxros: false,
                    macros: false,
                    environments: false
                },
                setoptions: false,
                autoload: false,
                require: false,
                configmacros: false,
                tagformat: false
            })
        }
    }
});
//# sourceMappingURL=SetOptionsConfiguration.js.map