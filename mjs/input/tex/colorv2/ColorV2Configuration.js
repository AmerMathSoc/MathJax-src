import { CommandMap } from '../SymbolMap.js';
import { Configuration } from '../Configuration.js';
export const ColorV2Methods = {
    Color(parser, name) {
        const color = parser.GetArgument(name);
        const old = parser.stack.env['color'];
        parser.stack.env['color'] = color;
        const math = parser.ParseArg(name);
        if (old) {
            parser.stack.env['color'] = old;
        }
        else {
            delete parser.stack.env['color'];
        }
        const node = parser.create('node', 'mstyle', [math], { mathcolor: color });
        parser.Push(node);
    }
};
new CommandMap('colorv2', { color: 'Color' }, ColorV2Methods);
export const ColorConfiguration = Configuration.create('colorv2', { handler: { macro: ['colorv2'] } });
//# sourceMappingURL=ColorV2Configuration.js.map