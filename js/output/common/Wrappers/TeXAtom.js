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
exports.CommonTeXAtomMixin = void 0;
var MmlNode_js_1 = require("../../../core/MmlTree/MmlNode.js");
function CommonTeXAtomMixin(Base) {
    return (function (_super) {
        __extends(CommonTeXAtomMixin, _super);
        function CommonTeXAtomMixin() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.dh = 0;
            return _this;
        }
        CommonTeXAtomMixin.prototype.computeBBox = function (bbox, recompute) {
            if (recompute === void 0) { recompute = false; }
            _super.prototype.computeBBox.call(this, bbox, recompute);
            if (this.childNodes[0] && this.childNodes[0].bbox.ic) {
                bbox.ic = this.childNodes[0].bbox.ic;
            }
            if (this.node.texClass === MmlNode_js_1.TEXCLASS.VCENTER) {
                var h = bbox.h, d = bbox.d;
                var a = this.font.params.axis_height;
                this.dh = ((h + d) / 2 + a) - h;
                bbox.h += this.dh;
                bbox.d -= this.dh;
            }
            else if (this.node.texClass === MmlNode_js_1.TEXCLASS.VBOX) {
                if (this.vboxAdjust(this.childNodes[0], bbox) || this.childNodes[0].childNodes.length > 1)
                    return;
                var child = this.childNodes[0].childNodes[0];
                (child.node.isKind('mpadded') && this.vboxAdjust(child.childNodes[0], bbox)) || this.vboxAdjust(child, bbox);
            }
        };
        CommonTeXAtomMixin.prototype.vboxAdjust = function (child, bbox) {
            var n = child.lineBBox.length;
            if (!n)
                return false;
            this.dh = bbox.d - child.lineBBox[n - 1].d;
            bbox.h += this.dh;
            bbox.d -= this.dh;
            return true;
        };
        return CommonTeXAtomMixin;
    }(Base));
}
exports.CommonTeXAtomMixin = CommonTeXAtomMixin;
//# sourceMappingURL=TeXAtom.js.map