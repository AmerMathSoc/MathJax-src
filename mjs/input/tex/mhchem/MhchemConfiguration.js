import { Configuration } from '../Configuration.js';
import { CommandMap } from '../SymbolMap.js';
import TexError from '../TexError.js';
import BaseMethods from '../base/BaseMethods.js';
import { AmsMethods } from '../ams/AmsMethods.js';
import { mhchemParser } from '#mhchem/mhchemParser.js';
let MhchemMethods = {};
MhchemMethods.Macro = BaseMethods.Macro;
MhchemMethods.xArrow = AmsMethods.xArrow;
MhchemMethods.Machine = function (parser, name, machine) {
    let arg = parser.GetArgument(name);
    let tex;
    try {
        tex = mhchemParser.toTex(arg, machine);
    }
    catch (err) {
        throw new TexError(err[0], err[1]);
    }
    parser.string = tex + parser.string.substr(parser.i);
    parser.i = 0;
};
new CommandMap('mhchem', {
    ce: ['Machine', 'ce'],
    pu: ['Machine', 'pu'],
    longrightleftharpoons: [
        'Macro',
        '\\stackrel{\\textstyle{-}\\!\\!{\\rightharpoonup}}{\\smash{{\\leftharpoondown}\\!\\!{-}}}'
    ],
    longRightleftharpoons: [
        'Macro',
        '\\stackrel{\\textstyle{-}\\!\\!{\\rightharpoonup}}{\\smash{\\leftharpoondown}}'
    ],
    longLeftrightharpoons: [
        'Macro',
        '\\stackrel{\\textstyle\\vphantom{{-}}{\\rightharpoonup}}{\\smash{{\\leftharpoondown}\\!\\!{-}}}'
    ],
    longleftrightarrows: [
        'Macro',
        '\\stackrel{\\longrightarrow}{\\smash{\\longleftarrow}\\Rule{0px}{.25em}{0px}}'
    ],
    tripledash: [
        'Macro',
        '\\vphantom{-}\\raise2mu{\\kern2mu\\tiny\\text{-}\\kern1mu\\text{-}\\kern1mu\\text{-}\\kern2mu}'
    ],
    xleftrightarrow: ['xArrow', 0x2194, 6, 6],
    xrightleftharpoons: ['xArrow', 0x21CC, 5, 7],
    xRightleftharpoons: ['xArrow', 0x21CC, 5, 7],
    xLeftrightharpoons: ['xArrow', 0x21CC, 5, 7]
}, MhchemMethods);
export const MhchemConfiguration = Configuration.create('mhchem', { handler: { macro: ['mhchem'] } });
//# sourceMappingURL=MhchemConfiguration.js.map