import { Configuration } from '../Configuration.js';
import { CommandMap } from '../SymbolMap.js';
import { AmsMethods } from '../ams/AmsMethods.js';
import NewcommandUtil from '../newcommand/NewcommandUtil.js';
import { NewcommandConfiguration } from '../newcommand/NewcommandConfiguration.js';
import TexError from '../TexError.js';
export let ExtpfeilMethods = {};
ExtpfeilMethods.xArrow = AmsMethods.xArrow;
ExtpfeilMethods.NewExtArrow = function (parser, name) {
    let cs = parser.GetArgument(name);
    const space = parser.GetArgument(name);
    const chr = parser.GetArgument(name);
    if (!cs.match(/^\\([a-z]+|.)$/i)) {
        throw new TexError('NewextarrowArg1', 'First argument to %1 must be a control sequence name', name);
    }
    if (!space.match(/^(\d+),(\d+)$/)) {
        throw new TexError('NewextarrowArg2', 'Second argument to %1 must be two integers separated by a comma', name);
    }
    if (!chr.match(/^(\d+|0x[0-9A-F]+)$/i)) {
        throw new TexError('NewextarrowArg3', 'Third argument to %1 must be a unicode character number', name);
    }
    cs = cs.substr(1);
    let spaces = space.split(',');
    NewcommandUtil.addMacro(parser, cs, ExtpfeilMethods.xArrow, [parseInt(chr), parseInt(spaces[0]), parseInt(spaces[1])]);
};
new CommandMap('extpfeil', {
    xtwoheadrightarrow: ['xArrow', 0x21A0, 12, 16],
    xtwoheadleftarrow: ['xArrow', 0x219E, 17, 13],
    xmapsto: ['xArrow', 0x21A6, 6, 7],
    xlongequal: ['xArrow', 0x003D, 7, 7],
    xtofrom: ['xArrow', 0x21C4, 12, 12],
    Newextarrow: 'NewExtArrow'
}, ExtpfeilMethods);
let init = function (config) {
    NewcommandConfiguration.init(config);
};
export const ExtpfeilConfiguration = Configuration.create('extpfeil', {
    handler: { macro: ['extpfeil'] },
    init: init
});
//# sourceMappingURL=ExtpfeilConfiguration.js.map