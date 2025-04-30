import { SvgWrapper } from '../Wrapper.js';
import { CommonMathMixin, } from '../../common/Wrappers/math.js';
import { MmlMath } from '../../../core/MmlTree/MmlNodes/math.js';
import { BBox } from '../../../util/BBox.js';
import { ZeroFontDataUrl } from './zero.js';
export const SvgMath = (function () {
    var _a;
    const Base = CommonMathMixin(SvgWrapper);
    return _a = class SvgMath extends Base {
            handleDisplay() {
                const [align, shift] = this.getAlignShift();
                if (align !== 'center') {
                    this.adaptor.setAttribute(this.jax.container, 'justify', align);
                }
                if (this.bbox.pwidth === BBox.fullWidth) {
                    this.adaptor.setAttribute(this.jax.container, 'width', 'full');
                    if (this.jax.table) {
                        let { L, w, R } = this.jax.table.getOuterBBox();
                        if (align === 'right') {
                            R = Math.max(R || -shift, -shift);
                        }
                        else if (align === 'left') {
                            L = Math.max(L || shift, shift);
                        }
                        else if (align === 'center') {
                            w += 2 * Math.abs(shift);
                        }
                        this.jax.minwidth = Math.max(0, L + w + R);
                    }
                }
                else {
                    this.jax.shift = shift;
                }
            }
            handleSpeech() {
                const adaptor = this.adaptor;
                const attributes = this.node.attributes;
                const speech = (attributes.get('aria-label') ||
                    attributes.get('data-semantic-speech'));
                if (speech) {
                    const id = this.getTitleID();
                    const label = this.svg('title', { id }, [this.text(speech)]);
                    adaptor.insert(label, adaptor.firstChild(this.dom[0]));
                    adaptor.setAttribute(this.dom[0], 'aria-labeledby', id);
                    adaptor.removeAttribute(this.dom[0], 'aria-label');
                    for (const child of this.childNodes[0].childNodes) {
                        child.dom.forEach((node) => adaptor.setAttribute(node, 'aria-hidden', 'true'));
                    }
                }
            }
            getTitleID() {
                return 'mjx-svg-title-' + String(this.jax.options.titleID++);
            }
            toSVG(parents) {
                super.toSVG(parents);
                const adaptor = this.adaptor;
                const display = this.node.attributes.get('display') === 'block';
                if (display) {
                    adaptor.setAttribute(this.jax.container, 'display', 'true');
                    this.handleDisplay();
                }
                if (this.jax.document.options.internalSpeechTitles) {
                    this.handleSpeech();
                }
            }
            setChildPWidths(recompute, w = null, _clear = true) {
                return super.setChildPWidths(recompute, this.parent ? w : this.metrics.containerWidth / this.jax.pxPerEm, false);
            }
        },
        _a.kind = MmlMath.prototype.kind,
        _a.styles = {
            'mjx-container[jax="SVG"] mjx-break': {
                'white-space': 'normal',
                'line-height': '0',
                'clip-path': 'rect(0 0 0 0)',
                'font-family': 'MJX-ZERO ! important',
            },
            'mjx-break[size="0"]': {
                'letter-spacing': 0.001 - 1 + 'em',
            },
            'mjx-break[size="1"]': {
                'letter-spacing': 0.111 - 1 + 'em',
            },
            'mjx-break[size="2"]': {
                'letter-spacing': 0.167 - 1 + 'em',
            },
            'mjx-break[size="3"]': {
                'letter-spacing': 0.222 - 1 + 'em',
            },
            'mjx-break[size="4"]': {
                'letter-spacing': 0.278 - 1 + 'em',
            },
            'mjx-break[size="5"]': {
                'letter-spacing': 0.333 - 1 + 'em',
            },
            'mjx-container[jax="SVG"] mjx-break[newline]::before': {
                'white-space': 'pre',
                content: '"\\A"',
            },
            'mjx-break[newline] + svg[width="0.054ex"]': {
                'margin-right': '-1px',
            },
            'mjx-break[prebreak]': {
                'letter-spacing': '-.999em',
            },
            '@font-face /* zero */': {
                'font-family': 'MJX-ZERO',
                src: ZeroFontDataUrl,
            },
        },
        _a;
})();
//# sourceMappingURL=math.js.map