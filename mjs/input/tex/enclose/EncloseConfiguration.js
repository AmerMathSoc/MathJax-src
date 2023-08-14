import { Configuration } from '../Configuration.js';
import { CommandMap } from '../SymbolMap.js';
import ParseUtil from '../ParseUtil.js';
export const ENCLOSE_OPTIONS = {
    'data-arrowhead': 1,
    color: 1,
    mathcolor: 1,
    background: 1,
    mathbackground: 1,
    'data-padding': 1,
    'data-thickness': 1
};
export let EncloseMethods = {};
EncloseMethods.Enclose = function (parser, name) {
    let notation = parser.GetArgument(name).replace(/,/g, ' ');
    const attr = parser.GetBrackets(name, '');
    const math = parser.ParseArg(name);
    const def = ParseUtil.keyvalOptions(attr, ENCLOSE_OPTIONS);
    def.notation = notation;
    parser.Push(parser.create('node', 'menclose', [math], def));
};
new CommandMap('enclose', { enclose: 'Enclose' }, EncloseMethods);
export const EncloseConfiguration = Configuration.create('enclose', { handler: { macro: ['enclose'] } });
//# sourceMappingURL=EncloseConfiguration.js.map