import { TEXCLASS } from '../../core/MmlTree/MmlNode.js';
import NodeUtil from './NodeUtil.js';
function _copyExplicit(attrs, node1, node2) {
    const attr1 = node1.attributes;
    const attr2 = node2.attributes;
    attrs.forEach((x) => {
        const attr = attr2.getExplicit(x);
        if (attr != null) {
            attr1.set(x, attr);
        }
    });
}
function _compareExplicit(node1, node2) {
    const filter = (attr, space) => {
        const exp = attr.getExplicitNames();
        return exp.filter((x) => {
            return (x !== space &&
                (x !== 'stretchy' || attr.getExplicit('stretchy')) &&
                x !== 'data-latex' &&
                x !== 'data-latex-item');
        });
    };
    const attr1 = node1.attributes;
    const attr2 = node2.attributes;
    const exp1 = filter(attr1, 'lspace');
    const exp2 = filter(attr2, 'rspace');
    if (exp1.length !== exp2.length) {
        return false;
    }
    for (const name of exp1) {
        if (attr1.getExplicit(name) !== attr2.getExplicit(name)) {
            return false;
        }
    }
    return true;
}
function _cleanSubSup(options, low, up) {
    const remove = [];
    for (const mml of options.getList('m' + low + up)) {
        const children = mml.childNodes;
        if (children[mml[low]] && children[mml[up]]) {
            continue;
        }
        const parent = mml.parent;
        const newNode = children[mml[low]]
            ? options.nodeFactory.create('node', 'm' + low, [
                children[mml.base],
                children[mml[low]],
            ])
            : options.nodeFactory.create('node', 'm' + up, [
                children[mml.base],
                children[mml[up]],
            ]);
        NodeUtil.copyAttributes(mml, newNode);
        parent.replaceChild(newNode, mml);
        remove.push(mml);
    }
    options.removeFromList('m' + low + up, remove);
}
function _moveLimits(options, underover, subsup) {
    const remove = [];
    for (const mml of options.getList(underover)) {
        if (mml.attributes.get('displaystyle')) {
            continue;
        }
        const base = mml.childNodes[mml.base];
        const mo = base.coreMO();
        if (base.getProperty('movablelimits') &&
            !mo.attributes.hasExplicit('movablelimits')) {
            const node = options.nodeFactory.create('node', subsup, mml.childNodes);
            NodeUtil.copyAttributes(mml, node);
            mml.parent.replaceChild(node, mml);
            remove.push(mml);
        }
    }
    options.removeFromList(underover, remove);
}
const FilterUtil = {
    cleanStretchy(arg) {
        const options = arg.data;
        for (const mo of options.getList('fixStretchy')) {
            if (NodeUtil.getProperty(mo, 'fixStretchy')) {
                const symbol = NodeUtil.getForm(mo);
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
    },
    cleanAttributes(arg) {
        const node = arg.data.root;
        node.walkTree((mml, _d) => {
            const attribs = mml.attributes;
            const keep = new Set((attribs.get('mjx-keep-attrs') || '').split(/ /));
            attribs.unset('mjx-keep-attrs');
            for (const key of attribs.getExplicitNames()) {
                if (!keep.has(key) &&
                    attribs.get(key) === mml.attributes.getInherited(key)) {
                    attribs.unset(key);
                }
            }
        }, {});
    },
    combineRelations(arg) {
        const remove = [];
        for (const mo of arg.data.getList('mo')) {
            if (mo.getProperty('relationsCombined') ||
                !mo.parent ||
                (mo.parent && !NodeUtil.isType(mo.parent, 'mrow')) ||
                NodeUtil.getTexClass(mo) !== TEXCLASS.REL) {
                continue;
            }
            const mml = mo.parent;
            let m2;
            const children = mml.childNodes;
            const next = children.indexOf(mo) + 1;
            const variantForm = NodeUtil.getProperty(mo, 'variantForm');
            while (next < children.length &&
                (m2 = children[next]) &&
                NodeUtil.isType(m2, 'mo') &&
                NodeUtil.getTexClass(m2) === TEXCLASS.REL) {
                if (variantForm === NodeUtil.getProperty(m2, 'variantForm') &&
                    _compareExplicit(mo, m2)) {
                    NodeUtil.appendChildren(mo, NodeUtil.getChildren(m2));
                    _copyExplicit(['stretchy', 'rspace'], mo, m2);
                    for (const name of m2.getPropertyNames()) {
                        mo.setProperty(name, m2.getProperty(name));
                    }
                    if (m2.attributes.get('data-latex')) {
                        mo.attributes.set('data-latex', mo.attributes.get('data-latex') +
                            m2.attributes.get('data-latex'));
                    }
                    children.splice(next, 1);
                    remove.push(m2);
                    m2.parent = null;
                    m2.setProperty('relationsCombined', true);
                    mo.setProperty('texClass', TEXCLASS.REL);
                }
                else {
                    if (!mo.attributes.hasExplicit('rspace')) {
                        NodeUtil.setAttribute(mo, 'rspace', '0pt');
                    }
                    if (!m2.attributes.hasExplicit('lspace')) {
                        NodeUtil.setAttribute(m2, 'lspace', '0pt');
                    }
                    break;
                }
            }
            mo.attributes.setInherited('form', mo.getForms()[0]);
        }
        arg.data.removeFromList('mo', remove);
    },
    cleanSubSup(arg) {
        const options = arg.data;
        if (options.error) {
            return;
        }
        _cleanSubSup(options, 'sub', 'sup');
        _cleanSubSup(options, 'under', 'over');
    },
    moveLimits(arg) {
        const options = arg.data;
        _moveLimits(options, 'munderover', 'msubsup');
        _moveLimits(options, 'munder', 'msub');
        _moveLimits(options, 'mover', 'msup');
    },
    setInherited(arg) {
        arg.data.root.setInheritedAttributes({}, arg.math['display'], 0, false);
    },
    checkScriptlevel(arg) {
        const options = arg.data;
        const remove = [];
        for (const mml of options.getList('mstyle')) {
            if (mml.childNodes[0].childNodes.length !== 1) {
                continue;
            }
            const attributes = mml.attributes;
            for (const key of ['displaystyle', 'scriptlevel']) {
                if (attributes.getExplicit(key) === attributes.getInherited(key)) {
                    attributes.unset(key);
                }
            }
            const names = attributes.getExplicitNames();
            if (names.filter((key) => key.substring(0, 10) !== 'data-latex').length ===
                0) {
                const child = mml.childNodes[0].childNodes[0];
                names.forEach((key) => child.attributes.set(key, attributes.get(key)));
                mml.parent.replaceChild(child, mml);
                remove.push(mml);
            }
        }
        options.removeFromList('mstyle', remove);
    },
};
export default FilterUtil;
//# sourceMappingURL=FilterUtil.js.map