import { AbstractMmlNode, AbstractMmlEmptyNode } from '../../core/MmlTree/MmlNode.js';
import { MmlMo } from '../../core/MmlTree/MmlNodes/mo.js';
var NodeUtil;
(function (NodeUtil) {
    const attrs = new Map([
        ['autoOP', true],
        ['fnOP', true],
        ['movesupsub', true],
        ['subsupOK', true],
        ['texprimestyle', true],
        ['useHeight', true],
        ['variantForm', true],
        ['withDelims', true],
        ['mathaccent', true],
        ['open', true],
        ['close', true]
    ]);
    function createEntity(code) {
        return String.fromCodePoint(parseInt(code, 16));
    }
    NodeUtil.createEntity = createEntity;
    function getChildren(node) {
        return node.childNodes;
    }
    NodeUtil.getChildren = getChildren;
    function getText(node) {
        return node.getText();
    }
    NodeUtil.getText = getText;
    function appendChildren(node, children) {
        for (let child of children) {
            node.appendChild(child);
        }
    }
    NodeUtil.appendChildren = appendChildren;
    function setAttribute(node, attribute, value) {
        node.attributes.set(attribute, value);
    }
    NodeUtil.setAttribute = setAttribute;
    function setProperty(node, property, value) {
        node.setProperty(property, value);
    }
    NodeUtil.setProperty = setProperty;
    function setProperties(node, properties) {
        for (const name of Object.keys(properties)) {
            let value = properties[name];
            if (name === 'texClass') {
                node.texClass = value;
                node.setProperty(name, value);
            }
            else if (name === 'movablelimits') {
                node.setProperty('movablelimits', value);
                if (node.isKind('mo') || node.isKind('mstyle')) {
                    node.attributes.set('movablelimits', value);
                }
            }
            else if (name === 'inferred') {
            }
            else if (attrs.has(name)) {
                node.setProperty(name, value);
            }
            else {
                node.attributes.set(name, value);
            }
        }
    }
    NodeUtil.setProperties = setProperties;
    function getProperty(node, property) {
        return node.getProperty(property);
    }
    NodeUtil.getProperty = getProperty;
    function getAttribute(node, attr) {
        return node.attributes.get(attr);
    }
    NodeUtil.getAttribute = getAttribute;
    function removeAttribute(node, attr) {
        delete (node.attributes.getAllAttributes())[attr];
    }
    NodeUtil.removeAttribute = removeAttribute;
    function removeProperties(node, ...properties) {
        node.removeProperty(...properties);
    }
    NodeUtil.removeProperties = removeProperties;
    function getChildAt(node, position) {
        return node.childNodes[position];
    }
    NodeUtil.getChildAt = getChildAt;
    function setChild(node, position, child) {
        let children = node.childNodes;
        children[position] = child;
        if (child) {
            child.parent = node;
        }
    }
    NodeUtil.setChild = setChild;
    function copyChildren(oldNode, newNode) {
        let children = oldNode.childNodes;
        for (let i = 0; i < children.length; i++) {
            setChild(newNode, i, children[i]);
        }
    }
    NodeUtil.copyChildren = copyChildren;
    function copyAttributes(oldNode, newNode) {
        newNode.attributes = oldNode.attributes;
        setProperties(newNode, oldNode.getAllProperties());
    }
    NodeUtil.copyAttributes = copyAttributes;
    function isType(node, kind) {
        return node.isKind(kind);
    }
    NodeUtil.isType = isType;
    function isEmbellished(node) {
        return node.isEmbellished;
    }
    NodeUtil.isEmbellished = isEmbellished;
    function getTexClass(node) {
        return node.texClass;
    }
    NodeUtil.getTexClass = getTexClass;
    function getCoreMO(node) {
        return node.coreMO();
    }
    NodeUtil.getCoreMO = getCoreMO;
    function isNode(item) {
        return item instanceof AbstractMmlNode || item instanceof AbstractMmlEmptyNode;
    }
    NodeUtil.isNode = isNode;
    function isInferred(node) {
        return node.isInferred;
    }
    NodeUtil.isInferred = isInferred;
    function getForm(node) {
        if (!isType(node, 'mo')) {
            return null;
        }
        let mo = node;
        let forms = mo.getForms();
        for (let form of forms) {
            let symbol = this.getOp(mo, form);
            if (symbol) {
                return symbol;
            }
        }
        return null;
    }
    NodeUtil.getForm = getForm;
    function getOp(mo, form = 'infix') {
        return MmlMo.OPTABLE[form][mo.getText()] || null;
    }
    NodeUtil.getOp = getOp;
})(NodeUtil || (NodeUtil = {}));
export default NodeUtil;
//# sourceMappingURL=NodeUtil.js.map