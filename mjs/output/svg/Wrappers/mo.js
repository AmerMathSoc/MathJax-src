import { SvgWrapper } from '../Wrapper.js';
import { CommonMoMixin } from '../../common/Wrappers/mo.js';
import { MmlMo } from '../../../core/MmlTree/MmlNodes/mo.js';
const VFUZZ = 0.1;
const HFUZZ = 0.1;
export const SvgMo = (function () {
    var _a;
    const Base = CommonMoMixin(SvgWrapper);
    return _a = class SvgMo extends Base {
            toSVG(parents) {
                const attributes = this.node.attributes;
                const symmetric = attributes.get('symmetric') && this.stretch.dir !== 2;
                const stretchy = this.stretch.dir !== 0;
                if (stretchy && this.size === null) {
                    this.getStretchedVariant([]);
                }
                let svg = this.standardSvgNodes(parents);
                if (svg.length > 1 && this.breakStyle !== 'duplicate') {
                    const i = (this.breakStyle === 'after' ? 1 : 0);
                    this.adaptor.remove(svg[i]);
                    svg[i] = null;
                }
                if (stretchy && this.size < 0) {
                    this.stretchSvg();
                }
                else {
                    const u = (symmetric || attributes.get('largeop') ? this.fixed(this.getCenterOffset()) : '0');
                    const v = (this.node.getProperty('mathaccent') ? this.fixed(this.getAccentOffset()) : '0');
                    if (u !== '0' || v !== '0') {
                        svg[0] && this.adaptor.setAttribute(svg[0], 'transform', `translate(${v} ${u})`);
                        svg[1] && this.adaptor.setAttribute(svg[1], 'transform', `translate(${v} ${u})`);
                    }
                    svg[0] && this.addChildren([svg[0]]);
                    svg[1] && (this.multChar || this).addChildren([svg[1]]);
                }
            }
            stretchSvg() {
                const stretch = this.stretch.stretch;
                const variants = this.getStretchVariants();
                const bbox = this.getBBox();
                if (this.stretch.dir === 1) {
                    this.stretchVertical(stretch, variants, bbox);
                }
                else {
                    this.stretchHorizontal(stretch, variants, bbox);
                }
            }
            getStretchVariants() {
                const c = this.stretch.c || this.getText().codePointAt(0);
                const variants = [];
                for (const i of this.stretch.stretch.keys()) {
                    variants[i] = this.font.getStretchVariant(c, i);
                }
                return variants;
            }
            stretchVertical(stretch, variant, bbox) {
                const { h, d, w } = bbox;
                const T = this.addTop(stretch[0], variant[0], h, w);
                const B = this.addBot(stretch[2], variant[2], d, w);
                if (stretch.length === 4) {
                    const [H, D] = this.addMidV(stretch[3], variant[3], w);
                    this.addExtV(stretch[1], variant[1], h, -H, T, 0, w);
                    this.addExtV(stretch[1], variant[1], -D, d, 0, B, w);
                }
                else {
                    this.addExtV(stretch[1], variant[1], h, d, T, B, w);
                }
            }
            stretchHorizontal(stretch, variant, bbox) {
                const w = bbox.w;
                const L = this.addLeft(stretch[0], variant[0]);
                const R = this.addRight(stretch[2], variant[2], w);
                if (stretch.length === 4) {
                    const [x1, x2] = this.addMidH(stretch[3], variant[3], w);
                    const w2 = w / 2;
                    this.addExtH(stretch[1], variant[1], w2, L, w2 - x1);
                    this.addExtH(stretch[1], variant[1], w2, x2 - w2, R, w2);
                }
                else {
                    this.addExtH(stretch[1], variant[1], w, L, R);
                }
            }
            getChar(n, variant) {
                const char = this.font.getChar(variant, n) || [0, 0, 0, null];
                return [char[0], char[1], char[2], char[3] || {}];
            }
            addGlyph(n, variant, x, y, parent = null) {
                if (parent) {
                    return this.placeChar(n, x, y, parent, variant);
                }
                if (this.dom[0]) {
                    const dx = this.placeChar(n, x, y, this.dom[0], variant);
                    if (!this.dom[1]) {
                        return dx;
                    }
                }
                return this.placeChar(n, x, y, this.dom[1], variant);
            }
            addTop(n, v, H, W) {
                if (!n)
                    return 0;
                const [h, d, w] = this.getChar(n, v);
                this.addGlyph(n, v, (W - w) / 2, H - h);
                return h + d;
            }
            addExtV(n, v, H, D, T, B, W) {
                if (!n)
                    return;
                T = Math.max(0, T - VFUZZ);
                B = Math.max(0, B - VFUZZ);
                const adaptor = this.adaptor;
                const [h, d, w] = this.getChar(n, v);
                const Y = H + D - T - B;
                const s = 1.5 * Y / (h + d);
                const y = (s * (h - d) - Y) / 2;
                if (Y <= 0)
                    return;
                const svg = this.svg('svg', {
                    width: this.fixed(w), height: this.fixed(Y),
                    y: this.fixed(B - D), x: this.fixed((W - w) / 2),
                    viewBox: [0, y, w, Y].map(x => this.fixed(x)).join(' ')
                });
                this.addGlyph(n, v, 0, 0, svg);
                const glyph = adaptor.lastChild(svg);
                adaptor.setAttribute(glyph, 'transform', `scale(1,${this.jax.fixed(s)})`);
                if (this.dom[0]) {
                    adaptor.append(this.dom[0], svg);
                }
                if (this.dom[1]) {
                    adaptor.append(this.dom[1], this.dom[0] ? adaptor.clone(svg) : svg);
                }
            }
            addBot(n, v, D, W) {
                if (!n)
                    return 0;
                const [h, d, w] = this.getChar(n, v);
                this.addGlyph(n, v, (W - w) / 2, d - D);
                return h + d;
            }
            addMidV(n, v, W) {
                if (!n)
                    return [0, 0];
                const [h, d, w] = this.getChar(n, v);
                const y = (d - h) / 2 + this.font.params.axis_height;
                this.addGlyph(n, v, (W - w) / 2, y);
                return [h + y, d - y];
            }
            addLeft(n, v) {
                return (n ? this.addGlyph(n, v, 0, 0) : 0);
            }
            addExtH(n, v, W, L, R, x = 0) {
                if (!n)
                    return;
                R = Math.max(0, R - HFUZZ);
                L = Math.max(0, L - HFUZZ);
                const adaptor = this.adaptor;
                const [h, d, w] = this.getChar(n, v);
                const X = W - L - R;
                const Y = h + d + 2 * VFUZZ;
                const s = 1.5 * (X / w);
                const D = -(d + VFUZZ);
                if (X <= 0)
                    return;
                const svg = this.svg('svg', {
                    width: this.fixed(X), height: this.fixed(Y),
                    x: this.fixed(x + L), y: this.fixed(D),
                    viewBox: [(s * w - X) / 2, D, X, Y].map(x => this.fixed(x)).join(' ')
                });
                this.addGlyph(n, v, 0, 0, svg);
                const glyph = adaptor.lastChild(svg);
                adaptor.setAttribute(glyph, 'transform', 'scale(' + this.jax.fixed(s) + ',1)');
                if (this.dom[0]) {
                    adaptor.append(this.dom[0], svg);
                }
                if (this.dom[1]) {
                    adaptor.append(this.dom[1], this.dom[0] ? adaptor.clone(svg) : svg);
                }
            }
            addRight(n, v, W) {
                if (!n)
                    return 0;
                const w = this.getChar(n, v)[2];
                return this.addGlyph(n, v, W - w, 0);
            }
            addMidH(n, v, W) {
                if (!n)
                    return [0, 0];
                const w = this.getChar(n, v)[2];
                this.addGlyph(n, v, (W - w) / 2, 0);
                return [(W - w) / 2, (W + w) / 2];
            }
        },
        _a.kind = MmlMo.prototype.kind,
        _a;
})();
//# sourceMappingURL=mo.js.map