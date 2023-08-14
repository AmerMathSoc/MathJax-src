import { userOptions, defaultOptions, makeArray, expandable } from '../../util/Options.js';
export class HTMLDomStrings {
    constructor(options = null) {
        let CLASS = this.constructor;
        this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options);
        this.init();
        this.getPatterns();
    }
    init() {
        this.strings = [];
        this.string = '';
        this.snodes = [];
        this.nodes = [];
        this.stack = [];
    }
    getPatterns() {
        let skip = makeArray(this.options['skipHtmlTags']);
        let ignore = makeArray(this.options['ignoreHtmlClass']);
        let process = makeArray(this.options['processHtmlClass']);
        this.skipHtmlTags = new RegExp('^(?:' + skip.join('|') + ')$', 'i');
        this.ignoreHtmlClass = new RegExp('(?:^| )(?:' + ignore.join('|') + ')(?: |$)');
        this.processHtmlClass = new RegExp('(?:^| )(?:' + process + ')(?: |$)');
    }
    pushString() {
        if (this.string.match(/\S/)) {
            this.strings.push(this.string);
            this.nodes.push(this.snodes);
        }
        this.string = '';
        this.snodes = [];
    }
    extendString(node, text) {
        this.snodes.push([node, text.length]);
        this.string += text;
    }
    handleText(node, ignore) {
        if (!ignore) {
            this.extendString(node, this.adaptor.value(node));
        }
        return this.adaptor.next(node);
    }
    handleTag(node, ignore) {
        if (!ignore) {
            let text = this.options['includeHtmlTags'][this.adaptor.kind(node)];
            if (text instanceof Function) {
                this.extendString(node, text(node, this.adaptor));
            }
            else {
                this.extendString(node, text);
            }
        }
        return this.adaptor.next(node);
    }
    handleContainer(node, ignore) {
        this.pushString();
        const cname = this.adaptor.getAttribute(node, 'class') || '';
        const tname = this.adaptor.kind(node) || '';
        const process = this.processHtmlClass.exec(cname);
        let next = node;
        if (this.adaptor.firstChild(node) && !this.adaptor.getAttribute(node, 'data-MJX') &&
            (process || !this.skipHtmlTags.exec(tname))) {
            if (this.adaptor.next(node)) {
                this.stack.push([this.adaptor.next(node), ignore]);
            }
            next = this.adaptor.firstChild(node);
            ignore = (ignore || this.ignoreHtmlClass.exec(cname)) && !process;
        }
        else {
            next = this.adaptor.next(node);
        }
        return [next, ignore];
    }
    handleOther(node, _ignore) {
        this.pushString();
        return this.adaptor.next(node);
    }
    find(node) {
        this.init();
        let stop = this.adaptor.next(node);
        let ignore = false;
        let include = this.options['includeHtmlTags'];
        while (node && node !== stop) {
            const kind = this.adaptor.kind(node);
            if (kind === '#text') {
                node = this.handleText(node, ignore);
            }
            else if (include.hasOwnProperty(kind)) {
                node = this.handleTag(node, ignore);
            }
            else if (kind) {
                [node, ignore] = this.handleContainer(node, ignore);
            }
            else {
                node = this.handleOther(node, ignore);
            }
            if (!node && this.stack.length) {
                this.pushString();
                [node, ignore] = this.stack.pop();
            }
        }
        this.pushString();
        let result = [this.strings, this.nodes];
        this.init();
        return result;
    }
}
HTMLDomStrings.OPTIONS = {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code',
        'annotation', 'annotation-xml', 'select', 'option',
        'mjx-container'],
    includeHtmlTags: expandable({ br: '\n', wbr: '', '#comment': '' }),
    ignoreHtmlClass: 'mathjax_ignore',
    processHtmlClass: 'mathjax_process'
};
//# sourceMappingURL=HTMLDomStrings.js.map