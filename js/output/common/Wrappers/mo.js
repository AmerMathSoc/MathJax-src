"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonMoMixin = exports.DirectionVH = void 0;
var BBox_js_1 = require("../../../util/BBox.js");
var string_js_1 = require("../../../util/string.js");
var FontData_js_1 = require("../FontData.js");
exports.DirectionVH = (_a = {},
    _a[1] = 'v',
    _a[2] = 'h',
    _a);
function CommonMoMixin(Base) {
    var _a;
    return _a = (function (_super) {
            __extends(Mo, _super);
            function Mo() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = _super.apply(this, __spread(args)) || this;
                _this.size = null;
                _this.isAccent = _this.node.isAccent;
                return _this;
            }
            Mo.prototype.computeBBox = function (bbox, _recompute) {
                if (_recompute === void 0) { _recompute = false; }
                this.protoBBox(bbox);
                if (this.node.attributes.get('symmetric') &&
                    this.stretch.dir !== 2) {
                    var d = this.getCenterOffset(bbox);
                    bbox.h += d;
                    bbox.d -= d;
                }
                if (this.node.getProperty('mathaccent') &&
                    (this.stretch.dir === 0 || this.size >= 0)) {
                    bbox.w = 0;
                }
            };
            Mo.prototype.protoBBox = function (bbox) {
                var stretchy = (this.stretch.dir !== 0);
                if (stretchy && this.size === null) {
                    this.getStretchedVariant([0]);
                }
                if (stretchy && this.size < 0)
                    return;
                _super.prototype.computeBBox.call(this, bbox);
                this.copySkewIC(bbox);
            };
            Mo.prototype.getAccentOffset = function () {
                var bbox = BBox_js_1.BBox.empty();
                this.protoBBox(bbox);
                return -bbox.w / 2;
            };
            Mo.prototype.getCenterOffset = function (bbox) {
                if (bbox === void 0) { bbox = null; }
                if (!bbox) {
                    bbox = BBox_js_1.BBox.empty();
                    _super.prototype.computeBBox.call(this, bbox);
                }
                return ((bbox.h + bbox.d) / 2 + this.font.params.axis_height) - bbox.h;
            };
            Mo.prototype.getVariant = function () {
                if (this.node.attributes.get('largeop')) {
                    this.variant = (this.node.attributes.get('displaystyle') ? '-largeop' : '-smallop');
                    return;
                }
                if (!this.node.attributes.getExplicit('mathvariant')) {
                    var text = this.getText();
                    if (this.constructor.pseudoScripts.exec(text)) {
                        var parent_1 = this.node.coreParent().Parent;
                        if (parent_1 && parent_1.isKind('msubsup')) {
                            this.variant = '-tex-variant';
                            return;
                        }
                    }
                }
                _super.prototype.getVariant.call(this);
            };
            Mo.prototype.canStretch = function (direction) {
                if (this.stretch.dir !== 0) {
                    return this.stretch.dir === direction;
                }
                var attributes = this.node.attributes;
                if (!attributes.get('stretchy'))
                    return false;
                var c = this.getText();
                if (Array.from(c).length !== 1)
                    return false;
                var delim = this.font.getDelimiter(c.codePointAt(0));
                this.stretch = (delim && delim.dir === direction ? delim : FontData_js_1.NOSTRETCH);
                return this.stretch.dir !== 0;
            };
            Mo.prototype.getStretchedVariant = function (WH, exact) {
                var e_1, _a;
                if (exact === void 0) { exact = false; }
                if (this.stretch.dir !== 0) {
                    var D = this.getWH(WH);
                    var min = this.getSize('minsize', 0);
                    var max = this.getSize('maxsize', Infinity);
                    var mathaccent = this.node.getProperty('mathaccent');
                    D = Math.max(min, Math.min(max, D));
                    var df = this.font.params.delimiterfactor / 1000;
                    var ds = this.font.params.delimitershortfall;
                    var m = (min || exact ? D : mathaccent ? Math.min(D / df, D + ds) : Math.max(D * df, D - ds));
                    var delim = this.stretch;
                    var c = delim.c || this.getText().codePointAt(0);
                    var i = 0;
                    if (delim.sizes) {
                        try {
                            for (var _b = __values(delim.sizes), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var d = _c.value;
                                if (d >= m) {
                                    if (mathaccent && i) {
                                        i--;
                                    }
                                    this.variant = this.font.getSizeVariant(c, i);
                                    this.size = i;
                                    return;
                                }
                                i++;
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                    if (delim.stretch) {
                        this.size = -1;
                        this.invalidateBBox();
                        this.getStretchBBox(WH, D, delim);
                    }
                    else {
                        this.variant = this.font.getSizeVariant(c, i - 1);
                        this.size = i - 1;
                    }
                }
            };
            Mo.prototype.getSize = function (name, value) {
                var attributes = this.node.attributes;
                if (attributes.isSet(name)) {
                    value = this.length2em(attributes.get(name), 1, 1);
                }
                return value;
            };
            Mo.prototype.getWH = function (WH) {
                if (WH.length === 0)
                    return 0;
                if (WH.length === 1)
                    return WH[0];
                var _a = __read(WH, 2), H = _a[0], D = _a[1];
                var a = this.font.params.axis_height;
                return (this.node.attributes.get('symmetric') ? 2 * Math.max(H - a, D + a) : H + D);
            };
            Mo.prototype.getStretchBBox = function (WHD, D, C) {
                var _a;
                if (C.hasOwnProperty('min') && C.min > D) {
                    D = C.min;
                }
                var _b = __read(C.HDW, 3), h = _b[0], d = _b[1], w = _b[2];
                if (this.stretch.dir === 1) {
                    _a = __read(this.getBaseline(WHD, D, C), 2), h = _a[0], d = _a[1];
                }
                else {
                    w = D;
                }
                this.bbox.h = h;
                this.bbox.d = d;
                this.bbox.w = w;
            };
            Mo.prototype.getBaseline = function (WHD, HD, C) {
                var hasWHD = (WHD.length === 2 && WHD[0] + WHD[1] === HD);
                var symmetric = this.node.attributes.get('symmetric');
                var _a = __read((hasWHD ? WHD : [HD, 0]), 2), H = _a[0], D = _a[1];
                var _b = __read([H + D, 0], 2), h = _b[0], d = _b[1];
                if (symmetric) {
                    var a = this.font.params.axis_height;
                    if (hasWHD) {
                        h = 2 * Math.max(H - a, D + a);
                    }
                    d = h / 2 - a;
                }
                else if (hasWHD) {
                    d = D;
                }
                else {
                    var _c = __read((C.HDW || [.75, .25]), 2), ch = _c[0], cd = _c[1];
                    d = cd * (h / (ch + cd));
                }
                return [h - d, d];
            };
            Mo.prototype.remapChars = function (chars) {
                var _this = this;
                var text = string_js_1.unicodeString(chars);
                if (text.match(this.font.primes)) {
                    var remapped = chars.map(function (c) { return (_this.font.getRemappedChar('primes', c) || String.fromCodePoint(c)); }).join('');
                    chars = this.unicodeChars(remapped, this.variant);
                }
                else if (chars.length === 1) {
                    var parent_2 = this.node.coreParent().parent;
                    var isAccent = this.isAccent && !parent_2.isKind('mrow');
                    var map = (isAccent ? 'accent' : 'mo');
                    var c = this.font.getRemappedChar(map, chars[0]);
                    if (c) {
                        chars = this.unicodeChars(c, this.variant);
                    }
                }
                return chars;
            };
            return Mo;
        }(Base)),
        _a.pseudoScripts = new RegExp([
            '^["\'*`',
            '\u00AA',
            '\u00B0',
            '\u00B2-\u00B4',
            '\u00B9',
            '\u00BA',
            '\u2018-\u201F',
            '\u2032-\u2037\u2057',
            '\u2070\u2071',
            '\u2074-\u207F',
            '\u2080-\u208E',
            ']+$'
        ].join('')),
        _a;
}
exports.CommonMoMixin = CommonMoMixin;
//# sourceMappingURL=mo.js.map