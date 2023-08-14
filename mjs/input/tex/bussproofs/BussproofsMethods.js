import TexError from '../TexError.js';
import TexParser from '../TexParser.js';
import ParseUtil from '../ParseUtil.js';
import * as BussproofsUtil from './BussproofsUtil.js';
let BussproofsMethods = {};
BussproofsMethods.Prooftree = function (parser, begin) {
    parser.Push(begin);
    let newItem = parser.itemFactory.create('proofTree').
        setProperties({ name: begin.getName(),
        line: 'solid', currentLine: 'solid', rootAtTop: false });
    return newItem;
};
BussproofsMethods.Axiom = function (parser, name) {
    let top = parser.stack.Top();
    if (top.kind !== 'proofTree') {
        throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
    }
    let content = paddedContent(parser, parser.GetArgument(name));
    BussproofsUtil.setProperty(content, 'axiom', true);
    top.Push(content);
};
const paddedContent = function (parser, content) {
    let nodes = ParseUtil.internalMath(parser, ParseUtil.trimSpaces(content), 0);
    if (!nodes[0].childNodes[0].childNodes.length) {
        return parser.create('node', 'mrow', []);
    }
    let lpad = parser.create('node', 'mspace', [], { width: '.5ex' });
    let rpad = parser.create('node', 'mspace', [], { width: '.5ex' });
    return parser.create('node', 'mrow', [lpad, ...nodes, rpad]);
};
BussproofsMethods.Inference = function (parser, name, n) {
    let top = parser.stack.Top();
    if (top.kind !== 'proofTree') {
        throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
    }
    if (top.Size() < n) {
        throw new TexError('BadProofTree', 'Proof tree badly specified.');
    }
    const rootAtTop = top.getProperty('rootAtTop');
    const childCount = (n === 1 && !top.Peek()[0].childNodes.length) ? 0 : n;
    let children = [];
    do {
        if (children.length) {
            children.unshift(parser.create('node', 'mtd', [], {}));
        }
        children.unshift(parser.create('node', 'mtd', [top.Pop()], { 'rowalign': (rootAtTop ? 'top' : 'bottom') }));
        n--;
    } while (n > 0);
    let row = parser.create('node', 'mtr', children, {});
    let table = parser.create('node', 'mtable', [row], { framespacing: '0 0' });
    let conclusion = paddedContent(parser, parser.GetArgument(name));
    let style = top.getProperty('currentLine');
    if (style !== top.getProperty('line')) {
        top.setProperty('currentLine', top.getProperty('line'));
    }
    let rule = createRule(parser, table, [conclusion], top.getProperty('left'), top.getProperty('right'), style, rootAtTop);
    top.setProperty('left', null);
    top.setProperty('right', null);
    BussproofsUtil.setProperty(rule, 'inference', childCount);
    parser.configuration.addNode('inference', rule);
    top.Push(rule);
};
function createRule(parser, premise, conclusions, left, right, style, rootAtTop) {
    const upper = parser.create('node', 'mtr', [parser.create('node', 'mtd', [premise], {})], {});
    const lower = parser.create('node', 'mtr', [parser.create('node', 'mtd', conclusions, {})], {});
    let rule = parser.create('node', 'mtable', rootAtTop ? [lower, upper] : [upper, lower], { align: 'top 2', rowlines: style, framespacing: '0 0' });
    BussproofsUtil.setProperty(rule, 'inferenceRule', rootAtTop ? 'up' : 'down');
    let leftLabel, rightLabel;
    if (left) {
        leftLabel = parser.create('node', 'mpadded', [left], { height: '+.5em', width: '+.5em', voffset: '-.15em' });
        BussproofsUtil.setProperty(leftLabel, 'prooflabel', 'left');
    }
    if (right) {
        rightLabel = parser.create('node', 'mpadded', [right], { height: '+.5em', width: '+.5em', voffset: '-.15em' });
        BussproofsUtil.setProperty(rightLabel, 'prooflabel', 'right');
    }
    let children, label;
    if (left && right) {
        children = [leftLabel, rule, rightLabel];
        label = 'both';
    }
    else if (left) {
        children = [leftLabel, rule];
        label = 'left';
    }
    else if (right) {
        children = [rule, rightLabel];
        label = 'right';
    }
    else {
        return rule;
    }
    rule = parser.create('node', 'mrow', children);
    BussproofsUtil.setProperty(rule, 'labelledRule', label);
    return rule;
}
BussproofsMethods.Label = function (parser, name, side) {
    let top = parser.stack.Top();
    if (top.kind !== 'proofTree') {
        throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
    }
    let content = ParseUtil.internalMath(parser, parser.GetArgument(name), 0);
    let label = (content.length > 1) ?
        parser.create('node', 'mrow', content, {}) : content[0];
    top.setProperty(side, label);
};
BussproofsMethods.SetLine = function (parser, _name, style, always) {
    let top = parser.stack.Top();
    if (top.kind !== 'proofTree') {
        throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
    }
    top.setProperty('currentLine', style);
    if (always) {
        top.setProperty('line', style);
    }
};
BussproofsMethods.RootAtTop = function (parser, _name, where) {
    let top = parser.stack.Top();
    if (top.kind !== 'proofTree') {
        throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
    }
    top.setProperty('rootAtTop', where);
};
BussproofsMethods.AxiomF = function (parser, name) {
    let top = parser.stack.Top();
    if (top.kind !== 'proofTree') {
        throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
    }
    let line = parseFCenterLine(parser, name);
    BussproofsUtil.setProperty(line, 'axiom', true);
    top.Push(line);
};
function parseFCenterLine(parser, name) {
    let dollar = parser.GetNext();
    if (dollar !== '$') {
        throw new TexError('IllegalUseOfCommand', 'Use of %1 does not match it\'s definition.', name);
    }
    parser.i++;
    let axiom = parser.GetUpTo(name, '$');
    if (axiom.indexOf('\\fCenter') === -1) {
        throw new TexError('IllegalUseOfCommand', 'Missing \\fCenter in %1.', name);
    }
    let [prem, conc] = axiom.split('\\fCenter');
    let premise = (new TexParser(prem, parser.stack.env, parser.configuration)).mml();
    let conclusion = (new TexParser(conc, parser.stack.env, parser.configuration)).mml();
    let fcenter = (new TexParser('\\fCenter', parser.stack.env, parser.configuration)).mml();
    const left = parser.create('node', 'mtd', [premise], {});
    const middle = parser.create('node', 'mtd', [fcenter], {});
    const right = parser.create('node', 'mtd', [conclusion], {});
    const row = parser.create('node', 'mtr', [left, middle, right], {});
    const table = parser.create('node', 'mtable', [row], { columnspacing: '.5ex', columnalign: 'center 2' });
    BussproofsUtil.setProperty(table, 'sequent', true);
    parser.configuration.addNode('sequent', row);
    return table;
}
BussproofsMethods.FCenter = function (_parser, _name) { };
BussproofsMethods.InferenceF = function (parser, name, n) {
    let top = parser.stack.Top();
    if (top.kind !== 'proofTree') {
        throw new TexError('IllegalProofCommand', 'Proof commands only allowed in prooftree environment.');
    }
    if (top.Size() < n) {
        throw new TexError('BadProofTree', 'Proof tree badly specified.');
    }
    const rootAtTop = top.getProperty('rootAtTop');
    const childCount = (n === 1 && !top.Peek()[0].childNodes.length) ? 0 : n;
    let children = [];
    do {
        if (children.length) {
            children.unshift(parser.create('node', 'mtd', [], {}));
        }
        children.unshift(parser.create('node', 'mtd', [top.Pop()], { 'rowalign': (rootAtTop ? 'top' : 'bottom') }));
        n--;
    } while (n > 0);
    let row = parser.create('node', 'mtr', children, {});
    let table = parser.create('node', 'mtable', [row], { framespacing: '0 0' });
    let conclusion = parseFCenterLine(parser, name);
    let style = top.getProperty('currentLine');
    if (style !== top.getProperty('line')) {
        top.setProperty('currentLine', top.getProperty('line'));
    }
    let rule = createRule(parser, table, [conclusion], top.getProperty('left'), top.getProperty('right'), style, rootAtTop);
    top.setProperty('left', null);
    top.setProperty('right', null);
    BussproofsUtil.setProperty(rule, 'inference', childCount);
    parser.configuration.addNode('inference', rule);
    top.Push(rule);
};
export default BussproofsMethods;
//# sourceMappingURL=BussproofsMethods.js.map