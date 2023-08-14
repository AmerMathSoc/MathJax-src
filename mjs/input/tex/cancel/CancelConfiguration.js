import { Configuration } from '../Configuration.js';
import { TexConstant } from '../TexConstants.js';
import { CommandMap } from '../SymbolMap.js';
import ParseUtil from '../ParseUtil.js';
import { ENCLOSE_OPTIONS } from '../enclose/EncloseConfiguration.js';
export let CancelMethods = {};
CancelMethods.Cancel = function (parser, name, notation) {
    const attr = parser.GetBrackets(name, '');
    const math = parser.ParseArg(name);
    const def = ParseUtil.keyvalOptions(attr, ENCLOSE_OPTIONS);
    def['notation'] = notation;
    parser.Push(parser.create('node', 'menclose', [math], def));
};
CancelMethods.CancelTo = function (parser, name) {
    const attr = parser.GetBrackets(name, '');
    let value = parser.ParseArg(name);
    const math = parser.ParseArg(name);
    const def = ParseUtil.keyvalOptions(attr, ENCLOSE_OPTIONS);
    def['notation'] = [TexConstant.Notation.UPDIAGONALSTRIKE,
        TexConstant.Notation.UPDIAGONALARROW,
        TexConstant.Notation.NORTHEASTARROW].join(' ');
    value = parser.create('node', 'mpadded', [value], { depth: '-.1em', height: '+.1em', voffset: '.1em' });
    parser.Push(parser.create('node', 'msup', [parser.create('node', 'menclose', [math], def), value]));
};
new CommandMap('cancel', {
    cancel: ['Cancel', TexConstant.Notation.UPDIAGONALSTRIKE],
    bcancel: ['Cancel', TexConstant.Notation.DOWNDIAGONALSTRIKE],
    xcancel: ['Cancel', TexConstant.Notation.UPDIAGONALSTRIKE + ' ' +
            TexConstant.Notation.DOWNDIAGONALSTRIKE],
    cancelto: 'CancelTo'
}, CancelMethods);
export const CancelConfiguration = Configuration.create('cancel', { handler: { macro: ['cancel'] } });
//# sourceMappingURL=CancelConfiguration.js.map