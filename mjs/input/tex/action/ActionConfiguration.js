import { Configuration } from '../Configuration.js';
import TexParser from '../TexParser.js';
import { CommandMap } from '../SymbolMap.js';
import BaseMethods from '../base/BaseMethods.js';
export let ActionMethods = {};
ActionMethods.Macro = BaseMethods.Macro;
ActionMethods.Toggle = function (parser, name) {
    const children = [];
    let arg;
    while ((arg = parser.GetArgument(name)) !== '\\endtoggle') {
        children.push(new TexParser(arg, parser.stack.env, parser.configuration).mml());
    }
    parser.Push(parser.create('node', 'maction', children, { actiontype: 'toggle' }));
};
ActionMethods.Mathtip = function (parser, name) {
    const arg = parser.ParseArg(name);
    const tip = parser.ParseArg(name);
    parser.Push(parser.create('node', 'maction', [arg, tip], { actiontype: 'tooltip' }));
};
new CommandMap('action-macros', {
    toggle: 'Toggle',
    mathtip: 'Mathtip',
    texttip: ['Macro', '\\mathtip{#1}{\\text{#2}}', 2]
}, ActionMethods);
export const ActionConfiguration = Configuration.create('action', { handler: { macro: ['action-macros'] } });
//# sourceMappingURL=ActionConfiguration.js.map