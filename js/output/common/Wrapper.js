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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonWrapper = exports.SPACE = void 0;
var Wrapper_js_1 = require("../../core/Tree/Wrapper.js");
var MmlNode_js_1 = require("../../core/MmlTree/MmlNode.js");
var string_js_1 = require("../../util/string.js");
var LENGTHS = __importStar(require("../../util/lengths.js"));
var Styles_js_1 = require("../../util/Styles.js");
var BBox_js_1 = require("../../util/BBox.js");
var LineBBox_js_1 = require("./LineBBox.js");
var FontData_js_1 = require("./FontData.js");
var SMALLSIZE = 2 / 18;
function MathMLSpace(script, size) {
    return (script ? size < SMALLSIZE ? 0 : SMALLSIZE : size);
}
exports.SPACE = (_a = {},
    _a[LENGTHS.em(2 / 18)] = '1',
    _a[LENGTHS.em(3 / 18)] = '2',
    _a[LENGTHS.em(4 / 18)] = '3',
    _a[LENGTHS.em(5 / 18)] = '4',
    _a[LENGTHS.em(6 / 18)] = '5',
    _a);
var CommonWrapper = (function (_super) {
    __extends(CommonWrapper, _super);
    function CommonWrapper(factory, node, parent) {
        if (parent === void 0) { parent = null; }
        var _this = _super.call(this, factory, node) || this;
        _this.parent = null;
        _this.dom = null;
        _this.removedStyles = null;
        _this.styles = null;
        _this.styleData = null;
        _this.variant = '';
        _this.bboxComputed = false;
        _this._breakCount = -1;
        _this.lineBBox = [];
        _this.stretch = FontData_js_1.NOSTRETCH;
        _this.font = null;
        _this.parent = parent;
        _this.font = factory.jax.font;
        _this.bbox = BBox_js_1.BBox.zero();
        _this.getStyles();
        _this.getStyleData();
        _this.getVariant();
        _this.getScale();
        _this.getSpace();
        _this.childNodes = node.childNodes.map(function (child) {
            var wrapped = _this.wrap(child);
            if (wrapped.bbox.pwidth && (node.notParent || node.isKind('math'))) {
                _this.bbox.pwidth = BBox_js_1.BBox.fullWidth;
            }
            return wrapped;
        });
        return _this;
    }
    Object.defineProperty(CommonWrapper.prototype, "jax", {
        get: function () {
            return this.factory.jax;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CommonWrapper.prototype, "adaptor", {
        get: function () {
            return this.factory.jax.adaptor;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CommonWrapper.prototype, "metrics", {
        get: function () {
            return this.factory.jax.math.metrics;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CommonWrapper.prototype, "containerWidth", {
        get: function () {
            return this.jax.containerWidth;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CommonWrapper.prototype, "linebreaks", {
        get: function () {
            return this.jax.linebreaks;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CommonWrapper.prototype, "linebreakOptions", {
        get: function () {
            return this.jax.options.linebreaks;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CommonWrapper.prototype, "fixesPWidth", {
        get: function () {
            return !this.node.notParent && !this.node.isToken;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CommonWrapper.prototype, "breakCount", {
        get: function () {
            if (this._breakCount < 0) {
                var node = this.node;
                this._breakCount = (node.isEmbellished ? this.coreMO().embellishedBreakCount :
                    node.arity < 0 && !node.linebreakContainer &&
                        this.childNodes[0].isStack ?
                        this.childNodes[0].breakCount : 0);
            }
            return this._breakCount;
        },
        enumerable: false,
        configurable: true
    });
    CommonWrapper.prototype.breakTop = function (mrow, _child) {
        return ((this.node.linebreakContainer || !this.parent) ? mrow : this.parent.breakTop(mrow, this));
    };
    CommonWrapper.prototype.wrap = function (node, parent) {
        if (parent === void 0) { parent = null; }
        var wrapped = this.factory.wrap(node, parent || this);
        if (parent) {
            parent.childNodes.push(wrapped);
        }
        this.jax.nodeMap.set(node, wrapped);
        return wrapped;
    };
    CommonWrapper.prototype.getBBox = function (save) {
        if (save === void 0) { save = true; }
        if (this.bboxComputed) {
            return this.bbox;
        }
        var bbox = (save ? this.bbox : BBox_js_1.BBox.zero());
        this.computeBBox(bbox);
        this.bboxComputed = save;
        return bbox;
    };
    CommonWrapper.prototype.getOuterBBox = function (save) {
        var e_1, _a;
        var _b;
        if (save === void 0) { save = true; }
        var bbox = this.getBBox(save);
        if (!this.styleData)
            return bbox;
        var padding = this.styleData.padding;
        var border = ((_b = this.styleData.border) === null || _b === void 0 ? void 0 : _b.width) || [0, 0, 0, 0];
        var obox = bbox.copy();
        try {
            for (var _c = __values(BBox_js_1.BBox.boxSides), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 3), i = _e[1], side = _e[2];
                obox[side] += (padding[i] + border[i]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return obox;
    };
    CommonWrapper.prototype.getUnbrokenHD = function () {
        var n = this.breakCount + 1;
        var H = 0;
        var D = 0;
        for (var i = 0; i < n; i++) {
            var _a = this.getLineBBox(i), h = _a.h, d = _a.d;
            if (h > H) {
                H = h;
            }
            if (d > D) {
                D = d;
            }
        }
        return [H, D];
    };
    CommonWrapper.prototype.computeBBox = function (bbox, recompute) {
        var e_2, _a;
        if (recompute === void 0) { recompute = false; }
        bbox.empty();
        try {
            for (var _b = __values(this.childNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                bbox.append(child.getOuterBBox());
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        bbox.clean();
        if (this.fixesPWidth && this.setChildPWidths(recompute)) {
            this.computeBBox(bbox, true);
        }
    };
    CommonWrapper.prototype.getLineBBox = function (i) {
        if (!this.lineBBox[i]) {
            var n = this.breakCount;
            if (n) {
                var line = (this.embellishedBBox(i) || this.computeLineBBox(i));
                this.lineBBox[i] = line;
                if (i === 0) {
                    if (!this.node.isKind('mo') && this.node.isEmbellished) {
                        line.originalL = this.getBBox().L;
                    }
                    else {
                        line.L = this.getBBox().L;
                    }
                }
                if (i === n) {
                    line.R = this.getBBox().R;
                }
            }
            else {
                this.lineBBox[i] = LineBBox_js_1.LineBBox.from(this.getOuterBBox(), this.linebreakOptions.lineleading);
            }
        }
        return this.lineBBox[i];
    };
    CommonWrapper.prototype.embellishedBBox = function (i) {
        if (!this.node.isEmbellished || this.node.isKind('mo'))
            return null;
        var mo = this.coreMO();
        return mo.moLineBBox(i, mo.embellishedBreakStyle, this.getOuterBBox());
    };
    CommonWrapper.prototype.computeLineBBox = function (i) {
        return this.getChildLineBBox(this.childNodes[0], i);
    };
    CommonWrapper.prototype.getBreakNode = function (bbox) {
        var _a = __read(bbox.start || [0, 0], 2), i = _a[0], j = _a[1];
        if (this.node.isEmbellished)
            return [this, this.coreMO()];
        if (this.node.isToken || !this.childNodes[i])
            return [this, null];
        return this.childNodes[i].getBreakNode(this.childNodes[i].getLineBBox(j));
    };
    CommonWrapper.prototype.getChildLineBBox = function (child, i) {
        var n = this.breakCount;
        var cbox = child.getLineBBox(i);
        if (this.styleData || this.bbox.L || this.bbox.R) {
            cbox = cbox.copy();
        }
        this.addMiddleBorders(cbox);
        if (i === 0) {
            cbox.L += this.bbox.L;
            this.addLeftBorders(cbox);
        }
        else if (i === n) {
            cbox.R += this.bbox.R;
            this.addRightBorders(cbox);
        }
        return cbox;
    };
    CommonWrapper.prototype.addLeftBorders = function (bbox) {
        var _a;
        if (!this.styleData)
            return;
        var border = this.styleData.border;
        var padding = this.styleData.padding;
        bbox.w += (((_a = border === null || border === void 0 ? void 0 : border.width) === null || _a === void 0 ? void 0 : _a[3]) || 0) + ((padding === null || padding === void 0 ? void 0 : padding[3]) || 0);
    };
    CommonWrapper.prototype.addMiddleBorders = function (bbox) {
        var _a, _b;
        if (!this.styleData)
            return;
        var border = this.styleData.border;
        var padding = this.styleData.padding;
        bbox.h += (((_a = border === null || border === void 0 ? void 0 : border.width) === null || _a === void 0 ? void 0 : _a[0]) || 0) + ((padding === null || padding === void 0 ? void 0 : padding[0]) || 0);
        bbox.d += (((_b = border === null || border === void 0 ? void 0 : border.width) === null || _b === void 0 ? void 0 : _b[2]) || 0) + ((padding === null || padding === void 0 ? void 0 : padding[2]) || 0);
    };
    CommonWrapper.prototype.addRightBorders = function (bbox) {
        var _a;
        if (!this.styleData)
            return;
        var border = this.styleData.border;
        var padding = this.styleData.padding;
        bbox.w += (((_a = border === null || border === void 0 ? void 0 : border.width) === null || _a === void 0 ? void 0 : _a[1]) || 0) + ((padding === null || padding === void 0 ? void 0 : padding[1]) || 0);
    };
    CommonWrapper.prototype.setChildPWidths = function (recompute, w, clear) {
        var e_3, _a;
        if (w === void 0) { w = null; }
        if (clear === void 0) { clear = true; }
        if (recompute) {
            return false;
        }
        if (clear) {
            this.bbox.pwidth = '';
        }
        var changed = false;
        try {
            for (var _b = __values(this.childNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                var cbox = child.getBBox();
                if (cbox.pwidth && child.setChildPWidths(recompute, w === null ? cbox.w : w, clear)) {
                    changed = true;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return changed;
    };
    CommonWrapper.prototype.breakToWidth = function (_W) {
    };
    CommonWrapper.prototype.invalidateBBox = function (bubble) {
        if (bubble === void 0) { bubble = true; }
        if (this.bboxComputed) {
            this.bboxComputed = false;
            this.lineBBox = [];
            this._breakCount = -1;
            if (this.parent && bubble) {
                this.parent.invalidateBBox();
            }
        }
    };
    CommonWrapper.prototype.copySkewIC = function (bbox) {
        var first = this.childNodes[0];
        if (first === null || first === void 0 ? void 0 : first.bbox.sk) {
            bbox.sk = first.bbox.sk;
        }
        if (first === null || first === void 0 ? void 0 : first.bbox.dx) {
            bbox.dx = first.bbox.dx;
        }
        var last = this.childNodes[this.childNodes.length - 1];
        if (last === null || last === void 0 ? void 0 : last.bbox.ic) {
            bbox.ic = last.bbox.ic;
            bbox.w += bbox.ic;
        }
    };
    CommonWrapper.prototype.getStyles = function () {
        var styleString = this.node.attributes.getExplicit('style');
        if (!styleString)
            return;
        var style = this.styles = new Styles_js_1.Styles(styleString);
        for (var i = 0, m = CommonWrapper.removeStyles.length; i < m; i++) {
            var id = CommonWrapper.removeStyles[i];
            if (style.get(id)) {
                if (!this.removedStyles)
                    this.removedStyles = {};
                this.removedStyles[id] = style.get(id);
                style.set(id, '');
            }
        }
    };
    CommonWrapper.prototype.getStyleData = function () {
        var e_4, _a;
        if (!this.styles)
            return;
        var padding = Array(4).fill(0);
        var width = Array(4).fill(0);
        var style = Array(4);
        var color = Array(4);
        var hasPadding = false;
        var hasBorder = false;
        try {
            for (var _b = __values(BBox_js_1.BBox.boxSides), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), name_1 = _d[0], i = _d[1];
                var key = 'border' + name_1;
                var w = this.styles.get(key + 'Width');
                if (w) {
                    hasBorder = true;
                    width[i] = Math.max(0, this.length2em(w, 1));
                    style[i] = this.styles.get(key + 'Style') || 'solid';
                    color[i] = this.styles.get(key + 'Color') || 'currentColor';
                }
                var p = this.styles.get('padding' + name_1);
                if (p) {
                    hasPadding = true;
                    padding[i] = Math.max(0, this.length2em(p, 1));
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        this.styleData = (hasPadding || hasBorder) ? {
            padding: padding,
            border: (hasBorder ? { width: width, style: style, color: color } : null)
        } : null;
    };
    CommonWrapper.prototype.getVariant = function () {
        if (!this.node.isToken)
            return;
        var attributes = this.node.attributes;
        var variant = attributes.get('mathvariant');
        if (!attributes.getExplicit('mathvariant')) {
            var values = attributes.getList('fontfamily', 'fontweight', 'fontstyle');
            if (this.removedStyles) {
                var style = this.removedStyles;
                if (style.fontFamily)
                    values.family = style.fontFamily;
                if (style.fontWeight)
                    values.weight = style.fontWeight;
                if (style.fontStyle)
                    values.style = style.fontStyle;
            }
            if (values.fontfamily)
                values.family = values.fontfamily;
            if (values.fontweight)
                values.weight = values.fontweight;
            if (values.fontstyle)
                values.style = values.fontstyle;
            if (values.weight && values.weight.match(/^\d+$/)) {
                values.weight = (parseInt(values.weight) > 600 ? 'bold' : 'normal');
            }
            if (values.family) {
                variant = this.explicitVariant(values.family, values.weight, values.style);
            }
            else {
                if (this.node.getProperty('variantForm'))
                    variant = '-tex-variant';
                variant = (CommonWrapper.BOLDVARIANTS[values.weight] || {})[variant] || variant;
                variant = (CommonWrapper.ITALICVARIANTS[values.style] || {})[variant] || variant;
            }
        }
        this.variant = variant;
    };
    CommonWrapper.prototype.explicitVariant = function (fontFamily, fontWeight, fontStyle) {
        var style = this.styles;
        if (!style)
            style = this.styles = new Styles_js_1.Styles();
        style.set('fontFamily', fontFamily);
        if (fontWeight)
            style.set('fontWeight', fontWeight);
        if (fontStyle)
            style.set('fontStyle', fontStyle);
        return '-explicitFont';
    };
    CommonWrapper.prototype.getScale = function () {
        var scale = 1, parent = this.parent;
        var pscale = (parent ? parent.bbox.scale : 1);
        var attributes = this.node.attributes;
        var scriptlevel = Math.min(attributes.get('scriptlevel'), 2);
        var fontsize = attributes.get('fontsize');
        var mathsize = (this.node.isToken || this.node.isKind('mstyle') ?
            attributes.get('mathsize') : attributes.getInherited('mathsize'));
        if (scriptlevel !== 0) {
            scale = Math.pow(attributes.get('scriptsizemultiplier'), scriptlevel);
            var scriptminsize = this.length2em(attributes.get('scriptminsize'), .8, 1);
            if (scale < scriptminsize)
                scale = scriptminsize;
        }
        if (this.removedStyles && this.removedStyles.fontSize && !fontsize) {
            fontsize = this.removedStyles.fontSize;
        }
        if (fontsize && !attributes.getExplicit('mathsize')) {
            mathsize = fontsize;
        }
        if (mathsize !== '1') {
            scale *= this.length2em(mathsize, 1, 1);
        }
        this.bbox.scale = scale;
        this.bbox.rscale = scale / pscale;
    };
    CommonWrapper.prototype.getSpace = function () {
        var isTop = this.isTopEmbellished();
        var hasSpacing = this.node.hasSpacingAttributes();
        if (this.jax.options.mathmlSpacing || hasSpacing) {
            isTop && this.getMathMLSpacing();
        }
        else {
            this.getTeXSpacing(isTop, hasSpacing);
        }
    };
    CommonWrapper.prototype.getMathMLSpacing = function () {
        var node = this.node.coreMO();
        var child = node.coreParent();
        var parent = child.parent;
        if (!parent || !parent.isKind('mrow') || parent.childNodes.length === 1)
            return;
        var attributes = node.attributes;
        var isScript = (attributes.get('scriptlevel') > 0);
        this.bbox.L = (attributes.isSet('lspace') ?
            Math.max(0, this.length2em(attributes.get('lspace'))) :
            MathMLSpace(isScript, node.lspace));
        this.bbox.R = (attributes.isSet('rspace') ?
            Math.max(0, this.length2em(attributes.get('rspace'))) :
            MathMLSpace(isScript, node.rspace));
        var n = parent.childIndex(child);
        if (n === 0)
            return;
        var prev = parent.childNodes[n - 1];
        if (!prev.isEmbellished)
            return;
        var bbox = this.jax.nodeMap.get(prev).getBBox();
        if (bbox.R) {
            this.bbox.L = Math.max(0, this.bbox.L - bbox.R);
        }
    };
    CommonWrapper.prototype.getTeXSpacing = function (isTop, hasSpacing) {
        if (!hasSpacing) {
            var space = this.node.texSpacing();
            if (space) {
                this.bbox.L = this.length2em(space);
            }
        }
        if (isTop || hasSpacing) {
            var attributes = this.node.coreMO().attributes;
            if (attributes.isSet('lspace')) {
                this.bbox.L = Math.max(0, this.length2em(attributes.get('lspace')));
            }
            if (attributes.isSet('rspace')) {
                this.bbox.R = Math.max(0, this.length2em(attributes.get('rspace')));
            }
        }
    };
    CommonWrapper.prototype.isTopEmbellished = function () {
        return (this.node.isEmbellished &&
            !(this.node.parent && this.node.parent.isEmbellished));
    };
    CommonWrapper.prototype.core = function () {
        return this.jax.nodeMap.get(this.node.core());
    };
    CommonWrapper.prototype.coreMO = function () {
        return this.jax.nodeMap.get(this.node.coreMO());
    };
    CommonWrapper.prototype.getText = function () {
        var e_5, _a;
        var text = '';
        if (this.node.isToken) {
            try {
                for (var _b = __values(this.node.childNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var child = _c.value;
                    if (child instanceof MmlNode_js_1.TextNode) {
                        text += child.getText();
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
        }
        return text;
    };
    CommonWrapper.prototype.canStretch = function (direction) {
        this.stretch = FontData_js_1.NOSTRETCH;
        if (this.node.isEmbellished) {
            var core = this.core();
            if (core && core.node !== this.node) {
                if (core.canStretch(direction)) {
                    this.stretch = core.stretch;
                }
            }
        }
        return this.stretch.dir !== 0;
    };
    CommonWrapper.prototype.getAlignShift = function () {
        var _a = this.node.attributes.getAllAttributes(), indentalign = _a.indentalign, indentshift = _a.indentshift, indentalignfirst = _a.indentalignfirst, indentshiftfirst = _a.indentshiftfirst;
        if (indentalignfirst !== 'indentalign') {
            indentalign = indentalignfirst;
        }
        if (indentshiftfirst !== 'indentshift') {
            indentshift = indentshiftfirst;
        }
        return this.processIndent(indentalign, indentshift);
    };
    CommonWrapper.prototype.processIndent = function (indentalign, indentshift, align, shift, width) {
        if (align === void 0) { align = ''; }
        if (shift === void 0) { shift = ''; }
        if (width === void 0) { width = this.metrics.containerWidth; }
        if (!align || align === 'auto') {
            align = this.jax.math.outputData.inlineMarked ? 'left' : this.jax.options.displayAlign;
        }
        if (!shift || shift === 'auto') {
            shift = this.jax.math.outputData.inlineMarked ? '0' : this.jax.options.displayIndent;
        }
        if (indentalign === 'auto') {
            indentalign = align;
        }
        if (indentshift === 'auto') {
            indentshift = shift;
            if (indentalign === 'right' && !indentshift.match(/^\s*0[a-z]*\s*$/)) {
                indentshift = ('-' + indentshift.trim()).replace(/^--/, '');
            }
        }
        var indent = this.length2em(indentshift, width);
        return [indentalign, indent];
    };
    CommonWrapper.prototype.getAlignX = function (W, bbox, align) {
        return (align === 'right' ? W - (bbox.w + bbox.R) * bbox.rscale :
            align === 'left' ? bbox.L * bbox.rscale :
                (W - bbox.w * bbox.rscale) / 2);
    };
    CommonWrapper.prototype.getAlignY = function (H, D, h, d, align) {
        return (align === 'top' ? H - h :
            align === 'bottom' ? d - D :
                align === 'center' ? ((H - h) - (D - d)) / 2 :
                    0);
    };
    CommonWrapper.prototype.getWrapWidth = function (i) {
        return this.childNodes[i].getBBox().w;
    };
    CommonWrapper.prototype.getChildAlign = function (_i) {
        return 'left';
    };
    CommonWrapper.prototype.percent = function (m) {
        return LENGTHS.percent(m);
    };
    CommonWrapper.prototype.em = function (m) {
        return LENGTHS.em(m);
    };
    CommonWrapper.prototype.px = function (m, M) {
        if (M === void 0) { M = -LENGTHS.BIGDIMEN; }
        return LENGTHS.px(m, M, this.metrics.em);
    };
    CommonWrapper.prototype.length2em = function (length, size, scale) {
        if (size === void 0) { size = 1; }
        if (scale === void 0) { scale = null; }
        if (scale === null) {
            scale = this.bbox.scale;
        }
        return LENGTHS.length2em(length, size, scale, this.jax.pxPerEm);
    };
    CommonWrapper.prototype.unicodeChars = function (text, name) {
        if (name === void 0) { name = this.variant; }
        var chars = (0, string_js_1.unicodeChars)(text);
        var variant = this.font.getVariant(name);
        if (variant && variant.chars) {
            var map_1 = variant.chars;
            chars = chars.map(function (n) { return ((map_1[n] || [])[3] || {}).smp || n; });
        }
        return chars;
    };
    CommonWrapper.prototype.remapChars = function (chars) {
        return chars;
    };
    CommonWrapper.prototype.mmlText = function (text) {
        return this.node.factory.create('text').setText(text);
    };
    CommonWrapper.prototype.mmlNode = function (kind, properties, children) {
        if (properties === void 0) { properties = {}; }
        if (children === void 0) { children = []; }
        return this.node.factory.create(kind, properties, children);
    };
    CommonWrapper.prototype.createMo = function (text) {
        var mmlFactory = this.node.factory;
        var textNode = mmlFactory.create('text').setText(text);
        var mml = mmlFactory.create('mo', { stretchy: true }, [textNode]);
        mml.inheritAttributesFrom(this.node);
        mml.parent = this.node.parent;
        var node = this.wrap(mml);
        node.parent = this;
        return node;
    };
    CommonWrapper.prototype.getVariantChar = function (variant, n) {
        var char = this.font.getChar(variant, n) || [0, 0, 0, { unknown: true }];
        if (char.length === 3) {
            char[3] = {};
        }
        return char;
    };
    CommonWrapper.prototype.html = function (type, def, content) {
        if (def === void 0) { def = {}; }
        if (content === void 0) { content = []; }
        return this.jax.html(type, def, content);
    };
    CommonWrapper.kind = 'unknown';
    CommonWrapper.styles = {};
    CommonWrapper.removeStyles = [
        'fontSize', 'fontFamily', 'fontWeight',
        'fontStyle', 'fontVariant', 'font'
    ];
    CommonWrapper.skipAttributes = {
        fontfamily: true, fontsize: true, fontweight: true, fontstyle: true,
        color: true, background: true,
        'class': true, href: true, style: true,
        xmlns: true
    };
    CommonWrapper.BOLDVARIANTS = {
        bold: {
            normal: 'bold',
            italic: 'bold-italic',
            fraktur: 'bold-fraktur',
            script: 'bold-script',
            'sans-serif': 'bold-sans-serif',
            'sans-serif-italic': 'sans-serif-bold-italic'
        },
        normal: {
            bold: 'normal',
            'bold-italic': 'italic',
            'bold-fraktur': 'fraktur',
            'bold-script': 'script',
            'bold-sans-serif': 'sans-serif',
            'sans-serif-bold-italic': 'sans-serif-italic'
        }
    };
    CommonWrapper.ITALICVARIANTS = {
        italic: {
            normal: 'italic',
            bold: 'bold-italic',
            'sans-serif': 'sans-serif-italic',
            'bold-sans-serif': 'sans-serif-bold-italic'
        },
        normal: {
            italic: 'normal',
            'bold-italic': 'bold',
            'sans-serif-italic': 'sans-serif',
            'sans-serif-bold-italic': 'bold-sans-serif'
        }
    };
    return CommonWrapper;
}(Wrapper_js_1.AbstractWrapper));
exports.CommonWrapper = CommonWrapper;
//# sourceMappingURL=Wrapper.js.map