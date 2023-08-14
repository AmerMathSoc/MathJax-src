import { TEXCLASS, TEXCLASSNAMES } from './MmlNode.js';
import { MmlMi } from './MmlNodes/mi.js';
import { MmlFactory } from './MmlFactory.js';
import { AbstractVisitor } from '../Tree/Visitor.js';
import { lookup } from '../../util/Options.js';
export const DATAMJX = 'data-mjx-';
export class MmlVisitor extends AbstractVisitor {
    constructor(factory = null) {
        if (!factory) {
            factory = new MmlFactory();
        }
        super(factory);
    }
    visitTextNode(_node, ..._args) { }
    visitXMLNode(_node, ..._args) { }
    visitHtmlNode(_node, ..._args) { }
    getKind(node) {
        const kind = node.kind;
        return lookup(kind, this.constructor.rename, kind);
    }
    getAttributeList(node) {
        const CLASS = this.constructor;
        const defaults = lookup(node.kind, CLASS.defaultAttributes, {});
        const attributes = Object.assign({}, defaults, this.getDataAttributes(node), node.attributes.getAllAttributes());
        const variants = CLASS.variants;
        if (attributes.hasOwnProperty('mathvariant') && variants.hasOwnProperty(attributes.mathvariant)) {
            attributes.mathvariant = variants[attributes.mathvariant];
        }
        return attributes;
    }
    getDataAttributes(node) {
        const data = {};
        const variant = node.attributes.getExplicit('mathvariant');
        const variants = this.constructor.variants;
        variant && variants.hasOwnProperty(variant) && this.setDataAttribute(data, 'variant', variant);
        node.getProperty('variantForm') && this.setDataAttribute(data, 'alternate', '1');
        node.getProperty('pseudoscript') && this.setDataAttribute(data, 'pseudoscript', 'true');
        node.getProperty('autoOP') === false && this.setDataAttribute(data, 'auto-op', 'false');
        const vbox = node.getProperty('vbox');
        vbox && this.setDataAttribute(data, 'vbox', vbox);
        const scriptalign = node.getProperty('scriptalign');
        scriptalign && this.setDataAttribute(data, 'script-align', scriptalign);
        const texclass = node.getProperty('texClass');
        if (texclass !== undefined) {
            let setclass = true;
            if (texclass === TEXCLASS.OP && node.isKind('mi')) {
                const name = node.getText();
                setclass = !(name.length > 1 && name.match(MmlMi.operatorName));
            }
            setclass && this.setDataAttribute(data, 'texclass', texclass < 0 ? 'NONE' : TEXCLASSNAMES[texclass]);
        }
        node.getProperty('scriptlevel') && node.getProperty('useHeight') === false &&
            this.setDataAttribute(data, 'smallmatrix', 'true');
        return data;
    }
    setDataAttribute(data, name, value) {
        data[DATAMJX + name] = value;
    }
}
MmlVisitor.rename = {
    TeXAtom: 'mrow'
};
MmlVisitor.variants = {
    '-tex-calligraphic': 'script',
    '-tex-bold-calligraphic': 'bold-script',
    '-tex-oldstyle': 'normal',
    '-tex-bold-oldstyle': 'bold',
    '-tex-mathit': 'italic'
};
MmlVisitor.defaultAttributes = {
    math: {
        xmlns: 'http://www.w3.org/1998/Math/MathML'
    }
};
//# sourceMappingURL=MmlVisitor.js.map