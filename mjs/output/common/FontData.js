var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { defaultOptions, userOptions } from '../../util/Options.js';
import { asyncLoad } from '../../util/AsyncLoad.js';
import { retryAfter } from '../../util/Retries.js';
import { mathjax } from '../../mathjax.js';
export const NOSTRETCH = { dir: 0 };
;
export function mergeOptions(dst, src) {
    return (src ? defaultOptions([dst], [src])[0] : dst);
}
export class FontData {
    get CLASS() {
        return this.constructor;
    }
    static charOptions(font, n) {
        const char = font[n];
        if (!Array.isArray(char)) {
            throw Error(`Character data hasn't been loaded for 0x${n.toString(16).toUpperCase()}`);
        }
        if (char.length === 3) {
            char[3] = {};
        }
        return char[3];
    }
    static defineDynamicFiles(dynamicFiles, extension = '') {
        const list = {};
        (dynamicFiles || []).forEach(([file, variants, delimiters]) => {
            list[file] = {
                extension, file, variants, delimiters: delimiters || [],
                promise: null, failed: false, setup: ((_font) => { list[file].failed = true; })
            };
        });
        return list;
    }
    static dynamicSetup(extension, file, variants, delimiters = {}, fonts = null) {
        const data = (extension ? this.dynamicExtensions.get(extension) : null);
        const files = (extension ? data.files : this.dynamicFiles);
        files[file].setup = (font) => {
            Object.keys(variants).forEach(name => font.defineChars(name, variants[name]));
            font.defineDelimiters(delimiters);
            extension && this.adjustDelimiters(font.delimiters, Object.keys(delimiters), data.sizeN, data.stretchN);
            fonts && font.addDynamicFontCss(fonts);
        };
    }
    static adjustDelimiters(delimiters, keys, sizeN, stretchN) {
        keys.forEach(id => {
            const delim = delimiters[parseInt(id)];
            if ('dir' in delim) {
                if (delim.variants) {
                    delim.variants = this.adjustArrayIndices(delim.variants, sizeN);
                }
                if (delim.stretchv) {
                    delim.stretchv = this.adjustArrayIndices(delim.stretchv, stretchN);
                }
            }
        });
    }
    static adjustArrayIndices(list, N) {
        return list.map(n => (n < 0 ? N - 1 - n : n));
    }
    static addExtension(data, prefix = '') {
        const extension = {
            name: data.name,
            prefix: prefix,
            files: this.defineDynamicFiles(data.ranges, data.name),
            sizeN: this.defaultSizeVariants.length,
            stretchN: this.defaultStretchVariants.length
        };
        this.dynamicExtensions.set(data.name, extension);
        for (const [src, dst] of [
            ['options', 'OPTIONS'],
            ['variants', 'defaultVariants'],
            ['cssFonts', 'defaultCssFonts'],
            ['accentMap', 'defaultAccentMap'],
            ['moMap', 'defaultMoMap'],
            ['mnMap', 'defaultMnMap'],
            ['parameters', 'defaultParams'],
            ['chars', 'defaultChars'],
            ['sizeVariants', 'defaultSizeVariants'],
            ['stretchVariants', 'defaultStretchVariants']
        ]) {
            mergeOptions(this[dst], data[src]);
        }
        if (data.delimiters) {
            Object.assign(this.defaultDelimiters, data.delimiters);
            this.adjustDelimiters(this.defaultDelimiters, Object.keys(data.delimiters), extension.sizeN, extension.stretchN);
        }
    }
    constructor(options = null) {
        this.variant = {};
        this.delimiters = {};
        this.cssFontMap = {};
        this.cssFontPrefix = '';
        this.remapChars = {};
        this.skewIcFactor = .75;
        let CLASS = this.CLASS;
        this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options);
        this.params = Object.assign({}, CLASS.defaultParams);
        this.sizeVariants = [...CLASS.defaultSizeVariants];
        this.stretchVariants = [...CLASS.defaultStretchVariants];
        this.defineCssFonts(CLASS.defaultCssFonts);
        this.cssFamilyPrefix = CLASS.defaultCssFamilyPrefix;
        this.createVariants(CLASS.defaultVariants);
        this.defineDelimiters(CLASS.defaultDelimiters);
        Object.keys(CLASS.defaultChars).forEach(name => this.defineChars(name, CLASS.defaultChars[name]));
        this.defineRemap('accent', CLASS.defaultAccentMap);
        this.defineRemap('mo', CLASS.defaultMoMap);
        this.defineRemap('mn', CLASS.defaultMnMap);
        this.defineDynamicCharacters(CLASS.dynamicFiles);
        CLASS.dynamicExtensions.forEach(data => this.defineDynamicCharacters(data.files));
    }
    setOptions(options) {
        mergeOptions(this.options, options);
    }
    addExtension(data, prefix = '') {
        const dynamicFont = {
            name: data.name,
            prefix: prefix,
            files: this.CLASS.defineDynamicFiles(data.ranges, prefix),
            sizeN: this.sizeVariants.length,
            stretchN: this.stretchVariants.length
        };
        this.CLASS.dynamicExtensions.set(data.name, dynamicFont);
        defaultOptions(this.options, data.options || {});
        defaultOptions(this.params, data.parameters || {});
        this.sizeVariants = mergeOptions(this.sizeVariants, data.sizeVariants);
        this.stretchVariants = mergeOptions(this.stretchVariants, data.stretchVariants);
        this.defineCssFonts(mergeOptions([], data.cssFonts));
        this.createVariants(mergeOptions([], data.variants));
        if (data.delimiters) {
            this.defineDelimiters(mergeOptions([], data.delimiters));
            this.CLASS.adjustDelimiters(this.delimiters, Object.keys(data.delimiters), dynamicFont.sizeN, dynamicFont.stretchN);
        }
        for (const name of Object.keys(data.chars || {})) {
            this.defineChars(name, data.chars[name]);
        }
        this.defineRemap('accent', data.accentMap);
        this.defineRemap('mo', data.moMap);
        this.defineRemap('mn', data.mnMap);
        if (data.ranges) {
            this.defineDynamicCharacters(dynamicFont.files);
        }
    }
    get styles() {
        return this._styles;
    }
    set styles(style) {
        this._styles = style;
    }
    createVariant(name, inherit = null, link = null) {
        let variant = {
            linked: [],
            chars: Object.create(inherit ? this.variant[inherit].chars : {})
        };
        if (this.variant[link]) {
            Object.assign(variant.chars, this.variant[link].chars);
            this.variant[link].linked.push(variant.chars);
            variant.chars = Object.create(variant.chars);
        }
        this.remapSmpChars(variant.chars, name);
        this.variant[name] = variant;
    }
    remapSmpChars(chars, name) {
        const CLASS = this.CLASS;
        if (CLASS.VariantSmp[name]) {
            const SmpRemap = CLASS.SmpRemap;
            const SmpGreek = [null, null, CLASS.SmpRemapGreekU, CLASS.SmpRemapGreekL];
            for (const [i, lo, hi] of CLASS.SmpRanges) {
                const base = CLASS.VariantSmp[name][i];
                if (!base)
                    continue;
                for (let n = lo; n <= hi; n++) {
                    if (n === 0x3A2)
                        continue;
                    const smp = base + n - lo;
                    chars[n] = this.smpChar(SmpRemap[smp] || smp);
                }
                if (SmpGreek[i]) {
                    for (const n of Object.keys(SmpGreek[i]).map((x) => parseInt(x))) {
                        chars[n] = this.smpChar(base + SmpGreek[i][n]);
                    }
                }
            }
        }
        if (name === 'bold') {
            chars[0x3DC] = this.smpChar(0x1D7CA);
            chars[0x3DD] = this.smpChar(0x1D7CB);
        }
    }
    smpChar(n) {
        return [, , , { smp: n }];
    }
    createVariants(variants) {
        for (const variant of variants) {
            this.createVariant(variant[0], variant[1], variant[2]);
        }
    }
    defineChars(name, chars) {
        const variant = this.variant[name];
        Object.assign(variant.chars, chars);
        for (const link of variant.linked) {
            Object.assign(link, chars);
        }
    }
    defineCssFonts(fonts) {
        Object.assign(this.cssFontMap, fonts);
        for (const name of Object.keys(fonts)) {
            if (this.cssFontMap[name][0] === 'unknown') {
                this.cssFontMap[name][0] = this.options.unknownFamily;
            }
        }
    }
    defineDelimiters(delims) {
        Object.assign(this.delimiters, delims);
    }
    defineRemap(name, remap) {
        if (remap) {
            if (!this.remapChars.hasOwnProperty(name)) {
                this.remapChars[name] = {};
            }
            Object.assign(this.remapChars[name], remap);
        }
    }
    defineDynamicCharacters(dynamicFiles) {
        for (const file of Object.keys(dynamicFiles)) {
            const dynamic = dynamicFiles[file];
            for (const name of Object.keys(dynamic.variants)) {
                this.defineChars(name, this.flattenRanges(dynamic.variants[name], dynamic));
            }
            this.defineDelimiters(this.flattenRanges(dynamic.delimiters, dynamic));
        }
    }
    flattenRanges(ranges, dynamic) {
        const chars = {};
        for (const n of ranges) {
            if (Array.isArray(n)) {
                for (let j = n[0]; j <= n[1]; j++) {
                    chars[j] = dynamic;
                }
            }
            else {
                chars[n] = dynamic;
            }
        }
        return chars;
    }
    dynamicFileName(dynamic) {
        const prefix = (!dynamic.extension ? this.options.dynamicPrefix :
            this.CLASS.dynamicExtensions.get(dynamic.extension).prefix);
        return (dynamic.file.match(/^(?:[\/\[]|[a-z]+:\/\/|[a-z]:)/i) ? dynamic.file :
            prefix + '/' + dynamic.file.replace(/\.js$/, ''));
    }
    loadDynamicFile(dynamic) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dynamic.failed)
                return Promise.reject(new Error(`dynamic file '${dynamic.file}' failed to load`));
            if (!dynamic.promise) {
                dynamic.promise = asyncLoad(this.dynamicFileName(dynamic)).catch(err => {
                    dynamic.failed = true;
                    console.warn(err);
                });
            }
            return dynamic.promise.then(() => dynamic.setup(this));
        });
    }
    loadDynamicFiles() {
        const dynamicFiles = this.CLASS.dynamicFiles;
        const promises = Object.keys(dynamicFiles).map(name => this.loadDynamicFile(dynamicFiles[name]));
        for (const data of this.CLASS.dynamicExtensions.values()) {
            promises.push(...Object.keys(data.files).map(name => this.loadDynamicFile(data.files[name])));
        }
        return Promise.all(promises);
    }
    loadDynamicFilesSync() {
        if (!mathjax.asyncLoad) {
            throw Error('MathJax(loadDynamicFilesSync): mathjax.asyncLoad must be specified and synchronous');
        }
        const dynamicFiles = this.CLASS.dynamicFiles;
        Object.keys(dynamicFiles).forEach(name => this.loadDynamicFileSync(dynamicFiles[name]));
        for (const data of this.CLASS.dynamicExtensions.values()) {
            Object.keys(data.files).forEach(name => this.loadDynamicFileSync(data.files[name]));
        }
    }
    loadDynamicFileSync(dynamic) {
        if (!dynamic.promise) {
            dynamic.promise = Promise.resolve();
            try {
                mathjax.asyncLoad(this.dynamicFileName(dynamic));
            }
            catch (err) {
                dynamic.failed = true;
                console.warn(err);
            }
            dynamic.setup(this);
        }
    }
    addDynamicFontCss(_fonts, _root) {
    }
    getDelimiter(n) {
        const delim = this.delimiters[n];
        if (delim && !('dir' in delim)) {
            this.delimiters[n] = null;
            retryAfter(this.loadDynamicFile(delim));
            return null;
        }
        return delim;
    }
    getSizeVariant(n, i) {
        const delim = this.getDelimiter(n);
        if (delim && delim.variants) {
            i = delim.variants[i];
        }
        return this.sizeVariants[i];
    }
    getStretchVariant(n, i) {
        const delim = this.getDelimiter(n);
        return this.stretchVariants[delim.stretchv ? delim.stretchv[i] : 0];
    }
    getStretchVariants(n) {
        return [0, 1, 2, 3].map(i => this.getStretchVariant(n, i));
    }
    getChar(name, n) {
        const char = this.variant[name].chars[n];
        if (char && !Array.isArray(char)) {
            const variant = this.variant[name];
            delete variant.chars[n];
            variant.linked.forEach(link => delete link[n]);
            retryAfter(this.loadDynamicFile(char));
            return null;
        }
        return char;
    }
    getVariant(name) {
        return this.variant[name];
    }
    getCssFont(variant) {
        return this.cssFontMap[variant] || ['serif', false, false];
    }
    getFamily(family) {
        return (this.cssFamilyPrefix ? this.cssFamilyPrefix + ', ' + family : family);
    }
    getRemappedChar(name, c) {
        const map = this.remapChars[name] || {};
        return map[c];
    }
}
FontData.OPTIONS = {
    unknownFamily: 'serif',
    dynamicPrefix: '.'
};
FontData.JAX = 'common';
FontData.NAME = '';
FontData.defaultVariants = [
    ['normal'],
    ['bold', 'normal'],
    ['italic', 'normal'],
    ['bold-italic', 'italic', 'bold'],
    ['double-struck', 'bold'],
    ['fraktur', 'normal'],
    ['bold-fraktur', 'bold', 'fraktur'],
    ['script', 'italic'],
    ['bold-script', 'bold-italic', 'script'],
    ['sans-serif', 'normal'],
    ['bold-sans-serif', 'bold', 'sans-serif'],
    ['sans-serif-italic', 'italic', 'sans-serif'],
    ['sans-serif-bold-italic', 'bold-italic', 'bold-sans-serif'],
    ['monospace', 'normal'],
    ['-smallop', 'normal'],
    ['-largeop', 'normal'],
    ['-tex-calligraphic', 'italic'],
    ['-tex-bold-calligraphic', 'bold-italic'],
    ['-tex-oldstyle', 'normal'],
    ['-tex-bold-oldstyle', 'bold'],
    ['-tex-mathit', 'italic'],
    ['-tex-variant', 'normal']
];
FontData.defaultCssFonts = {
    normal: ['unknown', false, false],
    bold: ['unknown', false, true],
    italic: ['unknown', true, false],
    'bold-italic': ['unknown', true, true],
    'double-struck': ['unknown', false, true],
    fraktur: ['unknown', false, false],
    'bold-fraktur': ['unknown', false, true],
    script: ['cursive', false, false],
    'bold-script': ['cursive', false, true],
    'sans-serif': ['sans-serif', false, false],
    'bold-sans-serif': ['sans-serif', false, true],
    'sans-serif-italic': ['sans-serif', true, false],
    'sans-serif-bold-italic': ['sans-serif', true, true],
    monospace: ['monospace', false, false],
    '-smallop': ['unknown', false, false],
    '-largeop': ['unknown', false, false],
    '-tex-calligraphic': ['cursive', true, false],
    '-tex-bold-calligraphic': ['cursive', true, true],
    '-tex-oldstyle': ['unknown', false, false],
    '-tex-bold-oldstyle': ['unknown', false, true],
    '-tex-mathit': ['unknown', true, false],
    '-tex-variant': ['unknown', false, false]
};
FontData.defaultCssFamilyPrefix = '';
FontData.VariantSmp = {
    bold: [0x1D400, 0x1D41A, 0x1D6A8, 0x1D6C2, 0x1D7CE],
    italic: [0x1D434, 0x1D44E, 0x1D6E2, 0x1D6FC],
    'bold-italic': [0x1D468, 0x1D482, 0x1D71C, 0x1D736],
    script: [0x1D49C, 0x1D4B6],
    'bold-script': [0x1D4D0, 0x1D4EA],
    fraktur: [0x1D504, 0x1D51E],
    'double-struck': [0x1D538, 0x1D552, , , 0x1D7D8],
    'bold-fraktur': [0x1D56C, 0x1D586],
    'sans-serif': [0x1D5A0, 0x1D5BA, , , 0x1D7E2],
    'bold-sans-serif': [0x1D5D4, 0x1D5EE, 0x1D756, 0x1D770, 0x1D7EC],
    'sans-serif-italic': [0x1D608, 0x1D622],
    'sans-serif-bold-italic': [0x1D63C, 0x1D656, 0x1D790, 0x1D7AA],
    'monospace': [0x1D670, 0x1D68A, , , 0x1D7F6]
};
FontData.SmpRanges = [
    [0, 0x41, 0x5A],
    [1, 0x61, 0x7A],
    [2, 0x391, 0x3A9],
    [3, 0x3B1, 0x3C9],
    [4, 0x30, 0x39]
];
FontData.SmpRemap = {
    0x1D455: 0x210E,
    0x1D49D: 0x212C,
    0x1D4A0: 0x2130,
    0x1D4A1: 0x2131,
    0x1D4A3: 0x210B,
    0x1D4A4: 0x2110,
    0x1D4A7: 0x2112,
    0x1D4A8: 0x2133,
    0x1D4AD: 0x211B,
    0x1D4BA: 0x212F,
    0x1D4BC: 0x210A,
    0x1D4C4: 0x2134,
    0x1D506: 0x212D,
    0x1D50B: 0x210C,
    0x1D50C: 0x2111,
    0x1D515: 0x211C,
    0x1D51D: 0x2128,
    0x1D53A: 0x2102,
    0x1D53F: 0x210D,
    0x1D545: 0x2115,
    0x1D547: 0x2119,
    0x1D548: 0x211A,
    0x1D549: 0x211D,
    0x1D551: 0x2124,
};
FontData.SmpRemapGreekU = {
    0x2207: 0x19,
    0x03F4: 0x11
};
FontData.SmpRemapGreekL = {
    0x3D1: 0x1B,
    0x3D5: 0x1D,
    0x3D6: 0x1F,
    0x3F0: 0x1C,
    0x3F1: 0x1E,
    0x3F5: 0x1A,
    0x2202: 0x19
};
FontData.defaultAccentMap = {
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
FontData.defaultMoMap = {
    0x002D: '\u2212'
};
FontData.defaultMnMap = {
    0x002D: '\u2212'
};
FontData.defaultParams = {
    x_height: .442,
    quad: 1,
    num1: .676,
    num2: .394,
    num3: .444,
    denom1: .686,
    denom2: .345,
    sup1: .413,
    sup2: .363,
    sup3: .289,
    sub1: .15,
    sub2: .247,
    sup_drop: .386,
    sub_drop: .05,
    delim1: 2.39,
    delim2: 1.0,
    axis_height: .25,
    rule_thickness: .06,
    big_op_spacing1: .111,
    big_op_spacing2: .167,
    big_op_spacing3: .2,
    big_op_spacing4: .6,
    big_op_spacing5: .1,
    surd_height: .06,
    scriptspace: .05,
    nulldelimiterspace: .12,
    delimiterfactor: 901,
    delimitershortfall: .3,
    rule_factor: 1.25,
    min_rule_thickness: 1.25,
    separation_factor: 1.75,
    extra_ic: .033,
    extender_factor: .333
};
FontData.defaultDelimiters = {};
FontData.defaultChars = {};
FontData.defaultSizeVariants = [];
FontData.defaultStretchVariants = [];
FontData.dynamicFiles = {};
FontData.dynamicExtensions = new Map();
//# sourceMappingURL=FontData.js.map