import { Attributes, INHERIT } from './Attributes.js';
import { AbstractNode, AbstractEmptyNode } from '../Tree/Node.js';
export const TEXCLASS = {
    ORD: 0,
    OP: 1,
    BIN: 2,
    REL: 3,
    OPEN: 4,
    CLOSE: 5,
    PUNCT: 6,
    INNER: 7,
    NONE: -1
};
export const TEXCLASSNAMES = ['ORD', 'OP', 'BIN', 'REL', 'OPEN', 'CLOSE', 'PUNCT', 'INNER'];
const TEXSPACELENGTH = ['', 'thinmathspace', 'mediummathspace', 'thickmathspace'];
const TEXSPACE = [
    [0, -1, 2, 3, 0, 0, 0, 1],
    [-1, -1, 0, 3, 0, 0, 0, 1],
    [2, 2, 0, 0, 2, 0, 0, 2],
    [3, 3, 0, 0, 3, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, -1, 2, 3, 0, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 1, 1],
    [1, -1, 2, 3, 1, 0, 1, 1]
];
export const MATHVARIANTS = new Set([
    'normal', 'bold', 'italic', 'bold-italic',
    'double-struck', 'fraktur', 'bold-fraktur', 'script', 'bold-script',
    'sans-serif', 'bold-sans-serif', 'sans-serif-italic', 'sans-serif-bold-italic',
    'monospace',
    'inital', 'tailed', 'looped', 'stretched'
]);
export const indentAttributes = [
    'indentalign', 'indentalignfirst',
    'indentshift', 'indentshiftfirst'
];
export class AbstractMmlNode extends AbstractNode {
    constructor(factory, attributes = {}, children = []) {
        super(factory);
        this.prevClass = null;
        this.prevLevel = null;
        this.texclass = null;
        if (this.arity < 0) {
            this.childNodes = [factory.create('inferredMrow')];
            this.childNodes[0].parent = this;
        }
        this.setChildren(children);
        this.attributes = new Attributes(factory.getNodeClass(this.kind).defaults, factory.getNodeClass('math').defaults);
        this.attributes.setList(attributes);
    }
    copy(keepIds = false) {
        const node = this.factory.create(this.kind);
        node.properties = Object.assign({}, this.properties);
        if (this.attributes) {
            const attributes = this.attributes.getAllAttributes();
            for (const name of Object.keys(attributes)) {
                if (name !== 'id' || keepIds) {
                    node.attributes.set(name, attributes[name]);
                }
            }
        }
        if (this.childNodes && this.childNodes.length) {
            let children = this.childNodes;
            if (children.length === 1 && children[0].isInferred) {
                children = children[0].childNodes;
            }
            for (const child of children) {
                if (child) {
                    node.appendChild(child.copy());
                }
                else {
                    node.childNodes.push(null);
                }
            }
        }
        return node;
    }
    get texClass() {
        return this.texclass;
    }
    set texClass(texClass) {
        this.texclass = texClass;
    }
    get isToken() {
        return false;
    }
    get isEmbellished() {
        return false;
    }
    get isSpacelike() {
        return false;
    }
    get linebreakContainer() {
        return false;
    }
    get linebreakAlign() {
        return 'data-align';
    }
    get arity() {
        return Infinity;
    }
    get isInferred() {
        return false;
    }
    get Parent() {
        let parent = this.parent;
        while (parent && parent.notParent) {
            parent = parent.Parent;
        }
        return parent;
    }
    get notParent() {
        return false;
    }
    setChildren(children) {
        if (this.arity < 0) {
            return this.childNodes[0].setChildren(children);
        }
        return super.setChildren(children);
    }
    appendChild(child) {
        if (this.arity < 0) {
            this.childNodes[0].appendChild(child);
            return child;
        }
        if (child.isInferred) {
            if (this.arity === Infinity) {
                child.childNodes.forEach((node) => super.appendChild(node));
                return child;
            }
            const original = child;
            child = this.factory.create('mrow');
            child.setChildren(original.childNodes);
            child.attributes = original.attributes;
            for (const name of original.getPropertyNames()) {
                child.setProperty(name, original.getProperty(name));
            }
        }
        return super.appendChild(child);
    }
    replaceChild(newChild, oldChild) {
        if (this.arity < 0) {
            this.childNodes[0].replaceChild(newChild, oldChild);
            return newChild;
        }
        return super.replaceChild(newChild, oldChild);
    }
    core() {
        return this;
    }
    coreMO() {
        return this;
    }
    coreIndex() {
        return 0;
    }
    childPosition() {
        let child = this;
        let parent = child.parent;
        while (parent && parent.notParent) {
            child = parent;
            parent = parent.parent;
        }
        if (parent) {
            let i = 0;
            for (const node of parent.childNodes) {
                if (node === child) {
                    return i;
                }
                i++;
            }
        }
        return null;
    }
    setTeXclass(prev) {
        this.getPrevClass(prev);
        return (this.texClass != null ? this : prev);
    }
    updateTeXclass(core) {
        if (core) {
            this.prevClass = core.prevClass;
            this.prevLevel = core.prevLevel;
            core.prevClass = core.prevLevel = null;
            this.texClass = core.texClass;
        }
    }
    getPrevClass(prev) {
        if (prev) {
            this.prevClass = prev.texClass;
            this.prevLevel = prev.attributes.get('scriptlevel');
        }
    }
    texSpacing() {
        let prevClass = (this.prevClass != null ? this.prevClass : TEXCLASS.NONE);
        let texClass = this.texClass || TEXCLASS.ORD;
        if (prevClass === TEXCLASS.NONE || texClass === TEXCLASS.NONE) {
            return '';
        }
        let space = TEXSPACE[prevClass][texClass];
        if ((this.prevLevel > 0 || this.attributes.get('scriptlevel') > 0) && space >= 0) {
            return '';
        }
        return TEXSPACELENGTH[Math.abs(space)];
    }
    hasSpacingAttributes() {
        return this.isEmbellished && this.coreMO().hasSpacingAttributes();
    }
    setInheritedAttributes(attributes = {}, display = false, level = 0, prime = false) {
        var _a, _b, _c;
        let defaults = this.attributes.getAllDefaults();
        for (const key of Object.keys(attributes)) {
            if (defaults.hasOwnProperty(key) || AbstractMmlNode.alwaysInherit.hasOwnProperty(key)) {
                let [node, value] = attributes[key];
                !((_b = (_a = AbstractMmlNode.noInherit[node]) === null || _a === void 0 ? void 0 : _a[this.kind]) === null || _b === void 0 ? void 0 : _b[key]) && this.attributes.setInherited(key, value);
            }
            if ((_c = AbstractMmlNode.stopInherit[this.kind]) === null || _c === void 0 ? void 0 : _c[key]) {
                attributes = Object.assign({}, attributes);
                delete attributes[key];
            }
        }
        let displaystyle = this.attributes.getExplicit('displaystyle');
        if (displaystyle === undefined) {
            this.attributes.setInherited('displaystyle', display);
        }
        let scriptlevel = this.attributes.getExplicit('scriptlevel');
        if (scriptlevel === undefined) {
            this.attributes.setInherited('scriptlevel', level);
        }
        if (prime) {
            this.setProperty('texprimestyle', prime);
        }
        let arity = this.arity;
        if (arity >= 0 && arity !== Infinity && ((arity === 1 && this.childNodes.length === 0) ||
            (arity !== 1 && this.childNodes.length !== arity))) {
            if (arity < this.childNodes.length) {
                this.childNodes = this.childNodes.slice(0, arity);
            }
            else {
                while (this.childNodes.length < arity) {
                    this.appendChild(this.factory.create('mrow'));
                }
            }
        }
        if (this.linebreakContainer && !this.isEmbellished) {
            const align = this.linebreakAlign;
            if (align) {
                const indentalign = this.attributes.get(align) || 'left';
                attributes = this.addInheritedAttributes(attributes, {
                    indentalign, indentshift: '0',
                    indentalignfirst: indentalign, indentshiftfirst: '0',
                    indentalignlast: 'indentalign', indentshiftlast: 'indentshift'
                });
            }
        }
        this.setChildInheritedAttributes(attributes, display, level, prime);
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        for (const child of this.childNodes) {
            child.setInheritedAttributes(attributes, display, level, prime);
        }
    }
    addInheritedAttributes(current, attributes) {
        let updated = Object.assign({}, current);
        for (const name of Object.keys(attributes)) {
            if (name !== 'displaystyle' && name !== 'scriptlevel' && name !== 'style') {
                updated[name] = [this.kind, attributes[name]];
            }
        }
        return updated;
    }
    inheritAttributesFrom(node) {
        const attributes = node.attributes;
        const display = attributes.get('displaystyle');
        const scriptlevel = attributes.get('scriptlevel');
        const defaults = (!attributes.isSet('mathsize') ? {} : {
            mathsize: ['math', attributes.get('mathsize')]
        });
        const prime = node.getProperty('texprimestyle') || false;
        this.setInheritedAttributes(defaults, display, scriptlevel, prime);
    }
    verifyTree(options = null) {
        if (options === null) {
            return;
        }
        this.verifyAttributes(options);
        let arity = this.arity;
        if (options['checkArity']) {
            if (arity >= 0 && arity !== Infinity &&
                ((arity === 1 && this.childNodes.length === 0) ||
                    (arity !== 1 && this.childNodes.length !== arity))) {
                this.mError('Wrong number of children for "' + this.kind + '" node', options, true);
            }
        }
        this.verifyChildren(options);
    }
    verifyAttributes(options) {
        if (options.checkAttributes) {
            const attributes = this.attributes;
            const bad = [];
            for (const name of attributes.getExplicitNames()) {
                if (name.substr(0, 5) !== 'data-' && attributes.getDefault(name) === undefined &&
                    !name.match(/^(?:class|style|id|(?:xlink:)?href)$/)) {
                    bad.push(name);
                }
            }
            if (bad.length) {
                this.mError('Unknown attributes for ' + this.kind + ' node: ' + bad.join(', '), options);
            }
        }
        if (options.checkMathvariants) {
            const variant = this.attributes.getExplicit('mathvariant');
            if (variant && !MATHVARIANTS.has(variant) && !this.getProperty('ignore-variant')) {
                this.mError(`Invalid mathvariant: ${variant}`, options, true);
            }
        }
    }
    verifyChildren(options) {
        for (const child of this.childNodes) {
            child.verifyTree(options);
        }
    }
    mError(message, options, short = false) {
        if (this.parent && this.parent.isKind('merror')) {
            return null;
        }
        let merror = this.factory.create('merror');
        merror.attributes.set('data-mjx-message', message);
        if (options.fullErrors || short) {
            let mtext = this.factory.create('mtext');
            let text = this.factory.create('text');
            text.setText(options.fullErrors ? message : this.kind);
            mtext.appendChild(text);
            merror.appendChild(mtext);
            this.parent.replaceChild(merror, this);
            if (!options.fullErrors) {
                merror.attributes.set('title', message);
            }
        }
        else {
            this.parent.replaceChild(merror, this);
            merror.appendChild(this);
        }
        return merror;
    }
}
AbstractMmlNode.defaults = {
    mathbackground: INHERIT,
    mathcolor: INHERIT,
    mathsize: INHERIT,
    dir: INHERIT
};
AbstractMmlNode.noInherit = {
    mstyle: {
        mpadded: { width: true, height: true, depth: true, lspace: true, voffset: true },
        mtable: { width: true, height: true, depth: true, align: true }
    },
    maligngroup: {
        mrow: { groupalign: true },
        mtable: { groupalign: true }
    },
    mtr: {
        msqrt: { 'data-vertical-align': true },
        mroot: { 'data-vertical-align': true }
    },
    mlabeledtr: {
        msqrt: { 'data-vertical-align': true },
        mroot: { 'data-vertical-align': true }
    }
};
AbstractMmlNode.stopInherit = {
    mtd: { columnalign: true, rowalign: true, groupalign: true }
};
AbstractMmlNode.alwaysInherit = {
    scriptminsize: true,
    scriptsizemultiplier: true,
    infixlinebreakstyle: true
};
AbstractMmlNode.verifyDefaults = {
    checkArity: true,
    checkAttributes: false,
    checkMathvariants: true,
    fullErrors: false,
    fixMmultiscripts: true,
    fixMtables: true
};
export class AbstractMmlTokenNode extends AbstractMmlNode {
    get isToken() {
        return true;
    }
    getText() {
        let text = '';
        for (const child of this.childNodes) {
            if (child instanceof TextNode) {
                text += child.getText();
            }
            else if ('textContent' in child) {
                text += child.textContent();
            }
        }
        return text;
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        for (const child of this.childNodes) {
            if (child instanceof AbstractMmlNode) {
                child.setInheritedAttributes(attributes, display, level, prime);
            }
        }
    }
    walkTree(func, data) {
        func(this, data);
        for (const child of this.childNodes) {
            if (child instanceof AbstractMmlNode) {
                child.walkTree(func, data);
            }
        }
        return data;
    }
}
AbstractMmlTokenNode.defaults = Object.assign(Object.assign({}, AbstractMmlNode.defaults), { mathvariant: 'normal', mathsize: INHERIT });
export class AbstractMmlLayoutNode extends AbstractMmlNode {
    get isSpacelike() {
        return this.childNodes[0].isSpacelike;
    }
    get isEmbellished() {
        return this.childNodes[0].isEmbellished;
    }
    get arity() {
        return -1;
    }
    core() {
        return this.childNodes[0];
    }
    coreMO() {
        return this.childNodes[0].coreMO();
    }
    setTeXclass(prev) {
        prev = this.childNodes[0].setTeXclass(prev);
        this.updateTeXclass(this.childNodes[0]);
        return prev;
    }
}
AbstractMmlLayoutNode.defaults = AbstractMmlNode.defaults;
export class AbstractMmlBaseNode extends AbstractMmlNode {
    get isEmbellished() {
        return this.childNodes[0].isEmbellished;
    }
    core() {
        return this.childNodes[0];
    }
    coreMO() {
        return this.childNodes[0].coreMO();
    }
    setTeXclass(prev) {
        this.getPrevClass(prev);
        this.texClass = TEXCLASS.ORD;
        let base = this.childNodes[0];
        if (base) {
            if (this.isEmbellished || base.isKind('mi')) {
                prev = base.setTeXclass(prev);
                this.updateTeXclass(this.core());
            }
            else {
                base.setTeXclass(null);
                prev = this;
            }
        }
        else {
            prev = this;
        }
        for (const child of this.childNodes.slice(1)) {
            if (child) {
                child.setTeXclass(null);
            }
        }
        return prev;
    }
}
AbstractMmlBaseNode.defaults = AbstractMmlNode.defaults;
export class AbstractMmlEmptyNode extends AbstractEmptyNode {
    get isToken() {
        return false;
    }
    get isEmbellished() {
        return false;
    }
    get isSpacelike() {
        return false;
    }
    get linebreakContainer() {
        return false;
    }
    get linebreakAlign() {
        return '';
    }
    get arity() {
        return 0;
    }
    get isInferred() {
        return false;
    }
    get notParent() {
        return false;
    }
    get Parent() {
        return this.parent;
    }
    get texClass() {
        return TEXCLASS.NONE;
    }
    get prevClass() {
        return TEXCLASS.NONE;
    }
    get prevLevel() {
        return 0;
    }
    hasSpacingAttributes() {
        return false;
    }
    get attributes() {
        return null;
    }
    core() {
        return this;
    }
    coreMO() {
        return this;
    }
    coreIndex() {
        return 0;
    }
    childPosition() {
        return 0;
    }
    setTeXclass(prev) {
        return prev;
    }
    texSpacing() {
        return '';
    }
    setInheritedAttributes(_attributes, _display, _level, _prime) { }
    inheritAttributesFrom(_node) { }
    verifyTree(_options) { }
    mError(_message, _options, _short = false) {
        return null;
    }
}
export class TextNode extends AbstractMmlEmptyNode {
    constructor() {
        super(...arguments);
        this.text = '';
    }
    get kind() {
        return 'text';
    }
    getText() {
        return this.text;
    }
    setText(text) {
        this.text = text;
        return this;
    }
    copy() {
        return this.factory.create(this.kind).setText(this.getText());
    }
    toString() {
        return this.text;
    }
}
export class XMLNode extends AbstractMmlEmptyNode {
    constructor() {
        super(...arguments);
        this.xml = null;
        this.adaptor = null;
    }
    get kind() {
        return 'XML';
    }
    getXML() {
        return this.xml;
    }
    setXML(xml, adaptor = null) {
        this.xml = xml;
        this.adaptor = adaptor;
        return this;
    }
    getSerializedXML() {
        return this.adaptor.serializeXML(this.xml);
    }
    copy() {
        return this.factory.create(this.kind).setXML(this.adaptor.clone(this.xml));
    }
    toString() {
        return 'XML data';
    }
}
//# sourceMappingURL=MmlNode.js.map