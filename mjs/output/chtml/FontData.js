import { FontData, DIRECTION, } from '../common/FontData.js';
import { Usage } from './Usage.js';
import { StyleJsonSheet, } from '../../util/StyleJson.js';
import { em } from '../../util/lengths.js';
export * from '../common/FontData.js';
export class ChtmlFontData extends FontData {
    constructor() {
        super(...arguments);
        this.charUsage = new Usage();
        this.delimUsage = new Usage();
        this.fontUsage = {};
        this.newFonts = 0;
    }
    static charOptions(font, n) {
        return super.charOptions(font, n);
    }
    static addFontURLs(styles, fonts, url) {
        for (const name of Object.keys(fonts)) {
            const font = Object.assign({}, fonts[name]);
            font.src = font.src.replace(/%%URL%%/, url);
            styles[name] = font;
        }
    }
    static addDynamicFontCss(styles, fonts, root) {
        const fontStyles = {};
        for (const font of fonts) {
            const name = font.slice(4);
            fontStyles[`@font-face /* ${name} */`] = {
                'font-family': font,
                src: `url("%%URL%%/${font.toLowerCase()}.woff2") format("woff2")`,
            };
            styles[`.${name}`] = {
                'font-family': `${this.defaultCssFamilyPrefix}, ${font}`,
            };
        }
        this.addFontURLs(styles, fontStyles, root);
    }
    static addExtension(data, prefix = '') {
        super.addExtension(data, prefix);
        if (data.fonts) {
            this.addDynamicFontCss(this.defaultStyles, data.fonts, data.fontURL);
        }
    }
    addExtension(data, prefix = '') {
        super.addExtension(data, prefix);
        if (!data.fonts || !this.options.adaptiveCSS) {
            return [];
        }
        const css = {};
        const styles = new StyleJsonSheet();
        this.constructor.addDynamicFontCss(css, data.fonts, data.fontURL);
        styles.addStyles(css);
        return styles.getStyleRules();
    }
    adaptiveCSS(adapt) {
        this.options.adaptiveCSS = adapt;
    }
    clearCache() {
        if (this.options.adaptiveCSS) {
            this.charUsage.clear();
            this.delimUsage.clear();
        }
    }
    createVariant(name, inherit = null, link = null) {
        super.createVariant(name, inherit, link);
        this.variant[name].letter = this.constructor.defaultVariantLetters[name];
    }
    defineChars(name, chars) {
        super.defineChars(name, chars);
        const letter = this.variant[name].letter;
        const CLASS = this.constructor;
        for (const n of Object.keys(chars)) {
            const i = parseInt(n);
            if (!Array.isArray(chars[i]))
                continue;
            const options = CLASS.charOptions(chars, i);
            if (options.f === undefined) {
                options.f = letter;
            }
            for (const [m, M] of CLASS.combiningChars) {
                if (i >= m && i <= M) {
                    options.cmb = true;
                    break;
                }
            }
        }
    }
    addDynamicFontCss(fonts, root = this.options.fontURL) {
        this.constructor.addDynamicFontCss(this.fontUsage, fonts, root);
    }
    updateDynamicStyles() {
        const styles = this.fontUsage;
        this.fontUsage = {};
        if (!this.options.adaptiveCSS) {
            this.updateStyles(styles);
        }
        return styles;
    }
    get styles() {
        const CLASS = this.constructor;
        const styles = Object.assign(Object.assign({}, CLASS.defaultStyles), this.fontUsage);
        this.fontUsage = {};
        CLASS.addFontURLs(styles, CLASS.defaultFonts, this.options.fontURL);
        if (this.options.adaptiveCSS) {
            this.updateStyles(styles);
        }
        else {
            this.allStyles(styles);
        }
        return styles;
    }
    updateStyles(styles) {
        for (const N of this.delimUsage.update()) {
            this.addDelimiterStyles(styles, N, this.getDelimiter(N));
        }
        for (const [name, N] of this.charUsage.update()) {
            const variant = this.variant[name];
            this.addCharStyles(styles, variant.letter, N, variant.chars[N]);
        }
        return styles;
    }
    allStyles(styles) {
        var _a;
        for (const n of Object.keys(this.delimiters)) {
            const N = parseInt(n);
            this.addDelimiterStyles(styles, N, this.delimiters[N]);
        }
        for (const name of Object.keys(this.variant)) {
            const variant = this.variant[name];
            const vletter = variant.letter;
            for (const n of Object.keys(variant.chars)) {
                const N = parseInt(n);
                const char = variant.chars[N];
                if (((_a = char === null || char === void 0 ? void 0 : char[3]) === null || _a === void 0 ? void 0 : _a.smp) || !Array.isArray(char))
                    continue;
                if (char.length < 4) {
                    char[3] = {};
                }
                this.addCharStyles(styles, vletter, N, char);
            }
        }
    }
    addDelimiterStyles(styles, n, data) {
        if (!data.stretch)
            return;
        const c = data.c && data.c !== n ? this.charSelector(data.c) : this.charSelector(n);
        if (data.dir === DIRECTION.Vertical) {
            this.addDelimiterVStyles(styles, n, c, data);
        }
        else {
            this.addDelimiterHStyles(styles, n, c, data);
        }
    }
    addDelimiterVStyles(styles, n, c, data) {
        const HDW = data.HDW;
        const [beg, ext, end, mid] = data.stretch;
        const [begV, extV, endV, midV] = this.getStretchVariants(n);
        const Hb = this.addDelimiterVPart(styles, c, 'beg', beg, begV, HDW);
        this.addDelimiterVPart(styles, c, 'ext', ext, extV, HDW);
        const He = this.addDelimiterVPart(styles, c, 'end', end, endV, HDW);
        if (mid) {
            const Hm = this.addDelimiterVPart(styles, c, 'mid', mid, midV, HDW);
            const m = this.em(Hm / 2 - 0.03);
            styles[`mjx-stretchy-v${c} > mjx-ext:first-of-type`] = {
                height: '50%',
                'border-width': `${this.em1(Hb - 0.03)} 0 ${m}`,
            };
            styles[`mjx-stretchy-v${c} > mjx-ext:last-of-type`] = {
                height: '50%',
                'border-width': `${m} 0 ${this.em1(He - 0.03)}`,
            };
        }
        else if (He || Hb) {
            styles[`mjx-stretchy-v${c} > mjx-ext`]['border-width'] =
                `${this.em1(Hb - 0.03)} 0 ${this.em1(He - 0.03)}`;
        }
    }
    addDelimiterVPart(styles, c, part, n, v, HDW) {
        if (!n)
            return 0;
        const [h, d, w] = this.getChar(v, n);
        const css = { width: this.em0(w) };
        if (part !== 'ext') {
            const dw = w > HDW[2] ? this.em((HDW[2] - w) / 2) : 'auto';
            const y = part === 'beg' ? h : part === 'end' ? -d : (h - d) / 2;
            css.margin = `${this.em(y)} ${dw} ${this.em(-y)}`;
        }
        else {
            css['line-height'] = this.em0(h + d + 0.005);
            styles[`mjx-stretchy-v${c} > mjx-${part} > mjx-spacer`] = {
                'margin-top': this.em(-d),
            };
        }
        styles[`mjx-stretchy-v${c} > mjx-${part}`] = css;
        return h + d;
    }
    addDelimiterHStyles(styles, n, c, data) {
        const HDW = [...data.HDW];
        const [beg, ext, end, mid] = data.stretch;
        const [begV, extV, endV, midV] = this.getStretchVariants(n);
        if (data.hd && !this.options.mathmlSpacing) {
            const t = this.params.extender_factor;
            HDW[0] = HDW[0] * (1 - t) + data.hd[0] * t;
            HDW[1] = HDW[1] * (1 - t) + data.hd[1] * t;
        }
        const Wb = this.addDelimiterHPart(styles, c, 'beg', beg, begV, HDW);
        this.addDelimiterHPart(styles, c, 'ext', ext, extV, HDW);
        const We = this.addDelimiterHPart(styles, c, 'end', end, endV, HDW);
        if (mid) {
            const Wm = this.addDelimiterHPart(styles, c, 'mid', mid, midV, HDW);
            const m = this.em0(Wm / 2 - 0.03);
            styles[`mjx-stretchy-h${c} > mjx-ext:first-of-type`] = {
                width: '50%',
                'border-width': `0 ${m} 0 ${this.em0(Wb - 0.03)}`,
            };
            styles[`mjx-stretchy-h${c} > mjx-ext:last-of-type`] = {
                width: '50%',
                'border-width': `0 ${this.em0(We - 0.03)} 0 ${m}`,
            };
        }
        else if (Wb || We) {
            styles[`mjx-stretchy-h${c} > mjx-ext`]['border-width'] =
                `0 ${this.em0(We - 0.06)} 0 ${this.em0(Wb - 0.06)}`;
        }
        if (data.ext) {
            styles[`mjx-stretchy-h${c} > mjx-ext > mjx-spacer`]['letter-spacing'] =
                this.em(-data.ext);
        }
    }
    addDelimiterHPart(styles, c, part, n, v, HDW) {
        if (!n)
            return 0;
        let [, , w, options] = this.getChar(v, n);
        const css = {
            padding: this.padding(HDW, w - HDW[2]),
        };
        if (part === 'ext') {
            if (!w && options.dx) {
                w = 2 * options.dx - 0.06;
            }
            styles[`mjx-stretchy-h${c} > mjx-${part} > mjx-spacer`] = {
                'margin-left': this.em(-w / 2),
            };
            if (options.cmb) {
                styles[`mjx-stretchy-h${c} > mjx-${part} > mjx-c`] = {
                    width: this.em(w),
                    'text-align': 'right',
                };
            }
        }
        else {
            if (part === 'mid') {
                css['margin'] = `0 ${this.em(-w / 2)}`;
            }
            else {
                css[part == 'end' ? 'margin-left' : 'margin-right'] = this.em(-w);
            }
            this.checkCombiningChar(options, css);
        }
        styles[`mjx-stretchy-h${c} > mjx-${part}`] = css;
        return w;
    }
    addCharStyles(styles, vletter, n, data) {
        const options = data[3];
        const letter = options.f !== undefined ? options.f : vletter;
        const font = options.ff || (letter ? `${this.cssFontPrefix}-${letter}` : '');
        const selector = 'mjx-c' + this.charSelector(n) + (font ? '.' + font : '');
        const padding = options.oc || options.ic || 0;
        styles[selector] = {
            padding: this.padding(data, padding),
        };
        if (options.oc) {
            styles[selector + '[noic]'] = { 'padding-right': this.em(data[2]) };
        }
        this.checkCombiningChar(options, styles[selector]);
    }
    checkCombiningChar(options, css) {
        if (!options.cmb)
            return;
        const pad = css.padding.split(/ /);
        css.width = pad[1];
        pad[1] = '0';
        if (!pad[3]) {
            pad.pop();
        }
        css.padding = pad.join(' ');
    }
    em(n) {
        return em(n);
    }
    em0(n) {
        return em(Math.max(0, n));
    }
    em1(n) {
        const m = em(Math.max(0, n));
        return m === '0' ? '.1px' : m;
    }
    padding([h, d, w], ic = 0) {
        return [h, w + ic, d, 0].map(this.em0).join(' ');
    }
    charSelector(n) {
        return '.mjx-c' + n.toString(16).toUpperCase();
    }
}
ChtmlFontData.OPTIONS = Object.assign(Object.assign({}, FontData.OPTIONS), { dynamicPrefix: './chtml/dynamic', fontURL: './chtml/woff2' });
ChtmlFontData.JAX = 'CHTML';
ChtmlFontData.defaultVariantLetters = {};
ChtmlFontData.defaultStyles = {};
ChtmlFontData.defaultFonts = {};
ChtmlFontData.combiningChars = [
    [0x300, 0x36f],
    [0x20d0, 0x20ff],
];
export function AddCSS(font, options) {
    for (const c of Object.keys(options)) {
        const n = parseInt(c);
        const data = options[n];
        if (data.c) {
            data.c = data.c.replace(/\\[0-9A-F]+/gi, (x) => String.fromCodePoint(parseInt(x.substring(1), 16)));
        }
        Object.assign(FontData.charOptions(font, n), data);
    }
    return font;
}
//# sourceMappingURL=FontData.js.map