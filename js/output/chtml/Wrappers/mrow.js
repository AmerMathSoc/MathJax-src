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
exports.ChtmlInferredMrow = exports.ChtmlMrow = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var mrow_js_1 = require("../../common/Wrappers/mrow.js");
var mrow_js_2 = require("../../common/Wrappers/mrow.js");
var mrow_js_3 = require("../../../core/MmlTree/MmlNodes/mrow.js");
exports.ChtmlMrow = (function () {
    var _a;
    var Base = (0, mrow_js_1.CommonMrowMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlMrow, _super);
            function ChtmlMrow() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.linebreakCount = 0;
                return _this;
            }
            ChtmlMrow.prototype.toCHTML = function (parents) {
                var n = this.linebreakCount = (this.isStack ? 0 : this.breakCount);
                if (n || !this.node.isInferred) {
                    parents = this.standardChtmlNodes(parents);
                }
                else {
                    this.dom = parents;
                }
                this.addChildren(parents);
                if (n) {
                    this.placeLines(parents, n);
                }
                else {
                    this.handleNegativeWidth(parents[0]);
                }
            };
            ChtmlMrow.prototype.placeLines = function (parents, n) {
                var e_1, _a;
                this.getBBox();
                var lines = this.lineBBox;
                var adaptor = this.adaptor;
                var _b = __read(lines[1].indentData[0], 2), alignfirst = _b[0], shiftfirst = _b[1];
                try {
                    for (var _c = __values(parents.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var i = _d.value;
                        var bbox = lines[i];
                        var _e = __read((i === 0 ? [alignfirst, shiftfirst] : bbox.indentData[i === n ? 2 : 1]), 2), indentalign = _e[0], indentshift = _e[1];
                        var _f = __read(this.processIndent(indentalign, indentshift, alignfirst, shiftfirst), 2), align = _f[0], shift = _f[1];
                        adaptor.setAttribute(parents[i], 'align', align);
                        if (shift) {
                            adaptor.setStyle(parents[i], 'position', 'relative');
                            adaptor.setStyle(parents[i], 'left', this.em(shift));
                        }
                        i < n && adaptor.setStyle(parents[i], 'margin-bottom', this.em(bbox.lineLeading));
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
            ChtmlMrow.prototype.handleNegativeWidth = function (dom) {
                var w = this.getBBox().w;
                if (w < 0) {
                    this.adaptor.setStyle(dom, 'width', this.em(Math.max(0, w)));
                    this.adaptor.setStyle(dom, 'marginRight', this.em(w));
                }
            };
            ChtmlMrow.prototype.createChtmlNodes = function (parents) {
                var n = this.linebreakCount;
                if (!n)
                    return _super.prototype.createChtmlNodes.call(this, parents);
                var adaptor = this.adaptor;
                var kind = (this.node.isInferred ? 'mjx-linestack' : 'mjx-' + this.node.kind);
                this.dom = [adaptor.append(parents[0], this.html(kind))];
                if (kind === 'mjx-mrow' && !this.isStack) {
                    adaptor.setAttribute(this.dom[0], 'break-top', 'true');
                }
                this.dom = [adaptor.append(this.handleHref(parents)[0], this.dom[0])];
                var chtml = Array(n);
                var inlineBreaks = this.node.getProperty('breakable');
                for (var i = 0; i <= n; i++) {
                    chtml[i] = adaptor.append(this.dom[0], this.html('mjx-linebox', { 'lineno': i }));
                    inlineBreaks && adaptor.append(this.dom[0], this.html('mjx-break', { newline: true }));
                }
                return chtml;
            };
            ChtmlMrow.prototype.addChildren = function (parents) {
                var e_2, _a;
                var i = 0;
                try {
                    for (var _b = __values(this.childNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var child = _c.value;
                        var n = child.breakCount;
                        child.toCHTML(parents.slice(i, i + n + 1));
                        i += n;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            };
            return ChtmlMrow;
        }(Base)),
        _a.kind = mrow_js_3.MmlMrow.prototype.kind,
        _a.styles = {
            'mjx-linestack, mjx-mrow[break-top]': {
                display: 'inline-table',
                width: '100%'
            },
            'mjx-linestack[data-mjx-breakable]': {
                display: 'inline',
                width: 'initial',
            },
            'mjx-linestack[data-mjx-breakable] > mjx-linebox': {
                display: 'inline'
            },
            'mjx-break[newline]::after': {
                display: 'block'
            },
            'mjx-linebox': {
                display: 'block'
            },
            'mjx-linebox[align="left"]': {
                'text-align': 'left'
            },
            'mjx-linebox[align="center"]': {
                'text-align': 'center'
            },
            'mjx-linebox[align="right"]': {
                'text-align': 'right'
            },
            'mjx-linestrut': {
                display: 'inline-block',
                height: '1em',
                'vertical-align': '-.25em'
            }
        },
        _a;
})();
exports.ChtmlInferredMrow = (function () {
    var _a;
    var Base = (0, mrow_js_2.CommonInferredMrowMixin)(exports.ChtmlMrow);
    return _a = (function (_super) {
            __extends(ChtmlInferredMrow, _super);
            function ChtmlInferredMrow() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return ChtmlInferredMrow;
        }(Base)),
        _a.kind = mrow_js_3.MmlInferredMrow.prototype.kind,
        _a;
})();
//# sourceMappingURL=mrow.js.map