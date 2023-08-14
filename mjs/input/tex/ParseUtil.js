import { TEXCLASS } from '../../core/MmlTree/MmlNode.js';
import NodeUtil from './NodeUtil.js';
import TexParser from './TexParser.js';
import TexError from './TexError.js';
import { entities } from '../../util/Entities.js';
var ParseUtil;
(function (ParseUtil) {
    const emPerInch = 7.2;
    const pxPerInch = 72;
    const UNIT_CASES = {
        'em': m => m,
        'ex': m => m * .43,
        'pt': m => m / 10,
        'pc': m => m * 1.2,
        'px': m => m * emPerInch / pxPerInch,
        'in': m => m * emPerInch,
        'cm': m => m * emPerInch / 2.54,
        'mm': m => m * emPerInch / 25.4,
        'mu': m => m / 18,
    };
    const num = '([-+]?([.,]\\d+|\\d+([.,]\\d*)?))';
    const unit = '(pt|em|ex|mu|px|mm|cm|in|pc)';
    const dimenEnd = RegExp('^\\s*' + num + '\\s*' + unit + '\\s*$');
    const dimenRest = RegExp('^\\s*' + num + '\\s*' + unit + ' ?');
    function matchDimen(dim, rest = false) {
        let match = dim.match(rest ? dimenRest : dimenEnd);
        return match ?
            muReplace([match[1].replace(/,/, '.'), match[4], match[0].length]) :
            [null, null, 0];
    }
    ParseUtil.matchDimen = matchDimen;
    function muReplace([value, unit, length]) {
        if (unit !== 'mu') {
            return [value, unit, length];
        }
        let em = Em(UNIT_CASES[unit](parseFloat(value || '1')));
        return [em.slice(0, -2), 'em', length];
    }
    function dimen2em(dim) {
        let [value, unit] = matchDimen(dim);
        let m = parseFloat(value || '1');
        let func = UNIT_CASES[unit];
        return func ? func(m) : 0;
    }
    ParseUtil.dimen2em = dimen2em;
    function Em(m) {
        if (Math.abs(m) < .0006) {
            return '0em';
        }
        return m.toFixed(3).replace(/\.?0+$/, '') + 'em';
    }
    ParseUtil.Em = Em;
    function cols(...W) {
        return W.map(n => Em(n)).join(' ');
    }
    ParseUtil.cols = cols;
    function fenced(configuration, open, mml, close, big = '', color = '') {
        let nf = configuration.nodeFactory;
        let mrow = nf.create('node', 'mrow', [], { open: open, close: close, texClass: TEXCLASS.INNER });
        let mo;
        if (big) {
            mo = new TexParser('\\' + big + 'l' + open, configuration.parser.stack.env, configuration).mml();
        }
        else {
            let openNode = nf.create('text', open);
            mo = nf.create('node', 'mo', [], { fence: true, stretchy: true, symmetric: true, texClass: TEXCLASS.OPEN }, openNode);
        }
        NodeUtil.appendChildren(mrow, [mo, mml]);
        if (big) {
            mo = new TexParser('\\' + big + 'r' + close, configuration.parser.stack.env, configuration).mml();
        }
        else {
            let closeNode = nf.create('text', close);
            mo = nf.create('node', 'mo', [], { fence: true, stretchy: true, symmetric: true, texClass: TEXCLASS.CLOSE }, closeNode);
        }
        color && mo.attributes.set('mathcolor', color);
        NodeUtil.appendChildren(mrow, [mo]);
        return mrow;
    }
    ParseUtil.fenced = fenced;
    function fixedFence(configuration, open, mml, close) {
        let mrow = configuration.nodeFactory.create('node', 'mrow', [], { open: open, close: close, texClass: TEXCLASS.ORD });
        if (open) {
            NodeUtil.appendChildren(mrow, [mathPalette(configuration, open, 'l')]);
        }
        if (NodeUtil.isType(mml, 'mrow')) {
            NodeUtil.appendChildren(mrow, NodeUtil.getChildren(mml));
        }
        else {
            NodeUtil.appendChildren(mrow, [mml]);
        }
        if (close) {
            NodeUtil.appendChildren(mrow, [mathPalette(configuration, close, 'r')]);
        }
        return mrow;
    }
    ParseUtil.fixedFence = fixedFence;
    function mathPalette(configuration, fence, side) {
        if (fence === '{' || fence === '}') {
            fence = '\\' + fence;
        }
        let D = '{\\bigg' + side + ' ' + fence + '}';
        let T = '{\\big' + side + ' ' + fence + '}';
        return new TexParser('\\mathchoice' + D + T + T + T, {}, configuration).mml();
    }
    ParseUtil.mathPalette = mathPalette;
    function fixInitialMO(configuration, nodes) {
        for (let i = 0, m = nodes.length; i < m; i++) {
            let child = nodes[i];
            if (child && (!NodeUtil.isType(child, 'mspace') &&
                (!NodeUtil.isType(child, 'TeXAtom') ||
                    (NodeUtil.getChildren(child)[0] &&
                        NodeUtil.getChildren(NodeUtil.getChildren(child)[0]).length)))) {
                if (NodeUtil.isEmbellished(child) ||
                    (NodeUtil.isType(child, 'TeXAtom') && NodeUtil.getTexClass(child) === TEXCLASS.REL)) {
                    let mi = configuration.nodeFactory.create('node', 'mi');
                    nodes.unshift(mi);
                }
                break;
            }
        }
    }
    ParseUtil.fixInitialMO = fixInitialMO;
    function internalMath(parser, text, level, font) {
        text = text.replace(/ +/g, ' ');
        if (parser.configuration.options.internalMath) {
            return parser.configuration.options.internalMath(parser, text, level, font);
        }
        let mathvariant = font || parser.stack.env.font;
        let def = (mathvariant ? { mathvariant } : {});
        let mml = [], i = 0, k = 0, c, node, match = '', braces = 0;
        if (text.match(/\\?[${}\\]|\\\(|\\(?:eq)?ref\s*\{|\\U/)) {
            while (i < text.length) {
                c = text.charAt(i++);
                if (c === '$') {
                    if (match === '$' && braces === 0) {
                        node = parser.create('node', 'TeXAtom', [(new TexParser(text.slice(k, i - 1), {}, parser.configuration)).mml()]);
                        mml.push(node);
                        match = '';
                        k = i;
                    }
                    else if (match === '') {
                        if (k < i - 1) {
                            mml.push(internalText(parser, text.slice(k, i - 1), def));
                        }
                        match = '$';
                        k = i;
                    }
                }
                else if (c === '{' && match !== '') {
                    braces++;
                }
                else if (c === '}') {
                    if (match === '}' && braces === 0) {
                        let atom = (new TexParser(text.slice(k, i), {}, parser.configuration)).mml();
                        node = parser.create('node', 'TeXAtom', [atom], def);
                        mml.push(node);
                        match = '';
                        k = i;
                    }
                    else if (match !== '') {
                        if (braces) {
                            braces--;
                        }
                    }
                }
                else if (c === '\\') {
                    if (match === '' && text.substr(i).match(/^(eq)?ref\s*\{/)) {
                        let len = RegExp['$&'].length;
                        if (k < i - 1) {
                            mml.push(internalText(parser, text.slice(k, i - 1), def));
                        }
                        match = '}';
                        k = i - 1;
                        i += len;
                    }
                    else {
                        c = text.charAt(i++);
                        if (c === '(' && match === '') {
                            if (k < i - 2) {
                                mml.push(internalText(parser, text.slice(k, i - 2), def));
                            }
                            match = ')';
                            k = i;
                        }
                        else if (c === ')' && match === ')' && braces === 0) {
                            node = parser.create('node', 'TeXAtom', [(new TexParser(text.slice(k, i - 2), {}, parser.configuration)).mml()]);
                            mml.push(node);
                            match = '';
                            k = i;
                        }
                        else if (c.match(/[${}\\]/) && match === '') {
                            i--;
                            text = text.substr(0, i - 1) + text.substr(i);
                        }
                        else if (c === 'U') {
                            const arg = text.substr(i).match(/^\s*(?:([0-9A-F])|\{\s*([0-9A-F]+)\s*\})/);
                            if (!arg) {
                                throw new TexError('BadRawUnicode', 'Argument to %1 must a hexadecimal number with 1 to 6 digits', '\\U');
                            }
                            const c = String.fromCodePoint(parseInt(arg[1] || arg[2], 16));
                            text = text.substr(0, i - 2) + c + text.substr(i + arg[0].length);
                        }
                    }
                }
            }
            if (match !== '') {
                throw new TexError('MathNotTerminated', 'Math not terminated in text box');
            }
        }
        if (k < text.length) {
            mml.push(internalText(parser, text.slice(k), def));
        }
        if (level != null) {
            mml = [parser.create('node', 'mstyle', mml, { displaystyle: false, scriptlevel: level })];
        }
        else if (mml.length > 1) {
            mml = [parser.create('node', 'mrow', mml)];
        }
        return mml;
    }
    ParseUtil.internalMath = internalMath;
    function internalText(parser, text, def) {
        text = text.replace(/\n+/g, ' ').replace(/^\s+/, entities.nbsp).replace(/\s+$/, entities.nbsp);
        let textNode = parser.create('text', text);
        return parser.create('node', 'mtext', [], def, textNode);
    }
    ParseUtil.internalText = internalText;
    function underOver(parser, base, script, pos, stack) {
        ParseUtil.checkMovableLimits(base);
        if (NodeUtil.isType(base, 'munderover') && NodeUtil.isEmbellished(base)) {
            NodeUtil.setProperties(NodeUtil.getCoreMO(base), { lspace: 0, rspace: 0 });
            const mo = parser.create('node', 'mo', [], { rspace: 0 });
            base = parser.create('node', 'mrow', [mo, base]);
        }
        const mml = parser.create('node', 'munderover', [base]);
        NodeUtil.setChild(mml, pos === 'over' ? mml.over : mml.under, script);
        let node = mml;
        if (stack) {
            node = parser.create('node', 'TeXAtom', [mml], { texClass: TEXCLASS.OP, movesupsub: true });
        }
        NodeUtil.setProperty(node, 'subsupOK', true);
        return node;
    }
    ParseUtil.underOver = underOver;
    function checkMovableLimits(base) {
        const symbol = (NodeUtil.isType(base, 'mo') ? NodeUtil.getForm(base) : null);
        if (NodeUtil.getProperty(base, 'movablelimits') || (symbol && symbol[3] && symbol[3].movablelimits)) {
            NodeUtil.setProperties(base, { movablelimits: false });
        }
    }
    ParseUtil.checkMovableLimits = checkMovableLimits;
    function trimSpaces(text) {
        if (typeof (text) !== 'string') {
            return text;
        }
        let TEXT = text.trim();
        if (TEXT.match(/\\$/) && text.match(/ $/)) {
            TEXT += ' ';
        }
        return TEXT;
    }
    ParseUtil.trimSpaces = trimSpaces;
    function setArrayAlign(array, align, parser) {
        if (!parser) {
            align = ParseUtil.trimSpaces(align || '');
        }
        if (align === 't') {
            array.arraydef.align = 'baseline 1';
        }
        else if (align === 'b') {
            array.arraydef.align = 'baseline -1';
        }
        else if (align === 'c') {
            array.arraydef.align = 'axis';
        }
        else if (align) {
            if (parser) {
                parser.string = `[${align}]` + parser.string.slice(parser.i);
                parser.i = 0;
            }
            else {
                array.arraydef.align = align;
            }
        }
        return array;
    }
    ParseUtil.setArrayAlign = setArrayAlign;
    function substituteArgs(parser, args, str) {
        let text = '';
        let newstring = '';
        let i = 0;
        while (i < str.length) {
            let c = str.charAt(i++);
            if (c === '\\') {
                text += c + str.charAt(i++);
            }
            else if (c === '#') {
                c = str.charAt(i++);
                if (c === '#') {
                    text += c;
                }
                else {
                    if (!c.match(/[1-9]/) || parseInt(c, 10) > args.length) {
                        throw new TexError('IllegalMacroParam', 'Illegal macro parameter reference');
                    }
                    newstring = addArgs(parser, addArgs(parser, newstring, text), args[parseInt(c, 10) - 1]);
                    text = '';
                }
            }
            else {
                text += c;
            }
        }
        return addArgs(parser, newstring, text);
    }
    ParseUtil.substituteArgs = substituteArgs;
    function addArgs(parser, s1, s2) {
        if (s2.match(/^[a-z]/i) && s1.match(/(^|[^\\])(\\\\)*\\[a-z]+$/i)) {
            s1 += ' ';
        }
        if (s1.length + s2.length > parser.configuration.options['maxBuffer']) {
            throw new TexError('MaxBufferSize', 'MathJax internal buffer size exceeded; is there a' +
                ' recursive macro call?');
        }
        return s1 + s2;
    }
    ParseUtil.addArgs = addArgs;
    function checkMaxMacros(parser, isMacro = true) {
        if (++parser.macroCount <= parser.configuration.options['maxMacros']) {
            return;
        }
        if (isMacro) {
            throw new TexError('MaxMacroSub1', 'MathJax maximum macro substitution count exceeded; ' +
                'is here a recursive macro call?');
        }
        else {
            throw new TexError('MaxMacroSub2', 'MathJax maximum substitution count exceeded; ' +
                'is there a recursive latex environment?');
        }
    }
    ParseUtil.checkMaxMacros = checkMaxMacros;
    function checkEqnEnv(parser, nestable = true) {
        const top = parser.stack.Top();
        const first = top.First;
        if (top.getProperty('nestable') && nestable && !first) {
            return;
        }
        if (!top.isKind('start') || first) {
            throw new TexError('ErroneousNestingEq', 'Erroneous nesting of equation structures');
        }
    }
    ParseUtil.checkEqnEnv = checkEqnEnv;
    function copyNode(node, parser) {
        const tree = node.copy();
        const options = parser.configuration;
        tree.walkTree((n) => {
            options.addNode(n.kind, n);
            const lists = (n.getProperty('in-lists') || '').split(/,/);
            for (const list of lists) {
                list && options.addNode(list, n);
            }
        });
        return tree;
    }
    ParseUtil.copyNode = copyNode;
    function MmlFilterAttribute(_parser, _name, value) {
        return value;
    }
    ParseUtil.MmlFilterAttribute = MmlFilterAttribute;
    function getFontDef(parser) {
        const font = parser.stack.env['font'];
        return (font ? { mathvariant: font } : {});
    }
    ParseUtil.getFontDef = getFontDef;
    function keyvalOptions(attrib, allowed = null, error = false) {
        let def = readKeyval(attrib);
        if (allowed) {
            for (let key of Object.keys(def)) {
                if (!allowed.hasOwnProperty(key)) {
                    if (error) {
                        throw new TexError('InvalidOption', 'Invalid option: %1', key);
                    }
                    delete def[key];
                }
            }
        }
        return def;
    }
    ParseUtil.keyvalOptions = keyvalOptions;
    function readKeyval(text) {
        let options = {};
        let rest = text;
        let end, key, val;
        while (rest) {
            [key, end, rest] = readValue(rest, ['=', ',']);
            if (end === '=') {
                [val, end, rest] = readValue(rest, [',']);
                val = (val === 'false' || val === 'true') ?
                    JSON.parse(val) : val;
                options[key] = val;
            }
            else if (key) {
                options[key] = true;
            }
        }
        return options;
    }
    function removeBraces(text, count) {
        while (count > 0) {
            text = text.trim().slice(1, -1);
            count--;
        }
        return text.trim();
    }
    function readValue(text, end) {
        let length = text.length;
        let braces = 0;
        let value = '';
        let index = 0;
        let start = 0;
        let startCount = true;
        let stopCount = false;
        while (index < length) {
            let c = text[index++];
            switch (c) {
                case ' ':
                    break;
                case '{':
                    if (startCount) {
                        start++;
                    }
                    else {
                        stopCount = false;
                        if (start > braces) {
                            start = braces;
                        }
                    }
                    braces++;
                    break;
                case '}':
                    if (braces) {
                        braces--;
                    }
                    if (startCount || stopCount) {
                        start--;
                        stopCount = true;
                    }
                    startCount = false;
                    break;
                default:
                    if (!braces && end.indexOf(c) !== -1) {
                        return [stopCount ? 'true' :
                                removeBraces(value, start), c, text.slice(index)];
                    }
                    startCount = false;
                    stopCount = false;
            }
            value += c;
        }
        if (braces) {
            throw new TexError('ExtraOpenMissingClose', 'Extra open brace or missing close brace');
        }
        return [stopCount ? 'true' : removeBraces(value, start), '', text.slice(index)];
    }
    function isLatinOrGreekChar(c) {
        return !!c.normalize('NFD').match(/[a-zA-Z\u0370-\u03F0]/);
    }
    ParseUtil.isLatinOrGreekChar = isLatinOrGreekChar;
})(ParseUtil || (ParseUtil = {}));
export default ParseUtil;
//# sourceMappingURL=ParseUtil.js.map