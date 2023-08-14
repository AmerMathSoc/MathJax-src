import { EqnArrayItem } from '../base/BaseItems.js';
import ParseUtil from '../ParseUtil.js';
import TexParser from '../TexParser.js';
import TexError from '../TexError.js';
import { Macro } from '../Symbol.js';
import { lookup } from '../../../util/Options.js';
import { MathtoolsMethods } from './MathtoolsMethods.js';
import { PAIREDDELIMS } from './MathtoolsConfiguration.js';
export const MathtoolsUtil = {
    setDisplayLevel(mml, style) {
        if (!style)
            return;
        const [display, script] = lookup(style, {
            '\\displaystyle': [true, 0],
            '\\textstyle': [false, 0],
            '\\scriptstyle': [false, 1],
            '\\scriptscriptstyle': [false, 2]
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
    addPairedDelims(config, cs, args) {
        const delims = config.handlers.retrieve(PAIREDDELIMS);
        delims.add(cs, new Macro(cs, MathtoolsMethods.PairedDelimiters, args));
    },
    spreadLines(mtable, spread) {
        if (!mtable.isKind('mtable'))
            return;
        let rowspacing = mtable.attributes.get('rowspacing');
        if (rowspacing) {
            const add = ParseUtil.dimen2em(spread);
            rowspacing = rowspacing
                .split(/ /)
                .map(s => ParseUtil.Em(Math.max(0, ParseUtil.dimen2em(s) + add)))
                .join(' ');
        }
        else {
            rowspacing = spread;
        }
        mtable.attributes.set('rowspacing', rowspacing);
    },
    plusOrMinus(name, n) {
        n = n.trim();
        if (!n.match(/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/)) {
            throw new TexError('NotANumber', 'Argument to %1 is not a number', name);
        }
        return (n.match(/^[-+]/) ? n : '+' + n);
    },
    getScript(parser, name, pos) {
        let arg = ParseUtil.trimSpaces(parser.GetArgument(name));
        if (arg === '') {
            return parser.create('node', 'none');
        }
        const format = parser.options.mathtools[`prescript-${pos}-format`];
        format && (arg = `${format}{${arg}}`);
        return new TexParser(arg, parser.stack.env, parser.configuration).mml();
    }
};
//# sourceMappingURL=MathtoolsUtil.js.map