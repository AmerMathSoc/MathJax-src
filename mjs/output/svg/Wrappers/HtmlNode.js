import { SvgWrapper } from '../Wrapper.js';
import { CommonHtmlNodeMixin } from '../../common/Wrappers/HtmlNode.js';
import { HtmlNode } from '../../../core/MmlTree/MmlNodes/HtmlNode.js';
export const SvgHtmlNode = (function () {
    var _a;
    const Base = CommonHtmlNodeMixin(SvgWrapper);
    return _a = class SvgHtmlNode extends Base {
            toSVG(parents) {
                const metrics = this.jax.math.metrics;
                const em = metrics.em * metrics.scale;
                const scale = this.fixed(1 / em);
                const { w, h, d } = this.getBBox();
                this.dom = [this.adaptor.append(parents[0], this.svg('foreignObject', {
                        'data-mjx-html': true,
                        y: this.jax.fixed(-h * em) + 'px',
                        width: this.jax.fixed(w * em) + 'px',
                        height: this.jax.fixed((h + d) * em) + 'px',
                        transform: `scale(${scale}) matrix(1 0 0 -1 0 0)`
                    }, [this.getHTML()]))];
            }
        },
        _a.kind = HtmlNode.prototype.kind,
        _a.styles = {
            'foreignObject[data-mjx-html]': {
                overflow: 'visible'
            },
            'mjx-html': {
                display: 'inline-block',
                'line-height': 'normal',
                'text-align': 'initial',
            },
            'mjx-html-holder': {
                display: 'block',
                position: 'absolute',
                width: '100%',
                height: '100%'
            }
        },
        _a;
})();
//# sourceMappingURL=HtmlNode.js.map