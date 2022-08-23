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
exports.SvgHtmlNode = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var HtmlNode_js_1 = require("../../common/Wrappers/HtmlNode.js");
var HtmlNode_js_2 = require("../../../core/MmlTree/MmlNodes/HtmlNode.js");
exports.SvgHtmlNode = (function () {
    var _a;
    var Base = (0, HtmlNode_js_1.CommonHtmlNodeMixin)(Wrapper_js_1.SvgWrapper);
    return _a = (function (_super) {
            __extends(SvgHtmlNode, _super);
            function SvgHtmlNode() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SvgHtmlNode.prototype.toSVG = function (parents) {
                var metrics = this.jax.math.metrics;
                var em = metrics.em * metrics.scale;
                var scale = this.fixed(1 / em);
                var _a = this.getBBox(), w = _a.w, h = _a.h, d = _a.d;
                this.dom = [this.adaptor.append(parents[0], this.svg('foreignObject', {
                        'data-mjx-html': true,
                        y: this.jax.fixed(-h * em) + 'px',
                        width: this.jax.fixed(w * em) + 'px',
                        height: this.jax.fixed((h + d) * em) + 'px',
                        transform: "scale(".concat(scale, ") matrix(1 0 0 -1 0 0)")
                    }, [this.getHTML()]))];
            };
            return SvgHtmlNode;
        }(Base)),
        _a.kind = HtmlNode_js_2.HtmlNode.prototype.kind,
        _a.styles = {
            'foreignObject[data-mjx-html]': {
                overflow: 'visible'
            },
            'mjx-html': {
                display: 'inline-block',
                'line-height': 'normal',
                'text-align': 'initial',
            },
            'mjx-html-holder': {
                display: 'block',
                position: 'absolute',
                width: '100%',
                height: '100%'
            }
        },
        _a;
})();
//# sourceMappingURL=HtmlNode.js.map