import { STATE, newState } from '../core/MathItem.js';
import { SerializedMmlVisitor } from '../core/MmlTree/SerializedMmlVisitor.js';
import { expandable } from '../util/Options.js';
export class LimitedMmlVisitor extends SerializedMmlVisitor {
    getAttributes(node) {
        return super.getAttributes(node).replace(/ ?id=".*?"/, '');
    }
}
newState('ASSISTIVEMML', 153);
export function AssistiveMmlMathItemMixin(BaseMathItem) {
    return class extends BaseMathItem {
        assistiveMml(document, force = false) {
            if (this.state() >= STATE.ASSISTIVEMML)
                return;
            if (!this.isEscaped && (document.options.enableAssistiveMml || force)) {
                const adaptor = document.adaptor;
                const mml = document.toMML(this.root).replace(/\n */g, '').replace(/<!--.*?-->/g, '');
                const mmlNodes = adaptor.firstChild(adaptor.body(adaptor.parse(mml, 'text/html')));
                const node = adaptor.node('mjx-assistive-mml', {
                    unselectable: 'on', display: (this.display ? 'block' : 'inline')
                }, [mmlNodes]);
                adaptor.setAttribute(adaptor.firstChild(this.typesetRoot), 'aria-hidden', 'true');
                adaptor.setStyle(this.typesetRoot, 'position', 'relative');
                adaptor.append(this.typesetRoot, node);
            }
            this.state(STATE.ASSISTIVEMML);
        }
    };
}
export function AssistiveMmlMathDocumentMixin(BaseDocument) {
    var _a;
    return _a = class BaseClass extends BaseDocument {
            constructor(...args) {
                super(...args);
                const CLASS = this.constructor;
                const ProcessBits = CLASS.ProcessBits;
                if (!ProcessBits.has('assistive-mml')) {
                    ProcessBits.allocate('assistive-mml');
                }
                this.visitor = new LimitedMmlVisitor(this.mmlFactory);
                this.options.MathItem =
                    AssistiveMmlMathItemMixin(this.options.MathItem);
                if ('addStyles' in this) {
                    this.addStyles(CLASS.assistiveStyles);
                }
            }
            toMML(node) {
                return this.visitor.visitTree(node);
            }
            assistiveMml() {
                if (!this.processed.isSet('assistive-mml')) {
                    for (const math of this.math) {
                        math.assistiveMml(this);
                    }
                    this.processed.set('assistive-mml');
                }
                return this;
            }
            state(state, restore = false) {
                super.state(state, restore);
                if (state < STATE.ASSISTIVEMML) {
                    this.processed.clear('assistive-mml');
                }
                return this;
            }
        },
        _a.OPTIONS = Object.assign(Object.assign({}, BaseDocument.OPTIONS), { enableAssistiveMml: true, renderActions: expandable(Object.assign(Object.assign({}, BaseDocument.OPTIONS.renderActions), { assistiveMml: [STATE.ASSISTIVEMML] })) }),
        _a.assistiveStyles = {
            'mjx-assistive-mml': {
                position: 'absolute !important',
                top: '0px', left: '0px',
                bottom: '0px', right: '0px',
                clip: 'rect(1px, 1px, 1px, 1px)',
                'clip-path': 'polygon(0 0, 0 1px, 1px 1px, 1px 0)',
                padding: '1px 0px 0px 0px !important',
                border: '0px !important',
                display: 'block !important',
                width: 'auto !important',
                overflow: 'hidden !important',
                '-webkit-touch-callout': 'none',
                '-webkit-user-select': 'none',
                '-khtml-user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                'user-select': 'none'
            },
            'mjx-assistive-mml[display="block"]': {
                width: '100% !important'
            }
        },
        _a;
}
export function AssistiveMmlHandler(handler) {
    handler.documentClass =
        AssistiveMmlMathDocumentMixin(handler.documentClass);
    return handler;
}
//# sourceMappingURL=assistive-mml.js.map