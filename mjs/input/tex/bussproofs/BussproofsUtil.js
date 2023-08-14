import NodeUtil from '../NodeUtil.js';
import ParseUtil from '../ParseUtil.js';
let doc = null;
let item = null;
let getBBox = function (node) {
    item.root = node;
    let { w: width } = doc.outputJax.getBBox(item, doc);
    return width;
};
let getRule = function (node) {
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
let getPremises = function (rule, direction) {
    return rule.childNodes[direction === 'up' ? 1 : 0].childNodes[0].
        childNodes[0].childNodes[0].childNodes[0];
};
let getPremise = function (premises, n) {
    return premises.childNodes[n].childNodes[0].childNodes[0];
};
let firstPremise = function (premises) {
    return getPremise(premises, 0);
};
let lastPremise = function (premises) {
    return getPremise(premises, premises.childNodes.length - 1);
};
let getConclusion = function (rule, direction) {
    return rule.childNodes[direction === 'up' ? 0 : 1].childNodes[0].childNodes[0].childNodes[0];
};
let getColumn = function (inf) {
    while (inf && !NodeUtil.isType(inf, 'mtd')) {
        inf = inf.parent;
    }
    return inf;
};
let nextSibling = function (inf) {
    return inf.parent.childNodes[inf.parent.childNodes.indexOf(inf) + 1];
};
let previousSibling = function (inf) {
    return inf.parent.childNodes[inf.parent.childNodes.indexOf(inf) - 1];
};
let getParentInf = function (inf) {
    while (inf && getProperty(inf, 'inference') == null) {
        inf = inf.parent;
    }
    return inf;
};
let getSpaces = function (inf, rule, right = false) {
    let result = 0;
    if (inf === rule) {
        return result;
    }
    if (inf !== rule.parent) {
        let children = inf.childNodes;
        let index = right ? children.length - 1 : 0;
        if (NodeUtil.isType(children[index], 'mspace')) {
            result += getBBox(children[index]);
        }
        inf = rule.parent;
    }
    if (inf === rule) {
        return result;
    }
    let children = inf.childNodes;
    let index = right ? children.length - 1 : 0;
    if (children[index] !== rule) {
        result += getBBox(children[index]);
    }
    return result;
};
let adjustValue = function (inf, right = false) {
    let rule = getRule(inf);
    let conc = getConclusion(rule, getProperty(rule, 'inferenceRule'));
    let w = getSpaces(inf, rule, right);
    let x = getBBox(rule);
    let y = getBBox(conc);
    return w + ((x - y) / 2);
};
let addSpace = function (config, inf, space, right = false) {
    if (getProperty(inf, 'inferenceRule') ||
        getProperty(inf, 'labelledRule')) {
        const mrow = config.nodeFactory.create('node', 'mrow');
        inf.parent.replaceChild(mrow, inf);
        mrow.setChildren([inf]);
        moveProperties(inf, mrow);
        inf = mrow;
    }
    const index = right ? inf.childNodes.length - 1 : 0;
    let mspace = inf.childNodes[index];
    if (NodeUtil.isType(mspace, 'mspace')) {
        NodeUtil.setAttribute(mspace, 'width', ParseUtil.Em(ParseUtil.dimen2em(NodeUtil.getAttribute(mspace, 'width')) + space));
        return;
    }
    mspace = config.nodeFactory.create('node', 'mspace', [], { width: ParseUtil.Em(space) });
    if (right) {
        inf.appendChild(mspace);
        return;
    }
    mspace.parent = inf;
    inf.childNodes.unshift(mspace);
};
let moveProperties = function (src, dest) {
    let props = ['inference', 'proof', 'maxAdjust', 'labelledRule'];
    props.forEach(x => {
        let value = getProperty(src, x);
        if (value != null) {
            setProperty(dest, x, value);
            removeProperty(src, x);
        }
    });
};
let adjustSequents = function (config) {
    let sequents = config.nodeLists['sequent'];
    if (!sequents) {
        return;
    }
    for (let i = sequents.length - 1, seq; seq = sequents[i]; i--) {
        if (getProperty(seq, 'sequentProcessed')) {
            removeProperty(seq, 'sequentProcessed');
            continue;
        }
        let collect = [];
        let inf = getParentInf(seq);
        if (getProperty(inf, 'inference') !== 1) {
            continue;
        }
        collect.push(seq);
        while (getProperty(inf, 'inference') === 1) {
            inf = getRule(inf);
            let premise = firstPremise(getPremises(inf, getProperty(inf, 'inferenceRule')));
            let sequent = (getProperty(premise, 'inferenceRule')) ?
                getConclusion(premise, getProperty(premise, 'inferenceRule')) :
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
    let mspace = config.nodeFactory.create('node', 'mspace', [], { width: ParseUtil.Em(width) });
    if (direction === 'left') {
        let row = sequent.childNodes[position].childNodes[0];
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
        let bottom = sequents.pop();
        let [left, right] = compareSequents(top, bottom);
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
export let balanceRules = function (arg) {
    item = new arg.document.options.MathItem('', null, arg.math.display);
    let config = arg.data;
    adjustSequents(config);
    let inferences = config.nodeLists['inference'] || [];
    for (let inf of inferences) {
        let isProof = getProperty(inf, 'proof');
        let rule = getRule(inf);
        let premises = getPremises(rule, getProperty(rule, 'inferenceRule'));
        let premiseF = firstPremise(premises);
        if (getProperty(premiseF, 'inference')) {
            let adjust = adjustValue(premiseF);
            if (adjust) {
                addSpace(config, premiseF, -adjust);
                let w = getSpaces(inf, rule, false);
                addSpace(config, inf, adjust - w);
            }
        }
        let premiseL = lastPremise(premises);
        if (getProperty(premiseL, 'inference') == null) {
            continue;
        }
        let adjust = adjustValue(premiseL, true);
        addSpace(config, premiseL, -adjust, true);
        let w = getSpaces(inf, rule, true);
        let maxAdjust = getProperty(inf, 'maxAdjust');
        if (maxAdjust != null) {
            adjust = Math.max(adjust, maxAdjust);
        }
        let column;
        if (isProof || !(column = getColumn(inf))) {
            addSpace(config, getProperty(inf, 'proof') ? inf : inf.parent, adjust - w, true);
            continue;
        }
        let sibling = nextSibling(column);
        if (sibling) {
            const pos = config.nodeFactory.create('node', 'mspace', [], { width: adjust - w + 'em' });
            sibling.appendChild(pos);
            inf.removeProperty('maxAdjust');
            continue;
        }
        let parentRule = getParentInf(column);
        if (!parentRule) {
            continue;
        }
        adjust = getProperty(parentRule, 'maxAdjust') ?
            Math.max(getProperty(parentRule, 'maxAdjust'), adjust) : adjust;
        setProperty(parentRule, 'maxAdjust', adjust);
    }
};
let property_prefix = 'bspr_';
let blacklistedProperties = {
    [property_prefix + 'maxAdjust']: true
};
export let setProperty = function (node, property, value) {
    NodeUtil.setProperty(node, property_prefix + property, value);
};
export let getProperty = function (node, property) {
    return NodeUtil.getProperty(node, property_prefix + property);
};
export let removeProperty = function (node, property) {
    node.removeProperty(property_prefix + property);
};
export let makeBsprAttributes = function (arg) {
    arg.data.root.walkTree((mml, _data) => {
        let attr = [];
        mml.getPropertyNames().forEach(x => {
            if (!blacklistedProperties[x] && x.match(RegExp('^' + property_prefix))) {
                attr.push(x + ':' + mml.getProperty(x));
            }
        });
        if (attr.length) {
            NodeUtil.setAttribute(mml, 'semantics', attr.join(';'));
        }
    });
};
export let saveDocument = function (arg) {
    doc = arg.document;
    if (!('getBBox' in doc.outputJax)) {
        throw Error('The bussproofs extension requires an output jax with a getBBox() method');
    }
};
export let clearDocument = function (_arg) {
    doc = null;
};
//# sourceMappingURL=BussproofsUtil.js.map