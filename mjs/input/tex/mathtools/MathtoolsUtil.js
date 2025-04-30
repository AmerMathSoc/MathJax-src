import { EqnArrayItem } from '../base/BaseItems.js';
import { UnitUtil } from '../UnitUtil.js';
import TexParser from '../TexParser.js';
import TexError from '../TexError.js';
import { lookup } from '../../../util/Options.js';
import { HandlerType } from '../HandlerTypes.js';
import { NewcommandUtil } from '../newcommand/NewcommandUtil.js';
import { MathtoolsMethods } from './MathtoolsMethods.js';
export const MathtoolsUtil = {
    setDisplayLevel(mml, style) {
        if (!style)
            return;
        const [display, script] = lookup(style, {
            '\\displaystyle': [true, 0],
            '\\textstyle': [false, 0],
            '\\scriptstyle': [false, 1],
            '\\scriptscriptstyle': [false, 2],
        }, [null, null]);
        if (display !== null) {
            mml.attributes.set('displaystyle', display);
            mml.attributes.set('scriptlevel', script);
        }
    },
    checkAlignment(parser, name) {
        const top = parser.stack.Top();
        if (top.kind !== EqnArrayItem.prototype.kind) {
            throw new TexError('NotInAlignment', '%1 can only be used in aligment environments', name);
        }
        return top;
    },
    addPairedDelims(parser, cs, args) {
        if (parser.configuration.handlers.get(HandlerType.MACRO).contains(cs)) {
            throw new TexError('CommadExists', 'Command %1 already defined', `\\${cs}`);
        }
        NewcommandUtil.addMacro(parser, cs, MathtoolsMethods.PairedDelimiters, args);
    },
    spreadLines(mtable, spread) {
        if (!mtable.isKind('mtable'))
            return;
        let rowspacing = mtable.attributes.get('rowspacing');
        const add = UnitUtil.dimen2em(spread);
        rowspacing = rowspacing
            .split(/ /)
            .map((s) => UnitUtil.em(Math.max(0, UnitUtil.dimen2em(s) + add)))
            .join(' ');
        mtable.attributes.set('rowspacing', rowspacing);
    },
    plusOrMinus(name, n) {
        n = n.trim();
        if (!n.match(/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/)) {
            throw new TexError('NotANumber', 'Argument to %1 is not a number', name);
        }
        return n.match(/^[-+]/) ? n : '+' + n;
    },
    getScript(parser, name, pos) {
        let arg = UnitUtil.trimSpaces(parser.GetArgument(name));
        if (arg === '') {
            return parser.create('node', 'none');
        }
        const format = parser.options.mathtools[`prescript-${pos}-format`];
        if (format) {
            arg = `${format}{${arg}}`;
        }
        const mml = new TexParser(arg, parser.stack.env, parser.configuration).mml();
        return mml.isKind('TeXAtom') && mml.childNodes[0].childNodes.length === 0
            ? parser.create('node', 'none')
            : mml;
    },
};
//# sourceMappingURL=MathtoolsUtil.js.map