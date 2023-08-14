import { AbstractMmlEmptyNode } from '../MmlNode.js';
export class HtmlNode extends AbstractMmlEmptyNode {
    constructor() {
        super(...arguments);
        this.html = null;
        this.adaptor = null;
    }
    get kind() {
        return 'html';
    }
    getHTML() {
        return this.html;
    }
    setHTML(html, adaptor = null) {
        try {
            adaptor.getAttribute(html, 'data-mjx-hdw');
        }
        catch (error) {
            html = adaptor.node('span', {}, [html]);
        }
        this.html = html;
        this.adaptor = adaptor;
        return this;
    }
    getSerializedHTML() {
        return this.adaptor.outerHTML(this.html);
    }
    textContent() {
        return this.adaptor.textContent(this.html);
    }
    copy() {
        return this.factory.create(this.kind).setHTML(this.adaptor.clone(this.html));
    }
    toString() {
        const kind = this.adaptor.kind(this.html);
        return `HTML=<${kind}>...</${kind}>`;
    }
    verifyTree(options) {
        if (this.parent && !this.parent.isToken) {
            this.mError('HTML can only be a child of a token element', options, true);
            return;
        }
    }
}
//# sourceMappingURL=HtmlNode.js.map