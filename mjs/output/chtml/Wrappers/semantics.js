import { ChtmlWrapper } from '../Wrapper.js';
import { CommonSemanticsMixin } from '../../common/Wrappers/semantics.js';
import { MmlSemantics, MmlAnnotation, MmlAnnotationXML } from '../../../core/MmlTree/MmlNodes/semantics.js';
import { XMLNode } from '../../../core/MmlTree/MmlNode.js';
export const ChtmlSemantics = (function () {
    var _a;
    const Base = CommonSemanticsMixin(ChtmlWrapper);
    return _a = class ChtmlSemantics extends Base {
            toCHTML(parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                const chtml = this.standardChtmlNodes(parents);
                if (this.childNodes.length) {
                    this.childNodes[0].toCHTML(chtml);
                }
            }
        },
        _a.kind = MmlSemantics.prototype.kind,
        _a;
})();
export const ChtmlAnnotation = (function () {
    var _a;
    return _a = class ChtmlAnnotation extends ChtmlWrapper {
            toCHTML(parents) {
                super.toCHTML(parents);
            }
            computeBBox() {
                return this.bbox;
            }
        },
        _a.kind = MmlAnnotation.prototype.kind,
        _a;
})();
export const ChtmlAnnotationXML = (function () {
    var _a;
    return _a = class ChtmlAnnotationXML extends ChtmlWrapper {
        },
        _a.kind = MmlAnnotationXML.prototype.kind,
        _a.styles = {
            'mjx-annotation-xml': {
                'font-family': 'initial',
                'line-height': 'normal'
            }
        },
        _a;
})();
export const ChtmlXmlNode = (function () {
    var _a;
    return _a = class ChtmlXmlNode extends ChtmlWrapper {
            toCHTML(parents) {
                this.dom = [this.adaptor.append(parents[0], this.adaptor.clone(this.node.getXML()))];
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