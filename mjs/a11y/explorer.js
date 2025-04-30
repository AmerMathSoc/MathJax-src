import { STATE, newState } from '../core/MathItem.js';
import { SpeechHandler } from './speech.js';
import { expandable } from '../util/Options.js';
import { SerializedMmlVisitor } from '../core/MmlTree/SerializedMmlVisitor.js';
import { hasWindow } from '../util/context.js';
import { ExplorerPool, RegionPool } from './explorer/ExplorerPool.js';
import * as Sre from './sre.js';
newState('EXPLORER', 160);
export function ExplorerMathItemMixin(BaseMathItem, toMathML) {
    return class extends BaseMathItem {
        constructor() {
            super(...arguments);
            this.refocus = null;
        }
        explorable(document, force = false) {
            if (this.state() >= STATE.EXPLORER)
                return;
            if (!this.isEscaped && (document.options.enableExplorer || force)) {
                const node = this.typesetRoot;
                const mml = toMathML(this.root);
                if (!this.explorers) {
                    this.explorers = new ExplorerPool();
                }
                this.explorers.init(document, node, mml, this);
            }
            this.state(STATE.EXPLORER);
        }
        rerender(document, start = STATE.RERENDER) {
            var _a;
            if (this.explorers) {
                const speech = this.explorers.speech;
                if (speech && speech.attached) {
                    this.refocus = (_a = speech.semanticFocus()) !== null && _a !== void 0 ? _a : null;
                }
                this.explorers.reattach();
            }
            super.rerender(document, start);
        }
        updateDocument(document) {
            var _a;
            super.updateDocument(document);
            if ((_a = this.explorers) === null || _a === void 0 ? void 0 : _a.speech) {
                this.explorers.speech.restarted = this.refocus;
            }
            this.refocus = null;
            if (this.explorers) {
                this.explorers.restart();
            }
        }
    };
}
export function ExplorerMathDocumentMixin(BaseDocument) {
    var _a;
    return _a = class extends BaseDocument {
            constructor(...args) {
                super(...args);
                this.explorerRegions = null;
                const ProcessBits = this.constructor.ProcessBits;
                if (!ProcessBits.has('explorer')) {
                    ProcessBits.allocate('explorer');
                }
                const visitor = new SerializedMmlVisitor(this.mmlFactory);
                const toMathML = (node) => visitor.visitTree(node);
                const options = this.options;
                if (!options.a11y.speechRules) {
                    options.a11y.speechRules = `${options.sre.domain}-${options.sre.style}`;
                }
                options.MathItem = ExplorerMathItemMixin(options.MathItem, toMathML);
                this.explorerRegions = new RegionPool(this);
            }
            explorable() {
                if (!this.processed.isSet('explorer')) {
                    if (this.options.enableExplorer) {
                        for (const math of this.math) {
                            math.explorable(this);
                        }
                    }
                    this.processed.set('explorer');
                }
                return this;
            }
            state(state, restore = false) {
                super.state(state, restore);
                if (state < STATE.EXPLORER) {
                    this.processed.clear('explorer');
                }
                return this;
            }
        },
        _a.OPTIONS = Object.assign(Object.assign({}, BaseDocument.OPTIONS), { enableExplorer: hasWindow, renderActions: expandable(Object.assign(Object.assign({}, BaseDocument.OPTIONS.renderActions), { explorable: [STATE.EXPLORER] })), sre: expandable(Object.assign(Object.assign({}, BaseDocument.OPTIONS.sre), { speech: 'none' })), a11y: Object.assign(Object.assign({}, BaseDocument.OPTIONS.a11y), { align: 'top', backgroundColor: 'Blue', backgroundOpacity: 20, flame: false, foregroundColor: 'Black', foregroundOpacity: 100, highlight: 'None', hover: false, infoPrefix: false, infoRole: false, infoType: false, keyMagnifier: false, magnification: 'None', magnify: '400%', mouseMagnifier: false, subtitles: false, treeColoring: false, viewBraille: false, voicing: false }) }),
        _a;
}
export function ExplorerHandler(handler, MmlJax = null) {
    if (!handler.documentClass.prototype.attachSpeech) {
        handler = SpeechHandler(handler, MmlJax);
    }
    handler.documentClass = ExplorerMathDocumentMixin(handler.documentClass);
    return handler;
}
export function setA11yOptions(document, options) {
    var _a;
    const sreOptions = Sre.engineSetup();
    for (const key in options) {
        if (document.options.a11y[key] !== undefined) {
            setA11yOption(document, key, options[key]);
        }
        else if (sreOptions[key] !== undefined) {
            document.options.sre[key] = options[key];
        }
    }
    for (const item of document.math) {
        (_a = item === null || item === void 0 ? void 0 : item.explorers) === null || _a === void 0 ? void 0 : _a.attach();
    }
}
export function setA11yOption(document, option, value) {
    switch (option) {
        case 'speechRules': {
            const [domain, style] = value.split('-');
            document.options.sre.domain = domain;
            document.options.sre.style = style;
            break;
        }
        case 'magnification':
            switch (value) {
                case 'None':
                    document.options.a11y.magnification = value;
                    document.options.a11y.keyMagnifier = false;
                    document.options.a11y.mouseMagnifier = false;
                    break;
                case 'Keyboard':
                    document.options.a11y.magnification = value;
                    document.options.a11y.keyMagnifier = true;
                    document.options.a11y.mouseMagnifier = false;
                    break;
                case 'Mouse':
                    document.options.a11y.magnification = value;
                    document.options.a11y.keyMagnifier = false;
                    document.options.a11y.mouseMagnifier = true;
                    break;
            }
            break;
        case 'highlight':
            switch (value) {
                case 'None':
                    document.options.a11y.highlight = value;
                    document.options.a11y.hover = false;
                    document.options.a11y.flame = false;
                    break;
                case 'Hover':
                    document.options.a11y.highlight = value;
                    document.options.a11y.hover = true;
                    document.options.a11y.flame = false;
                    break;
                case 'Flame':
                    document.options.a11y.highlight = value;
                    document.options.a11y.hover = false;
                    document.options.a11y.flame = true;
                    break;
            }
            break;
        case 'locale':
            document.options.sre.locale = value;
            break;
        default:
            document.options.a11y[option] = value;
    }
}
//# sourceMappingURL=explorer.js.map