import * as Entities from '../../util/Entities.js';
import { LiteElement } from './Element.js';
import { LiteComment } from './Text.js';
export var PATTERNS;
(function (PATTERNS) {
    PATTERNS.TAGNAME = '[a-z][^\\s\\n>]*';
    PATTERNS.ATTNAME = '[a-z][^\\s\\n>=]*';
    PATTERNS.VALUE = `(?:'[^']*'|"[^"]*"|[^\\s\\n]+)`;
    PATTERNS.VALUESPLIT = `(?:'([^']*)'|"([^"]*)"|([^\\s\\n]+))`;
    PATTERNS.SPACE = '(?:\\s|\\n)+';
    PATTERNS.OPTIONALSPACE = '(?:\\s|\\n)*';
    PATTERNS.ATTRIBUTE = PATTERNS.ATTNAME + '(?:' + PATTERNS.OPTIONALSPACE + '=' + PATTERNS.OPTIONALSPACE + PATTERNS.VALUE + ')?';
    PATTERNS.ATTRIBUTESPLIT = '(' + PATTERNS.ATTNAME + ')(?:' + PATTERNS.OPTIONALSPACE + '=' + PATTERNS.OPTIONALSPACE + PATTERNS.VALUESPLIT + ')?';
    PATTERNS.TAG = '(<(?:' + PATTERNS.TAGNAME + '(?:' + PATTERNS.SPACE + PATTERNS.ATTRIBUTE + ')*'
        + PATTERNS.OPTIONALSPACE + '/?|/' + PATTERNS.TAGNAME + '|!--[^]*?--|![^]*?)(?:>|$))';
    PATTERNS.tag = new RegExp(PATTERNS.TAG, 'i');
    PATTERNS.attr = new RegExp(PATTERNS.ATTRIBUTE, 'i');
    PATTERNS.attrsplit = new RegExp(PATTERNS.ATTRIBUTESPLIT, 'i');
})(PATTERNS || (PATTERNS = {}));
export class LiteParser {
    parseFromString(text, _format = 'text/html', adaptor = null) {
        const root = adaptor.createDocument();
        let node = adaptor.body(root);
        let parts = text.replace(/<\?.*?\?>/g, '').split(PATTERNS.tag);
        while (parts.length) {
            const text = parts.shift();
            const tag = parts.shift();
            if (text) {
                this.addText(adaptor, node, text);
            }
            if (tag && tag.charAt(tag.length - 1) === '>') {
                if (tag.charAt(1) === '!') {
                    this.addComment(adaptor, node, tag);
                }
                else if (tag.charAt(1) === '/') {
                    node = this.closeTag(adaptor, node, tag);
                }
                else {
                    node = this.openTag(adaptor, node, tag, parts);
                }
            }
        }
        this.checkDocument(adaptor, root);
        return root;
    }
    addText(adaptor, node, text) {
        text = Entities.translate(text);
        return adaptor.append(node, adaptor.text(text));
    }
    addComment(adaptor, node, comment) {
        return adaptor.append(node, new LiteComment(comment));
    }
    closeTag(adaptor, node, tag) {
        const kind = tag.slice(2, tag.length - 1).toLowerCase();
        while (adaptor.parent(node) && adaptor.kind(node) !== kind) {
            node = adaptor.parent(node);
        }
        return adaptor.parent(node);
    }
    openTag(adaptor, node, tag, parts) {
        const PCDATA = this.constructor.PCDATA;
        const SELF_CLOSING = this.constructor.SELF_CLOSING;
        const kind = tag.match(/<(.*?)[\s\n>\/]/)[1].toLowerCase();
        const child = adaptor.node(kind);
        const attributes = tag.replace(/^<.*?[\s\n>]/, '').split(PATTERNS.attrsplit);
        if (attributes.pop().match(/>$/) || attributes.length < 5) {
            this.addAttributes(adaptor, child, attributes);
            adaptor.append(node, child);
            if (!SELF_CLOSING[kind] && !tag.match(/\/>$/)) {
                if (PCDATA[kind]) {
                    this.handlePCDATA(adaptor, child, kind, parts);
                }
                else {
                    node = child;
                }
            }
        }
        return node;
    }
    addAttributes(adaptor, node, attributes) {
        while (attributes.length) {
            let [, name, v1, v2, v3] = attributes.splice(0, 5);
            let value = Entities.translate(v1 || v2 || v3 || '');
            adaptor.setAttribute(node, name, value);
        }
    }
    handlePCDATA(adaptor, node, kind, parts) {
        const pcdata = [];
        const etag = '</' + kind + '>';
        let ptag = '';
        while (parts.length && ptag !== etag) {
            pcdata.push(ptag);
            pcdata.push(parts.shift());
            ptag = parts.shift();
        }
        adaptor.append(node, adaptor.text(pcdata.join('')));
    }
    checkDocument(adaptor, root) {
        let node = this.getOnlyChild(adaptor, adaptor.body(root));
        if (!node)
            return;
        for (const child of adaptor.childNodes(adaptor.body(root))) {
            if (child === node) {
                break;
            }
            if (child instanceof LiteComment && child.value.match(/^<!DOCTYPE/)) {
                root.type = child.value;
            }
        }
        switch (adaptor.kind(node)) {
            case 'html':
                for (const child of node.children) {
                    switch (adaptor.kind(child)) {
                        case 'head':
                            root.head = child;
                            break;
                        case 'body':
                            root.body = child;
                            break;
                    }
                }
                root.root = node;
                adaptor.remove(node);
                if (adaptor.parent(root.body) !== node) {
                    adaptor.append(node, root.body);
                }
                if (adaptor.parent(root.head) !== node) {
                    adaptor.insert(root.head, root.body);
                }
                break;
            case 'head':
                root.head = adaptor.replace(node, root.head);
                break;
            case 'body':
                root.body = adaptor.replace(node, root.body);
                break;
        }
    }
    getOnlyChild(adaptor, body) {
        let node = null;
        for (const child of adaptor.childNodes(body)) {
            if (child instanceof LiteElement) {
                if (node)
                    return null;
                node = child;
            }
        }
        return node;
    }
    serialize(adaptor, node, xml = false) {
        const SELF_CLOSING = this.constructor.SELF_CLOSING;
        const tag = adaptor.kind(node);
        const attributes = adaptor.allAttributes(node).map((x) => x.name + '="' + this.protectAttribute(x.value) + '"').join(' ');
        const content = this.serializeInner(adaptor, node, xml);
        const html = '<' + tag + (attributes ? ' ' + attributes : '')
            + ((!xml || content) && !SELF_CLOSING[tag] ? `>${content}</${tag}>` : xml ? '/>' : '>');
        return html;
    }
    serializeInner(adaptor, node, xml = false) {
        const PCDATA = this.constructor.PCDATA;
        if (PCDATA.hasOwnProperty(node.kind)) {
            return adaptor.childNodes(node).map(x => adaptor.value(x)).join('');
        }
        return adaptor.childNodes(node).map(x => {
            const kind = adaptor.kind(x);
            return (kind === '#text' ? this.protectHTML(adaptor.value(x)) :
                kind === '#comment' ? x.value :
                    this.serialize(adaptor, x, xml));
        }).join('');
    }
    protectAttribute(text) {
        if (typeof text !== 'string') {
            text = String(text);
        }
        return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    }
    protectHTML(text) {
        return text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}
LiteParser.SELF_CLOSING = {
    area: true,
    base: true,
    br: true,
    col: true,
    command: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    menuitem: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true
};
LiteParser.PCDATA = {
    option: true,
    textarea: true,
    fieldset: true,
    title: true,
    style: true,
    script: true
};
//# sourceMappingURL=Parser.js.map