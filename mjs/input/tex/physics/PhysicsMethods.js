import BaseMethods from '../base/BaseMethods.js';
import TexParser from '../TexParser.js';
import TexError from '../TexError.js';
import { TEXCLASS } from '../../../core/MmlTree/MmlNode.js';
import ParseUtil from '../ParseUtil.js';
import NodeUtil from '../NodeUtil.js';
import { NodeFactory } from '../NodeFactory.js';
let PhysicsMethods = {};
const pairs = {
    '(': ')',
    '[': ']',
    '{': '}',
    '|': '|',
};
const biggs = /^(b|B)i(g{1,2})$/;
PhysicsMethods.Quantity = function (parser, name, open = '(', close = ')', arg = false, named = '', variant = '') {
    let star = arg ? parser.GetStar() : false;
    let next = parser.GetNext();
    let position = parser.i;
    let big = null;
    if (next === '\\') {
        parser.i++;
        big = parser.GetCS();
        if (!big.match(biggs)) {
            let empty = parser.create('node', 'mrow');
            parser.Push(ParseUtil.fenced(parser.configuration, open, empty, close));
            parser.i = position;
            return;
        }
        next = parser.GetNext();
    }
    let right = pairs[next];
    if (arg && next !== '{') {
        throw new TexError('MissingArgFor', 'Missing argument for %1', parser.currentCS);
    }
    if (!right) {
        let empty = parser.create('node', 'mrow');
        parser.Push(ParseUtil.fenced(parser.configuration, open, empty, close));
        parser.i = position;
        return;
    }
    if (named) {
        const mml = parser.create('token', 'mi', { texClass: TEXCLASS.OP }, named);
        if (variant) {
            NodeUtil.setAttribute(mml, 'mathvariant', variant);
        }
        parser.Push(parser.itemFactory.create('fn', mml));
    }
    if (next === '{') {
        let argument = parser.GetArgument(name);
        next = arg ? open : '\\{';
        right = arg ? close : '\\}';
        argument = star ? next + ' ' + argument + ' ' + right :
            (big ?
                '\\' + big + 'l' + next + ' ' + argument + ' ' + '\\' + big + 'r' + right :
                '\\left' + next + ' ' + argument + ' ' + '\\right' + right);
        parser.Push(new TexParser(argument, parser.stack.env, parser.configuration).mml());
        return;
    }
    if (arg) {
        next = open;
        right = close;
    }
    parser.i++;
    parser.Push(parser.itemFactory.create('auto open')
        .setProperties({ open: next, close: right, big: big }));
};
PhysicsMethods.Eval = function (parser, name) {
    let star = parser.GetStar();
    let next = parser.GetNext();
    if (next === '{') {
        let arg = parser.GetArgument(name);
        let replace = '\\left. ' +
            (star ? '\\smash{' + arg + '}' : arg) +
            ' ' + '\\vphantom{\\int}\\right|';
        parser.string = parser.string.slice(0, parser.i) + replace +
            parser.string.slice(parser.i);
        return;
    }
    if (next === '(' || next === '[') {
        parser.i++;
        parser.Push(parser.itemFactory.create('auto open')
            .setProperties({ open: next, close: '|',
            smash: star, right: '\\vphantom{\\int}' }));
        return;
    }
    throw new TexError('MissingArgFor', 'Missing argument for %1', parser.currentCS);
};
PhysicsMethods.Commutator = function (parser, name, open = '[', close = ']') {
    let star = parser.GetStar();
    let next = parser.GetNext();
    let big = null;
    if (next === '\\') {
        parser.i++;
        big = parser.GetCS();
        if (!big.match(biggs)) {
            throw new TexError('MissingArgFor', 'Missing argument for %1', parser.currentCS);
        }
        next = parser.GetNext();
    }
    if (next !== '{') {
        throw new TexError('MissingArgFor', 'Missing argument for %1', parser.currentCS);
    }
    let arg1 = parser.GetArgument(name);
    let arg2 = parser.GetArgument(name);
    let argument = arg1 + ',' + arg2;
    argument = star ? open + ' ' + argument + ' ' + close :
        (big ?
            '\\' + big + 'l' + open + ' ' + argument + ' ' + '\\' + big + 'r' + close :
            '\\left' + open + ' ' + argument + ' ' + '\\right' + close);
    parser.Push(new TexParser(argument, parser.stack.env, parser.configuration).mml());
};
let latinCap = [0x41, 0x5A];
let latinSmall = [0x61, 0x7A];
let greekCap = [0x391, 0x3A9];
let greekSmall = [0x3B1, 0x3C9];
let digits = [0x30, 0x39];
function inRange(value, range) {
    return (value >= range[0] && value <= range[1]);
}
function createVectorToken(factory, kind, def, text) {
    let parser = factory.configuration.parser;
    let token = NodeFactory.createToken(factory, kind, def, text);
    let code = text.codePointAt(0);
    if (text.length === 1 && !parser.stack.env.font &&
        parser.stack.env.vectorFont &&
        (inRange(code, latinCap) || inRange(code, latinSmall) ||
            inRange(code, greekCap) || inRange(code, digits) ||
            (inRange(code, greekSmall) && parser.stack.env.vectorStar) ||
            NodeUtil.getAttribute(token, 'accent'))) {
        NodeUtil.setAttribute(token, 'mathvariant', parser.stack.env.vectorFont);
    }
    return token;
}
PhysicsMethods.VectorBold = function (parser, name) {
    let star = parser.GetStar();
    let arg = parser.GetArgument(name);
    let oldToken = parser.configuration.nodeFactory.get('token');
    let oldFont = parser.stack.env.font;
    delete parser.stack.env.font;
    parser.configuration.nodeFactory.set('token', createVectorToken);
    parser.stack.env.vectorFont = star ? 'bold-italic' : 'bold';
    parser.stack.env.vectorStar = star;
    let node = new TexParser(arg, parser.stack.env, parser.configuration).mml();
    if (oldFont) {
        parser.stack.env.font = oldFont;
    }
    delete parser.stack.env.vectorFont;
    delete parser.stack.env.vectorStar;
    parser.configuration.nodeFactory.set('token', oldToken);
    parser.Push(node);
};
PhysicsMethods.StarMacro = function (parser, name, argcount, ...parts) {
    let star = parser.GetStar();
    const args = [];
    if (argcount) {
        for (let i = args.length; i < argcount; i++) {
            args.push(parser.GetArgument(name));
        }
    }
    let macro = parts.join(star ? '*' : '');
    macro = ParseUtil.substituteArgs(parser, args, macro);
    parser.string = ParseUtil.addArgs(parser, macro, parser.string.slice(parser.i));
    parser.i = 0;
    ParseUtil.checkMaxMacros(parser);
};
let vectorApplication = function (parser, kind, name, operator, fences) {
    let op = new TexParser(operator, parser.stack.env, parser.configuration).mml();
    parser.Push(parser.itemFactory.create(kind, op));
    let left = parser.GetNext();
    let right = pairs[left];
    if (!right) {
        return;
    }
    let lfence = '', rfence = '', arg = '';
    let enlarge = fences.indexOf(left) !== -1;
    if (left === '{') {
        arg = parser.GetArgument(name);
        lfence = enlarge ? '\\left\\{' : '';
        rfence = enlarge ? '\\right\\}' : '';
        let macro = lfence + ' ' + arg + ' ' + rfence;
        parser.string = macro + parser.string.slice(parser.i);
        parser.i = 0;
        return;
    }
    if (!enlarge) {
        return;
    }
    parser.i++;
    parser.Push(parser.itemFactory.create('auto open')
        .setProperties({ open: left, close: right }));
};
PhysicsMethods.OperatorApplication = function (parser, name, operator, ...fences) {
    vectorApplication(parser, 'fn', name, operator, fences);
};
PhysicsMethods.VectorOperator = function (parser, name, operator, ...fences) {
    vectorApplication(parser, 'mml', name, operator, fences);
};
PhysicsMethods.Expression = function (parser, name, opt = true, id = '') {
    id = id || name.slice(1);
    const exp = opt ? parser.GetBrackets(name) : null;
    let mml = parser.create('token', 'mi', { texClass: TEXCLASS.OP }, id);
    if (exp) {
        const sup = new TexParser(exp, parser.stack.env, parser.configuration).mml();
        mml = parser.create('node', 'msup', [mml, sup]);
    }
    parser.Push(parser.itemFactory.create('fn', mml));
    if (parser.GetNext() !== '(') {
        return;
    }
    parser.i++;
    parser.Push(parser.itemFactory.create('auto open')
        .setProperties({ open: '(', close: ')' }));
};
PhysicsMethods.Qqtext = function (parser, name, text) {
    let star = parser.GetStar();
    let arg = text ? text : parser.GetArgument(name);
    let replace = (star ? '' : '\\quad') + '\\text{' + arg + '}\\quad ';
    parser.string = parser.string.slice(0, parser.i) + replace +
        parser.string.slice(parser.i);
};
PhysicsMethods.Differential = function (parser, name, op) {
    const optArg = parser.GetBrackets(name);
    const power = optArg != null ? '^{' + optArg + '}' : ' ';
    const parens = parser.GetNext() === '(';
    const braces = parser.GetNext() === '{';
    let macro = op + power;
    if (!(parens || braces)) {
        macro += parser.GetArgument(name, true) || '';
        let mml = new TexParser(macro, parser.stack.env, parser.configuration).mml();
        parser.Push(mml);
        return;
    }
    if (braces) {
        macro += parser.GetArgument(name);
        const mml = new TexParser(macro, parser.stack.env, parser.configuration).mml();
        parser.Push(parser.create('node', 'TeXAtom', [mml], { texClass: TEXCLASS.OP }));
        return;
    }
    parser.Push(new TexParser(macro, parser.stack.env, parser.configuration).mml());
    parser.i++;
    parser.Push(parser.itemFactory.create('auto open')
        .setProperties({ open: '(', close: ')' }));
};
PhysicsMethods.Derivative = function (parser, name, argMax, op) {
    const star = parser.GetStar();
    const optArg = parser.GetBrackets(name);
    let argCounter = 1;
    const args = [];
    args.push(parser.GetArgument(name));
    while (parser.GetNext() === '{' && argCounter < argMax) {
        args.push(parser.GetArgument(name));
        argCounter++;
    }
    let ignore = false;
    let power1 = ' ';
    let power2 = ' ';
    if (argMax > 2 && args.length > 2) {
        power1 = '^{' + (args.length - 1) + '}';
        ignore = true;
    }
    else if (optArg != null) {
        if (argMax > 2 && args.length > 1) {
            ignore = true;
        }
        power1 = '^{' + optArg + '}';
        power2 = power1;
    }
    const frac = star ? '\\flatfrac' : '\\frac';
    const first = args.length > 1 ? args[0] : '';
    const second = args.length > 1 ? args[1] : args[0];
    let rest = '';
    for (let i = 2, arg; arg = args[i]; i++) {
        rest += op + ' ' + arg;
    }
    const macro = frac + '{' + op + power1 + first + '}' +
        '{' + op + ' ' + second + power2 + ' ' + rest + '}';
    parser.Push(new TexParser(macro, parser.stack.env, parser.configuration).mml());
    if (parser.GetNext() === '(') {
        parser.i++;
        parser.Push(parser.itemFactory.create('auto open')
            .setProperties({ open: '(', close: ')', ignore: ignore }));
    }
};
PhysicsMethods.Bra = function (parser, name) {
    let starBra = parser.GetStar();
    let bra = parser.GetArgument(name);
    let ket = '';
    let hasKet = false;
    let starKet = false;
    if (parser.GetNext() === '\\') {
        let saveI = parser.i;
        parser.i++;
        let cs = parser.GetCS();
        let symbol = parser.lookup('macro', cs);
        if (symbol && symbol.symbol === 'ket') {
            hasKet = true;
            saveI = parser.i;
            starKet = parser.GetStar();
            if (parser.GetNext() === '{') {
                ket = parser.GetArgument(cs, true);
            }
            else {
                parser.i = saveI;
                starKet = false;
            }
        }
        else {
            parser.i = saveI;
        }
    }
    let macro = '';
    if (hasKet) {
        macro = (starBra || starKet) ?
            `\\langle{${bra}}\\vert{${ket}}\\rangle` :
            `\\left\\langle{${bra}}\\middle\\vert{${ket}}\\right\\rangle`;
    }
    else {
        macro = (starBra || starKet) ?
            `\\langle{${bra}}\\vert` : `\\left\\langle{${bra}}\\right\\vert{${ket}}`;
    }
    parser.Push(new TexParser(macro, parser.stack.env, parser.configuration).mml());
};
PhysicsMethods.Ket = function (parser, name) {
    let star = parser.GetStar();
    let ket = parser.GetArgument(name);
    let macro = star ? `\\vert{${ket}}\\rangle` :
        `\\left\\vert{${ket}}\\right\\rangle`;
    parser.Push(new TexParser(macro, parser.stack.env, parser.configuration).mml());
};
PhysicsMethods.BraKet = function (parser, name) {
    let star = parser.GetStar();
    let bra = parser.GetArgument(name);
    let ket = null;
    if (parser.GetNext() === '{') {
        ket = parser.GetArgument(name, true);
    }
    let macro = '';
    if (ket == null) {
        macro = star ?
            `\\langle{${bra}}\\vert{${bra}}\\rangle` :
            `\\left\\langle{${bra}}\\middle\\vert{${bra}}\\right\\rangle`;
    }
    else {
        macro = star ?
            `\\langle{${bra}}\\vert{${ket}}\\rangle` :
            `\\left\\langle{${bra}}\\middle\\vert{${ket}}\\right\\rangle`;
    }
    parser.Push(new TexParser(macro, parser.stack.env, parser.configuration).mml());
};
PhysicsMethods.KetBra = function (parser, name) {
    let star = parser.GetStar();
    let ket = parser.GetArgument(name);
    let bra = null;
    if (parser.GetNext() === '{') {
        bra = parser.GetArgument(name, true);
    }
    let macro = '';
    if (bra == null) {
        macro = star ?
            `\\vert{${ket}}\\rangle\\!\\langle{${ket}}\\vert` :
            `\\left\\vert{${ket}}\\middle\\rangle\\!\\middle\\langle{${ket}}\\right\\vert`;
    }
    else {
        macro = star ?
            `\\vert{${ket}}\\rangle\\!\\langle{${bra}}\\vert` :
            `\\left\\vert{${ket}}\\middle\\rangle\\!\\middle\\langle{${bra}}\\right\\vert`;
    }
    parser.Push(new TexParser(macro, parser.stack.env, parser.configuration).mml());
};
function outputBraket([arg1, arg2, arg3], star1, star2) {
    return (star1 && star2) ?
        `\\left\\langle{${arg1}}\\middle\\vert{${arg2}}\\middle\\vert{${arg3}}\\right\\rangle` :
        (star1 ? `\\langle{${arg1}}\\vert{${arg2}}\\vert{${arg3}}\\rangle` :
            `\\left\\langle{${arg1}}\\right\\vert{${arg2}}\\left\\vert{${arg3}}\\right\\rangle`);
}
PhysicsMethods.Expectation = function (parser, name) {
    let star1 = parser.GetStar();
    let star2 = star1 && parser.GetStar();
    let arg1 = parser.GetArgument(name);
    let arg2 = null;
    if (parser.GetNext() === '{') {
        arg2 = parser.GetArgument(name, true);
    }
    let macro = (arg1 && arg2) ?
        outputBraket([arg2, arg1, arg2], star1, star2) :
        (star1 ? `\\langle {${arg1}} \\rangle` :
            `\\left\\langle {${arg1}} \\right\\rangle`);
    parser.Push(new TexParser(macro, parser.stack.env, parser.configuration).mml());
};
PhysicsMethods.MatrixElement = function (parser, name) {
    const star1 = parser.GetStar();
    const star2 = star1 && parser.GetStar();
    const arg1 = parser.GetArgument(name);
    const arg2 = parser.GetArgument(name);
    const arg3 = parser.GetArgument(name);
    const macro = outputBraket([arg1, arg2, arg3], star1, star2);
    parser.Push(new TexParser(macro, parser.stack.env, parser.configuration).mml());
};
PhysicsMethods.MatrixQuantity = function (parser, name, small) {
    const star = parser.GetStar();
    const next = parser.GetNext();
    const array = small ? 'smallmatrix' : 'array';
    let arg = '';
    let open = '';
    let close = '';
    switch (next) {
        case '{':
            arg = parser.GetArgument(name);
            break;
        case '(':
            parser.i++;
            open = star ? '\\lgroup' : '(';
            close = star ? '\\rgroup' : ')';
            arg = parser.GetUpTo(name, ')');
            break;
        case '[':
            parser.i++;
            open = '[';
            close = ']';
            arg = parser.GetUpTo(name, ']');
            break;
        case '|':
            parser.i++;
            open = '|';
            close = '|';
            arg = parser.GetUpTo(name, '|');
            break;
        default:
            open = '(';
            close = ')';
            break;
    }
    const macro = (open ? '\\left' : '') + open +
        '\\begin{' + array + '}{} ' + arg + '\\end{' + array + '}' +
        (open ? '\\right' : '') + close;
    parser.Push(new TexParser(macro, parser.stack.env, parser.configuration).mml());
};
PhysicsMethods.IdentityMatrix = function (parser, name) {
    const arg = parser.GetArgument(name);
    const size = parseInt(arg, 10);
    if (isNaN(size)) {
        throw new TexError('InvalidNumber', 'Invalid number');
    }
    if (size <= 1) {
        parser.string = '1' + parser.string.slice(parser.i);
        parser.i = 0;
        return;
    }
    let zeros = Array(size).fill('0');
    let columns = [];
    for (let i = 0; i < size; i++) {
        let row = zeros.slice();
        row[i] = '1';
        columns.push(row.join(' & '));
    }
    parser.string = columns.join('\\\\ ') + parser.string.slice(parser.i);
    parser.i = 0;
};
PhysicsMethods.XMatrix = function (parser, name) {
    const star = parser.GetStar();
    const arg1 = parser.GetArgument(name);
    const arg2 = parser.GetArgument(name);
    const arg3 = parser.GetArgument(name);
    let n = parseInt(arg2, 10);
    let m = parseInt(arg3, 10);
    if (isNaN(n) || isNaN(m) || m.toString() !== arg3 || n.toString() !== arg2) {
        throw new TexError('InvalidNumber', 'Invalid number');
    }
    n = n < 1 ? 1 : n;
    m = m < 1 ? 1 : m;
    if (!star) {
        const row = Array(m).fill(arg1).join(' & ');
        const matrix = Array(n).fill(row).join('\\\\ ');
        parser.string = matrix + parser.string.slice(parser.i);
        parser.i = 0;
        return;
    }
    let matrix = '';
    if (n === 1 && m === 1) {
        matrix = arg1;
    }
    else if (n === 1) {
        let row = [];
        for (let i = 1; i <= m; i++) {
            row.push(`${arg1}_{${i}}`);
        }
        matrix = row.join(' & ');
    }
    else if (m === 1) {
        let row = [];
        for (let i = 1; i <= n; i++) {
            row.push(`${arg1}_{${i}}`);
        }
        matrix = row.join('\\\\ ');
    }
    else {
        let rows = [];
        for (let i = 1; i <= n; i++) {
            let row = [];
            for (let j = 1; j <= m; j++) {
                row.push(`${arg1}_{{${i}}{${j}}}`);
            }
            rows.push(row.join(' & '));
        }
        matrix = rows.join('\\\\ ');
    }
    parser.string = matrix + parser.string.slice(parser.i);
    parser.i = 0;
    return;
};
PhysicsMethods.PauliMatrix = function (parser, name) {
    const arg = parser.GetArgument(name);
    let matrix = arg.slice(1);
    switch (arg[0]) {
        case '0':
            matrix += ' 1 & 0\\\\ 0 & 1';
            break;
        case '1':
        case 'x':
            matrix += ' 0 & 1\\\\ 1 & 0';
            break;
        case '2':
        case 'y':
            matrix += ' 0 & -i\\\\ i & 0';
            break;
        case '3':
        case 'z':
            matrix += ' 1 & 0\\\\ 0 & -1';
            break;
        default:
    }
    parser.string = matrix + parser.string.slice(parser.i);
    parser.i = 0;
};
PhysicsMethods.DiagonalMatrix = function (parser, name, anti) {
    if (parser.GetNext() !== '{') {
        return;
    }
    let startI = parser.i;
    parser.GetArgument(name);
    let endI = parser.i;
    parser.i = startI + 1;
    let elements = [];
    let element = '';
    let currentI = parser.i;
    while (currentI < endI) {
        try {
            element = parser.GetUpTo(name, ',');
        }
        catch (e) {
            parser.i = endI;
            elements.push(parser.string.slice(currentI, endI - 1));
            break;
        }
        if (parser.i >= endI) {
            elements.push(parser.string.slice(currentI, endI));
            break;
        }
        currentI = parser.i;
        elements.push(element);
    }
    parser.string = makeDiagMatrix(elements, anti) + parser.string.slice(endI);
    parser.i = 0;
};
function makeDiagMatrix(elements, anti) {
    let length = elements.length;
    let matrix = [];
    for (let i = 0; i < length; i++) {
        matrix.push(Array(anti ? length - i : i + 1).join('&') +
            '\\mqty{' + elements[i] + '}');
    }
    return matrix.join('\\\\ ');
}
PhysicsMethods.AutoClose = function (parser, fence, texclass) {
    let top = parser.stack.Top();
    if (top.isKind('over')) {
        top = parser.stack.Top(2);
    }
    if (!top.isKind('auto open') || !top.closing(fence)) {
        return false;
    }
    const mo = parser.create('token', 'mo', { texClass: texclass }, fence);
    parser.Push(parser.itemFactory.create('close').setProperties({ 'pre-autoclose': true }));
    parser.Push(parser.itemFactory.create('mml', mo).setProperties({ autoclose: true }));
};
PhysicsMethods.Vnabla = function (parser, _name) {
    let argument = parser.options.physics.arrowdel ?
        '\\vec{\\gradientnabla}' : '{\\gradientnabla}';
    return parser.Push(new TexParser(argument, parser.stack.env, parser.configuration).mml());
};
PhysicsMethods.DiffD = function (parser, _name) {
    let argument = parser.options.physics.italicdiff ? 'd' : '{\\rm d}';
    return parser.Push(new TexParser(argument, parser.stack.env, parser.configuration).mml());
};
PhysicsMethods.Macro = BaseMethods.Macro;
PhysicsMethods.NamedFn = BaseMethods.NamedFn;
PhysicsMethods.Array = BaseMethods.Array;
export default PhysicsMethods;
//# sourceMappingURL=PhysicsMethods.js.map