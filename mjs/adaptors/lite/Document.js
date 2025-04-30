import { LiteElement } from './Element.js';
export class LiteDocument {
    get kind() {
        return '#document';
    }
    constructor(window = null) {
        this.defaultView = null;
        this.listeners = [];
        this.root = new LiteElement('html', {}, [
            (this.head = new LiteElement('head')),
            (this.body = new LiteElement('body')),
        ]);
        this.type = '';
        this.defaultView = window;
    }
    addEventListener(kind, listener) {
        if (kind === 'message') {
            this.listeners.push(listener);
        }
    }
    postMessage(msg, domain) {
        new Promise(() => {
            for (const listener of this.listeners) {
                listener({ data: msg, origin: domain });
            }
        });
    }
}
//# sourceMappingURL=Document.js.map