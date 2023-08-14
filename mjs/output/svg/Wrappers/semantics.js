import { SvgWrapper } from '../Wrapper.js';
import { CommonSemanticsMixin } from '../../common/Wrappers/semantics.js';
import { MmlSemantics, MmlAnnotation, MmlAnnotationXML } from '../../../core/MmlTree/MmlNodes/semantics.js';
import { XMLNode } from '../../../core/MmlTree/MmlNode.js';
export const SvgSemantics = (function () {
    var _a;
    const Base = CommonSemanticsMixin(SvgWrapper);
    return _a = class SvgSemantics extends Base {
            toSVG(parents) {
                if (this.toEmbellishedSVG(parents))
                    return;
                const svg = this.standardSvgNodes(parents);
                if (this.childNodes.length) {
                    this.childNodes[0].toSVG(svg);
                }
            }
        },
        _a.kind = MmlSemantics.prototype.kind,
        _a;
})();
export const SvgAnnotation = (function () {
    var _a;
    return _a = class SvgAnnotation extends SvgWrapper {
            toSVG(parents) {
                super.toSVG(parents);
            }
            computeBBox() {
                return this.bbox;
            }
        },
        _a.kind = MmlAnnotation.prototype.kind,
        _a;
})();
export const SvgAnnotationXML = (function () {
    var _a;
    return _a = class SvgAnnotationXML extends SvgWrapper {
        },
        _a.kind = MmlAnnotationXML.prototype.kind,
        _a.styles = {
            'foreignObject[data-mjx-xml]': {
                'font-family': 'initial',
                'line-height': 'normal',
                overflow: 'visible'
            }
        },
        _a;
})();
export const SvgXmlNode = (function () {
    var _a;
    return _a = class SvgXmlNode extends SvgWrapper {
            toSVG(parents) {
                const xml = this.adaptor.clone(this.node.getXML());
                const em = this.jax.math.metrics.em * this.jax.math.metrics.scale;
                const scale = this.fixed(1 / em);
                const { w, h, d } = this.getBBox();
                this.dom = [this.adaptor.append(parents[0], this.svg('foreignObject', {
                        'data-mjx-xml': true,
                        y: this.jax.fixed(-h * em) + 'px',
                        width: this.jax.fixed(w * em) + 'px',
                        height: this.jax.fixed((h + d) * em) + 'px',
                        transform: `scale(${scale}) matrix(1 0 0 -1 0 0)`
                    }, [xml]))];
            }
            computeBBox(bbox, _recompute = false) {
                const { w, h, d } = this.jax.measureXMLnode(this.node.getXML());
                bbox.w = w;
                bbox.h = h;
                bbox.d = d;
            }
            getStyles() { }
            getScale() { }
            getVariant() { }
        },
        _a.kind = XMLNode.prototype.kind,
        _a.autoStyle = false,
        _a;
})();
//# sourceMappingURL=semantics.js.map