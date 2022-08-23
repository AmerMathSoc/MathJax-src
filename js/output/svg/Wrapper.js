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
exports.SvgWrapper = void 0;
var string_js_1 = require("../../util/string.js");
var Wrapper_js_1 = require("../common/Wrapper.js");
var svg_js_1 = require("../svg.js");
var SvgWrapper = (function (_super) {
    __extends(SvgWrapper, _super);
    function SvgWrapper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dx = 0;
        return _this;
    }
    SvgWrapper.prototype.toSVG = function (parents) {
        if (this.toEmbellishedSVG(parents))
            return;
        this.addChildren(this.standardSvgNodes(parents));
    };
    SvgWrapper.prototype.toEmbellishedSVG = function (parents) {
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
                    this.toSVG([parent_1]);
                    dom.push(this.dom[0]);
                    this.place(0, 0);
                }
                else {
                    dom.push(this.createSvgNodes([parent_1])[0]);
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
    SvgWrapper.prototype.addChildren = function (parents) {
        var e_2, _a;
        var x = 0;
        try {
            for (var _b = __values(this.childNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child.toSVG(parents);
                var bbox = child.getOuterBBox();
                if (child.dom) {
                    child.place(x + bbox.L * bbox.rscale, 0);
                }
                x += (bbox.L + bbox.w + bbox.R) * bbox.rscale;
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
    SvgWrapper.prototype.standardSvgNodes = function (parents) {
        var svg = this.createSvgNodes(parents);
        this.handleStyles();
        this.handleScale();
        this.handleBorder();
        this.handleColor();
        this.handleAttributes();
        return svg;
    };
    SvgWrapper.prototype.createSvgNodes = function (parents) {
        var e_3, _a;
        var _this = this;
        this.dom = parents.map(function (_parent) { return _this.svg('g', { 'data-mml-node': _this.node.kind }); });
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
    SvgWrapper.prototype.handleHref = function (parents) {
        var _this = this;
        var href = this.node.attributes.get('href');
        if (!href)
            return parents;
        var i = 0;
        var isEmbellished = this.node.isEmbellished && !this.node.isKind('mo');
        return parents.map(function (parent) {
            parent = _this.adaptor.append(parent, _this.svg('a', { href: href }));
            var _a = (isEmbellished ? _this.getOuterBBox() : _this.getLineBBox(i)), h = _a.h, d = _a.d, w = _a.w;
            _this.adaptor.append(_this.dom[i++], _this.svg('rect', {
                'data-hitbox': true, fill: 'none', stroke: 'none', 'pointer-events': 'all',
                width: _this.fixed(w), height: _this.fixed(h + d),
                x: (i === 1 || isEmbellished ? _this.fixed(-_this.dx) : 0), y: _this.fixed(-d)
            }));
            return parent;
        });
    };
    SvgWrapper.prototype.handleStyles = function () {
        var _this = this;
        var _a, _b, _c;
        if (!this.styles)
            return;
        var styles = this.styles.cssText;
        if (styles) {
            this.dom.forEach(function (node) { return _this.adaptor.setAttribute(node, 'style', styles); });
        }
        var padding = (((_a = this.styleData) === null || _a === void 0 ? void 0 : _a.padding) || [0, 0, 0, 0])[3];
        var border = (((_c = (_b = this.styleData) === null || _b === void 0 ? void 0 : _b.border) === null || _c === void 0 ? void 0 : _c.width) || [0, 0, 0, 0])[3];
        if (padding || border) {
            this.dx = padding + border;
        }
    };
    SvgWrapper.prototype.handleScale = function () {
        var _this = this;
        if (this.bbox.rscale !== 1) {
            var scale_1 = 'scale(' + this.fixed(this.bbox.rscale / 1000, 3) + ')';
            this.dom.forEach(function (node) { return _this.adaptor.setAttribute(node, 'transform', scale_1); });
        }
    };
    SvgWrapper.prototype.handleColor = function () {
        var _this = this;
        var _a;
        var adaptor = this.adaptor;
        var attributes = this.node.attributes;
        var color = (attributes.getExplicit('mathcolor') || attributes.getExplicit('color'));
        var background = (attributes.getExplicit('mathbackground') ||
            attributes.getExplicit('background') ||
            ((_a = this.styles) === null || _a === void 0 ? void 0 : _a.get('background-color')));
        if (color) {
            this.dom.forEach(function (node) {
                adaptor.setAttribute(node, 'fill', color);
                adaptor.setAttribute(node, 'stroke', color);
            });
        }
        if (background) {
            var i_1 = 0;
            var isEmbellished_1 = this.node.isEmbellished && !this.node.isKind('mo');
            this.dom.forEach(function (node) {
                var _a = (isEmbellished_1 ? _this.getOuterBBox() : _this.getLineBBox(i_1++)), h = _a.h, d = _a.d, w = _a.w;
                var rect = _this.svg('rect', {
                    fill: background,
                    x: (i_1 === 1 || isEmbellished_1 ? _this.fixed(-_this.dx) : 0), y: _this.fixed(-d),
                    width: _this.fixed(w),
                    height: _this.fixed(h + d),
                    'data-bgcolor': true
                });
                var child = adaptor.firstChild(node);
                if (child) {
                    adaptor.insert(rect, child);
                }
                else {
                    adaptor.append(node, rect);
                }
            });
        }
    };
    SvgWrapper.prototype.handleBorder = function () {
        var e_4, _a, e_5, _b;
        var _c;
        var border = (_c = this.styleData) === null || _c === void 0 ? void 0 : _c.border;
        if (!border)
            return;
        var f = SvgWrapper.borderFuzz;
        var adaptor = this.adaptor;
        var k = 0;
        var n = this.dom.length - 1;
        var isEmbellished = this.node.isEmbellished && !this.node.isKind('mo');
        try {
            for (var _d = __values(this.dom), _e = _d.next(); !_e.done; _e = _d.next()) {
                var dom = _e.value;
                var L = (!n || !k ? 1 : 0);
                var R = (!n || k === n ? 1 : 0);
                var bbox = (isEmbellished ? this.getOuterBBox() : this.getLineBBox(k++));
                var _f = __read([bbox.h + f, bbox.d + f, bbox.w + f], 3), h = _f[0], d = _f[1], w = _f[2];
                var outerRT = [w, h];
                var outerLT = [-f, h];
                var outerRB = [w, -d];
                var outerLB = [-f, -d];
                var innerRT = [w - R * border.width[1], h - border.width[0]];
                var innerLT = [-f + L * border.width[3], h - border.width[0]];
                var innerRB = [w - R * border.width[1], -d + border.width[2]];
                var innerLB = [-f + L * border.width[3], -d + border.width[2]];
                var paths = [
                    [outerLT, outerRT, innerRT, innerLT],
                    [outerRB, outerRT, innerRT, innerRB],
                    [outerLB, outerRB, innerRB, innerLB],
                    [outerLB, outerLT, innerLT, innerLB]
                ];
                var child = adaptor.firstChild(dom);
                var dx = L * this.dx;
                try {
                    for (var _g = (e_5 = void 0, __values([0, 1, 2, 3])), _h = _g.next(); !_h.done; _h = _g.next()) {
                        var i = _h.value;
                        if (!border.width[i] || (i === 3 && !L) || (i === 1 && !R))
                            continue;
                        var path = paths[i];
                        if (border.style[i] === 'dashed' || border.style[i] === 'dotted') {
                            this.addBorderBroken(path, border.color[i], border.style[i], border.width[i], i, dom, dx);
                        }
                        else {
                            this.addBorderSolid(path, border.color[i], child, dom, dx);
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    SvgWrapper.prototype.addBorderSolid = function (path, color, child, parent, dx) {
        var _this = this;
        var border = this.svg('polygon', {
            points: path.map(function (_a) {
                var _b = __read(_a, 2), x = _b[0], y = _b[1];
                return "".concat(_this.fixed(x - dx), ",").concat(_this.fixed(y));
            }).join(' '),
            stroke: 'none',
            fill: color
        });
        if (child) {
            this.adaptor.insert(border, child);
        }
        else {
            this.adaptor.append(parent, border);
        }
    };
    SvgWrapper.prototype.addBorderBroken = function (path, color, style, t, i, parent, dx) {
        var dot = (style === 'dotted');
        var t2 = t / 2;
        var _a = __read([[t2, -t2, -t2, -t2], [-t2, t2, -t2, -t2], [t2, t2, -t2, t2], [t2, t2, t2, -t2]][i], 4), tx1 = _a[0], ty1 = _a[1], tx2 = _a[2], ty2 = _a[3];
        var _b = __read(path, 2), A = _b[0], B = _b[1];
        var x1 = A[0] + tx1 - dx, y1 = A[1] + ty1;
        var x2 = B[0] + tx2 - dx, y2 = B[1] + ty2;
        var W = Math.abs(i % 2 ? y2 - y1 : x2 - x1);
        var n = (dot ? Math.ceil(W / (2 * t)) : Math.ceil((W - t) / (4 * t)));
        var m = W / (4 * n + 1);
        var line = this.svg('line', {
            x1: this.fixed(x1), y1: this.fixed(y1),
            x2: this.fixed(x2), y2: this.fixed(y2),
            'stroke-width': this.fixed(t), stroke: color, 'stroke-linecap': dot ? 'round' : 'square',
            'stroke-dasharray': dot ? [1, this.fixed(W / n - .002)].join(' ') : [this.fixed(m), this.fixed(3 * m)].join(' ')
        });
        var adaptor = this.adaptor;
        var child = adaptor.firstChild(parent);
        if (child) {
            adaptor.insert(line, child);
        }
        else {
            adaptor.append(parent, line);
        }
    };
    SvgWrapper.prototype.handleAttributes = function () {
        var e_6, _a, e_7, _b;
        var adaptor = this.adaptor;
        var attributes = this.node.attributes;
        var defaults = attributes.getAllDefaults();
        var skip = SvgWrapper.skipAttributes;
        var _loop_1 = function (name_1) {
            if (skip[name_1] === false || (!(name_1 in defaults) && !skip[name_1] &&
                !adaptor.hasAttribute(this_1.dom[0], name_1))) {
                this_1.dom.forEach(function (dom) { return adaptor.setAttribute(dom, name_1, attributes.getExplicit(name_1)); });
            }
        };
        var this_1 = this;
        try {
            for (var _c = __values(attributes.getExplicitNames()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var name_1 = _d.value;
                _loop_1(name_1);
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
            var _loop_2 = function (name_2) {
                this_2.dom.forEach(function (node) { return adaptor.addClass(node, name_2); });
            };
            var this_2 = this;
            try {
                for (var _e = __values((0, string_js_1.split)(attributes.get('class'))), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var name_2 = _f.value;
                    _loop_2(name_2);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_7) throw e_7.error; }
            }
        }
    };
    SvgWrapper.prototype.place = function (x, y, element) {
        if (element === void 0) { element = null; }
        if (!element) {
            x += this.dx * this.bbox.rscale;
        }
        if (!(x || y))
            return;
        if (!element) {
            element = this.dom[0];
            y = this.handleId(y);
        }
        var translate = "translate(".concat(this.fixed(x), ",").concat(this.fixed(y), ")");
        var transform = this.adaptor.getAttribute(element, 'transform') || '';
        this.adaptor.setAttribute(element, 'transform', translate + (transform ? ' ' + transform : ''));
    };
    SvgWrapper.prototype.handleId = function (y) {
        if (!this.node.attributes || !this.node.attributes.get('id')) {
            return y;
        }
        var adaptor = this.adaptor;
        var h = this.getBBox().h;
        var children = adaptor.childNodes(this.dom[0]);
        children.forEach(function (child) { return adaptor.remove(child); });
        var g = this.svg('g', { 'data-idbox': true, transform: "translate(0,".concat(this.fixed(-h), ")") }, children);
        adaptor.append(this.dom[0], this.svg('text', { 'data-id-align': true }, [this.text('')]));
        adaptor.append(this.dom[0], g);
        return y + h;
    };
    SvgWrapper.prototype.firstChild = function (dom) {
        if (dom === void 0) { dom = this.dom[0]; }
        var adaptor = this.adaptor;
        var child = adaptor.firstChild(dom);
        if (child && adaptor.kind(child) === 'text' && adaptor.getAttribute(child, 'data-id-align')) {
            child = adaptor.firstChild(adaptor.next(child));
        }
        if (child && adaptor.kind(child) === 'rect' && adaptor.getAttribute(child, 'data-hitbox')) {
            child = adaptor.next(child);
        }
        return child;
    };
    SvgWrapper.prototype.placeChar = function (n, x, y, parent, variant) {
        var e_8, _a;
        if (variant === void 0) { variant = null; }
        if (variant === null) {
            variant = this.variant;
        }
        var C = n.toString(16).toUpperCase();
        var _b = __read(this.getVariantChar(variant, n), 4), w = _b[2], data = _b[3];
        if ('p' in data) {
            var path = (data.p ? 'M' + data.p + 'Z' : '');
            this.place(x, y, this.adaptor.append(parent, this.charNode(variant, C, path)));
        }
        else if ('c' in data) {
            var g = this.adaptor.append(parent, this.svg('g', { 'data-c': C }));
            this.place(x, y, g);
            x = 0;
            try {
                for (var _c = __values(this.unicodeChars(data.c, variant)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var n_1 = _d.value;
                    x += this.placeChar(n_1, x, y, g, variant);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_8) throw e_8.error; }
            }
        }
        else if (data.unknown) {
            var char = String.fromCodePoint(n);
            var text = this.adaptor.append(parent, this.jax.unknownText(char, variant));
            this.place(x, y, text);
            return this.jax.measureTextNodeWithCache(text, char, variant).w;
        }
        return w;
    };
    SvgWrapper.prototype.charNode = function (variant, C, path) {
        var cache = this.jax.options.fontCache;
        return (cache !== 'none' ? this.useNode(variant, C, path) : this.pathNode(C, path));
    };
    SvgWrapper.prototype.pathNode = function (C, path) {
        return this.svg('path', { 'data-c': C, d: path });
    };
    SvgWrapper.prototype.useNode = function (variant, C, path) {
        var use = this.svg('use', { 'data-c': C });
        var id = '#' + this.jax.fontCache.cachePath(variant, C, path);
        this.adaptor.setAttribute(use, 'href', id, svg_js_1.XLINKNS);
        return use;
    };
    SvgWrapper.prototype.drawBBox = function () {
        var _a = this.getBBox(), w = _a.w, h = _a.h, d = _a.d;
        var box = this.svg('g', { style: {
                opacity: .25
            } }, [
            this.svg('rect', {
                fill: 'red',
                height: this.fixed(h),
                width: this.fixed(w)
            }),
            this.svg('rect', {
                fill: 'green',
                height: this.fixed(d),
                width: this.fixed(w),
                y: this.fixed(-d)
            })
        ]);
        var node = this.dom[0] || this.parent.dom[0];
        this.adaptor.append(node, box);
    };
    SvgWrapper.prototype.html = function (type, def, content) {
        if (def === void 0) { def = {}; }
        if (content === void 0) { content = []; }
        return this.jax.html(type, def, content);
    };
    SvgWrapper.prototype.svg = function (type, def, content) {
        if (def === void 0) { def = {}; }
        if (content === void 0) { content = []; }
        return this.jax.svg(type, def, content);
    };
    SvgWrapper.prototype.text = function (text) {
        return this.jax.text(text);
    };
    SvgWrapper.prototype.fixed = function (x, n) {
        if (n === void 0) { n = 1; }
        return this.jax.fixed(x * 1000, n);
    };
    SvgWrapper.kind = 'unknown';
    SvgWrapper.borderFuzz = 0.005;
    return SvgWrapper;
}(Wrapper_js_1.CommonWrapper));
exports.SvgWrapper = SvgWrapper;
//# sourceMappingURL=Wrapper.js.map