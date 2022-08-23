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
exports.SvgMo = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mo_js_1 = require("../../common/Wrappers/mo.js");
var mo_js_2 = require("../../../core/MmlTree/MmlNodes/mo.js");
var VFUZZ = 0.1;
var HFUZZ = 0.1;
exports.SvgMo = (function () {
    var _a;
    var Base = (0, mo_js_1.CommonMoMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgMo, _super);
            function SvgMo() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgMo.prototype.toSVG = function (parents) {
                var attributes = this.node.attributes;
                var symmetric = attributes.get('symmetric') && this.stretch.dir !== 2;
                var stretchy = this.stretch.dir !== 0;
                if (stretchy && this.size === null) {
                    this.getStretchedVariant([]);
                }
                var svg = this.standardSvgNodes(parents);
                if (svg.length > 1 && this.breakStyle !== 'duplicate') {
                    var i = (this.breakStyle === 'after' ? 1 : 0);
                    this.adaptor.remove(svg[i]);
                    svg[i] = null;
                }
                if (stretchy && this.size < 0) {
                    this.stretchSvg();
                }
                else {
                    var u = (symmetric || attributes.get('largeop') ? this.fixed(this.getCenterOffset()) : '0');
                    var v = (this.node.getProperty('mathaccent') ? this.fixed(this.getAccentOffset()) : '0');
                    if (u !== '0' || v !== '0') {
                        svg[0] && this.adaptor.setAttribute(svg[0], 'transform', "translate(".concat(v, " ").concat(u, ")"));
                        svg[1] && this.adaptor.setAttribute(svg[1], 'transform', "translate(".concat(v, " ").concat(u, ")"));
                    }
                    svg[0] && this.addChildren([svg[0]]);
                    svg[1] && (this.multChar || this).addChildren([svg[1]]);
                }
            };
            SvgMo.prototype.stretchSvg = function () {
                var stretch = this.stretch.stretch;
                var variants = this.getStretchVariants();
                var bbox = this.getBBox();
                if (this.stretch.dir === 1) {
                    this.stretchVertical(stretch, variants, bbox);
                }
                else {
                    this.stretchHorizontal(stretch, variants, bbox);
                }
            };
            SvgMo.prototype.getStretchVariants = function () {
                var e_1, _a;
                var c = this.stretch.c || this.getText().codePointAt(0);
                var variants = [];
                try {
                    for (var _b = __values(this.stretch.stretch.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var i = _c.value;
                        variants[i] = this.font.getStretchVariant(c, i);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return variants;
            };
            SvgMo.prototype.stretchVertical = function (stretch, variant, bbox) {
                var h = bbox.h, d = bbox.d, w = bbox.w;
                var T = this.addTop(stretch[0], variant[0], h, w);
                var B = this.addBot(stretch[2], variant[2], d, w);
                if (stretch.length === 4) {
                    var _a = __read(this.addMidV(stretch[3], variant[3], w), 2), H = _a[0], D = _a[1];
                    this.addExtV(stretch[1], variant[1], h, 0, T, H, w);
                    this.addExtV(stretch[1], variant[1], 0, d, D, B, w);
                }
                else {
                    this.addExtV(stretch[1], variant[1], h, d, T, B, w);
                }
            };
            SvgMo.prototype.stretchHorizontal = function (stretch, variant, bbox) {
                var w = bbox.w;
                var L = this.addLeft(stretch[0], variant[0]);
                var R = this.addRight(stretch[2], variant[2], w);
                if (stretch.length === 4) {
                    var _a = __read(this.addMidH(stretch[3], variant[3], w), 2), x1 = _a[0], x2 = _a[1];
                    var w2 = w / 2;
                    this.addExtH(stretch[1], variant[1], w2, L, w2 - x1);
                    this.addExtH(stretch[1], variant[1], w2, x2 - w2, R, w2);
                }
                else {
                    this.addExtH(stretch[1], variant[1], w, L, R);
                }
            };
            SvgMo.prototype.getChar = function (n, variant) {
                var char = this.font.getChar(variant, n) || [0, 0, 0, null];
                return [char[0], char[1], char[2], char[3] || {}];
            };
            SvgMo.prototype.addGlyph = function (n, variant, x, y, parent) {
                if (parent === void 0) { parent = null; }
                if (parent)
                    return this.placeChar(n, x, y, parent, variant);
                if (this.dom[0]) {
                    var dx = this.placeChar(n, x, y, this.dom[0], variant);
                    if (!this.dom[1])
                        return dx;
                }
                return this.placeChar(n, x, y, this.dom[1], variant);
            };
            SvgMo.prototype.addTop = function (n, v, H, W) {
                if (!n)
                    return 0;
                var _a = __read(this.getChar(n, v), 3), h = _a[0], d = _a[1], w = _a[2];
                this.addGlyph(n, v, (W - w) / 2, H - h);
                return h + d;
            };
            SvgMo.prototype.addExtV = function (n, v, H, D, T, B, W) {
                var _this = this;
                if (!n)
                    return;
                T = Math.max(0, T - VFUZZ);
                B = Math.max(0, B - VFUZZ);
                var adaptor = this.adaptor;
                var _a = __read(this.getChar(n, v), 3), h = _a[0], d = _a[1], w = _a[2];
                var Y = H + D - T - B;
                var s = 1.5 * Y / (h + d);
                var y = (s * (h - d) - Y) / 2;
                if (Y <= 0)
                    return;
                var svg = this.svg('svg', {
                    width: this.fixed(w), height: this.fixed(Y),
                    y: this.fixed(B - D), x: this.fixed((W - w) / 2),
                    viewBox: [0, y, w, Y].map(function (x) { return _this.fixed(x); }).join(' ')
                });
                this.addGlyph(n, v, 0, 0, svg);
                var glyph = adaptor.lastChild(svg);
                adaptor.setAttribute(glyph, 'transform', "scale(1,".concat(this.jax.fixed(s), ")"));
                this.dom[0] && adaptor.append(this.dom[0], svg);
                this.dom[1] && adaptor.append(this.dom[1], this.dom[0] ? adaptor.clone(svg) : svg);
            };
            SvgMo.prototype.addBot = function (n, v, D, W) {
                if (!n)
                    return 0;
                var _a = __read(this.getChar(n, v), 3), h = _a[0], d = _a[1], w = _a[2];
                this.addGlyph(n, v, (W - w) / 2, d - D);
                return h + d;
            };
            SvgMo.prototype.addMidV = function (n, v, W) {
                if (!n)
                    return [0, 0];
                var _a = __read(this.getChar(n, v), 3), h = _a[0], d = _a[1], w = _a[2];
                var y = (d - h) / 2 + this.font.params.axis_height;
                this.addGlyph(n, v, (W - w) / 2, y);
                return [h + y, d - y];
            };
            SvgMo.prototype.addLeft = function (n, v) {
                return (n ? this.addGlyph(n, v, 0, 0) : 0);
            };
            SvgMo.prototype.addExtH = function (n, v, W, L, R, x) {
                var _this = this;
                if (x === void 0) { x = 0; }
                if (!n)
                    return;
                R = Math.max(0, R - HFUZZ);
                L = Math.max(0, L - HFUZZ);
                var adaptor = this.adaptor;
                var _a = __read(this.getChar(n, v), 3), h = _a[0], d = _a[1], w = _a[2];
                var X = W - L - R;
                var Y = h + d + 2 * VFUZZ;
                var s = 1.5 * (X / w);
                var D = -(d + VFUZZ);
                if (X <= 0)
                    return;
                var svg = this.svg('svg', {
                    width: this.fixed(X), height: this.fixed(Y),
                    x: this.fixed(x + L), y: this.fixed(D),
                    viewBox: [(s * w - X) / 2, D, X, Y].map(function (x) { return _this.fixed(x); }).join(' ')
                });
                this.addGlyph(n, v, 0, 0, svg);
                var glyph = adaptor.lastChild(svg);
                adaptor.setAttribute(glyph, 'transform', 'scale(' + this.jax.fixed(s) + ',1)');
                this.dom[0] && adaptor.append(this.dom[0], svg);
                this.dom[1] && adaptor.append(this.dom[1], this.dom[0] ? adaptor.clone(svg) : svg);
            };
            SvgMo.prototype.addRight = function (n, v, W) {
                if (!n)
                    return 0;
                var w = this.getChar(n, v)[2];
                return this.addGlyph(n, v, W - w, 0);
            };
            SvgMo.prototype.addMidH = function (n, v, W) {
                if (!n)
                    return [0, 0];
                var w = this.getChar(n, v)[2];
                this.addGlyph(n, v, (W - w) / 2, 0);
                return [(W - w) / 2, (W + w) / 2];
            };
            return SvgMo;
        }(Base)),
        _a.kind = mo_js_2.MmlMo.prototype.kind,
        _a;
})();
//# sourceMappingURL=mo.js.map