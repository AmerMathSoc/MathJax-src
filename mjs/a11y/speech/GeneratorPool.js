import { buildLabel, buildSpeech, InPlace, SemAttr, } from '../speech/SpeechUtil.js';
export class GeneratorPool {
    constructor() {
        this.promise = Promise.resolve();
        this.adaptor = null;
        this._options = {};
        this._init = false;
        this.lastSpeech = new Map();
        this.lastMove_ = InPlace.NONE;
    }
    set element(element) {
        this._element = element;
    }
    get element() {
        return this._element;
    }
    set options(options) {
        this._options = Object.assign({}, (options === null || options === void 0 ? void 0 : options.sre) || {});
        delete this._options.custom;
    }
    get options() {
        return this._options;
    }
    init(options, adaptor, webworker) {
        if (this._init)
            return;
        this.adaptor = adaptor;
        this.options = options;
        this.webworker = webworker;
        this._init = true;
    }
    update(options) {
        Object.assign(this.options, options);
    }
    Speech(item) {
        const mml = item.outputData.mml;
        const options = Object.assign({}, this.options, { modality: 'speech' });
        return (this.promise = this.webworker.Speech(mml, options, item));
    }
    cancel(item) {
        this.webworker.Cancel(item);
    }
    summary(node) {
        if (this.lastMove === InPlace.SUMMARY) {
            this.CleanUp(node);
            return;
        }
        this.lastSpeech.set(SemAttr.SPEECH, this.adaptor.getAttribute(node, SemAttr.SPEECH));
        this.lastSpeech.set(SemAttr.SPEECH_SSML, this.adaptor.getAttribute(node, SemAttr.SPEECH_SSML));
        this.adaptor.setAttribute(node, SemAttr.SPEECH_SSML, this.adaptor.getAttribute(node, SemAttr.SUMMARY_SSML));
        this.adaptor.setAttribute(node, SemAttr.SPEECH, this.adaptor.getAttribute(node, SemAttr.SUMMARY));
    }
    CleanUp(node) {
        if (this.lastMove) {
            this.adaptor.setAttribute(node, SemAttr.SPEECH, this.lastSpeech.get(SemAttr.SPEECH));
            this.adaptor.setAttribute(node, SemAttr.SPEECH_SSML, this.lastSpeech.get(SemAttr.SPEECH_SSML));
            this.adaptor.setAttribute(node, 'aria-label', buildSpeech(this.getLabel(node))[0]);
            this.lastSpeech.clear();
        }
    }
    get lastMove() {
        return this.lastMove_;
    }
    set lastMove(move) {
        this.lastMove_ = move !== this.lastMove_ ? move : InPlace.NONE;
    }
    updateRegions(node, speechRegion, brailleRegion) {
        const speech = this.getLabel(node);
        speechRegion.Update(speech);
        this.adaptor.setAttribute(node, 'aria-label', buildSpeech(speech)[0]);
        brailleRegion.Update(this.adaptor.getAttribute(node, 'aria-braillelabel'));
    }
    getOptions(node) {
        var _a, _b, _c;
        return {
            locale: (_a = this.adaptor.getAttribute(node, 'data-semantic-locale')) !== null && _a !== void 0 ? _a : '',
            domain: (_b = this.adaptor.getAttribute(node, 'data-semantic-domain')) !== null && _b !== void 0 ? _b : '',
            style: (_c = this.adaptor.getAttribute(node, 'data-semantic-style')) !== null && _c !== void 0 ? _c : '',
        };
    }
    nextRules(item) {
        const options = this.getOptions(item.typesetRoot);
        this.update(options);
        return (this.promise = this.webworker.nextRules(item.outputData.mml, Object.assign({}, this.options, { modality: 'speech' }), item));
    }
    nextStyle(node, item) {
        const options = this.getOptions(item.typesetRoot);
        this.update(options);
        return (this.promise = this.webworker.nextStyle(item.outputData.mml, Object.assign({}, this.options, { modality: 'speech' }), this.adaptor.getAttribute(node, 'data-semantic-id'), item));
    }
    getLabel(node, _center = '', sep = ' ') {
        return buildLabel(this.adaptor.getAttribute(node, SemAttr.SPEECH_SSML), this.adaptor.getAttribute(node, SemAttr.PREFIX_SSML), this.adaptor.getAttribute(node, SemAttr.POSTFIX_SSML), sep);
    }
    depth(node, root, actionable) {
        var _a, _b, _c;
        if (this.lastMove === InPlace.DEPTH) {
            this.CleanUp(node);
            return;
        }
        let postfix = '';
        let sep = '';
        if (actionable) {
            postfix =
                (_a = this.adaptor.getAttribute(root, this.adaptor.childNodes(node).length === 0
                    ? 'data-semantic-expandable'
                    : 'data-semantic-collapsible')) !== null && _a !== void 0 ? _a : '';
            sep = ' ';
        }
        const depth = ((_b = this.adaptor.getAttribute(root, 'data-semantic-level')) !== null && _b !== void 0 ? _b : '') +
            ' ' +
            ((_c = this.adaptor.getAttribute(node, 'aria-level')) !== null && _c !== void 0 ? _c : '0');
        this.lastSpeech.set(SemAttr.SPEECH, this.adaptor.getAttribute(node, SemAttr.SPEECH));
        this.lastSpeech.set(SemAttr.SPEECH_SSML, this.adaptor.getAttribute(node, SemAttr.SPEECH_SSML));
        this.adaptor.setAttribute(node, SemAttr.SPEECH_SSML, `${depth}${sep}${postfix}`);
        this.adaptor.setAttribute(node, SemAttr.SPEECH, `${depth}${sep}${postfix}`);
    }
}
//# sourceMappingURL=GeneratorPool.js.map