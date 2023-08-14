import { split } from '../../../util/string.js';
export function CommonHtmlNodeMixin(Base) {
    return class CommonHtmlNodeMixin extends Base {
        computeBBox(bbox, _recompute = false) {
            const hdw = this.getHDW(this.node.getHTML(), 'use', 'force');
            const { h, d, w } = (hdw ? this.splitHDW(hdw) : this.jax.measureXMLnode(this.getHTML()));
            bbox.w = w;
            bbox.h = h;
            bbox.d = d;
        }
        getHTML() {
            var _a;
            const adaptor = this.adaptor;
            const jax = this.jax;
            const styles = {};
            const html = this.addHDW(adaptor.clone(this.node.getHTML()), styles);
            const metrics = jax.math.metrics;
            if (metrics.scale !== 1) {
                styles['font-size'] = jax.fixed(100 / metrics.scale, 1) + '%';
            }
            const parent = adaptor.parent(jax.math.start.node);
            styles['font-family'] = ((_a = this.parent.styles) === null || _a === void 0 ? void 0 : _a.get('font-family')) ||
                metrics.family || adaptor.fontFamily(parent) || 'initial';
            return this.html('mjx-html', { variant: this.parent.variant, style: styles }, [html]);
        }
        addHDW(html, styles) {
            const hdw = this.getHDW(html, 'force');
            if (!hdw)
                return html;
            const { h, d, w } = this.splitHDW(hdw);
            styles.height = this.em(h + d);
            styles.width = this.em(w);
            styles['vertical-align'] = this.em(-d);
            styles.position = 'relative';
            return this.html('mjx-html-holder', {}, [html]);
        }
        getHDW(html, use, force = use) {
            const option = this.jax.options.htmlHDW;
            const hdw = this.adaptor.getAttribute(html, 'data-mjx-hdw');
            return (hdw && (option === use || option === force) ? hdw : null);
        }
        splitHDW(hdw) {
            const [h, d, w] = split(hdw).map(x => this.length2em(x || '0'));
            return { h, d, w };
        }
        getStyles() { }
        getScale() { }
        getVariant() { }
    };
}
//# sourceMappingURL=HtmlNode.js.map