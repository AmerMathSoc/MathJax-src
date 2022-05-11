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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STIX2Font = void 0;
var FontData_js_1 = require("../FontData.js");
var stix2_js_1 = require("../../common/fonts/stix2.js");
var normal_js_1 = require("./stix2/normal.js");
var bold_js_1 = require("./stix2/bold.js");
var italic_js_1 = require("./stix2/italic.js");
var bold_italic_js_1 = require("./stix2/bold-italic.js");
var tex_calligraphic_js_1 = require("./stix2/tex-calligraphic.js");
var tex_calligraphic_bold_js_1 = require("./stix2/tex-calligraphic-bold.js");
var tex_oldstyle_js_1 = require("./stix2/tex-oldstyle.js");
var tex_oldstyle_bold_js_1 = require("./stix2/tex-oldstyle-bold.js");
var tex_mathit_js_1 = require("./stix2/tex-mathit.js");
var smallop_js_1 = require("./stix2/smallop.js");
var largeop_js_1 = require("./stix2/largeop.js");
var size3_js_1 = require("./stix2/size3.js");
var size4_js_1 = require("./stix2/size4.js");
var size5_js_1 = require("./stix2/size5.js");
var size6_js_1 = require("./stix2/size6.js");
var size7_js_1 = require("./stix2/size7.js");
var size8_js_1 = require("./stix2/size8.js");
var size9_js_1 = require("./stix2/size9.js");
var size10_js_1 = require("./stix2/size10.js");
var size11_js_1 = require("./stix2/size11.js");
var size12_js_1 = require("./stix2/size12.js");
var tex_variant_js_1 = require("./stix2/tex-variant.js");
var extend_js_1 = require("./stix2/extend.js");
var double_struck_js_1 = require("./stix2/double-struck.js");
var fraktur_js_1 = require("./stix2/fraktur.js");
var fraktur_bold_js_1 = require("./stix2/fraktur-bold.js");
var script_js_1 = require("./stix2/script.js");
var script_bold_js_1 = require("./stix2/script-bold.js");
var monospace_js_1 = require("./stix2/monospace.js");
var sans_serif_bold_js_1 = require("./stix2/sans-serif-bold.js");
var sans_serif_italic_js_1 = require("./stix2/sans-serif-italic.js");
var sans_serif_bold_italic_js_1 = require("./stix2/sans-serif-bold-italic.js");
var sans_serif_js_1 = require("./stix2/sans-serif.js");
var double_struck_italic_js_1 = require("./stix2/double-struck-italic.js");
var delimiters_js_1 = require("./stix2/delimiters.js");
var STIX2Font = (function (_super) {
    __extends(STIX2Font, _super);
    function STIX2Font() {
        var e_1, _a;
        var _this = _super.call(this) || this;
        var CLASS = _this.constructor;
        try {
            for (var _b = __values(Object.keys(CLASS.variantCacheIds)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var variant = _c.value;
                _this.variant[variant].cacheID = 'STX-' + CLASS.variantCacheIds[variant];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return _this;
    }
    STIX2Font.defaultAccentMap = {
        0x005E: '\u02C6',
        0x007E: '\u02DC',
        0x0300: '\u02CB',
        0x0301: '\u02CA',
        0x0302: '\u02C6',
        0x0303: '\u02DC',
        0x0304: '\u02C9',
        0x0306: '\u02D8',
        0x0307: '\u02D9',
        0x0308: '\u00A8',
        0x030A: '\u02DA',
        0x030C: '\u02C7',
        0x2192: '\u20D7'
    };
    STIX2Font.defaultParams = __assign(__assign({}, FontData_js_1.SVGFontData.defaultParams), { separation_factor: 1.5 });
    STIX2Font.defaultDelimiters = delimiters_js_1.delimiters;
    STIX2Font.defaultVariants = __spreadArray(__spreadArray([], __read(FontData_js_1.SVGFontData.defaultVariants), false), [
        ['-tex-calligraphic', 'normal'],
        ['-tex-bold-calligraphic', 'normal'],
        ['-tex-oldstyle', 'normal'],
        ['-tex-bold-oldstyle', 'normal'],
        ['-tex-mathit', 'normal'],
        ['-smallop', 'normal'],
        ['-largeop', 'normal'],
        ['-size3', 'normal'],
        ['-size4', 'normal'],
        ['-size5', 'normal'],
        ['-size6', 'normal'],
        ['-size7', 'normal'],
        ['-size8', 'normal'],
        ['-size9', 'normal'],
        ['-size10', 'normal'],
        ['-size11', 'normal'],
        ['-size12', 'normal'],
        ['-tex-variant', 'normal'],
        ['-extend', 'normal'],
        ['-double-struck-italic', 'normal']
    ], false);
    STIX2Font.defaultCssFonts = __assign(__assign({}, FontData_js_1.SVGFontData.defaultCssFonts), { '-tex-calligraphic': ['serif', false, false], '-tex-bold-calligraphic': ['serif', false, false], '-tex-oldstyle': ['serif', false, false], '-tex-bold-oldstyle': ['serif', false, false], '-tex-mathit': ['serif', false, false], '-smallop': ['serif', false, false], '-largeop': ['serif', false, false], '-size3': ['serif', false, false], '-size4': ['serif', false, false], '-size5': ['serif', false, false], '-size6': ['serif', false, false], '-size7': ['serif', false, false], '-size8': ['serif', false, false], '-size9': ['serif', false, false], '-size10': ['serif', false, false], '-size11': ['serif', false, false], '-size12': ['serif', false, false], '-tex-variant': ['serif', false, false], '-extend': ['serif', false, false], '-double-struck-italic': ['serif', false, false] });
    STIX2Font.defaultChars = {
        'normal': normal_js_1.normal,
        'bold': bold_js_1.bold,
        'italic': italic_js_1.italic,
        'bold-italic': bold_italic_js_1.boldItalic,
        '-tex-calligraphic': tex_calligraphic_js_1.texCalligraphic,
        '-tex-bold-calligraphic': tex_calligraphic_bold_js_1.texCalligraphicBold,
        '-tex-oldstyle': tex_oldstyle_js_1.texOldstyle,
        '-tex-bold-oldstyle': tex_oldstyle_bold_js_1.texOldstyleBold,
        '-tex-mathit': tex_mathit_js_1.texMathit,
        '-smallop': smallop_js_1.smallop,
        '-largeop': largeop_js_1.largeop,
        '-size3': size3_js_1.size3,
        '-size4': size4_js_1.size4,
        '-size5': size5_js_1.size5,
        '-size6': size6_js_1.size6,
        '-size7': size7_js_1.size7,
        '-size8': size8_js_1.size8,
        '-size9': size9_js_1.size9,
        '-size10': size10_js_1.size10,
        '-size11': size11_js_1.size11,
        '-size12': size12_js_1.size12,
        '-tex-variant': tex_variant_js_1.texVariant,
        '-extend': extend_js_1.extend,
        'double-struck': double_struck_js_1.doubleStruck,
        'fraktur': fraktur_js_1.fraktur,
        'bold-fraktur': fraktur_bold_js_1.frakturBold,
        'script': script_js_1.script,
        'bold-script': script_bold_js_1.scriptBold,
        'monospace': monospace_js_1.monospace,
        'bold-sans-serif': sans_serif_bold_js_1.sansSerifBold,
        'sans-serif-italic': sans_serif_italic_js_1.sansSerifItalic,
        'sans-serif-bold-italic': sans_serif_bold_italic_js_1.sansSerifBoldItalic,
        'sans-serif': sans_serif_js_1.sansSerif,
        '-double-struck-italic': double_struck_italic_js_1.doubleStruckItalic
    };
    STIX2Font.variantCacheIds = {
        'normal': 'N',
        'bold': 'B',
        'italic': 'I',
        'bold-italic': 'BI',
        '-tex-calligraphic': 'C',
        '-tex-bold-calligraphic': 'CB',
        '-tex-oldstyle': 'OS',
        '-tex-bold-oldstyle': 'OB',
        '-tex-mathit': 'MI',
        '-smallop': 'SO',
        '-largeop': 'LO',
        '-size3': 'S3',
        '-size4': 'S4',
        '-size5': 'S5',
        '-size6': 'S6',
        '-size7': 'S7',
        '-size8': 'S8',
        '-size9': 'S9',
        '-size10': 'S10',
        '-size11': 'S11',
        '-size12': 'S12',
        '-tex-variant': 'V',
        '-extend': 'E',
        'double-struck': 'DS',
        'fraktur': 'F',
        'bold-fraktur': 'FB',
        'script': 'S',
        'bold-script': 'SB',
        'monospace': 'M',
        'bold-sans-serif': 'SSB',
        'sans-serif-italic': 'SSI',
        'sans-serif-bold-italic': 'SSBI',
        'sans-serif': 'SS',
        '-double-struck-italic': 'DSI'
    };
    STIX2Font.defaultSizeVariants = ['normal', '-smallop', '-largeop', '-size3', '-size4', '-size5', '-size6', '-size7', '-size8', '-size9', '-size10', '-size11', '-size12'];
    STIX2Font.defaultStretchVariants = ['-extend', 'normal', '-size4', '-smallop', '-tex-variant'];
    return STIX2Font;
}((0, stix2_js_1.CommonSTIX2FontMixin)(FontData_js_1.SVGFontData)));
exports.STIX2Font = STIX2Font;
//# sourceMappingURL=stix2.js.map