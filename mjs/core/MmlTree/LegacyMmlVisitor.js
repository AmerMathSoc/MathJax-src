import { MmlVisitor } from './MmlVisitor.js';
let MML = MathJax.ElementJax.mml;
export class LegacyMmlVisitor extends MmlVisitor {
    visitTree(node) {
        let root = MML.mrow();
        this.visitNode(node, root);
        root = root.data[0];
        root.parent = null;
        return root;
    }
    visitTextNode(node, parent) {
        parent.Append(MML.chars(node.getText()));
    }
    visitXMLNode(node, parent) {
        parent.Append(MML.xml(node.getXML()));
    }
    visitInferredMrowNode(node, parent) {
        for (const child of node.childNodes) {
            this.visitNode(child, parent);
        }
    }
    visitDefault(node, parent) {
        let mml = MML[node.kind]();
        this.addAttributes(node, mml);
        this.addProperties(node, mml);
        for (const child of node.childNodes) {
            this.visitNode(child, mml);
        }
        parent.Append(mml);
    }
    addAttributes(node, mml) {
        let attributes = node.attributes;
        let names = attributes.getExplicitNames();
        for (const name of names) {
            mml[name] = attributes.getExplicit(name);
        }
    }
    addProperties(node, mml) {
        let names = node.getPropertyNames();
        for (const name of names) {
            mml[name] = node.getProperty(name);
        }
    }
}
//# sourceMappingURL=LegacyMmlVisitor.js.map