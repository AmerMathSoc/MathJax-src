import { STATE, newState } from '../core/MathItem.js';
import { EnrichHandler } from './semantic-enrich.js';
import { expandable } from '../util/Options.js';
import { SerializedMmlVisitor } from '../core/MmlTree/SerializedMmlVisitor.js';
import { ExplorerPool, RegionPool } from './explorer/ExplorerPool.js';
import { Sre } from './sre.js';
const hasWindow = (typeof window !== 'undefined');
newState('EXPLORER', 160);
export function ExplorerMathItemMixin(BaseMathItem, toMathML) {
    return class extends BaseMathItem {
        constructor() {
            super(...arguments);
            this.refocus = false;
            this.savedId = null;
        }
        explorable(document, force = false) {
            if (this.state() >= STATE.EXPLORER)
                return;
            if (!this.isEscaped && (document.options.enableExplorer || force)) {
                const node = this.typesetRoot;
                const mml = toMathML(this.root);
                if (this.savedId) {
                    this.typesetRoot.setAttribute('sre-explorer-id', this.savedId);
                    this.savedId = null;
                }
                if (!this.explorers) {
                    this.explorers = new ExplorerPool();
                }
                this.explorers.init(document, node, mml);
            }
            this.state(STATE.EXPLORER);
        }
        rerender(document, start = STATE.RERENDER) {
            this.savedId = this.typesetRoot.getAttribute('sre-explorer-id');
            this.refocus = (hasWindow ? window.document.activeElement === this.typesetRoot : false);
            if (this.explorers) {
                this.explorers.reattach();
            }
            super.rerender(document, start);
        }
        updateDocument(document) {
            super.updateDocument(document);
            this.refocus && this.typesetRoot.focus();
            if (this.explorers) {
                this.explorers.restart();
            }
            this.refocus = false;
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
                const toMathML = ((node) => visitor.visitTree(node));
                const options = this.options;
                if (!options.a11y.speechRules) {
                    options.a11y.speechRules = `${options.sre.domain}-${options.sre.style}`;
                }
                options.MathItem = ExplorerMathItemMixin(options.MathItem, toMathML);
            }
            explorable() {
                if (!this.processed.isSet('explorer')) {
                    if (this.options.enableExplorer) {
                        if (!this.explorerRegions) {
                            this.explorerRegions = new RegionPool(this);
                        }
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
        _a.OPTIONS = Object.assign(Object.assign({}, BaseDocument.OPTIONS), { enableExplorer: hasWindow, renderActions: expandable(Object.assign(Object.assign({}, BaseDocument.OPTIONS.renderActions), { explorable: [STATE.EXPLORER] })), sre: expandable(Object.assign(Object.assign({}, BaseDocument.OPTIONS.sre), { speech: 'shallow' })), a11y: {
                align: 'top',
                backgroundColor: 'Blue',
                backgroundOpacity: 20,
                braille: false,
                flame: false,
                foregroundColor: 'Black',
                foregroundOpacity: 100,
                highlight: 'None',
                hover: false,
                infoPrefix: false,
                infoRole: false,
                infoType: false,
                keyMagnifier: false,
                magnification: 'None',
                magnify: '400%',
                mouseMagnifier: false,
                speech: true,
                subtitles: true,
                treeColoring: false,
                viewBraille: false,
                voicing: false,
            } }),
        _a;
}
export function ExplorerHandler(handler, MmlJax = null) {
    if (!handler.documentClass.prototype.enrich && MmlJax) {
        handler = EnrichHandler(handler, MmlJax);
    }
    handler.documentClass = ExplorerMathDocumentMixin(handler.documentClass);
    return handler;
}
export function setA11yOptions(document, options) {
    let sreOptions = Sre.engineSetup();
    for (let key in options) {
        if (document.options.a11y[key] !== undefined) {
            setA11yOption(document, key, options[key]);
            if (key === 'locale') {
                document.options.sre[key] = options[key];
            }
            continue;
        }
        if (sreOptions[key] !== undefined) {
            document.options.sre[key] = options[key];
        }
    }
    for (let item of document.math) {
        item.explorers.attach();
    }
}
export function setA11yOption(document, option, value) {
    switch (option) {
        case 'speechRules':
            const [domain, style] = value.split('-');
            document.options.sre.domain = domain;
            document.options.sre.style = style;
            break;
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
        default:
            document.options.a11y[option] = value;
    }
}
//# sourceMappingURL=explorer.js.map