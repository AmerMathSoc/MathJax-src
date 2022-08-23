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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
exports.ChtmlWrapper = exports.FONTSIZE = void 0;
var Wrapper_js_1 = require("../common/Wrapper.js");
var BBox_js_1 = require("../../util/BBox.js");
exports.FONTSIZE = {
    '70.7%': 's',
    '70%': 's',
    '50%': 'ss',
    '60%': 'Tn',
    '85%': 'sm',
    '120%': 'lg',
    '144%': 'Lg',
    '173%': 'LG',
    '207%': 'hg',
    '249%': 'HG'
};
var ChtmlWrapper = (function (_super) {
    __extends(ChtmlWrapper, _super);
    function ChtmlWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChtmlWrapper.prototype.toCHTML = function (parents) {
        if (this.toEmbellishedCHTML(parents))
            return;
        this.addChildren(this.standardChtmlNodes(parents));
    };
    ChtmlWrapper.prototype.toEmbellishedCHTML = function (parents) {
        var e_1, _a;
        var _this = this;
        if (parents.length <= 1 || !this.node.isEmbellished)
            return false;
        var adaptor = this.adaptor;
        parents.forEach(function (dom) { return adaptor.append(dom, _this.html('mjx-linestrut')); });
        var style = this.coreMO().embellishedBreakStyle;
        var dom = [];
        try {
            for (var _b = __values([[parents[0], 'before'], [parents[1], 'after']]), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), parent_1 = _d[0], STYLE = _d[1];
                if (style !== STYLE) {
                    this.toCHTML([parent_1]);
                    dom.push(this.dom[0]);
                    STYLE === 'after' && adaptor.removeAttribute(this.dom[0], 'space');
                }
                else {
                    dom.push(this.createChtmlNodes([parent_1])[0]);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.dom = dom;
        return true;
    };
    ChtmlWrapper.prototype.addChildren = function (parents) {
        var e_2, _a;
        try {
            for (var _b = __values(this.childNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child.toCHTML(parents);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    ChtmlWrapper.prototype.standardChtmlNodes = function (parents) {
        this.markUsed();
        var chtml = this.createChtmlNodes(parents);
        this.handleStyles();
        this.handleVariant();
        this.handleScale();
        this.handleBorders();
        this.handleColor();
        this.handleSpace();
        this.handleAttributes();
        this.handlePWidth();
        return chtml;
    };
    ChtmlWrapper.prototype.markUsed = function () {
        this.jax.wrapperUsage.add(this.kind);
    };
    ChtmlWrapper.prototype.createChtmlNodes = function (parents) {
        var e_3, _a;
        var _this = this;
        this.dom = parents.map(function (_parent) { return _this.html('mjx-' + _this.node.kind); });
        parents = this.handleHref(parents);
        try {
            for (var _b = __values(parents.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var i = _c.value;
                this.adaptor.append(parents[i], this.dom[i]);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return this.dom;
    };
    ChtmlWrapper.prototype.handleHref = function (parents) {
        var _this = this;
        var href = this.node.attributes.get('href');
        if (!href)
            return parents;
        return parents.map(function (parent) { return _this.adaptor.append(parent, _this.html('a', { href: href })); });
    };
    ChtmlWrapper.prototype.handleStyles = function () {
        if (!this.styles)
            return;
        var styles = this.styles.cssText;
        if (styles) {
            var adaptor_1 = this.adaptor;
            this.dom.forEach(function (dom) { return adaptor_1.setAttribute(dom, 'style', styles); });
            var family_1 = this.styles.get('font-family');
            if (family_1) {
                this.dom.forEach(function (dom) { return adaptor_1.setStyle(dom, 'font-family', 'MJXZERO, ' + family_1); });
            }
        }
    };
    ChtmlWrapper.prototype.handleVariant = function () {
        var _this = this;
        if (this.node.isToken && this.variant !== '-explicitFont') {
            var adaptor_2 = this.adaptor;
            this.dom.forEach(function (dom) { return adaptor_2.setAttribute(dom, 'class', (_this.font.getVariant(_this.variant) || _this.font.getVariant('normal')).classes); });
        }
    };
    ChtmlWrapper.prototype.handleScale = function () {
        var _this = this;
        this.dom.forEach(function (dom) { return _this.setScale(dom, _this.bbox.rscale); });
    };
    ChtmlWrapper.prototype.setScale = function (chtml, rscale) {
        var scale = (Math.abs(rscale - 1) < .001 ? 1 : rscale);
        if (chtml && scale !== 1) {
            var size = this.percent(scale);
            if (exports.FONTSIZE[size]) {
                this.adaptor.setAttribute(chtml, 'size', exports.FONTSIZE[size]);
            }
            else {
                this.adaptor.setStyle(chtml, 'fontSize', size);
            }
        }
        return chtml;
    };
    ChtmlWrapper.prototype.handleSpace = function () {
        var e_4, _a;
        var adaptor = this.adaptor;
        var breakable = !!this.node.getProperty('breakable');
        var n = this.dom.length - 1;
        try {
            for (var _b = __values([[this.getLineBBox(0).L, 'space', 'marginLeft', 0],
                [this.getLineBBox(n).R, 'rspace', 'marginRight', n]]), _c = _b.next(); !_c.done; _c = _b.next()) {
                var data = _c.value;
                var _d = __read(data, 4), dimen = _d[0], name_1 = _d[1], margin = _d[2], i = _d[3];
                if (dimen) {
                    var space = this.em(dimen);
                    if (breakable) {
                        var node = adaptor.node('mjx-break', Wrapper_js_1.SPACE[space] ? { size: Wrapper_js_1.SPACE[space] } :
                            { style: { 'font-size': (dimen * 400).toFixed(1) + '%' } });
                        adaptor.insert(node, this.dom[i]);
                    }
                    else {
                        if (Wrapper_js_1.SPACE[space]) {
                            adaptor.setAttribute(this.dom[i], name_1, Wrapper_js_1.SPACE[space]);
                        }
                        else {
                            adaptor.setStyle(this.dom[i], margin, space);
                        }
                    }
                }
                else if (breakable) {
                    adaptor.insert(adaptor.node('mjx-break', { style: { 'font-size': 0 } }), this.dom[i]);
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    ChtmlWrapper.prototype.handleBorders = function () {
        var e_5, _a;
        var _b, _c;
        var border = (_b = this.styleData) === null || _b === void 0 ? void 0 : _b.border;
        var padding = (_c = this.styleData) === null || _c === void 0 ? void 0 : _c.padding;
        var n = this.dom.length - 1;
        if (!border || !n)
            return;
        var adaptor = this.adaptor;
        try {
            for (var _d = __values(this.dom.keys()), _e = _d.next(); !_e.done; _e = _d.next()) {
                var k = _e.value;
                var dom = this.dom[k];
                if (k) {
                    if (border.width[3]) {
                        adaptor.setStyle(dom, 'border-left', ' none');
                    }
                    if (padding[3]) {
                        adaptor.setStyle(dom, 'padding-left', '0');
                    }
                }
                if (k !== n) {
                    if (border.width[1]) {
                        adaptor.setStyle(dom, 'border-right', 'none');
                    }
                    if (padding[1]) {
                        adaptor.setStyle(dom, 'padding-right', '0');
                    }
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    ChtmlWrapper.prototype.handleColor = function () {
        var _a;
        var adaptor = this.adaptor;
        var attributes = this.node.attributes;
        var color = (attributes.getExplicit('mathcolor') || attributes.getExplicit('color'));
        var background = (attributes.getExplicit('mathbackground') ||
            attributes.getExplicit('background') ||
            ((_a = this.styles) === null || _a === void 0 ? void 0 : _a.get('background-color')));
        if (color) {
            this.dom.forEach(function (dom) { return adaptor.setStyle(dom, 'color', color); });
        }
        if (background) {
            this.dom.forEach(function (dom) { return adaptor.setStyle(dom, 'backgroundColor', background); });
        }
    };
    ChtmlWrapper.prototype.handleAttributes = function () {
        var e_6, _a, e_7, _b;
        var adaptor = this.adaptor;
        var attributes = this.node.attributes;
        var defaults = attributes.getAllDefaults();
        var skip = ChtmlWrapper.skipAttributes;
        var _loop_1 = function (name_2) {
            if (skip[name_2] === false || (!(name_2 in defaults) && !skip[name_2] &&
                !adaptor.hasAttribute(this_1.dom[0], name_2))) {
                var value_1 = attributes.getExplicit(name_2);
                this_1.dom.forEach(function (dom) { return adaptor.setAttribute(dom, name_2, value_1); });
            }
        };
        var this_1 = this;
        try {
            for (var _c = __values(attributes.getExplicitNames()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var name_2 = _d.value;
                _loop_1(name_2);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_6) throw e_6.error; }
        }
        if (attributes.get('class')) {
            var names = attributes.get('class').trim().split(/ +/);
            var _loop_2 = function (name_3) {
                this_2.dom.forEach(function (dom) { return adaptor.addClass(dom, name_3); });
            };
            var this_2 = this;
            try {
                for (var names_1 = __values(names), names_1_1 = names_1.next(); !names_1_1.done; names_1_1 = names_1.next()) {
                    var name_3 = names_1_1.value;
                    _loop_2(name_3);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (names_1_1 && !names_1_1.done && (_b = names_1.return)) _b.call(names_1);
                }
                finally { if (e_7) throw e_7.error; }
            }
        }
    };
    ChtmlWrapper.prototype.handlePWidth = function () {
        var _this = this;
        if (this.bbox.pwidth) {
            var adaptor_3 = this.adaptor;
            if (this.bbox.pwidth === BBox_js_1.BBox.fullWidth) {
                this.dom.forEach(function (dom) { return adaptor_3.setAttribute(dom, 'width', 'full'); });
            }
            else {
                this.dom.forEach(function (dom) { return adaptor_3.setStyle(dom, 'width', _this.bbox.pwidth); });
            }
        }
    };
    ChtmlWrapper.prototype.setIndent = function (chtml, align, shift) {
        var adaptor = this.adaptor;
        if (align === 'center' || align === 'left') {
            var L = this.getBBox().L;
            adaptor.setStyle(chtml, 'margin-left', this.em(shift + L));
        }
        if (align === 'center' || align === 'right') {
            var R = this.getBBox().R;
            adaptor.setStyle(chtml, 'margin-right', this.em(-shift + R));
        }
    };
    ChtmlWrapper.prototype.drawBBox = function () {
        var _a = this.getOuterBBox(), w = _a.w, h = _a.h, d = _a.d, R = _a.R;
        var box = this.html('mjx-box', { style: {
                opacity: .25, 'margin-left': this.em(-w - R)
            } }, [
            this.html('mjx-box', { style: {
                    height: this.em(h),
                    width: this.em(w),
                    'background-color': 'red'
                } }),
            this.html('mjx-box', { style: {
                    height: this.em(d),
                    width: this.em(w),
                    'margin-left': this.em(-w),
                    'vertical-align': this.em(-d),
                    'background-color': 'green'
                } })
        ]);
        var node = this.dom[0] || this.parent.dom[0];
        var size = this.adaptor.getAttribute(node, 'size');
        if (size) {
            this.adaptor.setAttribute(box, 'size', size);
        }
        var fontsize = this.adaptor.getStyle(node, 'fontSize');
        if (fontsize) {
            this.adaptor.setStyle(box, 'fontSize', fontsize);
        }
        this.adaptor.append(this.adaptor.parent(node), box);
        this.adaptor.setStyle(node, 'backgroundColor', '#FFEE00');
    };
    ChtmlWrapper.prototype.html = function (type, def, content) {
        if (def === void 0) { def = {}; }
        if (content === void 0) { content = []; }
        return this.jax.html(type, def, content);
    };
    ChtmlWrapper.prototype.text = function (text) {
        return this.jax.text(text);
    };
    ChtmlWrapper.prototype.char = function (n) {
        return this.font.charSelector(n).substr(1);
    };
    ChtmlWrapper.kind = 'unknown';
    ChtmlWrapper.autoStyle = true;
    return ChtmlWrapper;
}(Wrapper_js_1.CommonWrapper));
exports.ChtmlWrapper = ChtmlWrapper;
//# sourceMappingURL=Wrapper.js.map