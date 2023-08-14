import { CommonOutputJax } from './common.js';
import { SvgWrapperFactory } from './svg/WrapperFactory.js';
import { FontCache } from './svg/FontCache.js';
import { unicodeChars } from '../util/string.js';
import * as LENGTHS from '../util/lengths.js';
import { SPACE } from './common/Wrapper.js';
import { DefaultFont } from './svg/DefaultFont.js';
export const SVGNS = 'http://www.w3.org/2000/svg';
export const XLINKNS = 'http://www.w3.org/1999/xlink';
export class SVG extends CommonOutputJax {
    get forceInlineBreaks() {
        return true;
    }
    constructor(options = null) {
        super(options, SvgWrapperFactory, DefaultFont);
        this.minwidth = 0;
        this.shift = 0;
        this.svgStyles = null;
        this.fontCache = new FontCache(this);
    }
    initialize() {
        if (this.options.fontCache === 'global') {
            this.fontCache.clearCache();
        }
    }
    clearFontCache() {
        this.fontCache.clearCache();
    }
    reset() {
        this.clearFontCache();
    }
    escaped(math, html) {
        this.setDocument(html);
        return this.html('span', {}, [this.text(math.math)]);
    }
    styleSheet(html) {
        if (this.svgStyles) {
            return this.svgStyles;
        }
        const sheet = this.svgStyles = super.styleSheet(html);
        this.adaptor.setAttribute(sheet, 'id', SVG.STYLESHEETID);
        return sheet;
    }
    pageElements(html) {
        if (this.options.fontCache === 'global' && !this.findCache(html)) {
            return this.svg('svg', { id: SVG.FONTCACHEID, style: { display: 'none' } }, [this.fontCache.getCache()]);
        }
        return null;
    }
    findCache(html) {
        const adaptor = this.adaptor;
        const svgs = adaptor.tags(adaptor.body(html.document), 'svg');
        for (let i = svgs.length - 1; i >= 0; i--) {
            if (this.adaptor.getAttribute(svgs[i], 'id') === SVG.FONTCACHEID) {
                return true;
            }
        }
        return false;
    }
    processMath(wrapper, parent) {
        const container = this.container;
        this.container = parent;
        const [svg, g] = this.createRoot(wrapper);
        this.typesetSvg(wrapper, svg, g);
        wrapper.node.getProperty('process-breaks') && this.handleInlineBreaks(wrapper, svg, g);
        this.container = container;
    }
    createRoot(wrapper) {
        const { w, h, d, pwidth } = wrapper.getOuterBBox();
        const [svg, g] = this.createSVG(h, d, w);
        if (pwidth) {
            const adaptor = this.adaptor;
            adaptor.setStyle(svg, 'min-width', adaptor.getStyle(svg, 'width'));
            adaptor.setAttribute(svg, 'width', pwidth);
            adaptor.removeAttribute(svg, 'viewBox');
            const scale = this.fixed(wrapper.metrics.ex / (this.font.params.x_height * 1000), 6);
            adaptor.setAttribute(g, 'transform', `scale(${scale},-${scale}) translate(0, ${this.fixed(-h * 1000, 1)})`);
        }
        return [svg, g];
    }
    createSVG(h, d, w) {
        const px = this.math.metrics.em / 1000;
        const W = Math.max(w, px);
        const H = Math.max(h + d, px);
        const g = this.svg('g', {
            stroke: 'currentColor', fill: 'currentColor',
            'stroke-width': 0, transform: 'scale(1,-1)'
        });
        const adaptor = this.adaptor;
        const svg = adaptor.append(this.container, this.svg('svg', {
            xmlns: SVGNS,
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
        if (this.options.fontCache !== 'none' && this.options.useXlink) {
            adaptor.setAttribute(svg, 'xmlns:xlink', XLINKNS);
        }
        return [svg, g];
    }
    typesetSvg(wrapper, svg, g) {
        const adaptor = this.adaptor;
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
            const align = adaptor.getAttribute(this.container, 'justify') || 'center';
            this.setIndent(svg, align, this.shift);
        }
    }
    setIndent(svg, align, shift) {
        if (align === 'center' || align === 'left') {
            this.adaptor.setStyle(svg, 'margin-left', this.ex(shift));
        }
        if (align === 'center' || align === 'right') {
            this.adaptor.setStyle(svg, 'margin-right', this.ex(-shift));
        }
    }
    handleInlineBreaks(wrapper, svg, g) {
        const n = wrapper.childNodes[0].breakCount;
        if (!n)
            return;
        const adaptor = this.adaptor;
        const math = adaptor.firstChild(g);
        const lines = adaptor.childNodes(adaptor.firstChild(math));
        const lineBBox = wrapper.childNodes[0].lineBBox;
        adaptor.remove(g);
        for (let i = 0; i <= n; i++) {
            const line = lineBBox[i] || wrapper.childNodes[0].getLineBBox(i);
            const { h, d, w } = line;
            const [mml, mo] = wrapper.childNodes[0].getBreakNode(line);
            const { scale } = mml.getBBox();
            const [nsvg, ng] = this.createSVG(h * scale, d * scale, w * scale);
            const nmath = adaptor.append(ng, adaptor.clone(math, false));
            for (const child of adaptor.childNodes(lines[i])) {
                adaptor.append(nmath, child);
            }
            adaptor.insert(nsvg, svg);
            const forced = !!(mo && mo.node.getProperty('forcebreak'));
            if (forced && mo.node.attributes.get('linebreakstyle') === 'after') {
                const k = mml.parent.node.childIndex(mml.node) + 1;
                const next = mml.parent.childNodes[k];
                const dimen = (next ? next.getLineBBox(0).originalL : 0) * scale;
                if (dimen) {
                    this.addInlineBreak(nsvg, dimen, forced);
                }
            }
            else if (forced || i) {
                const dimen = (mml && i ? mml.getLineBBox(0).originalL : 0) * scale;
                if (dimen || !forced) {
                    this.addInlineBreak(nsvg, dimen, forced || !!mml.node.getProperty('forcebreak'));
                }
            }
        }
        if (adaptor.childNodes(svg).length) {
            adaptor.append(adaptor.firstChild(adaptor.parent(svg)), adaptor.firstChild(svg));
        }
        adaptor.remove(svg);
    }
    addInlineBreak(nsvg, dimen, forced) {
        const adaptor = this.adaptor;
        const space = LENGTHS.em(dimen);
        if (!forced) {
            adaptor.insert(adaptor.node('mjx-break', { prebreak: true }), nsvg);
        }
        adaptor.insert(adaptor.node('mjx-break', !forced ? { newline: true } :
            SPACE[space] ? { size: SPACE[space] } : { style: `letter-spacing: ${LENGTHS.em(dimen - 1)}` }), nsvg);
    }
    ex(m) {
        m /= this.font.params.x_height;
        return (Math.abs(m) < .001 ? '0' : m.toFixed(3).replace(/\.?0+$/, '') + 'ex');
    }
    svg(kind, properties = {}, children = []) {
        return this.html(kind, properties, children, SVGNS);
    }
    unknownText(text, variant) {
        const metrics = this.math.metrics;
        const scale = this.font.params.x_height / metrics.ex * metrics.em * 1000;
        const svg = this.svg('text', {
            'data-variant': variant,
            transform: 'scale(1,-1)', 'font-size': this.fixed(scale, 1) + 'px'
        }, [this.text(text)]);
        const adaptor = this.adaptor;
        if (variant !== '-explicitFont') {
            const c = unicodeChars(text);
            if (c.length !== 1 || c[0] < 0x1D400 || c[0] > 0x1D7FF) {
                const [family, italic, bold] = this.font.getCssFont(variant);
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
    }
    measureTextNode(text) {
        const adaptor = this.adaptor;
        text = adaptor.clone(text);
        adaptor.removeAttribute(text, 'transform');
        const ex = this.fixed(this.font.params.x_height * 1000, 1);
        const svg = this.svg('svg', {
            position: 'absolute', visibility: 'hidden',
            width: '1ex', height: '1ex',
            viewBox: [0, 0, ex, ex].join(' ')
        }, [text]);
        adaptor.append(adaptor.body(adaptor.document), svg);
        let w = adaptor.nodeSize(text, 1000, true)[0];
        adaptor.remove(svg);
        return { w: w, h: .75, d: .2 };
    }
}
SVG.NAME = 'SVG';
SVG.OPTIONS = Object.assign(Object.assign({}, CommonOutputJax.OPTIONS), { blacker: 3, internalSpeechTitles: true, titleID: 0, fontCache: 'local', localID: null, useXlink: true });
SVG.commonStyles = Object.assign(Object.assign({}, CommonOutputJax.commonStyles), { 'mjx-container[jax="SVG"]': {
        direction: 'ltr',
        'white-space': 'nowrap'
    }, 'mjx-container[jax="SVG"] > svg': {
        overflow: 'visible',
        'min-height': '1px',
        'min-width': '1px'
    }, 'mjx-container[jax="SVG"] > svg a': {
        fill: 'blue', stroke: 'blue'
    } });
SVG.FONTCACHEID = 'MJX-SVG-global-cache';
SVG.STYLESHEETID = 'MJX-SVG-styles';
//# sourceMappingURL=svg.js.map