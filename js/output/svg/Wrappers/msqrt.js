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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgMsqrt = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var msqrt_js_1 = require("../../common/Wrappers/msqrt.js");
var msqrt_js_2 = require("../../../core/MmlTree/MmlNodes/msqrt.js");
exports.SvgMsqrt = (function () {
    var _a;
    var Base = (0, msqrt_js_1.CommonMsqrtMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgMsqrt, _super);
            function SvgMsqrt() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.dx = 0;
                return _this;
            }
            SvgMsqrt.prototype.addRoot = function (_ROOT, _root, _sbox, _H) {
                return 0;
            };
            SvgMsqrt.prototype.toSVG = function (parents) {
                var surd = this.surd;
                var base = this.childNodes[this.base];
                var root = (this.root ? this.childNodes[this.root] : null);
                var sbox = surd.getBBox();
                var bbox = base.getOuterBBox();
                var q = this.getPQ(sbox)[1];
                var t = this.font.params.rule_thickness * this.bbox.scale;
                var H = bbox.h + q + t;
                var SVG = this.standardSvgNodes(parents);
                var BASE = this.adaptor.append(SVG[0], this.svg('g'));
                var dx = this.addRoot(SVG, root, sbox, H);
                surd.toSVG(SVG);
                surd.place(dx, H - sbox.h);
                base.toSVG([BASE]);
                base.place(dx + sbox.w, 0);
                this.adaptor.append(SVG[SVG.length - 1], this.svg('rect', {
                    width: this.fixed(bbox.w), height: this.fixed(t),
                    x: this.fixed(dx + sbox.w), y: this.fixed(H - t)
                }));
            };
            return SvgMsqrt;
        }(Base)),
        _a.kind = msqrt_js_2.MmlMsqrt.prototype.kind,
        _a;
})();
//# sourceMappingURL=msqrt.js.map