import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMoMixin, DirectionVH } from '../../common/Wrappers/mo.js';
import { MmlMo } from '../../../core/MmlTree/MmlNodes/mo.js';
export const ChtmlMo = (function () {
    var _a;
    const Base = CommonMoMixin(ChtmlWrapper);
    return _a = class ChtmlMo extends Base {
            toCHTML(parents) {
                const adaptor = this.adaptor;
                const attributes = this.node.attributes;
                const symmetric = attributes.get('symmetric') && this.stretch.dir !== 2;
                const stretchy = this.stretch.dir !== 0;
                if (stretchy && this.size === null) {
                    this.getStretchedVariant([]);
                }
                parents.length > 1 && parents.forEach(dom => adaptor.append(dom, this.html('mjx-linestrut')));
                let chtml = this.standardChtmlNodes(parents);
                if (chtml.length > 1 && this.breakStyle !== 'duplicate') {
                    const i = (this.breakStyle === 'after' ? 1 : 0);
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
                            chtml.forEach(dom => dom && adaptor.setStyle(dom, 'verticalAlign', u));
                        }
                    }
                    if (this.node.getProperty('mathaccent')) {
                        chtml.forEach(dom => {
                            adaptor.setStyle(dom, 'width', '0');
                            adaptor.setStyle(dom, 'margin-left', this.em(this.getAccentOffset()));
                        });
                    }
                    chtml[0] && this.addChildren([chtml[0]]);
                    chtml[1] && (this.multChar || this).addChildren([chtml[1]]);
                }
            }
            stretchHTML(chtml) {
                const c = this.getText().codePointAt(0);
                this.font.delimUsage.add(c);
                this.childNodes[0].markUsed();
                const delim = this.stretch;
                const stretch = delim.stretch;
                const stretchv = this.font.getStretchVariants(c);
                const content = [];
                this.createPart('mjx-beg', stretch[0], stretchv[0], content);
                this.createPart('mjx-ext', stretch[1], stretchv[1], content);
                if (stretch.length === 4) {
                    this.createPart('mjx-mid', stretch[3], stretchv[3], content);
                    this.createPart('mjx-ext', stretch[1], stretchv[1], content);
                }
                this.createPart('mjx-end', stretch[2], stretchv[2], content);
                const styles = {};
                const { h, d, w } = this.bbox;
                if (delim.dir === 1) {
                    content.push(this.html('mjx-mark'));
                    styles.height = this.em(h + d);
                    styles.verticalAlign = this.em(-d);
                }
                else {
                    styles.width = this.em(w);
                }
                const dir = DirectionVH[delim.dir];
                const properties = { class: this.char(delim.c || c), style: styles };
                const html = this.html('mjx-stretchy-' + dir, properties, content);
                const adaptor = this.adaptor;
                chtml[0] && adaptor.append(chtml[0], html);
                chtml[1] && adaptor.append(chtml[1], chtml[0] ? adaptor.clone(html) : html);
            }
            createPart(part, n, v, content) {
                if (n) {
                    const options = this.font.getChar(v, n)[3];
                    const letter = options.f || (v === 'normal' ? '' : this.font.getVariant(v).letter);
                    const font = options.ff || (letter ? `${this.font.cssFontPrefix}-${letter}` : '');
                    let c = (options.c || String.fromCodePoint(n))
                        .replace(/\\[0-9A-F]+/ig, (x) => String.fromCodePoint(parseInt(x.substr(1), 16)));
                    content.push(this.html(part, {}, [
                        this.html('mjx-c', font ? { class: font } : {}, [this.text(c)])
                    ]));
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
                width: 0
            },
            'mjx-stretchy-h > mjx-ext': {
                '/* IE */ overflow': 'hidden',
                '/* others */ overflow': 'clip visible',
                width: '100%',
                border: '0px solid transparent',
                'box-sizing': 'border-box',
                'text-align': 'center'
            },
            'mjx-stretchy-h > mjx-ext > mjx-c': {
                transform: 'scalex(500)',
                width: 0
            },
            'mjx-stretchy-v': {
                display: 'inline-block',
                'text-align': 'center'
            },
            'mjx-stretchy-v > *': {
                display: 'block',
                height: 0
            },
            'mjx-stretchy-v > mjx-ext': {
                '/* IE */ overflow': 'hidden',
                '/* others */ overflow': 'visible clip',
                height: '100%',
                border: '0px solid transparent',
                'box-sizing': 'border-box'
            },
            'mjx-mark': {
                display: 'inline-block',
                height: 0
            }
        },
        _a;
})();
//# sourceMappingURL=mo.js.map