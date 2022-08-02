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
exports.ChtmlMath = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var math_js_1 = require("../../common/Wrappers/math.js");
var math_js_2 = require("../../../core/MmlTree/MmlNodes/math.js");
var BBox_js_1 = require("../../../util/BBox.js");
exports.ChtmlMath = (function () {
    var _a;
    var Base = (0, math_js_1.CommonMathMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlMath, _super);
            function ChtmlMath() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMath.prototype.handleDisplay = function (parent) {
                var adaptor = this.adaptor;
                var _a = __read(this.getAlignShift(), 2), align = _a[0], shift = _a[1];
                if (align !== 'center') {
                    adaptor.setAttribute(parent, 'justify', align);
                }
                if (this.bbox.pwidth === BBox_js_1.BBox.fullWidth) {
                    adaptor.setAttribute(parent, 'width', 'full');
                    if (this.jax.table) {
                        var _b = this.jax.table.getOuterBBox(), L = _b.L, w = _b.w, R = _b.R;
                        if (align === 'right') {
                            R = Math.max(R || -shift, -shift);
                        }
                        else if (align === 'left') {
                            L = Math.max(L || shift, shift);
                        }
                        else if (align === 'center') {
                            w += 2 * Math.abs(shift);
                        }
                        var W = this.em(Math.max(0, L + w + R));
                        adaptor.setStyle(parent, 'min-width', W);
                        adaptor.setStyle(this.jax.table.dom[0], 'min-width', W);
                    }
                }
                else {
                    this.setIndent(this.dom[0], align, shift);
                }
            };
            ChtmlMath.prototype.handleInline = function (parent) {
                var adaptor = this.adaptor;
                var margin = adaptor.getStyle(this.dom[0], 'margin-right');
                if (margin) {
                    adaptor.setStyle(this.dom[0], 'margin-right', '');
                    adaptor.setStyle(parent, 'margin-right', margin);
                    adaptor.setStyle(parent, 'width', '0');
                }
            };
            ChtmlMath.prototype.toCHTML = function (parents) {
                _super.prototype.toCHTML.call(this, parents);
                var adaptor = this.adaptor;
                var display = (this.node.attributes.get('display') === 'block');
                if (display) {
                    adaptor.setAttribute(this.dom[0], 'display', 'true');
                    adaptor.setAttribute(parents[0], 'display', 'true');
                    this.handleDisplay(parents[0]);
                }
                else {
                    this.handleInline(parents[0]);
                }
                adaptor.addClass(this.dom[0], 'MJX-TEX');
            };
            ChtmlMath.prototype.setChildPWidths = function (recompute, w, clear) {
                if (w === void 0) { w = null; }
                if (clear === void 0) { clear = true; }
                return (this.parent ? _super.prototype.setChildPWidths.call(this, recompute, w, clear) : false);
            };
            ChtmlMath.prototype.handleAttributes = function () {
                _super.prototype.handleAttributes.call(this);
                var adaptor = this.adaptor;
                if (this.node.getProperty('breakable')) {
                    this.dom.forEach(function (dom) { return adaptor.setAttribute(dom, 'breakable', 'true'); });
                }
            };
            return ChtmlMath;
        }(Base)),
        _a.kind = math_js_2.MmlMath.prototype.kind,
        _a.styles = {
            'mjx-math': {
                'line-height': 0,
                'text-align': 'left',
                'text-indent': 0,
                'font-style': 'normal',
                'font-weight': 'normal',
                'font-size': '100%',
                'font-size-adjust': 'none',
                'letter-spacing': 'normal',
                'word-wrap': 'normal',
                'word-spacing': 'normal',
                'direction': 'ltr',
                'padding': '1px 0'
            },
            'mjx-container[jax="CHTML"][display="true"]': {
                display: 'block',
                'text-align': 'center',
                'justify-content': 'center',
                margin: '1em 0'
            },
            'mjx-container[jax="CHTML"][display="true"][width="full"]': {
                display: 'flex',
            },
            'mjx-container[jax="CHTML"][display="true"] mjx-math': {
                padding: 0
            },
            'mjx-container[jax="CHTML"][justify="left"]': {
                'text-align': 'left',
                'justify-content': 'left'
            },
            'mjx-container[jax="CHTML"][justify="right"]': {
                'text-align': 'right',
                'justify-content': 'right'
            },
            'mjx-break::after': {
                content: '" "',
                'white-space': 'normal'
            },
            'mjx-break[size="1"]': {
                'font-size': '44.4%'
            },
            'mjx-break[size="2"]': {
                'font-size': '66.8%'
            },
            'mjx-break[size="3"]': {
                'font-size': '88.8%'
            },
            'mjx-break[size="4"]': {
                'font-size': '111.2%'
            },
            'mjx-break[size="5"]': {
                'font-size': '133.2%'
            },
            'mjx-math[breakable]': {
                display: 'inline'
            }
        },
        _a;
})();
//# sourceMappingURL=math.js.map