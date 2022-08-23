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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgInferredMrow = exports.SvgMrow = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mrow_js_1 = require("../../common/Wrappers/mrow.js");
var mrow_js_2 = require("../../../core/MmlTree/MmlNodes/mrow.js");
exports.SvgMrow = (function () {
    var _a;
    var Base = (0, mrow_js_1.CommonMrowMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgMrow, _super);
            function SvgMrow() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.linebreakCount = 0;
                return _this;
            }
            SvgMrow.prototype.toSVG = function (parents) {
                this.getBBox();
                var n = this.linebreakCount = (this.isStack ? 0 : this.breakCount);
                if (n || !this.node.isInferred) {
                    parents = this.standardSvgNodes(parents);
                }
                else {
                    this.dom = parents;
                }
                this.addChildren(parents);
                n && this.placeLines(parents);
            };
            SvgMrow.prototype.placeLines = function (parents) {
                var e_1, _a;
                var _b;
                var lines = this.lineBBox;
                var y = 0;
                try {
                    for (var _c = __values(parents.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var k = _d.value;
                        var lbox = lines[k];
                        this.place(lbox.L || 0, y, parents[k]);
                        y -= Math.max(.25, lbox.d) + lbox.lineLeading + Math.max(.75, ((_b = lines[k + 1]) === null || _b === void 0 ? void 0 : _b.h) || 0);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            };
            SvgMrow.prototype.createSvgNodes = function (parents) {
                var n = this.linebreakCount;
                if (!n)
                    return _super.prototype.createSvgNodes.call(this, parents);
                var adaptor = this.adaptor;
                var def = (this.node.isInferred ? { 'data-mjx-linestack': true } : { 'data-mml-node': this.node.kind });
                this.dom = [adaptor.append(parents[0], this.svg('g', def))];
                this.dom = [adaptor.append(this.handleHref(parents)[0], this.dom[0])];
                var svg = Array(n);
                for (var i = 0; i <= n; i++) {
                    svg[i] = adaptor.append(this.dom[0], this.svg('g', { 'data-mjx-linebox': true, 'data-mjx-lineno': i }));
                }
                return svg;
            };
            SvgMrow.prototype.addChildren = function (parents) {
                var e_2, _a, e_3, _b;
                var x = 0;
                var i = 0;
                try {
                    for (var _c = __values(this.childNodes), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var child = _d.value;
                        var n = child.breakCount;
                        child.toSVG(parents.slice(i, i + n + 1));
                        if (child.dom) {
                            var k = 0;
                            try {
                                for (var _e = (e_3 = void 0, __values(child.dom)), _f = _e.next(); !_f.done; _f = _e.next()) {
                                    var dom = _f.value;
                                    if (dom) {
                                        var dx = (k ? 0 : child.dx);
                                        var cbox = child.getLineBBox(k++);
                                        x += (cbox.L + dx) * cbox.rscale;
                                        this.place(x, 0, dom);
                                        x += (cbox.w + cbox.R - dx) * cbox.rscale;
                                    }
                                    if (n) {
                                        x = 0;
                                    }
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                            if (n) {
                                var cbox = child.getLineBBox(n);
                                x += (cbox.w + cbox.R) * cbox.rscale;
                            }
                        }
                        i += n;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            };
            return SvgMrow;
        }(Base)),
        _a.kind = mrow_js_2.MmlMrow.prototype.kind,
        _a;
})();
exports.SvgInferredMrow = (function () {
    var _a;
    var Base = (0, mrow_js_1.CommonInferredMrowMixin)(exports.SvgMrow);
    return _a = (function (_super) {
            __extends(SvgInferredMrowNTD, _super);
            function SvgInferredMrowNTD() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return SvgInferredMrowNTD;
        }(Base)),
        _a.kind = mrow_js_2.MmlInferredMrow.prototype.kind,
        _a;
})();
//# sourceMappingURL=mrow.js.map