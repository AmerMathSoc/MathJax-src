import { AbstractMathDocument } from '../../core/MathDocument.js';
import { userOptions, separateOptions, expandable } from '../../util/Options.js';
import { HTMLMathItem } from './HTMLMathItem.js';
import { HTMLMathList } from './HTMLMathList.js';
import { HTMLDomStrings } from './HTMLDomStrings.js';
import { STATE } from '../../core/MathItem.js';
export class HTMLDocument extends AbstractMathDocument {
    constructor(document, adaptor, options) {
        let [html, dom] = separateOptions(options, HTMLDomStrings.OPTIONS);
        super(document, adaptor, html);
        this.domStrings = this.options['DomStrings'] || new HTMLDomStrings(dom);
        this.domStrings.adaptor = adaptor;
        this.styles = [];
    }
    findPosition(N, index, delim, nodes) {
        const adaptor = this.adaptor;
        for (const list of nodes[N]) {
            let [node, n] = list;
            if (index <= n && adaptor.kind(node) === '#text') {
                return { node: node, n: Math.max(index, 0), delim: delim };
            }
            index -= n;
        }
        return { node: null, n: 0, delim: delim };
    }
    mathItem(item, jax, nodes) {
        let math = item.math;
        let start = this.findPosition(item.n, item.start.n, item.open, nodes);
        let end = this.findPosition(item.n, item.end.n, item.close, nodes);
        return new this.options.MathItem(math, jax, item.display, start, end);
    }
    findMath(options) {
        if (!this.processed.isSet('findMath')) {
            this.adaptor.document = this.document;
            options = userOptions({ elements: this.options.elements || [this.adaptor.body(this.document)] }, options);
            const containers = this.adaptor.getElements(options.elements, this.document);
            for (const jax of this.inputJax) {
                const list = (jax.processStrings ?
                    this.findMathFromStrings(jax, containers) :
                    this.findMathFromDOM(jax, containers));
                this.math.merge(list);
            }
            this.processed.set('findMath');
        }
        return this;
    }
    findMathFromStrings(jax, containers) {
        const strings = [];
        const nodes = [];
        for (const container of containers) {
            const [slist, nlist] = this.domStrings.find(container);
            strings.push(...slist);
            nodes.push(...nlist);
        }
        const list = new this.options.MathList();
        for (const math of jax.findMath(strings)) {
            list.push(this.mathItem(math, jax, nodes));
        }
        return list;
    }
    findMathFromDOM(jax, containers) {
        const items = [];
        for (const container of containers) {
            for (const math of jax.findMath(container)) {
                items.push(new this.options.MathItem(math.math, jax, math.display, math.start, math.end));
            }
        }
        return new this.options.MathList(...items);
    }
    updateDocument() {
        if (!this.processed.isSet('updateDocument')) {
            this.addPageElements();
            this.addStyleSheet();
            super.updateDocument();
            this.processed.set('updateDocument');
        }
        return this;
    }
    addPageElements() {
        const body = this.adaptor.body(this.document);
        const node = this.documentPageElements();
        if (node) {
            this.adaptor.append(body, node);
        }
    }
    addStyleSheet() {
        const sheet = this.documentStyleSheet();
        const adaptor = this.adaptor;
        if (sheet && !adaptor.parent(sheet)) {
            const head = adaptor.head(this.document);
            let styles = this.findSheet(head, adaptor.getAttribute(sheet, 'id'));
            if (styles) {
                adaptor.replace(sheet, styles);
            }
            else {
                adaptor.append(head, sheet);
            }
        }
    }
    findSheet(head, id) {
        if (id) {
            for (const sheet of this.adaptor.tags(head, 'style')) {
                if (this.adaptor.getAttribute(sheet, 'id') === id) {
                    return sheet;
                }
            }
        }
        return null;
    }
    removeFromDocument(restore = false) {
        if (this.processed.isSet('updateDocument')) {
            for (const math of this.math) {
                if (math.state() >= STATE.INSERTED) {
                    math.state(STATE.TYPESET, restore);
                }
            }
        }
        this.processed.clear('updateDocument');
        return this;
    }
    documentStyleSheet() {
        return this.outputJax.styleSheet(this);
    }
    documentPageElements() {
        return this.outputJax.pageElements(this);
    }
    addStyles(styles) {
        this.styles.push(styles);
    }
    getStyles() {
        return this.styles;
    }
}
HTMLDocument.KIND = 'HTML';
HTMLDocument.OPTIONS = Object.assign(Object.assign({}, AbstractMathDocument.OPTIONS), { renderActions: expandable(Object.assign(Object.assign({}, AbstractMathDocument.OPTIONS.renderActions), { styles: [STATE.INSERTED + 1, '', 'updateStyleSheet', false] })), MathList: HTMLMathList, MathItem: HTMLMathItem, DomStrings: null });
//# sourceMappingURL=HTMLDocument.js.map