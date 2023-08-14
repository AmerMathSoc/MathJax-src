import { AbstractMmlNode, TEXCLASS } from '../MmlNode.js';
export class MmlMfenced extends AbstractMmlNode {
    constructor() {
        super(...arguments);
        this.texclass = TEXCLASS.INNER;
        this.separators = [];
        this.open = null;
        this.close = null;
    }
    get kind() {
        return 'mfenced';
    }
    setTeXclass(prev) {
        this.getPrevClass(prev);
        if (this.open) {
            prev = this.open.setTeXclass(prev);
        }
        if (this.childNodes[0]) {
            prev = this.childNodes[0].setTeXclass(prev);
        }
        for (let i = 1, m = this.childNodes.length; i < m; i++) {
            if (this.separators[i - 1]) {
                prev = this.separators[i - 1].setTeXclass(prev);
            }
            if (this.childNodes[i]) {
                prev = this.childNodes[i].setTeXclass(prev);
            }
        }
        if (this.close) {
            prev = this.close.setTeXclass(prev);
        }
        this.updateTeXclass(this.open);
        return prev;
    }
    setChildInheritedAttributes(attributes, display, level, prime) {
        this.addFakeNodes();
        for (const child of [this.open, this.close].concat(this.separators)) {
            if (child) {
                child.setInheritedAttributes(attributes, display, level, prime);
            }
        }
        super.setChildInheritedAttributes(attributes, display, level, prime);
    }
    addFakeNodes() {
        let { open, close, separators } = this.attributes.getList('open', 'close', 'separators');
        open = open.replace(/[ \t\n\r]/g, '');
        close = close.replace(/[ \t\n\r]/g, '');
        separators = separators.replace(/[ \t\n\r]/g, '');
        if (open) {
            this.open = this.fakeNode(open, { fence: true, form: 'prefix' }, TEXCLASS.OPEN);
        }
        if (separators) {
            while (separators.length < this.childNodes.length - 1) {
                separators += separators.charAt(separators.length - 1);
            }
            let i = 0;
            for (const child of this.childNodes.slice(1)) {
                if (child) {
                    this.separators.push(this.fakeNode(separators.charAt(i++)));
                }
            }
        }
        if (close) {
            this.close = this.fakeNode(close, { fence: true, form: 'postfix' }, TEXCLASS.CLOSE);
        }
    }
    fakeNode(c, properties = {}, texClass = null) {
        let text = this.factory.create('text').setText(c);
        let node = this.factory.create('mo', properties, [text]);
        node.texClass = texClass;
        node.parent = this;
        return node;
    }
}
MmlMfenced.defaults = Object.assign(Object.assign({}, AbstractMmlNode.defaults), { open: '(', close: ')', separators: ',' });
//# sourceMappingURL=mfenced.js.map