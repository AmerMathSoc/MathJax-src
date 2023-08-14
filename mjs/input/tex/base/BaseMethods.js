import * as sitem from './BaseItems.js';
import NodeUtil from '../NodeUtil.js';
import TexError from '../TexError.js';
import TexParser from '../TexParser.js';
import { TexConstant } from '../TexConstants.js';
import ParseUtil from '../ParseUtil.js';
import { TEXCLASS } from '../../../core/MmlTree/MmlNode.js';
import { Label } from '../Tags.js';
import { em } from '../../../util/lengths.js';
import { entities } from '../../../util/Entities.js';
import { lookup } from '../../../util/Options.js';
import { replaceUnicode } from '../../../util/string.js';
let BaseMethods = {};
const P_HEIGHT = 1.2 / .85;
const MmlTokenAllow = {
    fontfamily: 1, fontsize: 1, fontweight: 1, fontstyle: 1,
    color: 1, background: 1,
    id: 1, 'class': 1, href: 1, style: 1
};
export function splitAlignArray(align, n = Infinity) {
    const list = align.replace(/\s+/g, '').split('').map((s) => {
        const name = { t: 'top', b: 'bottom', m: 'middle', c: 'center' }[s];
        if (!name) {
            throw new TexError('BadBreakAlign', 'Invalid alignment character: %1', s);
        }
        return name;
    });
    if (list.length > n) {
        throw new TexError('TooManyAligns', 'Too many alignment characters: %1', align);
    }
    return (n === 1 ? list[0] : list.join(' '));
}
BaseMethods.Open = function (parser, _c) {
    parser.Push(parser.itemFactory.create('open'));
};
BaseMethods.Close = function (parser, _c) {
    parser.Push(parser.itemFactory.create('close'));
};
BaseMethods.Bar = function (parser, c) {
    parser.Push(parser.create('token', 'mo', { stretchy: false, texClass: TEXCLASS.ORD }, c));
};
BaseMethods.Tilde = function (parser, _c) {
    parser.Push(parser.create('token', 'mtext', {}, entities.nbsp));
};
BaseMethods.Space = function (_parser, _c) { };
BaseMethods.Superscript = function (parser, _c) {
    if (parser.GetNext().match(/\d/)) {
        parser.string = parser.string.substr(0, parser.i + 1) +
            ' ' + parser.string.substr(parser.i + 1);
    }
    let primes;
    let base;
    const top = parser.stack.Top();
    if (top.isKind('prime')) {
        [base, primes] = top.Peek(2);
        parser.stack.Pop();
    }
    else {
        base = parser.stack.Prev();
        if (!base) {
            base = parser.create('token', 'mi', {}, '');
        }
    }
    const movesupsub = NodeUtil.getProperty(base, 'movesupsub');
    let position = NodeUtil.isType(base, 'msubsup') ? base.sup :
        base.over;
    if ((NodeUtil.isType(base, 'msubsup') && !NodeUtil.isType(base, 'msup') &&
        NodeUtil.getChildAt(base, base.sup)) ||
        (NodeUtil.isType(base, 'munderover') && !NodeUtil.isType(base, 'mover') &&
            NodeUtil.getChildAt(base, base.over) &&
            !NodeUtil.getProperty(base, 'subsupOK'))) {
        throw new TexError('DoubleExponent', 'Double exponent: use braces to clarify');
    }
    if (!NodeUtil.isType(base, 'msubsup') || NodeUtil.isType(base, 'msup')) {
        if (movesupsub) {
            if (!NodeUtil.isType(base, 'munderover') || NodeUtil.isType(base, 'mover') ||
                NodeUtil.getChildAt(base, base.over)) {
                base = parser.create('node', 'munderover', [base], { movesupsub: true });
            }
            position = base.over;
        }
        else {
            base = parser.create('node', 'msubsup', [base]);
            position = base.sup;
        }
    }
    parser.Push(parser.itemFactory.create('subsup', base).setProperties({
        position: position, primes: primes, movesupsub: movesupsub
    }));
};
BaseMethods.Subscript = function (parser, _c) {
    if (parser.GetNext().match(/\d/)) {
        parser.string =
            parser.string.substr(0, parser.i + 1) + ' ' +
                parser.string.substr(parser.i + 1);
    }
    let primes, base;
    const top = parser.stack.Top();
    if (top.isKind('prime')) {
        [base, primes] = top.Peek(2);
        parser.stack.Pop();
    }
    else {
        base = parser.stack.Prev();
        if (!base) {
            base = parser.create('token', 'mi', {}, '');
        }
    }
    const movesupsub = NodeUtil.getProperty(base, 'movesupsub');
    let position = NodeUtil.isType(base, 'msubsup') ?
        base.sub : base.under;
    if ((NodeUtil.isType(base, 'msubsup') && !NodeUtil.isType(base, 'msup') &&
        NodeUtil.getChildAt(base, base.sub)) ||
        (NodeUtil.isType(base, 'munderover') && !NodeUtil.isType(base, 'mover') &&
            NodeUtil.getChildAt(base, base.under) &&
            !NodeUtil.getProperty(base, 'subsupOK'))) {
        throw new TexError('DoubleSubscripts', 'Double subscripts: use braces to clarify');
    }
    if (!NodeUtil.isType(base, 'msubsup') || NodeUtil.isType(base, 'msup')) {
        if (movesupsub) {
            if (!NodeUtil.isType(base, 'munderover') || NodeUtil.isType(base, 'mover') ||
                NodeUtil.getChildAt(base, base.under)) {
                base = parser.create('node', 'munderover', [base], { movesupsub: true });
            }
            position = base.under;
        }
        else {
            base = parser.create('node', 'msubsup', [base]);
            position = base.sub;
        }
    }
    parser.Push(parser.itemFactory.create('subsup', base).setProperties({
        position: position, primes: primes, movesupsub: movesupsub
    }));
};
BaseMethods.Prime = function (parser, c) {
    let base = parser.stack.Prev();
    if (!base) {
        base = parser.create('token', 'mi');
    }
    if (NodeUtil.isType(base, 'msubsup') && !NodeUtil.isType(base, 'msup') &&
        NodeUtil.getChildAt(base, base.sup)) {
        throw new TexError('DoubleExponentPrime', 'Prime causes double exponent: use braces to clarify');
    }
    let sup = '';
    parser.i--;
    do {
        sup += entities.prime;
        parser.i++, c = parser.GetNext();
    } while (c === '\'' || c === entities.rsquo);
    sup = ['', '\u2032', '\u2033', '\u2034', '\u2057'][sup.length] || sup;
    const node = parser.create('token', 'mo', { variantForm: true }, sup);
    parser.Push(parser.itemFactory.create('prime', base, node));
};
BaseMethods.Comment = function (parser, _c) {
    while (parser.i < parser.string.length && parser.string.charAt(parser.i) !== '\n') {
        parser.i++;
    }
};
BaseMethods.Hash = function (_parser, _c) {
    throw new TexError('CantUseHash1', 'You can\'t use \'macro parameter character #\' in math mode');
};
BaseMethods.MathFont = function (parser, name, variant) {
    const text = parser.GetArgument(name);
    let mml = new TexParser(text, Object.assign(Object.assign({ multiLetterIdentifiers: parser.options.identifierPattern }, parser.stack.env), { font: variant, noAutoOP: true }), parser.configuration).mml();
    parser.Push(parser.create('node', 'TeXAtom', [mml]));
};
BaseMethods.SetFont = function (parser, _name, font) {
    parser.stack.env['font'] = font;
};
BaseMethods.SetStyle = function (parser, _name, texStyle, style, level) {
    parser.stack.env['style'] = texStyle;
    parser.stack.env['level'] = level;
    parser.Push(parser.itemFactory.create('style').setProperty('styles', { displaystyle: style, scriptlevel: level }));
};
BaseMethods.SetSize = function (parser, _name, size) {
    parser.stack.env['size'] = size;
    parser.Push(parser.itemFactory.create('style').setProperty('styles', { mathsize: em(size) }));
};
BaseMethods.Spacer = function (parser, _name, space) {
    const node = parser.create('node', 'mspace', [], { width: em(space) });
    const style = parser.create('node', 'mstyle', [node], { scriptlevel: 0 });
    parser.Push(style);
};
BaseMethods.DiscretionaryTimes = function (parser, _name) {
    parser.Push(parser.create('token', 'mo', { linebreakmultchar: '\u00D7' }, '\u2062'));
};
BaseMethods.AllowBreak = function (parser, _name) {
    parser.Push(parser.create('token', 'mspace'));
};
BaseMethods.Break = function (parser, _name) {
    parser.Push(parser.create('token', 'mspace', { linebreak: TexConstant.LineBreak.NEWLINE }));
};
BaseMethods.Linebreak = function (parser, _name, linebreak) {
    var _a, _b;
    let insert = true;
    const prev = parser.stack.Prev(true);
    if (prev && prev.isKind('mo')) {
        const style = ((_b = (_a = NodeUtil.getOp(prev)) === null || _a === void 0 ? void 0 : _a[3]) === null || _b === void 0 ? void 0 : _b.linebreakstyle) ||
            NodeUtil.getAttribute(prev, 'linebreakstyle');
        if (style !== TexConstant.LineBreakStyle.BEFORE) {
            prev.attributes.set('linebreak', linebreak);
            insert = false;
        }
    }
    parser.Push(parser.itemFactory.create('break', linebreak, insert));
};
BaseMethods.LeftRight = function (parser, name) {
    const first = name.substr(1);
    parser.Push(parser.itemFactory.create(first, parser.GetDelimiter(name), parser.stack.env.color));
};
BaseMethods.NamedFn = function (parser, name, id) {
    if (!id) {
        id = name.substr(1);
    }
    const mml = parser.create('token', 'mi', { texClass: TEXCLASS.OP }, id);
    parser.Push(parser.itemFactory.create('fn', mml));
};
BaseMethods.NamedOp = function (parser, name, id) {
    if (!id) {
        id = name.substr(1);
    }
    id = id.replace(/&thinsp;/, '\u2006');
    const mml = parser.create('token', 'mo', {
        movablelimits: true,
        movesupsub: true,
        form: TexConstant.Form.PREFIX,
        texClass: TEXCLASS.OP
    }, id);
    parser.Push(mml);
};
BaseMethods.Limits = function (parser, _name, limits) {
    let op = parser.stack.Prev(true);
    if (!op || (NodeUtil.getTexClass(NodeUtil.getCoreMO(op)) !== TEXCLASS.OP &&
        NodeUtil.getProperty(op, 'movesupsub') == null)) {
        throw new TexError('MisplacedLimits', '%1 is allowed only on operators', parser.currentCS);
    }
    const top = parser.stack.Top();
    let node;
    if (NodeUtil.isType(op, 'munderover') && !limits) {
        node = parser.create('node', 'msubsup');
        NodeUtil.copyChildren(op, node);
        op = top.Last = node;
    }
    else if (NodeUtil.isType(op, 'msubsup') && limits) {
        node = parser.create('node', 'munderover');
        NodeUtil.copyChildren(op, node);
        op = top.Last = node;
    }
    NodeUtil.setProperty(op, 'movesupsub', limits ? true : false);
    NodeUtil.setProperties(NodeUtil.getCoreMO(op), { 'movablelimits': false });
    if (NodeUtil.getAttribute(op, 'movablelimits') ||
        NodeUtil.getProperty(op, 'movablelimits')) {
        NodeUtil.setProperties(op, { 'movablelimits': false });
    }
};
BaseMethods.Over = function (parser, name, open, close) {
    const mml = parser.itemFactory.create('over').setProperty('name', parser.currentCS);
    if (open || close) {
        mml.setProperty('ldelim', open);
        mml.setProperty('rdelim', close);
    }
    else if (name.match(/withdelims$/)) {
        mml.setProperty('ldelim', parser.GetDelimiter(name));
        mml.setProperty('rdelim', parser.GetDelimiter(name));
    }
    if (name.match(/^\\above/)) {
        mml.setProperty('thickness', parser.GetDimen(name));
    }
    else if (name.match(/^\\atop/) || open || close) {
        mml.setProperty('thickness', 0);
    }
    parser.Push(mml);
};
BaseMethods.Frac = function (parser, name) {
    const num = parser.ParseArg(name);
    const den = parser.ParseArg(name);
    const node = parser.create('node', 'mfrac', [num, den]);
    parser.Push(node);
};
BaseMethods.Sqrt = function (parser, name) {
    const n = parser.GetBrackets(name);
    let arg = parser.GetArgument(name);
    if (arg === '\\frac') {
        arg += '{' + parser.GetArgument(arg) + '}{' + parser.GetArgument(arg) + '}';
    }
    let mml = new TexParser(arg, parser.stack.env, parser.configuration).mml();
    if (!n) {
        mml = parser.create('node', 'msqrt', [mml]);
    }
    else {
        mml = parser.create('node', 'mroot', [mml, parseRoot(parser, n)]);
    }
    parser.Push(mml);
};
function parseRoot(parser, n) {
    const env = parser.stack.env;
    const inRoot = env['inRoot'];
    env['inRoot'] = true;
    const newParser = new TexParser(n, env, parser.configuration);
    let node = newParser.mml();
    const global = newParser.stack.global;
    if (global['leftRoot'] || global['upRoot']) {
        const def = {};
        if (global['leftRoot']) {
            def['width'] = global['leftRoot'];
        }
        if (global['upRoot']) {
            def['voffset'] = global['upRoot'];
            def['height'] = global['upRoot'];
        }
        node = parser.create('node', 'mpadded', [node], def);
    }
    env['inRoot'] = inRoot;
    return node;
}
BaseMethods.Root = function (parser, name) {
    const n = parser.GetUpTo(name, '\\of');
    const arg = parser.ParseArg(name);
    const node = parser.create('node', 'mroot', [arg, parseRoot(parser, n)]);
    parser.Push(node);
};
BaseMethods.MoveRoot = function (parser, name, id) {
    if (!parser.stack.env['inRoot']) {
        throw new TexError('MisplacedMoveRoot', '%1 can appear only within a root', parser.currentCS);
    }
    if (parser.stack.global[id]) {
        throw new TexError('MultipleMoveRoot', 'Multiple use of %1', parser.currentCS);
    }
    let n = parser.GetArgument(name);
    if (!n.match(/-?[0-9]+/)) {
        throw new TexError('IntegerArg', 'The argument to %1 must be an integer', parser.currentCS);
    }
    n = (parseInt(n, 10) / 15) + 'em';
    if (n.substr(0, 1) !== '-') {
        n = '+' + n;
    }
    parser.stack.global[id] = n;
};
BaseMethods.Accent = function (parser, name, accent, stretchy) {
    const c = parser.ParseArg(name);
    const def = Object.assign(Object.assign({}, ParseUtil.getFontDef(parser)), { accent: true, mathaccent: true });
    const entity = NodeUtil.createEntity(accent);
    const moNode = parser.create('token', 'mo', def, entity);
    const mml = moNode;
    NodeUtil.setAttribute(mml, 'stretchy', stretchy ? true : false);
    const mo = (NodeUtil.isEmbellished(c) ? NodeUtil.getCoreMO(c) : c);
    if (NodeUtil.isType(mo, 'mo') || NodeUtil.getProperty(mo, 'movablelimits')) {
        NodeUtil.setProperties(mo, { 'movablelimits': false });
    }
    const muoNode = parser.create('node', 'munderover');
    NodeUtil.setChild(muoNode, 0, c);
    NodeUtil.setChild(muoNode, 1, null);
    NodeUtil.setChild(muoNode, 2, mml);
    let texAtom = parser.create('node', 'TeXAtom', [muoNode]);
    parser.Push(texAtom);
};
BaseMethods.UnderOver = function (parser, name, c, stack) {
    const entity = NodeUtil.createEntity(c);
    const mo = parser.create('token', 'mo', { stretchy: true, accent: true }, entity);
    mo.setProperty('mathaccent', false);
    const pos = (name.charAt(1) === 'o' ? 'over' : 'under');
    const base = parser.ParseArg(name);
    parser.Push(ParseUtil.underOver(parser, base, mo, pos, stack));
};
BaseMethods.Overset = function (parser, name) {
    const top = parser.ParseArg(name);
    const base = parser.ParseArg(name);
    const topMo = top.coreMO();
    const accent = (topMo.isKind('mo') && NodeUtil.getAttribute(topMo, 'accent') === true);
    ParseUtil.checkMovableLimits(base);
    const node = parser.create('node', 'mover', [base, top], { accent });
    parser.Push(node);
};
BaseMethods.Underset = function (parser, name) {
    const bot = parser.ParseArg(name);
    const base = parser.ParseArg(name);
    const botMo = bot.coreMO();
    const accentunder = (botMo.isKind('mo') && NodeUtil.getAttribute(botMo, 'accent') === true);
    ParseUtil.checkMovableLimits(base);
    const node = parser.create('node', 'munder', [base, bot], { accentunder });
    parser.Push(node);
};
BaseMethods.Overunderset = function (parser, name) {
    const top = parser.ParseArg(name);
    const bot = parser.ParseArg(name);
    const base = parser.ParseArg(name);
    const topMo = top.coreMO();
    const botMo = bot.coreMO();
    const accent = (topMo.isKind('mo') && NodeUtil.getAttribute(topMo, 'accent') === true);
    const accentunder = (botMo.isKind('mo') && NodeUtil.getAttribute(botMo, 'accent') === true);
    ParseUtil.checkMovableLimits(base);
    const node = parser.create('node', 'munderover', [base, bot, top], { accent, accentunder });
    parser.Push(node);
};
BaseMethods.TeXAtom = function (parser, name, mclass) {
    let def = { texClass: mclass };
    let mml;
    let node;
    if (mclass === TEXCLASS.OP) {
        def['movesupsub'] = def['movablelimits'] = true;
        const arg = parser.GetArgument(name);
        const match = arg.match(/^\s*\\rm\s+([a-zA-Z0-9 ]+)$/);
        if (match) {
            def['mathvariant'] = TexConstant.Variant.NORMAL;
            node = parser.create('token', 'mi', def, match[1]);
        }
        else {
            const parsed = new TexParser(arg, parser.stack.env, parser.configuration).mml();
            node = parser.create('node', 'TeXAtom', [parsed], def);
        }
        mml = parser.itemFactory.create('fn', node);
    }
    else {
        mml = parser.create('node', 'TeXAtom', [parser.ParseArg(name)], def);
    }
    parser.Push(mml);
};
BaseMethods.VBox = function (parser, name, align) {
    const arg = new TexParser(parser.GetArgument(name), parser.stack.env, parser.configuration);
    const def = { 'data-vertical-align': align, texClass: TEXCLASS.ORD };
    if (arg.stack.env.hsize) {
        def.width = arg.stack.env.hsize;
        def['data-overflow'] = 'linebreak';
    }
    const mml = parser.create('node', 'mpadded', [arg.mml()], def);
    mml.setProperty('vbox', align);
    parser.Push(mml);
};
BaseMethods.Hsize = function (parser, name) {
    parser.GetNext() === '=' && parser.i++;
    parser.stack.env.hsize = parser.GetDimen(name);
};
BaseMethods.ParBox = function (parser, name) {
    const c = parser.GetBrackets(name, 'c');
    const width = parser.GetDimen(name);
    const text = ParseUtil.internalMath(parser, parser.GetArgument(name));
    const align = splitAlignArray(c, 1);
    const mml = parser.create('node', 'mpadded', text, {
        width: width,
        'data-overflow': 'linebreak',
        'data-vertical-align': align
    });
    mml.setProperty('vbox', align);
    parser.Push(mml);
};
BaseMethods.BreakAlign = function (parser, name) {
    const top = parser.stack.Top();
    if (!(top instanceof sitem.ArrayItem)) {
        throw new TexError('BreakNotInArray', '%1 must be used in an alignment environment', parser.currentCS);
    }
    const type = parser.GetArgument(name).trim();
    switch (type) {
        case 'c':
            if (top.First) {
                throw new TexError('BreakFirstInEntry', '%1 must be at the beginning of an alignment entry', parser.currentCS + '{c}');
            }
            top.breakAlign.cell = splitAlignArray(parser.GetArgument(name), 1);
            break;
        case 'r':
            if (top.row.length || top.First) {
                throw new TexError('BreakFirstInRow', '%1 must be at the beginning of an alignment row', parser.currentCS + '{r}');
            }
            top.breakAlign.row = splitAlignArray(parser.GetArgument(name));
            break;
        case 't':
            if (top.table.length || top.row.length || top.First) {
                throw new TexError('BreakFirstInTable', '%1 must be at the beginning of an alignment', parser.currentCS + '{t}');
            }
            top.breakAlign.table = splitAlignArray(parser.GetArgument(name));
            break;
        default:
            throw new TexError('BreakType', 'First argument to %1 must be one of c, r, or t', parser.currentCS);
    }
};
BaseMethods.MmlToken = function (parser, name) {
    const kind = parser.GetArgument(name);
    let attr = parser.GetBrackets(name, '').replace(/^\s+/, '');
    const text = parser.GetArgument(name);
    const def = {};
    const keep = [];
    let node;
    try {
        node = parser.create('node', kind);
    }
    catch (e) {
        node = null;
    }
    if (!node || !node.isToken) {
        throw new TexError('NotMathMLToken', '%1 is not a token element', kind);
    }
    while (attr !== '') {
        const match = attr.match(/^([a-z]+)\s*=\s*('[^']*'|"[^"]*"|[^ ,]*)\s*,?\s*/i);
        if (!match) {
            throw new TexError('InvalidMathMLAttr', 'Invalid MathML attribute: %1', attr);
        }
        if (!node.attributes.hasDefault(match[1]) && !MmlTokenAllow[match[1]]) {
            throw new TexError('UnknownAttrForElement', '%1 is not a recognized attribute for %2', match[1], kind);
        }
        let value = ParseUtil.MmlFilterAttribute(parser, match[1], match[2].replace(/^(['"])(.*)\1$/, '$2'));
        if (value) {
            if (value.toLowerCase() === 'true') {
                value = true;
            }
            else if (value.toLowerCase() === 'false') {
                value = false;
            }
            def[match[1]] = value;
            keep.push(match[1]);
        }
        attr = attr.substr(match[0].length);
    }
    if (keep.length) {
        def['mjx-keep-attrs'] = keep.join(' ');
    }
    const textNode = parser.create('text', replaceUnicode(text));
    node.appendChild(textNode);
    NodeUtil.setProperties(node, def);
    parser.Push(node);
};
BaseMethods.Strut = function (parser, _name) {
    const row = parser.create('node', 'mrow');
    const padded = parser.create('node', 'mpadded', [row], { height: '8.6pt', depth: '3pt', width: 0 });
    parser.Push(padded);
};
BaseMethods.Phantom = function (parser, name, v, h) {
    let box = parser.create('node', 'mphantom', [parser.ParseArg(name)]);
    if (v || h) {
        box = parser.create('node', 'mpadded', [box]);
        if (h) {
            NodeUtil.setAttribute(box, 'height', 0);
            NodeUtil.setAttribute(box, 'depth', 0);
        }
        if (v) {
            NodeUtil.setAttribute(box, 'width', 0);
        }
    }
    const atom = parser.create('node', 'TeXAtom', [box]);
    parser.Push(atom);
};
BaseMethods.Smash = function (parser, name) {
    const bt = ParseUtil.trimSpaces(parser.GetBrackets(name, ''));
    const smash = parser.create('node', 'mpadded', [parser.ParseArg(name)]);
    switch (bt) {
        case 'b':
            NodeUtil.setAttribute(smash, 'depth', 0);
            break;
        case 't':
            NodeUtil.setAttribute(smash, 'height', 0);
            break;
        default:
            NodeUtil.setAttribute(smash, 'height', 0);
            NodeUtil.setAttribute(smash, 'depth', 0);
    }
    const atom = parser.create('node', 'TeXAtom', [smash]);
    parser.Push(atom);
};
BaseMethods.Lap = function (parser, name) {
    const mml = parser.create('node', 'mpadded', [parser.ParseArg(name)], { width: 0 });
    if (name === '\\llap') {
        NodeUtil.setAttribute(mml, 'lspace', '-1width');
    }
    const atom = parser.create('node', 'TeXAtom', [mml]);
    parser.Push(atom);
};
BaseMethods.RaiseLower = function (parser, name) {
    let h = parser.GetDimen(name);
    let item = parser.itemFactory.create('position').setProperties({ name: parser.currentCS, move: 'vertical' });
    if (h.charAt(0) === '-') {
        h = h.slice(1);
        name = name.substr(1) === 'raise' ? '\\lower' : '\\raise';
    }
    if (name === '\\lower') {
        item.setProperty('dh', '-' + h);
        item.setProperty('dd', '+' + h);
    }
    else {
        item.setProperty('dh', '+' + h);
        item.setProperty('dd', '-' + h);
    }
    parser.Push(item);
};
BaseMethods.MoveLeftRight = function (parser, name) {
    let h = parser.GetDimen(name);
    let nh = (h.charAt(0) === '-' ? h.slice(1) : '-' + h);
    if (name === '\\moveleft') {
        let tmp = h;
        h = nh;
        nh = tmp;
    }
    parser.Push(parser.itemFactory.create('position').setProperties({
        name: parser.currentCS, move: 'horizontal',
        left: parser.create('node', 'mspace', [], { width: h }),
        right: parser.create('node', 'mspace', [], { width: nh })
    }));
};
BaseMethods.Hskip = function (parser, name, nobreak = false) {
    const node = parser.create('node', 'mspace', [], { width: parser.GetDimen(name) });
    nobreak && NodeUtil.setAttribute(node, 'linebreak', 'nobreak');
    parser.Push(node);
};
BaseMethods.Nonscript = function (parser, _name) {
    parser.Push(parser.itemFactory.create('nonscript'));
};
BaseMethods.Rule = function (parser, name, style) {
    const w = parser.GetDimen(name), h = parser.GetDimen(name), d = parser.GetDimen(name);
    let def = { width: w, height: h, depth: d };
    if (style !== 'blank') {
        def['mathbackground'] = (parser.stack.env['color'] || 'black');
    }
    const node = parser.create('node', 'mspace', [], def);
    parser.Push(node);
};
BaseMethods.rule = function (parser, name) {
    const v = parser.GetBrackets(name), w = parser.GetDimen(name), h = parser.GetDimen(name);
    let mml = parser.create('node', 'mspace', [], {
        width: w, height: h,
        mathbackground: (parser.stack.env['color'] || 'black')
    });
    if (v) {
        mml = parser.create('node', 'mpadded', [mml], { voffset: v });
        if (v.match(/^\-/)) {
            NodeUtil.setAttribute(mml, 'height', v);
            NodeUtil.setAttribute(mml, 'depth', '+' + v.substr(1));
        }
        else {
            NodeUtil.setAttribute(mml, 'height', '+' + v);
        }
    }
    parser.Push(mml);
};
BaseMethods.MakeBig = function (parser, name, mclass, size) {
    size *= P_HEIGHT;
    let sizeStr = String(size).replace(/(\.\d\d\d).+/, '$1') + 'em';
    const delim = parser.GetDelimiter(name, true);
    const mo = parser.create('token', 'mo', {
        minsize: sizeStr, maxsize: sizeStr,
        fence: true, stretchy: true, symmetric: true
    }, delim);
    const node = parser.create('node', 'TeXAtom', [mo], { texClass: mclass });
    parser.Push(node);
};
BaseMethods.BuildRel = function (parser, name) {
    const top = parser.ParseUpTo(name, '\\over');
    const bot = parser.ParseArg(name);
    const node = parser.create('node', 'munderover');
    NodeUtil.setChild(node, 0, bot);
    NodeUtil.setChild(node, 1, null);
    NodeUtil.setChild(node, 2, top);
    const atom = parser.create('node', 'TeXAtom', [node], { texClass: TEXCLASS.REL });
    parser.Push(atom);
};
BaseMethods.HBox = function (parser, name, style, font) {
    parser.PushAll(ParseUtil.internalMath(parser, parser.GetArgument(name), style, font));
};
BaseMethods.FBox = function (parser, name) {
    const internal = ParseUtil.internalMath(parser, parser.GetArgument(name));
    const node = parser.create('node', 'menclose', internal, { notation: 'box' });
    parser.Push(node);
};
BaseMethods.FrameBox = function (parser, name) {
    const width = parser.GetBrackets(name);
    const pos = parser.GetBrackets(name) || 'c';
    let mml = ParseUtil.internalMath(parser, parser.GetArgument(name));
    if (width) {
        mml = [parser.create('node', 'mpadded', mml, {
                width,
                'data-align': lookup(pos, { l: 'left', r: 'right' }, 'center')
            })];
    }
    const node = parser.create('node', 'TeXAtom', [parser.create('node', 'menclose', mml, { notation: 'box' })], { texClass: TEXCLASS.ORD });
    parser.Push(node);
};
BaseMethods.MakeBox = function (parser, name) {
    const width = parser.GetBrackets(name);
    const pos = parser.GetBrackets(name, 'c');
    const mml = parser.create('node', 'mpadded', ParseUtil.internalMath(parser, parser.GetArgument(name)));
    if (width) {
        NodeUtil.setAttribute(mml, 'width', width);
    }
    const align = lookup(pos.toLowerCase(), { c: 'center', r: 'right' }, '');
    if (align) {
        NodeUtil.setAttribute(mml, 'data-align', align);
    }
    pos.toLowerCase() !== pos && NodeUtil.setAttribute(mml, 'data-overflow', 'linebreak');
    parser.Push(mml);
};
BaseMethods.Not = function (parser, _name) {
    parser.Push(parser.itemFactory.create('not'));
};
BaseMethods.Dots = function (parser, _name) {
    const ldotsEntity = NodeUtil.createEntity('2026');
    const cdotsEntity = NodeUtil.createEntity('22EF');
    const ldots = parser.create('token', 'mo', { stretchy: false }, ldotsEntity);
    const cdots = parser.create('token', 'mo', { stretchy: false }, cdotsEntity);
    parser.Push(parser.itemFactory.create('dots').setProperties({
        ldots: ldots,
        cdots: cdots
    }));
};
BaseMethods.Matrix = function (parser, _name, open, close, align, spacing, vspacing, style, cases, numbered) {
    const c = parser.GetNext();
    if (c === '') {
        throw new TexError('MissingArgFor', 'Missing argument for %1', parser.currentCS);
    }
    if (c === '{') {
        parser.i++;
    }
    else {
        parser.string = c + '}' + parser.string.slice(parser.i + 1);
        parser.i = 0;
    }
    const array = parser.itemFactory.create('array').setProperty('requireClose', true);
    if (open || !align) {
        array.setProperty('arrayPadding', '.2em .125em');
    }
    array.arraydef = {
        rowspacing: (vspacing || '4pt'),
        columnspacing: (spacing || '1em')
    };
    if (cases) {
        array.setProperty('isCases', true);
    }
    if (numbered) {
        array.setProperty('isNumbered', true);
        array.arraydef.side = numbered;
    }
    if (open || close) {
        array.setProperty('open', open);
        array.setProperty('close', close);
    }
    if (style === 'D') {
        array.arraydef.displaystyle = true;
    }
    if (align != null) {
        array.arraydef.columnalign = align;
    }
    parser.Push(array);
};
BaseMethods.Entry = function (parser, name) {
    parser.Push(parser.itemFactory.create('cell').setProperties({ isEntry: true, name: name }));
    const top = parser.stack.Top();
    const env = top.getProperty('casesEnv');
    const cases = top.getProperty('isCases');
    if (!cases && !env)
        return;
    const str = parser.string;
    let braces = 0, close = -1, i = parser.i, m = str.length;
    const end = (env ? new RegExp(`^\\\\end\\s*\\{${env.replace(/\*/, '\\*')}\\}`) : null);
    while (i < m) {
        const c = str.charAt(i);
        if (c === '{') {
            braces++;
            i++;
        }
        else if (c === '}') {
            if (braces === 0) {
                m = 0;
            }
            else {
                braces--;
                if (braces === 0 && close < 0) {
                    close = i - parser.i;
                }
                i++;
            }
        }
        else if (c === '&' && braces === 0) {
            throw new TexError('ExtraAlignTab', 'Extra alignment tab in \\cases text');
        }
        else if (c === '\\') {
            const rest = str.substr(i);
            if (rest.match(/^((\\cr)[^a-zA-Z]|\\\\)/) || (end && rest.match(end))) {
                m = 0;
            }
            else {
                i += 2;
            }
        }
        else {
            i++;
        }
    }
    const text = str.substr(parser.i, i - parser.i);
    if (!text.match(/^\s*\\text[^a-zA-Z]/) || close !== text.replace(/\s+$/, '').length - 1) {
        const internal = ParseUtil.internalMath(parser, ParseUtil.trimSpaces(text), 0);
        parser.PushAll(internal);
        parser.i = i;
    }
};
BaseMethods.Cr = function (parser, name) {
    parser.Push(parser.itemFactory.create('cell').setProperties({ isCR: true, name: name }));
};
BaseMethods.CrLaTeX = function (parser, name, nobrackets = false) {
    let n;
    if (!nobrackets) {
        if (parser.string.charAt(parser.i) === '*') {
            parser.i++;
        }
        if (parser.string.charAt(parser.i) === '[') {
            let dim = parser.GetBrackets(name, '');
            let [value, unit,] = ParseUtil.matchDimen(dim);
            if (dim && !value) {
                throw new TexError('BracketMustBeDimension', 'Bracket argument to %1 must be a dimension', parser.currentCS);
            }
            n = value + unit;
        }
    }
    parser.Push(parser.itemFactory.create('cell').setProperties({ isCR: true, name: name, linebreak: true }));
    const top = parser.stack.Top();
    let node;
    if (top instanceof sitem.ArrayItem) {
        if (n) {
            top.addRowSpacing(n);
        }
    }
    else {
        node = parser.create('node', 'mspace', [], { linebreak: TexConstant.LineBreak.NEWLINE });
        if (n) {
            NodeUtil.setAttribute(node, 'data-lineleading', n);
        }
        parser.Push(node);
    }
};
BaseMethods.HLine = function (parser, _name, style) {
    if (style == null) {
        style = 'solid';
    }
    const top = parser.stack.Top();
    if (!(top instanceof sitem.ArrayItem) || top.Size()) {
        throw new TexError('Misplaced', 'Misplaced %1', parser.currentCS);
    }
    if (!top.table.length) {
        top.frame.push(['top', style]);
    }
    else {
        const lines = (top.arraydef['rowlines'] ? top.arraydef['rowlines'].split(/ /) : []);
        while (lines.length < top.table.length) {
            lines.push('none');
        }
        lines[top.table.length - 1] = style;
        top.arraydef['rowlines'] = lines.join(' ');
    }
};
BaseMethods.HFill = function (parser, _name) {
    const top = parser.stack.Top();
    if (top instanceof sitem.ArrayItem) {
        top.hfill.push(top.Size());
    }
    else {
        throw new TexError('UnsupportedHFill', 'Unsupported use of %1', parser.currentCS);
    }
};
BaseMethods.NewColumnType = function (parser, name) {
    const c = parser.GetArgument(name);
    const n = parser.GetBrackets(name, '0');
    const macro = parser.GetArgument(name);
    if (c.length !== 1) {
        throw new TexError('BadColumnName', 'Column specifier must be exactly one character: %1', c);
    }
    if (!n.match(/^\d+$/)) {
        throw new TexError('PositiveIntegerArg', 'Argument to %1 must me a positive integer', n);
    }
    const cparser = parser.configuration.columnParser;
    cparser.columnHandler[c] = (state) => cparser.macroColumn(state, macro, parseInt(n));
};
BaseMethods.BeginEnd = function (parser, name) {
    let env = parser.GetArgument(name);
    if (env.match(/\\/)) {
        throw new TexError('InvalidEnv', 'Invalid environment name \'%1\'', env);
    }
    let macro = parser.configuration.handlers.get('environment').lookup(env);
    if (macro && name === '\\end') {
        if (!macro.args[0]) {
            const mml = parser.itemFactory.create('end').setProperty('name', env);
            parser.Push(mml);
            return;
        }
        parser.stack.env['closing'] = env;
    }
    ParseUtil.checkMaxMacros(parser, false);
    parser.parse('environment', [parser, env]);
};
BaseMethods.Array = function (parser, begin, open, close, align, spacing, vspacing, style, raggedHeight) {
    if (!align) {
        align = parser.GetArgument('\\begin{' + begin.getName() + '}');
    }
    const array = parser.itemFactory.create('array');
    begin.getName() === 'array' && array.setProperty('arrayPadding', '.5em .125em');
    array.parser = parser;
    array.arraydef = {
        columnspacing: (spacing || '1em'),
        rowspacing: (vspacing || '4pt')
    };
    parser.configuration.columnParser.process(parser, align, array);
    if (open) {
        array.setProperty('open', parser.convertDelimiter(open));
    }
    if (close) {
        array.setProperty('close', parser.convertDelimiter(close));
    }
    if ((style || '').charAt(1) === '\'') {
        array.arraydef['data-cramped'] = true;
        style = style.charAt(0);
    }
    if (style === 'D') {
        array.arraydef['displaystyle'] = true;
    }
    else if (style) {
        array.arraydef['displaystyle'] = false;
    }
    if (style === 'S') {
        array.arraydef['scriptlevel'] = 1;
    }
    if (raggedHeight) {
        array.arraydef['useHeight'] = false;
    }
    parser.Push(begin);
    array.StartEntry();
    return array;
};
BaseMethods.AlignedArray = function (parser, begin, style = '') {
    const align = parser.GetBrackets('\\begin{' + begin.getName() + '}');
    let item = BaseMethods.Array(parser, begin, null, null, null, null, null, style);
    return ParseUtil.setArrayAlign(item, align);
};
BaseMethods.IndentAlign = function (parser, begin) {
    const name = `\\begin{${begin.getName()}}`;
    const first = parser.GetBrackets(name, '');
    let shift = parser.GetBrackets(name, '');
    const last = parser.GetBrackets(name, '');
    if ((first && !ParseUtil.matchDimen(first)[0]) ||
        (shift && !ParseUtil.matchDimen(shift)[0]) ||
        (last && !ParseUtil.matchDimen(last)[0])) {
        throw new TexError('BracketMustBeDimension', 'Bracket argument to %1 must be a dimension', name);
    }
    const lcr = parser.GetArgument(name);
    if (lcr && !lcr.match(/^([lcr]{1,3})?$/)) {
        throw new TexError('BadAlignment', 'Alignment must be one to three copies of l, c, or r');
    }
    const align = [...lcr].map(c => ({ l: 'left', c: 'center', r: 'right' })[c]);
    align.length === 1 && align.push(align[0]);
    const attr = {};
    for (const [name, value] of [
        ['indentshiftfirst', first], ['indentshift', shift || first], ['indentshiftlast', last],
        ['indentalignfirst', align[0]], ['indentalign', align[1]], ['indentalignlast', align[2]]
    ]) {
        if (value) {
            attr[name] = value;
        }
    }
    parser.Push(parser.itemFactory.create('mstyle', attr, begin.getName()));
};
BaseMethods.Equation = function (parser, begin, numbered, display = true) {
    parser.configuration.mathItem.display = display;
    parser.stack.env.display = display;
    ParseUtil.checkEqnEnv(parser);
    parser.Push(begin);
    return parser.itemFactory.create('equation', numbered).
        setProperty('name', begin.getName());
};
BaseMethods.EqnArray = function (parser, begin, numbered, taggable, align, balign, spacing) {
    let name = begin.getName();
    let isGather = (name === 'gather' || name === 'gather*');
    if (taggable) {
        ParseUtil.checkEqnEnv(parser, !isGather);
    }
    parser.Push(begin);
    align = align.replace(/[^clr]/g, '').split('').join(' ');
    align = align.replace(/l/g, 'left').replace(/r/g, 'right').replace(/c/g, 'center');
    balign = splitAlignArray(balign);
    let newItem = parser.itemFactory.create('eqnarray', name, numbered, taggable, parser.stack.global);
    newItem.arraydef = {
        displaystyle: true,
        columnalign: align,
        columnspacing: (spacing || '1em'),
        rowspacing: '3pt',
        'data-break-align': balign,
        side: parser.options['tagSide'],
        minlabelspacing: parser.options['tagIndent']
    };
    if (isGather) {
        newItem.setProperty('nestable', true);
    }
    return newItem;
};
BaseMethods.HandleNoTag = function (parser, _name) {
    parser.tags.notag();
};
BaseMethods.HandleLabel = function (parser, name) {
    let label = parser.GetArgument(name);
    if (label === '') {
        return;
    }
    if (!parser.tags.refUpdate) {
        if (parser.tags.label) {
            throw new TexError('MultipleCommand', 'Multiple %1', parser.currentCS);
        }
        parser.tags.label = label;
        if ((parser.tags.allLabels[label] || parser.tags.labels[label]) && !parser.options['ignoreDuplicateLabels']) {
            throw new TexError('MultipleLabel', 'Label \'%1\' multiply defined', label);
        }
        parser.tags.labels[label] = new Label();
    }
};
BaseMethods.HandleRef = function (parser, name, eqref) {
    let label = parser.GetArgument(name);
    let ref = parser.tags.allLabels[label] || parser.tags.labels[label];
    if (!ref) {
        if (!parser.tags.refUpdate) {
            parser.tags.redo = true;
        }
        ref = new Label();
    }
    let tag = ref.tag;
    if (eqref) {
        tag = parser.tags.formatRef(tag);
    }
    let node = parser.create('node', 'mrow', ParseUtil.internalMath(parser, tag), {
        href: parser.tags.formatUrl(ref.id, parser.options.baseURL), 'class': 'MathJax_ref'
    });
    parser.Push(node);
};
BaseMethods.Macro = function (parser, name, macro, argcount, def) {
    if (argcount) {
        const args = [];
        if (def != null) {
            const optional = parser.GetBrackets(name);
            args.push(optional == null ? def : optional);
        }
        for (let i = args.length; i < argcount; i++) {
            args.push(parser.GetArgument(name));
        }
        macro = ParseUtil.substituteArgs(parser, args, macro);
    }
    parser.string = ParseUtil.addArgs(parser, macro, parser.string.slice(parser.i));
    parser.i = 0;
    ParseUtil.checkMaxMacros(parser);
};
BaseMethods.MathChoice = function (parser, name) {
    const D = parser.ParseArg(name);
    const T = parser.ParseArg(name);
    const S = parser.ParseArg(name);
    const SS = parser.ParseArg(name);
    parser.Push(parser.create('node', 'MathChoice', [D, T, S, SS]));
};
export default BaseMethods;
//# sourceMappingURL=BaseMethods.js.map