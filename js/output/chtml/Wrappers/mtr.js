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
exports.ChtmlMlabeledtr = exports.ChtmlMtr = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mtr_js_1 = require("../../common/Wrappers/mtr.js");
var mtr_js_2 = require("../../../core/MmlTree/MmlNodes/mtr.js");
exports.ChtmlMtr = (function () {
    var _a;
    var Base = (0, mtr_js_1.CommonMtrMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlMtr, _super);
            function ChtmlMtr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMtr.prototype.toCHTML = function (parents) {
                _super.prototype.toCHTML.call(this, parents);
                var align = this.node.attributes.get('rowalign');
                if (align !== 'baseline') {
                    this.adaptor.setAttribute(this.dom[0], 'rowalign', align);
                }
            };
            return ChtmlMtr;
        }(Base)),
        _a.kind = mtr_js_2.MmlMtr.prototype.kind,
        _a.styles = {
            'mjx-mtr': {
                display: 'table-row',
            },
            'mjx-mtr[rowalign="top"] > mjx-mtd': {
                'vertical-align': 'top'
            },
            'mjx-mtr[rowalign="center"] > mjx-mtd': {
                'vertical-align': 'middle'
            },
            'mjx-mtr[rowalign="bottom"] > mjx-mtd': {
                'vertical-align': 'bottom'
            },
            'mjx-mtr[rowalign="baseline"] > mjx-mtd': {
                'vertical-align': 'baseline'
            },
            'mjx-mtr[rowalign="axis"] > mjx-mtd': {
                'vertical-align': '.25em'
            }
        },
        _a;
})();
exports.ChtmlMlabeledtr = (function () {
    var _a;
    var Base = (0, mtr_js_1.CommonMlabeledtrMixin)(exports.ChtmlMtr);
    return _a = (function (_super) {
            __extends(ChtmlMlabeledtr, _super);
            function ChtmlMlabeledtr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMlabeledtr.prototype.toCHTML = function (parents) {
                _super.prototype.toCHTML.call(this, parents);
                var child = this.adaptor.firstChild(this.dom[0]);
                if (child) {
                    this.adaptor.remove(child);
                    var align = this.node.attributes.get('rowalign');
                    var attr = (align !== 'baseline' && align !== 'axis' ? { rowalign: align } : {});
                    var row = this.html('mjx-mtr', attr, [child]);
                    this.adaptor.append(this.parent.labels, row);
                }
            };
            ChtmlMlabeledtr.prototype.markUsed = function () {
                _super.prototype.markUsed.call(this);
                this.jax.wrapperUsage.add(exports.ChtmlMtr.kind);
            };
            return ChtmlMlabeledtr;
        }(Base)),
        _a.kind = mtr_js_2.MmlMlabeledtr.prototype.kind,
        _a.styles = {
            'mjx-mlabeledtr': {
                display: 'table-row'
            },
            'mjx-mlabeledtr[rowalign="top"] > mjx-mtd': {
                'vertical-align': 'top'
            },
            'mjx-mlabeledtr[rowalign="center"] > mjx-mtd': {
                'vertical-align': 'middle'
            },
            'mjx-mlabeledtr[rowalign="bottom"] > mjx-mtd': {
                'vertical-align': 'bottom'
            },
            'mjx-mlabeledtr[rowalign="baseline"] > mjx-mtd': {
                'vertical-align': 'baseline'
            },
            'mjx-mlabeledtr[rowalign="axis"] > mjx-mtd': {
                'vertical-align': '.25em'
            }
        },
        _a;
})();
//# sourceMappingURL=mtr.js.map