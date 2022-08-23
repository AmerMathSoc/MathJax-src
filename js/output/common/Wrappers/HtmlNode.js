"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonHtmlNodeMixin = void 0;
var string_js_1 = require("../../../util/string.js");
function CommonHtmlNodeMixin(Base) {
    return (function (_super) {
        __extends(CommonHtmlNodeMixin, _super);
        function CommonHtmlNodeMixin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CommonHtmlNodeMixin.prototype.computeBBox = function (bbox, _recompute) {
            if (_recompute === void 0) { _recompute = false; }
            var hdw = this.getHDW(this.node.getHTML(), 'use', 'force');
            var _a = (hdw ? this.splitHDW(hdw) : this.jax.measureXMLnode(this.getHTML())), h = _a.h, d = _a.d, w = _a.w;
            bbox.w = w;
            bbox.h = h;
            bbox.d = d;
        };
        CommonHtmlNodeMixin.prototype.getHTML = function () {
            var _a;
            var adaptor = this.adaptor;
            var jax = this.jax;
            var styles = {};
            var html = this.addHDW(adaptor.clone(this.node.getHTML()), styles);
            var metrics = jax.math.metrics;
            if (metrics.scale !== 1) {
                styles['font-size'] = jax.fixed(100 / metrics.scale, 1) + '%';
            }
            var parent = adaptor.parent(jax.math.start.node);
            styles['font-family'] = ((_a = this.parent.styles) === null || _a === void 0 ? void 0 : _a.get('font-family')) ||
                metrics.family || adaptor.fontFamily(parent) || 'initial';
            return this.html('mjx-html', { variant: this.parent.variant, style: styles }, [html]);
        };
        CommonHtmlNodeMixin.prototype.addHDW = function (html, styles) {
            var hdw = this.getHDW(html, 'force');
            if (!hdw)
                return html;
            var _a = this.splitHDW(hdw), h = _a.h, d = _a.d, w = _a.w;
            styles.height = this.em(h + d);
            styles.width = this.em(w);
            styles['vertical-align'] = this.em(-d);
            styles.position = 'relative';
            return this.html('mjx-html-holder', {}, [html]);
        };
        CommonHtmlNodeMixin.prototype.getHDW = function (html, use, force) {
            if (force === void 0) { force = use; }
            var option = this.jax.options.htmlHDW;
            var hdw = this.adaptor.getAttribute(html, 'data-mjx-hdw');
            return (hdw && (option === use || option === force) ? hdw : null);
        };
        CommonHtmlNodeMixin.prototype.splitHDW = function (hdw) {
            var _this = this;
            var _a = __read((0, string_js_1.split)(hdw).map(function (x) { return _this.length2em(x || '0'); }), 3), h = _a[0], d = _a[1], w = _a[2];
            return { h: h, d: d, w: w };
        };
        CommonHtmlNodeMixin.prototype.getStyles = function () { };
        CommonHtmlNodeMixin.prototype.getScale = function () { };
        CommonHtmlNodeMixin.prototype.getVariant = function () { };
        return CommonHtmlNodeMixin;
    }(Base));
}
exports.CommonHtmlNodeMixin = CommonHtmlNodeMixin;
//# sourceMappingURL=HtmlNode.js.map