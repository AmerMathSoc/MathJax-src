import { TEXCLASS } from '../../core/MmlTree/MmlNode.js';
import NodeUtil from './NodeUtil.js';
var FilterUtil;
(function (FilterUtil) {
    FilterUtil.cleanStretchy = function (arg) {
        let options = arg.data;
        for (let mo of options.getList('fixStretchy')) {
            if (NodeUtil.getProperty(mo, 'fixStretchy')) {
                let symbol = NodeUtil.getForm(mo);
                if (symbol && symbol[3] && symbol[3]['stretchy']) {
                    NodeUtil.setAttribute(mo, 'stretchy', false);
                }
                const parent = mo.parent;
                if (!NodeUtil.getTexClass(mo) && (!symbol || !symbol[2])) {
                    const texAtom = options.nodeFactory.create('node', 'TeXAtom', [mo]);
                    parent.replaceChild(texAtom, mo);
                    texAtom.inheritAttributesFrom(mo);
                }
                NodeUtil.removeProperties(mo, 'fixStretchy');
            }
        }
    };
    FilterUtil.cleanAttributes = function (arg) {
        let node = arg.data.root;
        node.walkTree((mml, _d) => {
            let attribs = mml.attributes;
            if (!attribs) {
                return;
            }
            const keep = new Set((attribs.get('mjx-keep-attrs') || '').split(/ /));
            delete (attribs.getAllAttributes())['mjx-keep-attrs'];
            for (const key of attribs.getExplicitNames()) {
                if (!keep.has(key) && attribs.attributes[key] === mml.attributes.getInherited(key)) {
                    delete attribs.attributes[key];
                }
            }
        }, {});
    };
    FilterUtil.combineRelations = function (arg) {
        const remove = [];
        for (let mo of arg.data.getList('mo')) {
            if (mo.getProperty('relationsCombined') || !mo.parent ||
                (mo.parent && !NodeUtil.isType(mo.parent, 'mrow')) ||
                NodeUtil.getTexClass(mo) !== TEXCLASS.REL) {
                continue;
            }
            let mml = mo.parent;
            let m2;
            let children = mml.childNodes;
            let next = children.indexOf(mo) + 1;
            let variantForm = NodeUtil.getProperty(mo, 'variantForm');
            while (next < children.length && (m2 = children[next]) &&
                NodeUtil.isType(m2, 'mo') &&
                NodeUtil.getTexClass(m2) === TEXCLASS.REL) {
                if (variantForm === NodeUtil.getProperty(m2, 'variantForm') &&
                    _compareExplicit(mo, m2)) {
                    NodeUtil.appendChildren(mo, NodeUtil.getChildren(m2));
                    _copyExplicit(['stretchy', 'rspace'], mo, m2);
                    for (const name of m2.getPropertyNames()) {
                        mo.setProperty(name, m2.getProperty(name));
                    }
                    children.splice(next, 1);
                    remove.push(m2);
                    m2.parent = null;
                    m2.setProperty('relationsCombined', true);
                }
                else {
                    if (mo.attributes.getExplicit('rspace') == null) {
                        NodeUtil.setAttribute(mo, 'rspace', '0pt');
                    }
                    if (m2.attributes.getExplicit('lspace') == null) {
                        NodeUtil.setAttribute(m2, 'lspace', '0pt');
                    }
                    break;
                }
            }
            mo.attributes.setInherited('form', mo.getForms()[0]);
        }
        arg.data.removeFromList('mo', remove);
    };
    let _copyExplicit = function (attrs, node1, node2) {
        let attr1 = node1.attributes;
        let attr2 = node2.attributes;
        attrs.forEach(x => {
            let attr = attr2.getExplicit(x);
            if (attr != null) {
                attr1.set(x, attr);
            }
        });
    };
    let _compareExplicit = function (node1, node2) {
        let filter = (attr, space) => {
            let exp = attr.getExplicitNames();
            return exp.filter(x => {
                return x !== space &&
                    (x !== 'stretchy' ||
                        attr.getExplicit('stretchy'));
            });
        };
        let attr1 = node1.attributes;
        let attr2 = node2.attributes;
        let exp1 = filter(attr1, 'lspace');
        let exp2 = filter(attr2, 'rspace');
        if (exp1.length !== exp2.length) {
            return false;
        }
        for (let name of exp1) {
            if (attr1.getExplicit(name) !== attr2.getExplicit(name)) {
                return false;
            }
        }
        return true;
    };
    let _cleanSubSup = function (options, low, up) {
        const remove = [];
        for (let mml of options.getList('m' + low + up)) {
            const children = mml.childNodes;
            if (children[mml[low]] && children[mml[up]]) {
                continue;
            }
            const parent = mml.parent;
            let newNode = (children[mml[low]] ?
                options.nodeFactory.create('node', 'm' + low, [children[mml.base], children[mml[low]]]) :
                options.nodeFactory.create('node', 'm' + up, [children[mml.base], children[mml[up]]]));
            NodeUtil.copyAttributes(mml, newNode);
            if (parent) {
                parent.replaceChild(newNode, mml);
            }
            else {
                options.root = newNode;
            }
            remove.push(mml);
        }
        options.removeFromList('m' + low + up, remove);
    };
    FilterUtil.cleanSubSup = function (arg) {
        let options = arg.data;
        if (options.error) {
            return;
        }
        _cleanSubSup(options, 'sub', 'sup');
        _cleanSubSup(options, 'under', 'over');
    };
    let _moveLimits = function (options, underover, subsup) {
        const remove = [];
        for (const mml of options.getList(underover)) {
            if (mml.attributes.get('displaystyle')) {
                continue;
            }
            const base = mml.childNodes[mml.base];
            const mo = base.coreMO();
            if (base.getProperty('movablelimits') && !mo.attributes.getExplicit('movablelimits')) {
                let node = options.nodeFactory.create('node', subsup, mml.childNodes);
                NodeUtil.copyAttributes(mml, node);
                if (mml.parent) {
                    mml.parent.replaceChild(node, mml);
                }
                else {
                    options.root = node;
                }
                remove.push(mml);
            }
        }
        options.removeFromList(underover, remove);
    };
    FilterUtil.moveLimits = function (arg) {
        const options = arg.data;
        _moveLimits(options, 'munderover', 'msubsup');
        _moveLimits(options, 'munder', 'msub');
        _moveLimits(options, 'mover', 'msup');
    };
    FilterUtil.setInherited = function (arg) {
        arg.data.root.setInheritedAttributes({}, arg.math['display'], 0, false);
    };
})(FilterUtil || (FilterUtil = {}));
export default FilterUtil;
//# sourceMappingURL=FilterUtil.js.map