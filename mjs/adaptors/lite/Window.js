import { LiteElement } from './Element.js';
import { LiteDocument } from './Document.js';
import { LiteList } from './List.js';
import { LiteParser } from './Parser.js';
export class LiteWindow {
    constructor() {
        this.DOMParser = LiteParser;
        this.NodeList = LiteList;
        this.HTMLCollection = LiteList;
        this.HTMLElement = LiteElement;
        this.DocumentFragment = LiteList;
        this.Document = LiteDocument;
        this.document = new LiteDocument(this);
    }
    postMessage(msg, domain) {
        this.document.postMessage(msg, domain);
    }
    addEventListener(kind, listener) {
        if (kind === 'message') {
            this.document.listeners.push(listener);
        }
    }
}
//# sourceMappingURL=Window.js.map