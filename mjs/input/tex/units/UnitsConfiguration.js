import { Configuration } from '../Configuration.js';
import TexParser from '../TexParser.js';
import { CommandMap } from '../SymbolMap.js';
export let UnitsMethods = {};
UnitsMethods.Unit = function (parser, name) {
    let val = parser.GetBrackets(name);
    let dim = parser.GetArgument(name);
    let macro = `\\mathrm{${dim}}`;
    if (val) {
        macro = val + (parser.options.units.loose ? '~' : '\\,') + macro;
    }
    parser.string = macro + parser.string.slice(parser.i);
    parser.i = 0;
};
UnitsMethods.UnitFrac = function (parser, name) {
    let val = parser.GetBrackets(name) || '';
    let num = parser.GetArgument(name);
    let den = parser.GetArgument(name);
    let macro = `\\nicefrac[\\mathrm]{${num}}{${den}}`;
    if (val) {
        macro = val + (parser.options.units.loose ? '~' : '\\,') + macro;
    }
    parser.string = macro + parser.string.slice(parser.i);
    parser.i = 0;
};
UnitsMethods.NiceFrac = function (parser, name) {
    let font = parser.GetBrackets(name) || '\\mathrm';
    let num = parser.GetArgument(name);
    let den = parser.GetArgument(name);
    let numMml = new TexParser(`${font}{${num}}`, Object.assign({}, parser.stack.env), parser.configuration).mml();
    let denMml = new TexParser(`${font}{${den}}`, Object.assign({}, parser.stack.env), parser.configuration).mml();
    const def = parser.options.units.ugly ? {} : { bevelled: true };
    const node = parser.create('node', 'mfrac', [numMml, denMml], def);
    parser.Push(node);
};
new CommandMap('units', {
    units: 'Unit',
    unitfrac: 'UnitFrac',
    nicefrac: 'NiceFrac'
}, UnitsMethods);
export const UnitsConfiguration = Configuration.create('units', {
    handler: { macro: ['units'] },
    options: {
        units: {
            loose: false,
            ugly: false
        }
    }
});
//# sourceMappingURL=UnitsConfiguration.js.map