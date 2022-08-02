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
exports.ChtmlMunderover = exports.ChtmlMover = exports.ChtmlMunder = void 0;
var munderover_js_1 = require("../../common/Wrappers/munderover.js");
var munderover_js_2 = require("../../../core/MmlTree/MmlNodes/munderover.js");
var msubsup_js_1 = require("./msubsup.js");
exports.ChtmlMunder = (function () {
    var _a;
    var Base = (0, munderover_js_1.CommonMunderMixin)(msubsup_js_1.ChtmlMsub);
    return _a = (function (_super) {
            __extends(ChtmlMunder, _super);
            function ChtmlMunder() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMunder.prototype.toCHTML = function (parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                if (this.hasMovableLimits()) {
                    _super.prototype.toCHTML.call(this, parents);
                    this.adaptor.setAttribute(this.dom[0], 'limits', 'false');
                    return;
                }
                this.dom = this.standardChtmlNodes(parents);
                var base = this.adaptor.append(this.adaptor.append(this.dom[0], this.html('mjx-row')), this.html('mjx-base'));
                var under = this.adaptor.append(this.adaptor.append(this.dom[0], this.html('mjx-row')), this.html('mjx-under'));
                this.baseChild.toCHTML([base]);
                this.scriptChild.toCHTML([under]);
                var basebox = this.baseChild.getOuterBBox();
                var underbox = this.scriptChild.getOuterBBox();
                var k = this.getUnderKV(basebox, underbox)[0];
                var delta = (this.isLineBelow ? 0 : this.getDelta(true));
                this.adaptor.setStyle(under, 'paddingTop', this.em(k));
                this.setDeltaW([base, under], this.getDeltaW([basebox, underbox], [0, -delta]));
                this.adjustUnderDepth(under, underbox);
            };
            return ChtmlMunder;
        }(Base)),
        _a.kind = munderover_js_2.MmlMunder.prototype.kind,
        _a.styles = {
            'mjx-over': {
                'text-align': 'left'
            },
            'mjx-munder:not([limits="false"])': {
                display: 'inline-table',
            },
            'mjx-munder > mjx-row': {
                'text-align': 'left'
            },
            'mjx-under': {
                'padding-bottom': '.1em'
            }
        },
        _a;
})();
exports.ChtmlMover = (function () {
    var _a;
    var Base = (0, munderover_js_1.CommonMoverMixin)(msubsup_js_1.ChtmlMsup);
    return _a = (function (_super) {
            __extends(ChtmlMover, _super);
            function ChtmlMover() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMover.prototype.toCHTML = function (parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                if (this.hasMovableLimits()) {
                    _super.prototype.toCHTML.call(this, parents);
                    this.adaptor.setAttribute(this.dom[0], 'limits', 'false');
                    return;
                }
                this.dom = this.standardChtmlNodes(parents);
                var over = this.adaptor.append(this.dom[0], this.html('mjx-over'));
                var base = this.adaptor.append(this.dom[0], this.html('mjx-base'));
                this.scriptChild.toCHTML([over]);
                this.baseChild.toCHTML([base]);
                var overbox = this.scriptChild.getOuterBBox();
                var basebox = this.baseChild.getOuterBBox();
                this.adjustBaseHeight(base, basebox);
                var k = this.getOverKU(basebox, overbox)[0];
                var delta = (this.isLineAbove ? 0 : this.getDelta());
                this.adaptor.setStyle(over, 'paddingBottom', this.em(k));
                this.setDeltaW([base, over], this.getDeltaW([basebox, overbox], [0, delta]));
                this.adjustOverDepth(over, overbox);
            };
            return ChtmlMover;
        }(Base)),
        _a.kind = munderover_js_2.MmlMover.prototype.kind,
        _a.styles = {
            'mjx-mover:not([limits="false"])': {
                'padding-top': '.1em'
            },
            'mjx-mover:not([limits="false"]) > *': {
                display: 'block',
                'text-align': 'left'
            }
        },
        _a;
})();
exports.ChtmlMunderover = (function () {
    var _a;
    var Base = (0, munderover_js_1.CommonMunderoverMixin)(msubsup_js_1.ChtmlMsubsup);
    return _a = (function (_super) {
            __extends(ChtmlMunderover, _super);
            function ChtmlMunderover() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMunderover.prototype.toCHTML = function (parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                if (this.hasMovableLimits()) {
                    _super.prototype.toCHTML.call(this, parents);
                    this.adaptor.setAttribute(this.dom[0], 'limits', 'false');
                    return;
                }
                this.dom = this.standardChtmlNodes(parents);
                var over = this.adaptor.append(this.dom[0], this.html('mjx-over'));
                var table = this.adaptor.append(this.adaptor.append(this.dom[0], this.html('mjx-box')), this.html('mjx-munder'));
                var base = this.adaptor.append(this.adaptor.append(table, this.html('mjx-row')), this.html('mjx-base'));
                var under = this.adaptor.append(this.adaptor.append(table, this.html('mjx-row')), this.html('mjx-under'));
                this.overChild.toCHTML([over]);
                this.baseChild.toCHTML([base]);
                this.underChild.toCHTML([under]);
                var overbox = this.overChild.getOuterBBox();
                var basebox = this.baseChild.getOuterBBox();
                var underbox = this.underChild.getOuterBBox();
                this.adjustBaseHeight(base, basebox);
                var ok = this.getOverKU(basebox, overbox)[0];
                var uk = this.getUnderKV(basebox, underbox)[0];
                var delta = this.getDelta();
                this.adaptor.setStyle(over, 'paddingBottom', this.em(ok));
                this.adaptor.setStyle(under, 'paddingTop', this.em(uk));
                this.setDeltaW([base, under, over], this.getDeltaW([basebox, underbox, overbox], [0, this.isLineBelow ? 0 : -delta, this.isLineAbove ? 0 : delta]));
                this.adjustOverDepth(over, overbox);
                this.adjustUnderDepth(under, underbox);
            };
            ChtmlMunderover.prototype.markUsed = function () {
                _super.prototype.markUsed.call(this);
                this.jax.wrapperUsage.add(msubsup_js_1.ChtmlMsubsup.kind);
            };
            return ChtmlMunderover;
        }(Base)),
        _a.kind = munderover_js_2.MmlMunderover.prototype.kind,
        _a.styles = {
            'mjx-munderover:not([limits="false"])': {
                'padding-top': '.1em'
            },
            'mjx-munderover:not([limits="false"]) > *': {
                display: 'block'
            },
        },
        _a;
})();
//# sourceMappingURL=munderover.js.map