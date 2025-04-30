import { ChtmlWrapper } from '../Wrapper.js';
import { CommonMfracMixin, } from '../../common/Wrappers/mfrac.js';
import { MmlMfrac } from '../../../core/MmlTree/MmlNodes/mfrac.js';
export const ChtmlMfrac = (function () {
    var _a;
    const Base = CommonMfracMixin(ChtmlWrapper);
    return _a = class ChtmlMfrac extends Base {
            toCHTML(parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                this.standardChtmlNodes(parents);
                const { linethickness, bevelled } = this.node.attributes.getList('linethickness', 'bevelled');
                const display = this.isDisplay();
                if (bevelled) {
                    this.makeBevelled(display);
                }
                else {
                    const thickness = this.length2em(String(linethickness), 0.06);
                    if (thickness === 0) {
                        this.makeAtop(display);
                    }
                    else {
                        this.makeFraction(display, thickness);
                    }
                }
            }
            makeFraction(display, t) {
                const { numalign, denomalign } = this.node.attributes.getList('numalign', 'denomalign');
                const withDelims = this.node.getProperty('withDelims');
                const attr = (display ? { type: 'd' } : {});
                const fattr = (withDelims ? Object.assign(Object.assign({}, attr), { delims: 'true' }) : Object.assign({}, attr));
                const nattr = (numalign !== 'center' ? { align: numalign } : {});
                const dattr = (denomalign !== 'center' ? { align: denomalign } : {});
                const dsattr = Object.assign({}, attr), nsattr = Object.assign({}, attr);
                const tex = this.font.params;
                if (t !== 0.06) {
                    const a = tex.axis_height;
                    const r = this.font.params.rule_factor;
                    const tEm = this.em(t);
                    const { T, u, v } = this.getTUV(display, t);
                    const m = (display ? this.em(3 * t) : tEm) + ' -.1em';
                    attr.style = {
                        height: tEm,
                        'border-top': this.em(t * r) + ' solid',
                        margin: m,
                    };
                    const nh = this.em(Math.max(0, u));
                    nsattr.style = { height: nh, 'vertical-align': '-' + nh };
                    dsattr.style = { height: this.em(Math.max(0, v)) };
                    fattr.style = { 'vertical-align': this.em(a - T) };
                }
                let num, den;
                this.adaptor.append(this.dom[0], this.html('mjx-frac', fattr, [
                    (num = this.html('mjx-num', nattr, [
                        this.html('mjx-nstrut', nsattr),
                    ])),
                    this.html('mjx-dbox', {}, [
                        this.html('mjx-dtable', {}, [
                            this.html('mjx-line', attr),
                            this.html('mjx-row', {}, [
                                (den = this.html('mjx-den', dattr, [
                                    this.html('mjx-dstrut', dsattr),
                                ])),
                            ]),
                        ]),
                    ]),
                ]));
                this.childNodes[0].toCHTML([num]);
                this.childNodes[1].toCHTML([den]);
            }
            makeAtop(display) {
                const { numalign, denomalign } = this.node.attributes.getList('numalign', 'denomalign');
                const withDelims = this.node.getProperty('withDelims');
                const attr = (display ? { type: 'd', atop: true } : { atop: true });
                const fattr = (withDelims ? Object.assign(Object.assign({}, attr), { delims: true }) : Object.assign({}, attr));
                const nattr = (numalign !== 'center' ? { align: numalign } : {});
                const dattr = (denomalign !== 'center' ? { align: denomalign } : {});
                const { v, q } = this.getUVQ(display);
                nattr.style = { 'padding-bottom': this.em(q) };
                fattr.style = { 'vertical-align': this.em(-v) };
                let num, den;
                this.adaptor.append(this.dom[0], this.html('mjx-frac', fattr, [
                    (num = this.html('mjx-num', nattr)),
                    (den = this.html('mjx-den', dattr)),
                ]));
                this.childNodes[0].toCHTML([num]);
                this.childNodes[1].toCHTML([den]);
            }
            makeBevelled(display) {
                const adaptor = this.adaptor;
                adaptor.setAttribute(this.dom[0], 'bevelled', 'ture');
                const num = adaptor.append(this.dom[0], this.html('mjx-num'));
                this.childNodes[0].toCHTML([num]);
                this.bevel.toCHTML(this.dom);
                const den = adaptor.append(this.dom[0], this.html('mjx-den'));
                this.childNodes[1].toCHTML([den]);
                const { u, v, delta, nbox, dbox } = this.getBevelData(display);
                if (u) {
                    adaptor.setStyle(num, 'verticalAlign', this.em(u / nbox.scale));
                }
                if (v) {
                    adaptor.setStyle(den, 'verticalAlign', this.em(v / dbox.scale));
                }
                const dx = this.em(-delta / 2);
                adaptor.setStyle(this.bevel.dom[0], 'marginLeft', dx);
                adaptor.setStyle(this.bevel.dom[0], 'marginRight', dx);
            }
        },
        _a.kind = MmlMfrac.prototype.kind,
        _a.styles = {
            'mjx-frac': {
                display: 'inline-block',
                'vertical-align': '0.17em',
                padding: '0 .22em'
            },
            'mjx-frac[type="d"]': {
                'vertical-align': '.04em'
            },
            'mjx-frac[delims]': {
                padding: '0 .1em'
            },
            'mjx-frac[atop]': {
                padding: '0 .12em'
            },
            'mjx-frac[atop][delims]': {
                padding: '0'
            },
            'mjx-dtable': {
                display: 'inline-table',
                width: '100%'
            },
            'mjx-dtable > *': {
                'font-size': '2000%'
            },
            'mjx-dbox': {
                display: 'block',
                'font-size': '5%'
            },
            'mjx-num': {
                display: 'block',
                'text-align': 'center'
            },
            'mjx-den': {
                display: 'block',
                'text-align': 'center'
            },
            'mjx-mfrac[bevelled] > mjx-num': {
                display: 'inline-block'
            },
            'mjx-mfrac[bevelled] > mjx-den': {
                display: 'inline-block'
            },
            'mjx-den[align="right"], mjx-num[align="right"]': {
                'text-align': 'right'
            },
            'mjx-den[align="left"], mjx-num[align="left"]': {
                'text-align': 'left'
            },
            'mjx-nstrut': {
                display: 'inline-block',
                height: '.054em',
                width: 0,
                'vertical-align': '-.054em'
            },
            'mjx-nstrut[type="d"]': {
                height: '.217em',
                'vertical-align': '-.217em',
            },
            'mjx-dstrut': {
                display: 'inline-block',
                height: '.505em',
                width: 0
            },
            'mjx-dstrut[type="d"]': {
                height: '.726em',
            },
            'mjx-line': {
                display: 'block',
                'box-sizing': 'border-box',
                'min-height': '1px',
                height: '.06em',
                'border-top': '.075em solid',
                margin: '.06em -.1em',
                overflow: 'hidden'
            },
            'mjx-line[type="d"]': {
                margin: '.18em -.1em'
            }
        },
        _a;
})();
//# sourceMappingURL=mfrac.js.map