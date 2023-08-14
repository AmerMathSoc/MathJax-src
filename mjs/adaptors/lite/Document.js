import { LiteElement } from './Element.js';
export class LiteDocument {
    get kind() {
        return '#document';
    }
    constructor() {
        this.root = new LiteElement('html', {}, [
            this.head = new LiteElement('head'),
            this.body = new LiteElement('body')
        ]);
        this.type = '';
    }
}
//# sourceMappingURL=Document.js.map