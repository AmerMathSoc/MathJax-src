import { mathjax } from '../mathjax.js';
import { STATE, newState } from '../core/MathItem.js';
import { SerializedMmlVisitor } from '../core/MmlTree/SerializedMmlVisitor.js';
import { expandable } from '../util/Options.js';
import { Sre } from './sre.js';
let currentSpeech = 'none';
newState('ENRICHED', 30);
newState('ATTACHSPEECH', 155);
export class enrichVisitor extends SerializedMmlVisitor {
    visitTree(node, math) {
        this.mactionId = 1;
        const mml = super.visitTree(node);
        if (this.mactionId) {
            math.inputData.hasMaction = true;
        }
        return mml;
    }
    visitMactionNode(node, space) {
        let [nl, endspace] = (node.childNodes.length === 0 ? ['', ''] : ['\n', space]);
        const children = this.childNodeMml(node, space + '  ', nl);
        let attributes = this.getAttributes(node);
        if (node.attributes.get('actiontype') === 'toggle') {
            const id = this.mactionId++;
            node.setProperty('mactionId', id);
            attributes = ` data-maction-id="${id}" selection="${node.attributes.get('selection')}"`
                + attributes.replace(/ selection="\d+"/, '');
        }
        return space + '<maction' + attributes + '>'
            + (children.match(/\S/) ? nl + children + endspace : '')
            + '</maction>';
    }
}
export function EnrichedMathItemMixin(BaseMathItem, MmlJax, toMathML) {
    return class extends BaseMathItem {
        serializeMml(node) {
            if ('outerHTML' in node) {
                return node.outerHTML;
            }
            if (typeof Element !== 'undefined' && typeof window !== 'undefined' && node instanceof Element) {
                const div = window.document.createElement('div');
                div.appendChild(node);
                return div.innerHTML;
            }
            return node.toString();
        }
        enrich(document, force = false) {
            if (this.state() >= STATE.ENRICHED)
                return;
            if (!this.isEscaped && (document.options.enableEnrichment || force)) {
                if (document.options.sre.speech !== currentSpeech) {
                    currentSpeech = document.options.sre.speech;
                    mathjax.retryAfter(Sre.setupEngine(document.options.sre).then(() => Sre.sreReady()));
                }
                const math = new document.options.MathItem('', MmlJax);
                try {
                    let mml;
                    if (!this.inputData.originalMml) {
                        mml = this.inputData.originalMml = toMathML(this.root, this);
                    }
                    else {
                        mml = this.adjustSelections();
                    }
                    this.inputData.enrichedMml = math.math = this.serializeMml(Sre.toEnriched(mml));
                    math.display = this.display;
                    math.compile(document);
                    this.root = math.root;
                }
                catch (err) {
                    document.options.enrichError(document, this, err);
                }
            }
            this.state(STATE.ENRICHED);
        }
        adjustSelections() {
            let mml = this.inputData.originalMml;
            if (!this.inputData.hasMaction)
                return mml;
            const maction = [];
            this.root.walkTree((node) => {
                if (node.isKind('maction')) {
                    maction[node.attributes.get('data-maction-id')] = node;
                }
            });
            return mml.replace(/(data-maction-id="(\d+)" selection=)"\d+"/g, (_match, prefix, id) => `${prefix}"${maction[id].attributes.get('selection')}"`);
        }
        attachSpeech(document) {
            if (this.state() >= STATE.ATTACHSPEECH)
                return;
            const attributes = this.root.attributes;
            const speech = (attributes.get('aria-label') ||
                this.getSpeech(this.root));
            if (speech) {
                const adaptor = document.adaptor;
                const node = this.typesetRoot;
                adaptor.setAttribute(node, 'aria-label', speech);
                for (const child of adaptor.childNodes(node)) {
                    adaptor.setAttribute(child, 'aria-hidden', 'true');
                }
                this.outputData.speech = speech;
            }
            this.state(STATE.ATTACHSPEECH);
        }
        getSpeech(node) {
            const attributes = node.attributes;
            if (!attributes)
                return '';
            const speech = attributes.getExplicit('data-semantic-speech');
            if (!attributes.getExplicit('data-semantic-parent') && speech) {
                return speech;
            }
            for (let child of node.childNodes) {
                let value = this.getSpeech(child);
                if (value) {
                    return value;
                }
            }
            return '';
        }
    };
}
export function EnrichedMathDocumentMixin(BaseDocument, MmlJax) {
    var _a;
    return _a = class extends BaseDocument {
            constructor(...args) {
                super(...args);
                MmlJax.setMmlFactory(this.mmlFactory);
                const ProcessBits = this.constructor.ProcessBits;
                if (!ProcessBits.has('enriched')) {
                    ProcessBits.allocate('enriched');
                    ProcessBits.allocate('attach-speech');
                }
                const visitor = new enrichVisitor(this.mmlFactory);
                const toMathML = ((node, math) => visitor.visitTree(node, math));
                this.options.MathItem =
                    EnrichedMathItemMixin(this.options.MathItem, MmlJax, toMathML);
            }
            attachSpeech() {
                if (!this.processed.isSet('attach-speech')) {
                    for (const math of this.math) {
                        math.attachSpeech(this);
                    }
                    this.processed.set('attach-speech');
                }
                return this;
            }
            enrich() {
                if (!this.processed.isSet('enriched')) {
                    if (this.options.enableEnrichment) {
                        for (const math of this.math) {
                            math.enrich(this);
                        }
                    }
                    this.processed.set('enriched');
                }
                return this;
            }
            enrichError(_doc, _math, err) {
                console.warn('Enrichment error:', err);
            }
            state(state, restore = false) {
                super.state(state, restore);
                if (state < STATE.ENRICHED) {
                    this.processed.clear('enriched');
                }
                return this;
            }
        },
        _a.OPTIONS = Object.assign(Object.assign({}, BaseDocument.OPTIONS), { enableEnrichment: true, enrichError: (doc, math, err) => doc.enrichError(doc, math, err), renderActions: expandable(Object.assign(Object.assign({}, BaseDocument.OPTIONS.renderActions), { enrich: [STATE.ENRICHED], attachSpeech: [STATE.ATTACHSPEECH] })), sre: expandable({
                structure: true,
                speech: 'none',
                domain: 'mathspeak',
                style: 'default',
                locale: 'en'
            }) }),
        _a;
}
export function EnrichHandler(handler, MmlJax) {
    MmlJax.setAdaptor(handler.adaptor);
    handler.documentClass =
        EnrichedMathDocumentMixin(handler.documentClass, MmlJax);
    return handler;
}
//# sourceMappingURL=semantic-enrich.js.map