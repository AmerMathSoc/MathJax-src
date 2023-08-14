import { HTMLAdaptor } from './HTMLAdaptor.js';
import { NodeMixin } from './NodeMixin.js';
export class LinkedomAdaptor extends NodeMixin(HTMLAdaptor) {
    parse(text, format = 'text/html') {
        if (!text.match(/^(?:\s|\n)*</))
            text = '<html>' + text + '</html>';
        return this.parser.parseFromString(text, format);
    }
    serializeXML(node) {
        return this.outerHTML(node);
    }
}
export function linkedomAdaptor(parseHTML, options = null) {
    const window = parseHTML('<html></html>');
    window.HTMLCollection = class {
    };
    return new LinkedomAdaptor(window, options);
}
//# sourceMappingURL=linkedomAdaptor.js.map