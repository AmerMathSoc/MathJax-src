import NodeUtil from '../NodeUtil.js';
import { UnitUtil } from '../UnitUtil.js';
let doc = null;
let item = null;
const getBBox = function (node) {
    item.root = node;
    const { w: width } = doc.outputJax.getBBox(item, doc);
    return width;
};
const getRule = function (node) {
    let i = 0;
    while (node && !NodeUtil.isType(node, 'mtable')) {
        if (NodeUtil.isType(node, 'text')) {
            return null;
        }
        if (NodeUtil.isType(node, 'mrow')) {
            node = node.childNodes[0];
            i = 0;
            continue;
        }
        node = node.parent.childNodes[i];
        i++;
    }
    return node;
};
const getPremises = function (rule, direction) {
    return rule.childNodes[direction === 'up' ? 1 : 0].childNodes[0].childNodes[0]
        .childNodes[0].childNodes[0];
};
const getPremise = function (premises, n) {
    return premises.childNodes[n].childNodes[0].childNodes[0];
};
const firstPremise = function (premises) {
    return getPremise(premises, 0);
};
const lastPremise = function (premises) {
    return getPremise(premises, premises.childNodes.length - 1);
};
const getConclusion = function (rule, direction) {
    return rule.childNodes[direction === 'up' ? 0 : 1].childNodes[0].childNodes[0]
        .childNodes[0];
};
const getColumn = function (inf) {
    while (inf && !NodeUtil.isType(inf, 'mtd')) {
        inf = inf.parent;
    }
    return inf;
};
const nextSibling = function (inf) {
    return inf.parent.childNodes[inf.parent.childNodes.indexOf(inf) + 1];
};
const _previousSibling = function (inf) {
    return inf.parent.childNodes[inf.parent.childNodes.indexOf(inf) - 1];
};
const getParentInf = function (inf) {
    while (inf && getProperty(inf, 'inference') == null) {
        inf = inf.parent;
    }
    return inf;
};
const getSpaces = function (inf, rule, right = false) {
    let result = 0;
    if (inf === rule) {
        return result;
    }
    if (inf !== rule.parent) {
        const children = inf.childNodes;
        const index = right ? children.length - 1 : 0;
        if (NodeUtil.isType(children[index], 'mspace')) {
            result += getBBox(children[index]);
        }
        inf = rule.parent;
    }
    if (inf === rule) {
        return result;
    }
    const children = inf.childNodes;
    const index = right ? children.length - 1 : 0;
    if (children[index] !== rule) {
        result += getBBox(children[index]);
    }
    return result;
};
const adjustValue = function (inf, right = false) {
    const rule = getRule(inf);
    const conc = getConclusion(rule, getProperty(rule, 'inferenceRule'));
    const w = getSpaces(inf, rule, right);
    const x = getBBox(rule);
    const y = getBBox(conc);
    return w + (x - y) / 2;
};
const addSpace = function (config, inf, space, right = false) {
    if (space === 0)
        return;
    if (getProperty(inf, 'inferenceRule') || getProperty(inf, 'labelledRule')) {
        const mrow = config.nodeFactory.create('node', 'mrow');
        inf.parent.replaceChild(mrow, inf);
        mrow.setChildren([inf]);
        moveProperties(inf, mrow);
        inf = mrow;
    }
    const index = right ? inf.childNodes.length - 1 : 0;
    let mspace = inf.childNodes[index];
    if (NodeUtil.isType(mspace, 'mspace')) {
        NodeUtil.setAttribute(mspace, 'width', UnitUtil.em(UnitUtil.dimen2em(NodeUtil.getAttribute(mspace, 'width')) +
            space));
        return;
    }
    mspace = config.nodeFactory.create('node', 'mspace', [], {
        width: UnitUtil.em(space),
    });
    if (right) {
        inf.appendChild(mspace);
        return;
    }
    mspace.parent = inf;
    inf.childNodes.unshift(mspace);
};
const moveProperties = function (src, dest) {
    const props = ['inference', 'proof', 'labelledRule'];
    props.forEach((x) => {
        const value = getProperty(src, x);
        if (value != null) {
            setProperty(dest, x, value);
            removeProperty(src, x);
        }
    });
};
const adjustSequents = function (config) {
    const sequents = config.nodeLists['sequent'];
    if (!sequents) {
        return;
    }
    for (let i = sequents.length - 1, seq; (seq = sequents[i]); i--) {
        if (getProperty(seq, 'sequentProcessed')) {
            removeProperty(seq, 'sequentProcessed');
            continue;
        }
        const collect = [];
        let inf = getParentInf(seq);
        if (getProperty(inf, 'inference') !== 1) {
            continue;
        }
        collect.push(seq);
        while (getProperty(inf, 'inference') === 1) {
            inf = getRule(inf);
            const premise = firstPremise(getPremises(inf, getProperty(inf, 'inferenceRule')));
            const sequent = getProperty(premise, 'inferenceRule')
                ?
                    getConclusion(premise, getProperty(premise, 'inferenceRule'))
                :
                    premise;
            if (getProperty(sequent, 'sequent')) {
                seq = sequent.childNodes[0];
                collect.push(seq);
                setProperty(seq, 'sequentProcessed', true);
            }
            inf = premise;
        }
        adjustSequentPairwise(config, collect);
    }
};
const addSequentSpace = function (config, sequent, position, direction, width) {
    const mspace = config.nodeFactory.create('node', 'mspace', [], {
        width: UnitUtil.em(width),
    });
    if (direction === 'left') {
        const row = sequent.childNodes[position].childNodes[0];
        mspace.parent = row;
        row.childNodes.unshift(mspace);
    }
    else {
        sequent.childNodes[position].appendChild(mspace);
    }
    setProperty(sequent.parent, 'sequentAdjust_' + direction, width);
};
const adjustSequentPairwise = function (config, sequents) {
    let top = sequents.pop();
    while (sequents.length) {
        const bottom = sequents.pop();
        const [left, right] = compareSequents(top, bottom);
        if (getProperty(top.parent, 'axiom')) {
            addSequentSpace(config, left < 0 ? top : bottom, 0, 'left', Math.abs(left));
            addSequentSpace(config, right < 0 ? top : bottom, 2, 'right', Math.abs(right));
        }
        top = bottom;
    }
};
const compareSequents = function (top, bottom) {
    const tr = getBBox(top.childNodes[2]);
    const br = getBBox(bottom.childNodes[2]);
    const tl = getBBox(top.childNodes[0]);
    const bl = getBBox(bottom.childNodes[0]);
    const dl = tl - bl;
    const dr = tr - br;
    return [dl, dr];
};
export const balanceRules = function (arg) {
    item = new arg.document.options.MathItem('', null, arg.math.display);
    const config = arg.data;
    adjustSequents(config);
    const inferences = config.nodeLists['inference'] || [];
    let maxAdjust = 0;
    for (const inf of inferences) {
        const isProof = getProperty(inf, 'proof');
        const rule = getRule(inf);
        const premises = getPremises(rule, getProperty(rule, 'inferenceRule'));
        const premiseF = firstPremise(premises);
        let leftAdjust = 0;
        if (getProperty(premiseF, 'inference')) {
            const adjust = adjustValue(premiseF);
            if (adjust) {
                addSpace(config, premiseF, -adjust);
                const w = getSpaces(inf, rule, false);
                addSpace(config, inf, adjust - w);
                leftAdjust = adjust - w;
            }
        }
        const premiseL = lastPremise(premises);
        if (getProperty(premiseL, 'inference') == null) {
            continue;
        }
        const adjust = adjustValue(premiseL, true);
        addSpace(config, premiseL, -adjust, true);
        const w = getSpaces(inf, rule, true);
        const delta = (getBBox(rule) - getBBox(premises.parent)) / 2;
        addSpace(config, inf, delta < leftAdjust ? -delta : -leftAdjust);
        maxAdjust = Math.max(0, Math.max(0, maxAdjust + adjust - w) - delta);
        let column;
        if (isProof || !(column = getColumn(inf))) {
            addSpace(config, getProperty(inf, 'proof') ? inf : inf.parent, maxAdjust, true);
            continue;
        }
        const sibling = nextSibling(column);
        if (sibling) {
            const pos = config.nodeFactory.create('node', 'mspace', [], {
                width: UnitUtil.em(maxAdjust),
            });
            sibling.appendChild(pos);
            maxAdjust = 0;
            continue;
        }
        if (!getParentInf(column)) {
            continue;
        }
    }
};
const property_prefix = 'bspr_';
const prefix_pattern = RegExp('^' + property_prefix);
export const setProperty = function (node, property, value) {
    NodeUtil.setProperty(node, property_prefix + property, value);
};
export const getProperty = function (node, property) {
    return NodeUtil.getProperty(node, property_prefix + property);
};
export const removeProperty = function (node, property) {
    node.removeProperty(property_prefix + property);
};
export const makeBsprAttributes = function (arg) {
    arg.data.root.walkTree((mml, _data) => {
        const attr = [];
        mml.getPropertyNames().forEach((x) => {
            if (x.match(prefix_pattern)) {
                attr.push(x + ':' + mml.getProperty(x));
            }
        });
        if (attr.length) {
            NodeUtil.setAttribute(mml, 'semantics', attr.join(';'));
        }
    });
};
export const saveDocument = function (arg) {
    doc = arg.document;
    if (!('getBBox' in doc.outputJax)) {
        throw Error('The bussproofs extension requires an output jax with a getBBox() method');
    }
};
export const clearDocument = function (_arg) {
    doc = null;
};
//# sourceMappingURL=BussproofsUtil.js.map