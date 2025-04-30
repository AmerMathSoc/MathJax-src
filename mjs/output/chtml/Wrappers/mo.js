import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMoMixin, } from '../../common/Wrappers/mo.js';
import { MmlMo } from '../../../core/MmlTree/MmlNodes/mo.js';
import { DIRECTION } from '../FontData.js';
export const ChtmlMo = (function () {
    var _a;
    const Base = CommonMoMixin(ChtmlWrapper);
    return _a = class ChtmlMo extends Base {
            toCHTML(parents) {
                const adaptor = this.adaptor;
                const attributes = this.node.attributes;
                const symmetric = attributes.get('symmetric') &&
                    this.stretch.dir !== DIRECTION.Horizontal;
                const stretchy = this.stretch.dir !== DIRECTION.None;
                if (stretchy && this.size === null) {
                    this.getStretchedVariant([]);
                }
                if (parents.length > 1) {
                    parents.forEach((dom) => adaptor.append(dom, this.html('mjx-linestrut')));
                }
                const chtml = this.standardChtmlNodes(parents);
                if (chtml.length > 1 && this.breakStyle !== 'duplicate') {
                    const i = this.breakStyle === 'after' ? 1 : 0;
                    adaptor.remove(chtml[i]);
                    chtml[i] = null;
                }
                if (stretchy && this.size < 0) {
                    this.stretchHTML(chtml);
                }
                else {
                    if (symmetric || attributes.get('largeop')) {
                        const u = this.em(this.getCenterOffset());
                        if (u !== '0') {
                            chtml.forEach((dom) => dom && adaptor.setStyle(dom, 'verticalAlign', u));
                        }
                    }
                    if (this.node.getProperty('mathaccent')) {
                        chtml.forEach((dom) => {
                            adaptor.setStyle(dom, 'width', '0');
                            adaptor.setStyle(dom, 'margin-left', this.em(this.getAccentOffset()));
                        });
                    }
                    if (chtml[0]) {
                        this.addChildren([chtml[0]]);
                    }
                    if (chtml[1]) {
                        (this.multChar || this).addChildren([chtml[1]]);
                    }
                }
            }
            stretchHTML(chtml) {
                const c = this.getText().codePointAt(0);
                this.font.delimUsage.add(c);
                this.childNodes[0].markUsed();
                const delim = this.stretch;
                const stretch = delim.stretch;
                const stretchv = this.font.getStretchVariants(c);
                const dom = [];
                const parts = [];
                for (let i = 0; i < stretch.length; i++) {
                    if (stretch[i]) {
                        parts[i] = this.font.getChar(stretchv[i], stretch[i]);
                    }
                }
                const { h, d, w } = this.bbox;
                const styles = {};
                if (delim.dir === DIRECTION.Vertical) {
                    this.createAssembly(parts, stretch, stretchv, dom, h + d, 0.05, '\n');
                    dom.push(this.html('mjx-mark'));
                    styles.height = this.em(h + d);
                    styles.verticalAlign = this.em(-d);
                }
                else {
                    this.createAssembly(parts, stretch, stretchv, dom, w, delim.ext || 0);
                    styles.width = this.em(w);
                }
                const properties = { class: this.char(delim.c || c), style: styles };
                const html = this.html('mjx-stretchy-' + delim.dir, properties, dom);
                const adaptor = this.adaptor;
                if (chtml[0]) {
                    adaptor.append(chtml[0], html);
                }
                if (chtml[1]) {
                    adaptor.append(chtml[1], chtml[0] ? adaptor.clone(html) : html);
                }
            }
            createAssembly(parts, sn, sv, dom, wh, ext, nl = '') {
                parts = [...parts, null, null, null].slice(0, 4);
                let [WHb, WHx, WHe, WHm] = parts.map((part) => part ? (nl ? part[0] + part[1] : part[2]) : 0);
                WHx = Math.max(0, WHx - ext);
                const [WH1, WH2] = parts[3]
                    ? [(wh - WHm) / 2 - WHb, (wh - WHm) / 2 - WHe]
                    : [wh - WHb - WHe, 0];
                this.createPart('mjx-beg', parts[0], sn[0], sv[0], dom);
                this.createPart('mjx-ext', parts[1], sn[1], sv[1], dom, WH1, WHx, nl);
                if (parts[3]) {
                    this.createPart('mjx-mid', parts[3], sn[3], sv[3], dom);
                    this.createPart('mjx-ext', parts[1], sn[1], sv[1], dom, WH2, WHx, nl);
                }
                this.createPart('mjx-end', parts[2], sn[2], sv[2], dom);
            }
            createPart(part, data, n, v, dom, W = 0, Wx = 0, nl = '') {
                if (n) {
                    const options = data[3];
                    const letter = options.f || (v === 'normal' ? '' : this.font.getVariant(v).letter);
                    const font = options.ff || (letter ? `${this.font.cssFontPrefix}-${letter}` : '');
                    const c = options.c || String.fromCodePoint(n);
                    let nodes = [];
                    if (part === 'mjx-ext' && (Wx || options.dx)) {
                        if (!Wx) {
                            Wx = Math.max(0.06, 2 * options.dx - 0.06);
                        }
                        const n = Math.min(Math.ceil(W / Wx) + 1, 500);
                        if (options.cmb) {
                            nodes.push(this.html('mjx-spacer'));
                            for (let i = 0; i < n; i++) {
                                nodes.push(this.html('mjx-c', {}, [this.text(c)]));
                            }
                        }
                        else {
                            nodes = [
                                this.html('mjx-spacer', {}, [
                                    this.text(Array(n).fill(c).join(nl)),
                                ]),
                            ];
                        }
                    }
                    else {
                        nodes = [this.text(c)];
                    }
                    dom.push(this.html(part, font ? { class: font } : {}, nodes));
                }
            }
        },
        _a.kind = MmlMo.prototype.kind,
        _a.styles = {
            'mjx-stretchy-h': {
                display: 'inline-block',
            },
            'mjx-stretchy-h > *': {
                display: 'inline-block',
                width: 0,
                'text-align': 'right',
            },
            'mjx-stretchy-h > mjx-ext': {
                'clip-path': 'padding-box xywh(0 -1em 100% calc(100% + 2em))',
                width: '100%',
                border: '0px solid transparent',
                'box-sizing': 'border-box',
                'text-align': 'left',
            },
            'mjx-stretchy-v': {
                display: 'inline-block',
                'text-align': 'center',
            },
            'mjx-stretchy-v > *': {
                display: 'block',
                height: 0,
                margin: '0 auto',
            },
            'mjx-stretchy-v > mjx-ext > mjx-spacer': {
                display: 'block',
            },
            'mjx-stretchy-v > mjx-ext': {
                'clip-path': 'padding-box xywh(-1em 0 calc(100% + 2em) 100%)',
                height: '100%',
                border: '0.1px solid transparent',
                'box-sizing': 'border-box',
                'white-space': 'wrap',
            },
            'mjx-mark': {
                display: 'inline-block',
                height: 0,
            },
        },
        _a;
})();
//# sourceMappingURL=mo.js.map