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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonInferredMrowMixin = exports.CommonMrowMixin = void 0;
var BBox_js_1 = require("../../../util/BBox.js");
var LineBBox_js_1 = require("../LineBBox.js");
function CommonMrowMixin(Base) {
    return (function (_super) {
        __extends(CommonMrowMixin, _super);
        function CommonMrowMixin(factory, node, parent) {
            var e_1, _a;
            if (parent === void 0) { parent = null; }
            var _this = _super.call(this, factory, node, parent) || this;
            var self = _this;
            _this.isStack = (_this.parent.node.isInferred || _this.parent.breakTop(self, self) !== self);
            _this.stretchChildren();
            try {
                for (var _b = __values(_this.childNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var child = _c.value;
                    if (child.bbox.pwidth) {
                        _this.bbox.pwidth = BBox_js_1.BBox.fullWidth;
                        break;
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
            return _this;
        }
        CommonMrowMixin.prototype.stretchChildren = function () {
            var e_2, _a, e_3, _b, e_4, _c;
            var stretchy = [];
            try {
                for (var _d = __values(this.childNodes), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var child = _e.value;
                    if (child.canStretch(1)) {
                        stretchy.push(child);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var count = stretchy.length;
            var nodeCount = this.childNodes.length;
            if (count && nodeCount > 1) {
                var H = 0, D = 0;
                var all = (count > 1 && count === nodeCount);
                try {
                    for (var _f = __values(this.childNodes), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var child = _g.value;
                        var noStretch = (child.stretch.dir === 0);
                        if (all || noStretch) {
                            var rscale = child.getBBox().rscale;
                            var _h = __read(child.getUnbrokenHD(), 2), h = _h[0], d = _h[1];
                            h *= rscale;
                            d *= rscale;
                            if (h > H)
                                H = h;
                            if (d > D)
                                D = d;
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                try {
                    for (var stretchy_1 = __values(stretchy), stretchy_1_1 = stretchy_1.next(); !stretchy_1_1.done; stretchy_1_1 = stretchy_1.next()) {
                        var child = stretchy_1_1.value;
                        var rscale = child.coreRScale();
                        child.coreMO().getStretchedVariant([H / rscale, D / rscale]);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (stretchy_1_1 && !stretchy_1_1.done && (_c = stretchy_1.return)) _c.call(stretchy_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        };
        Object.defineProperty(CommonMrowMixin.prototype, "fixesPWidth", {
            get: function () {
                return false;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CommonMrowMixin.prototype, "breakCount", {
            get: function () {
                if (this._breakCount < 0) {
                    this._breakCount = (!this.childNodes.length ? 0 :
                        this.childNodes.reduce(function (n, child) { return n + child.breakCount; }, 0));
                }
                return this._breakCount;
            },
            enumerable: false,
            configurable: true
        });
        CommonMrowMixin.prototype.breakTop = function (_mrow, _child) {
            var node = this;
            return (this.isStack ? this.parent.breakTop(node, node) : node);
        };
        CommonMrowMixin.prototype.computeBBox = function (bbox, recompute) {
            var e_5, _a;
            if (recompute === void 0) { recompute = false; }
            var breaks = this.breakCount;
            this.lineBBox = (breaks ? [new LineBBox_js_1.LineBBox({ h: .75, d: .25, w: 0 }, [0, 0])] : []);
            bbox.empty();
            try {
                for (var _b = __values(this.childNodes.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var i = _c.value;
                    var child = this.childNodes[i];
                    bbox.append(child.getOuterBBox());
                    breaks && this.computeChildLineBBox(child, i);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            bbox.clean();
            breaks && this.computeLinebreakBBox(bbox);
            if (this.fixesPWidth && this.setChildPWidths(recompute)) {
                this.computeBBox(bbox, true);
            }
        };
        CommonMrowMixin.prototype.computeLinebreakBBox = function (bbox) {
            var e_6, _a, e_7, _b;
            var _c;
            bbox.empty();
            var isStack = this.isStack;
            var lines = this.lineBBox;
            var n = lines.length - 1;
            if (isStack) {
                try {
                    for (var _d = __values(lines.keys()), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var k = _e.value;
                        var line = lines[k];
                        this.addMiddleBorders(line);
                        k === 0 && this.addLeftBorders(line);
                        k === n && this.addRightBorders(line);
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
            var y = 0;
            try {
                for (var _f = __values(lines.keys()), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var k = _g.value;
                    var line = lines[k];
                    bbox.combine(line, 0, y);
                    y -= Math.max(.25, line.d) + line.lineLeading + Math.max(.75, ((_c = lines[k + 1]) === null || _c === void 0 ? void 0 : _c.h) || 0);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_7) throw e_7.error; }
            }
            if (isStack) {
                lines[0].L = this.bbox.L;
                lines[n].R = this.bbox.R;
            }
            else {
                bbox.w = Math.max.apply(Math, __spreadArray([], __read(this.lineBBox.map(function (bbox) { return bbox.w; })), false));
                this.shiftLines(bbox.w);
                if (!this.jax.math.display && !this.linebreakOptions.inline) {
                    bbox.pwidth = BBox_js_1.BBox.fullWidth;
                    if (this.node.isInferred) {
                        this.parent.bbox.pwidth = BBox_js_1.BBox.fullWidth;
                    }
                }
            }
            bbox.clean();
        };
        CommonMrowMixin.prototype.computeChildLineBBox = function (child, i) {
            var lbox = this.lineBBox[this.lineBBox.length - 1];
            lbox.end = [i, 0];
            lbox.append(child.getLineBBox(0));
            var parts = child.breakCount + 1;
            if (parts === 1)
                return;
            for (var l = 1; l < parts; l++) {
                var bbox = new LineBBox_js_1.LineBBox({ h: .75, d: .25, w: 0 });
                bbox.start = bbox.end = [i, l];
                bbox.isFirst = true;
                bbox.append(child.getLineBBox(l));
                this.lineBBox.push(bbox);
            }
        };
        CommonMrowMixin.prototype.getLineBBox = function (i) {
            this.getBBox();
            return (this.isStack ? _super.prototype.getLineBBox.call(this, i) :
                LineBBox_js_1.LineBBox.from(this.getOuterBBox(), this.linebreakOptions.lineleading));
        };
        CommonMrowMixin.prototype.shiftLines = function (W) {
            var e_8, _a;
            var lines = this.lineBBox;
            var n = lines.length - 1;
            var _b = __read(lines[1].indentData[0], 2), alignfirst = _b[0], shiftfirst = _b[1];
            try {
                for (var _c = __values(lines.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var i = _d.value;
                    var bbox = lines[i];
                    var _e = __read((i === 0 ? [alignfirst, shiftfirst] : bbox.indentData[i === n ? 2 : 1]), 2), indentalign = _e[0], indentshift = _e[1];
                    var _f = __read(this.processIndent(indentalign, indentshift, alignfirst, shiftfirst, W), 2), align = _f[0], shift = _f[1];
                    bbox.L = 0;
                    bbox.L = this.getAlignX(W, bbox, align) + shift;
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_8) throw e_8.error; }
            }
        };
        CommonMrowMixin.prototype.setChildPWidths = function (recompute, w, clear) {
            if (w === void 0) { w = null; }
            if (clear === void 0) { clear = true; }
            if (!this.breakCount)
                return _super.prototype.setChildPWidths.call(this, recompute, w, clear);
            if (recompute)
                return false;
            if (w !== null && this.bbox.w !== w) {
                this.bbox.w = w;
                this.shiftLines(w);
            }
            return true;
        };
        CommonMrowMixin.prototype.breakToWidth = function (W) {
            this.linebreaks.breakToWidth(this, W);
        };
        return CommonMrowMixin;
    }(Base));
}
exports.CommonMrowMixin = CommonMrowMixin;
function CommonInferredMrowMixin(Base) {
    return (function (_super) {
        __extends(CommonInferredMrowMixin, _super);
        function CommonInferredMrowMixin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CommonInferredMrowMixin.prototype.getScale = function () {
            this.bbox.scale = this.parent.bbox.scale;
            this.bbox.rscale = 1;
        };
        return CommonInferredMrowMixin;
    }(Base));
}
exports.CommonInferredMrowMixin = CommonInferredMrowMixin;
//# sourceMappingURL=mrow.js.map