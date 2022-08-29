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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.SVG = exports.XLINKNS = exports.SVGNS = void 0;
var common_js_1 = require("./common.js");
var WrapperFactory_js_1 = require("./svg/WrapperFactory.js");
var tex_js_1 = require("./svg/fonts/tex.js");
var FontCache_js_1 = require("./svg/FontCache.js");
var string_js_1 = require("../util/string.js");
var LENGTHS = __importStar(require("../util/lengths.js"));
var Wrapper_js_1 = require("./common/Wrapper.js");
exports.SVGNS = 'http://www.w3.org/2000/svg';
exports.XLINKNS = 'http://www.w3.org/1999/xlink';
var SVG = (function (_super) {
    __extends(SVG, _super);
    function SVG(options) {
        if (options === void 0) { options = null; }
        var _this = _super.call(this, options, WrapperFactory_js_1.SvgWrapperFactory, tex_js_1.TeXFont) || this;
        _this.minwidth = 0;
        _this.shift = 0;
        _this.svgStyles = null;
        _this.fontCache = new FontCache_js_1.FontCache(_this);
        return _this;
    }
    Object.defineProperty(SVG.prototype, "forceInlineBreaks", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    SVG.prototype.initialize = function () {
        if (this.options.fontCache === 'global') {
            this.fontCache.clearCache();
        }
    };
    SVG.prototype.clearFontCache = function () {
        this.fontCache.clearCache();
    };
    SVG.prototype.reset = function () {
        this.clearFontCache();
    };
    SVG.prototype.escaped = function (math, html) {
        this.setDocument(html);
        return this.html('span', {}, [this.text(math.math)]);
    };
    SVG.prototype.styleSheet = function (html) {
        if (this.svgStyles) {
            return this.svgStyles;
        }
        var sheet = this.svgStyles = _super.prototype.styleSheet.call(this, html);
        this.adaptor.setAttribute(sheet, 'id', SVG.STYLESHEETID);
        return sheet;
    };
    SVG.prototype.pageElements = function (html) {
        if (this.options.fontCache === 'global' && !this.findCache(html)) {
            return this.svg('svg', { id: SVG.FONTCACHEID, style: { display: 'none' } }, [this.fontCache.getCache()]);
        }
        return null;
    };
    SVG.prototype.findCache = function (html) {
        var adaptor = this.adaptor;
        var svgs = adaptor.tags(adaptor.body(html.document), 'svg');
        for (var i = svgs.length - 1; i >= 0; i--) {
            if (this.adaptor.getAttribute(svgs[i], 'id') === SVG.FONTCACHEID) {
                return true;
            }
        }
        return false;
    };
    SVG.prototype.processMath = function (wrapper, parent) {
        var container = this.container;
        this.container = parent;
        var _a = __read(this.createRoot(wrapper), 2), svg = _a[0], g = _a[1];
        this.typesetSvg(wrapper, svg, g);
        wrapper.node.getProperty('process-breaks') && this.handleInlineBreaks(wrapper, svg, g);
        this.container = container;
    };
    SVG.prototype.createRoot = function (wrapper) {
        var _a = wrapper.getOuterBBox(), w = _a.w, h = _a.h, d = _a.d, pwidth = _a.pwidth;
        var _b = __read(this.createSVG(h, d, w), 2), svg = _b[0], g = _b[1];
        if (pwidth) {
            var adaptor = this.adaptor;
            adaptor.setStyle(svg, 'min-width', adaptor.getStyle(svg, 'width'));
            adaptor.setAttribute(svg, 'width', pwidth);
            adaptor.removeAttribute(svg, 'viewBox');
            var scale = this.fixed(wrapper.metrics.ex / (this.font.params.x_height * 1000), 6);
            adaptor.setAttribute(g, 'transform', "scale(".concat(scale, ",-").concat(scale, ") translate(0, ").concat(this.fixed(-h * 1000, 1), ")"));
        }
        return [svg, g];
    };
    SVG.prototype.createSVG = function (h, d, w) {
        var px = this.math.metrics.em / 1000;
        var W = Math.max(w, px);
        var H = Math.max(h + d, px);
        var g = this.svg('g', {
            stroke: 'currentColor', fill: 'currentColor',
            'stroke-width': 0, transform: 'scale(1,-1)'
        });
        var adaptor = this.adaptor;
        var svg = adaptor.append(this.container, this.svg('svg', {
            xmlns: exports.SVGNS,
            width: this.ex(W), height: this.ex(H),
            role: 'img', focusable: false,
            style: { 'vertical-align': this.ex(-d) },
            viewBox: [0, this.fixed(-h * 1000, 1), this.fixed(W * 1000, 1), this.fixed(H * 1000, 1)].join(' ')
        }, [g]));
        if (W === .001) {
            adaptor.setAttribute(svg, 'preserveAspectRatio', 'xMidYMid slice');
            if (w < 0) {
                adaptor.setStyle(this.container, 'margin-right', this.ex(w));
            }
        }
        if (this.options.fontCache !== 'none') {
            adaptor.setAttribute(svg, 'xmlns:xlink', exports.XLINKNS);
        }
        return [svg, g];
    };
    SVG.prototype.typesetSvg = function (wrapper, svg, g) {
        var adaptor = this.adaptor;
        this.minwidth = this.shift = 0;
        if (this.options.fontCache === 'local') {
            this.fontCache.clearCache();
            this.fontCache.useLocalID(this.options.localID);
            adaptor.insert(this.fontCache.getCache(), g);
        }
        wrapper.toSVG([g]);
        this.fontCache.clearLocalID();
        if (this.minwidth) {
            adaptor.setStyle(svg, 'minWidth', this.ex(this.minwidth));
            adaptor.setStyle(this.container, 'minWidth', this.ex(this.minwidth));
        }
        else if (this.shift) {
            var align = adaptor.getAttribute(this.container, 'justify') || 'center';
            this.setIndent(svg, align, this.shift);
        }
    };
    SVG.prototype.setIndent = function (svg, align, shift) {
        if (align === 'center' || align === 'left') {
            this.adaptor.setStyle(svg, 'margin-left', this.ex(shift));
        }
        if (align === 'center' || align === 'right') {
            this.adaptor.setStyle(svg, 'margin-right', this.ex(-shift));
        }
    };
    SVG.prototype.handleInlineBreaks = function (wrapper, svg, g) {
        var e_1, _a;
        var n = wrapper.childNodes[0].breakCount;
        if (!n)
            return;
        var adaptor = this.adaptor;
        var math = adaptor.firstChild(g);
        var lines = adaptor.childNodes(adaptor.firstChild(math));
        var lineBBox = wrapper.childNodes[0].lineBBox;
        adaptor.remove(g);
        var newline = true;
        for (var i = 0; i <= n; i++) {
            var line = lineBBox[i] || wrapper.childNodes[0].getLineBBox(i);
            var h = line.h, d = line.d, w = line.w;
            var _b = __read(this.createSVG(h, d, w), 2), nsvg = _b[0], ng = _b[1];
            var nmath = adaptor.append(ng, adaptor.clone(math, false));
            try {
                for (var _c = (e_1 = void 0, __values(adaptor.childNodes(lines[i]))), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var child = _d.value;
                    adaptor.append(nmath, child);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            adaptor.insert(nsvg, svg);
            var _e = __read(wrapper.childNodes[0].getBreakNode(line), 2), mml = _e[0], mo = _e[1];
            var forced = !!(mo && mo.node.getProperty('forcebreak'));
            if (i || forced) {
                var dimen = (mml && !newline ? mml.getLineBBox(0).originalL : 0);
                if (dimen || !forced) {
                    var space = LENGTHS.em(dimen);
                    adaptor.insert(adaptor.node('mjx-break', !forced ? { newline: true } :
                        Wrapper_js_1.SPACE[space] ? { size: Wrapper_js_1.SPACE[space] } : { style: { 'font-size': dimen.toFixed(1) + '%' } }), nsvg);
                }
            }
            newline = !!(mo && mo.node.attributes.get('linebreak') === 'newline');
        }
        if (adaptor.childNodes(svg).length) {
            adaptor.append(adaptor.firstChild(adaptor.parent(svg)), adaptor.firstChild(svg));
        }
        adaptor.remove(svg);
    };
    SVG.prototype.ex = function (m) {
        m /= this.font.params.x_height;
        return (Math.abs(m) < .001 ? '0' : m.toFixed(3).replace(/\.?0+$/, '') + 'ex');
    };
    SVG.prototype.svg = function (kind, properties, children) {
        if (properties === void 0) { properties = {}; }
        if (children === void 0) { children = []; }
        return this.html(kind, properties, children, exports.SVGNS);
    };
    SVG.prototype.unknownText = function (text, variant) {
        var metrics = this.math.metrics;
        var scale = this.font.params.x_height / metrics.ex * metrics.em * 1000;
        var svg = this.svg('text', {
            'data-variant': variant,
            transform: 'scale(1,-1)', 'font-size': this.fixed(scale, 1) + 'px'
        }, [this.text(text)]);
        var adaptor = this.adaptor;
        if (variant !== '-explicitFont') {
            var c = (0, string_js_1.unicodeChars)(text);
            if (c.length !== 1 || c[0] < 0x1D400 || c[0] > 0x1D7FF) {
                var _a = __read(this.font.getCssFont(variant), 3), family = _a[0], italic = _a[1], bold = _a[2];
                adaptor.setAttribute(svg, 'font-family', family);
                if (italic) {
                    adaptor.setAttribute(svg, 'font-style', 'italic');
                }
                if (bold) {
                    adaptor.setAttribute(svg, 'font-weight', 'bold');
                }
            }
        }
        return svg;
    };
    SVG.prototype.measureTextNode = function (text) {
        var adaptor = this.adaptor;
        text = adaptor.clone(text);
        adaptor.removeAttribute(text, 'transform');
        var ex = this.fixed(this.font.params.x_height * 1000, 1);
        var svg = this.svg('svg', {
            position: 'absolute', visibility: 'hidden',
            width: '1ex', height: '1ex',
            viewBox: [0, 0, ex, ex].join(' ')
        }, [text]);
        adaptor.append(adaptor.body(adaptor.document), svg);
        var w = adaptor.nodeSize(text, 1000, true)[0];
        adaptor.remove(svg);
        return { w: w, h: .75, d: .2 };
    };
    SVG.NAME = 'SVG';
    SVG.OPTIONS = __assign(__assign({}, common_js_1.CommonOutputJax.OPTIONS), { internalSpeechTitles: true, titleID: 0, fontCache: 'local', localID: null });
    SVG.commonStyles = {
        'mjx-container[jax="SVG"]': {
            direction: 'ltr',
            'white-space': 'nowrap'
        },
        'mjx-container[jax="SVG"] > svg': {
            overflow: 'visible',
            'min-height': '1px',
            'min-width': '1px'
        },
        'mjx-container[jax="SVG"] > svg a': {
            fill: 'blue', stroke: 'blue'
        }
    };
    SVG.FONTCACHEID = 'MJX-SVG-global-cache';
    SVG.STYLESHEETID = 'MJX-SVG-styles';
    return SVG;
}(common_js_1.CommonOutputJax));
exports.SVG = SVG;
//# sourceMappingURL=svg.js.map