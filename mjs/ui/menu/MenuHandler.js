import { mathjax } from '../../mathjax.js';
import { STATE, newState } from '../../core/MathItem.js';
import { expandable } from '../../util/Options.js';
import { Menu } from './Menu.js';
import '../../a11y/SpeechMenu.js';
newState('CONTEXT_MENU', 170);
export function MenuMathItemMixin(BaseMathItem) {
    return class extends BaseMathItem {
        addMenu(document, force = false) {
            if (this.state() >= STATE.CONTEXT_MENU)
                return;
            if (!this.isEscaped && (document.options.enableMenu || force)) {
                document.menu.addMenu(this);
            }
            this.state(STATE.CONTEXT_MENU);
        }
        checkLoading(document) {
            document.checkLoading();
        }
    };
}
export function MenuMathDocumentMixin(BaseDocument) {
    var _a;
    return _a = class extends BaseDocument {
            constructor(...args) {
                super(...args);
                this.menu = new this.options.MenuClass(this, this.options.menuOptions);
                const ProcessBits = this.constructor.ProcessBits;
                if (!ProcessBits.has('context-menu')) {
                    ProcessBits.allocate('context-menu');
                }
                this.options.MathItem = MenuMathItemMixin(this.options.MathItem);
            }
            addMenu() {
                if (!this.processed.isSet('context-menu')) {
                    for (const math of this.math) {
                        math.addMenu(this);
                    }
                    this.processed.set('context-menu');
                }
                return this;
            }
            checkLoading() {
                if (this.menu.isLoading) {
                    mathjax.retryAfter(this.menu.loadingPromise.catch((err) => console.log(err)));
                }
                const settings = this.menu.settings;
                if (settings.collapsible) {
                    this.options.enableComplexity = true;
                    this.menu.checkComponent('a11y/complexity');
                }
                if (settings.explorer) {
                    this.options.enableEnrichment = true;
                    this.options.enableExplorer = true;
                    this.menu.checkComponent('a11y/explorer');
                }
                return this;
            }
            state(state, restore = false) {
                super.state(state, restore);
                if (state < STATE.CONTEXT_MENU) {
                    this.processed.clear('context-menu');
                }
                return this;
            }
            updateDocument() {
                super.updateDocument();
                this.menu.menu.store.sort();
                return this;
            }
        },
        _a.OPTIONS = Object.assign(Object.assign({ enableEnrichment: true, enableComplexity: true, enableExplorer: true, enrichSpeech: 'none', enrichError: (_doc, _math, err) => console.warn('Enrichment Error:', err) }, BaseDocument.OPTIONS), { MenuClass: Menu, menuOptions: Menu.OPTIONS, enableMenu: true, sre: (BaseDocument.OPTIONS.sre || expandable({})), a11y: (BaseDocument.OPTIONS.a11y || expandable({})), renderActions: expandable(Object.assign(Object.assign({}, BaseDocument.OPTIONS.renderActions), { addMenu: [STATE.CONTEXT_MENU], checkLoading: [STATE.UNPROCESSED + 1] })) }),
        _a;
}
export function MenuHandler(handler) {
    handler.documentClass = MenuMathDocumentMixin(handler.documentClass);
    return handler;
}
//# sourceMappingURL=MenuHandler.js.map