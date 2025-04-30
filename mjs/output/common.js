import { AbstractOutputJax } from '../core/OutputJax.js';
import { STATE } from '../core/MathItem.js';
import { TEXCLASS } from '../core/MmlTree/MmlNode.js';
import { FontData, } from './common/FontData.js';
import { separateOptions } from '../util/Options.js';
import { LinebreakVisitor } from './common/LinebreakVisitor.js';
import { percent } from '../util/lengths.js';
import { length2em } from '../util/lengths.js';
import { Styles } from '../util/Styles.js';
import { StyleJsonSheet } from '../util/StyleJson.js';
export const FONTPATH = '@mathjax/%%FONT%%-font';
export class CommonOutputJax extends AbstractOutputJax {
    get forceInlineBreaks() {
        return false;
    }
    constructor(options = {}, defaultFactory = null, defaultFont = null) {
        const [fontClass, font] = options.fontData instanceof FontData
            ? [options.fontData.constructor, options.fontData]
            : [options.fontData || defaultFont, null];
        const [jaxOptions, fontOptions] = separateOptions(options, fontClass.OPTIONS);
        super(jaxOptions);
        this.factory =
            this.options.wrapperFactory ||
                new defaultFactory();
        this.factory.jax = this;
        this.styleJson = this.options.styleJson || new StyleJsonSheet();
        this.font = font || new fontClass(fontOptions);
        this.font.setOptions({ mathmlSpacing: this.options.mathmlSpacing });
        this.unknownCache = new Map();
        const linebreaks = (this.options.linebreaks.LinebreakVisitor ||
            LinebreakVisitor);
        this.linebreaks = new linebreaks(this.factory);
    }
    setAdaptor(adaptor) {
        super.setAdaptor(adaptor);
        if (this.options.htmlHDW === 'auto') {
            this.options.htmlHDW = adaptor.canMeasureNodes ? 'ignore' : 'force';
        }
    }
    addExtension(font, prefix = '') {
        return this.font.addExtension(font, prefix);
    }
    typeset(math, html) {
        this.setDocument(html);
        const node = this.createNode();
        this.toDOM(math, node, html);
        return node;
    }
    createNode() {
        const jax = this.constructor.NAME;
        return this.html('mjx-container', { class: 'MathJax', jax: jax });
    }
    setScale(node, wrapper) {
        let scale = this.getInitialScale() * this.options.scale;
        if (wrapper.node.attributes.get('overflow') === 'scale' &&
            this.math.display) {
            const w = wrapper.getOuterBBox().w;
            const W = this.math.metrics.containerWidth / this.pxPerEm;
            if (w > W && w) {
                scale *= W / w;
            }
        }
        if (scale !== 1) {
            this.adaptor.setStyle(node, 'fontSize', percent(scale));
        }
    }
    getInitialScale() {
        return this.math.metrics.scale;
    }
    toDOM(math, node, html = null) {
        var _a;
        this.setDocument(html);
        this.math = math;
        this.container = node;
        this.pxPerEm = math.metrics.ex / this.font.params.x_height;
        this.nodeMap = new Map();
        math.root.attributes.getAllInherited().overflow =
            this.options.displayOverflow;
        const overflow = math.root.attributes.get('overflow');
        this.adaptor.setAttribute(node, 'overflow', overflow);
        const linebreak = overflow === 'linebreak';
        if (linebreak) {
            this.getLinebreakWidth();
        }
        const inlineMarked = !!math.root.getProperty('inlineMarked');
        if (this.options.linebreaks.inline && !math.display && !inlineMarked) {
            this.markInlineBreaks((_a = math.root.childNodes) === null || _a === void 0 ? void 0 : _a[0]);
            math.root.setProperty('inlineMarked', true);
        }
        else if (!this.options.linebreaks.inline && inlineMarked) {
            this.unmarkInlineBreaks(math.root);
            math.root.setProperty('inlineMarked', false);
        }
        math.root.setTeXclass(null);
        const wrapper = this.factory.wrap(math.root);
        this.setScale(node, wrapper);
        this.processMath(wrapper, node);
        this.nodeMap = null;
        this.executeFilters(this.postFilters, math, html, node);
    }
    getBBox(math, html) {
        this.setDocument(html);
        this.math = math;
        math.root.setTeXclass(null);
        this.nodeMap = new Map();
        const bbox = this.factory.wrap(math.root).getOuterBBox();
        this.nodeMap = null;
        return bbox;
    }
    getLinebreakWidth() {
        const W = this.math.metrics.containerWidth / this.pxPerEm;
        const width = this.math.root.attributes.get('maxwidth') ||
            this.options.linebreaks.width;
        this.containerWidth = length2em(width, W, 1, this.pxPerEm);
    }
    markInlineBreaks(node) {
        if (!node)
            return;
        const forcebreak = this.forceInlineBreaks;
        let postbreak = false;
        let marked = false;
        let markNext = '';
        for (const child of node.childNodes) {
            if (markNext) {
                marked = this.markInlineBreak(marked, forcebreak, markNext, node, child);
                markNext = '';
                postbreak = false;
            }
            else if (child.isEmbellished) {
                if (child === node.childNodes[0]) {
                    continue;
                }
                const mo = child.coreMO();
                const texClass = mo.texClass;
                const linebreak = mo.attributes.get('linebreak');
                const linebreakstyle = mo.attributes.get('linebreakstyle');
                if ((texClass === TEXCLASS.BIN ||
                    texClass === TEXCLASS.REL ||
                    (texClass === TEXCLASS.ORD && mo.hasSpacingAttributes()) ||
                    linebreak !== 'auto') &&
                    linebreak !== 'nobreak') {
                    if (linebreakstyle === 'before') {
                        if (!postbreak || linebreak !== 'auto') {
                            marked = this.markInlineBreak(marked, forcebreak, linebreak, node, child, mo);
                        }
                    }
                    else {
                        markNext = linebreak;
                    }
                }
                postbreak = linebreak === 'newline' && linebreakstyle === 'after';
            }
            else if (child.isKind('mspace')) {
                const linebreak = child.attributes.get('linebreak');
                if (linebreak !== 'nobreak' && child.canBreak) {
                    marked = this.markInlineBreak(marked, forcebreak, linebreak, node, child);
                }
                postbreak = linebreak === 'newline';
            }
            else {
                postbreak = false;
                if ((child.isKind('mstyle') &&
                    !child.attributes.get('style') &&
                    !child.attributes.hasExplicit('mathbackground')) ||
                    child.isKind('semantics')) {
                    this.markInlineBreaks(child.childNodes[0]);
                    if (child.getProperty('process-breaks')) {
                        child.setProperty('inline-breaks', true);
                        child.childNodes[0].setProperty('inline-breaks', true);
                        node.parent.setProperty('process-breaks', 'true');
                    }
                }
                else if (child.isKind('mrow') &&
                    child.attributes.get('data-semantic-added')) {
                    this.markInlineBreaks(child);
                    if (child.getProperty('process-breaks')) {
                        child.setProperty('inline-breaks', true);
                        node.parent.setProperty('process-breaks', 'true');
                    }
                }
            }
        }
    }
    markInlineBreak(marked, forcebreak, linebreak, node, child, mo = null) {
        child.setProperty('breakable', true);
        if (forcebreak && linebreak !== 'newline') {
            child.setProperty('forcebreak', true);
            mo === null || mo === void 0 ? void 0 : mo.setProperty('forcebreak', true);
        }
        else {
            child.removeProperty('forcebreak');
            mo === null || mo === void 0 ? void 0 : mo.removeProperty('forcebreak');
            if (linebreak === 'newline') {
                child.setProperty('newline', true);
            }
        }
        if (!marked) {
            node.setProperty('process-breaks', true);
            node.parent.setProperty('process-breaks', true);
            marked = true;
        }
        return marked;
    }
    unmarkInlineBreaks(node) {
        if (!node)
            return;
        node.removeProperty('forcebreak');
        node.removeProperty('breakable');
        if (node.getProperty('process-breaks')) {
            node.removeProperty('process-breaks');
            for (const child of node.childNodes) {
                this.unmarkInlineBreaks(child);
            }
        }
    }
    getMetrics(html) {
        this.setDocument(html);
        const adaptor = this.adaptor;
        const maps = this.getMetricMaps(html);
        for (const math of html.math) {
            const parent = adaptor.parent(math.start.node);
            if (math.state() < STATE.METRICS && parent) {
                const map = maps[math.display ? 1 : 0];
                const { em, ex, containerWidth, scale, family } = map.get(parent);
                math.setMetrics(em, ex, containerWidth, scale);
                if (this.options.mtextInheritFont) {
                    math.outputData.mtextFamily = family;
                }
                if (this.options.merrorInheritFont) {
                    math.outputData.merrorFamily = family;
                }
                math.state(STATE.METRICS);
            }
        }
    }
    getMetricsFor(node, display) {
        const getFamily = this.options.mtextInheritFont || this.options.merrorInheritFont;
        const test = this.getTestElement(node, display);
        const metrics = Object.assign(Object.assign({}, this.measureMetrics(test, getFamily)), { display });
        this.adaptor.remove(test);
        return metrics;
    }
    getMetricMaps(html) {
        const adaptor = this.adaptor;
        const domMaps = [
            new Map(),
            new Map(),
        ];
        for (const math of html.math) {
            const node = adaptor.parent(math.start.node);
            if (node && math.state() < STATE.METRICS) {
                const map = domMaps[math.display ? 1 : 0];
                if (!map.has(node)) {
                    map.set(node, this.getTestElement(node, math.display));
                }
            }
        }
        const getFamily = this.options.mtextInheritFont || this.options.merrorInheritFont;
        const maps = [new Map(), new Map()];
        for (const i of maps.keys()) {
            for (const node of domMaps[i].keys()) {
                maps[i].set(node, this.measureMetrics(domMaps[i].get(node), getFamily));
            }
        }
        for (const i of maps.keys()) {
            for (const node of domMaps[i].values()) {
                adaptor.remove(node);
            }
        }
        return maps;
    }
    getTestElement(node, display) {
        const adaptor = this.adaptor;
        if (!this.testInline) {
            this.testInline = this.html('mjx-test', {
                style: {
                    display: 'inline-block',
                    width: '100%',
                    'font-style': 'normal',
                    'font-weight': 'normal',
                    'font-size': '100%',
                    'font-size-adjust': 'none',
                    'text-indent': 0,
                    'text-transform': 'none',
                    'letter-spacing': 'normal',
                    'word-spacing': 'normal',
                    overflow: 'hidden',
                    height: '1px',
                    'margin-right': '-1px',
                },
            }, [
                this.html('mjx-left-box', {
                    style: {
                        display: 'inline-block',
                        width: 0,
                        float: 'left',
                    },
                }),
                this.html('mjx-ex-box', {
                    style: {
                        position: 'absolute',
                        overflow: 'hidden',
                        width: '1px',
                        height: '60ex',
                    },
                }),
                this.html('mjx-right-box', {
                    style: {
                        display: 'inline-block',
                        width: 0,
                        float: 'right',
                    },
                }),
            ]);
            this.testDisplay = adaptor.clone(this.testInline);
            adaptor.setStyle(this.testDisplay, 'display', 'table');
            adaptor.setStyle(this.testDisplay, 'margin-right', '');
            adaptor.setStyle(adaptor.firstChild(this.testDisplay), 'display', 'none');
            const right = adaptor.lastChild(this.testDisplay);
            adaptor.setStyle(right, 'display', 'table-cell');
            adaptor.setStyle(right, 'width', '10000em');
            adaptor.setStyle(right, 'float', '');
        }
        return adaptor.append(node, adaptor.clone(display ? this.testDisplay : this.testInline));
    }
    measureMetrics(node, getFamily) {
        const adaptor = this.adaptor;
        const family = getFamily ? adaptor.fontFamily(node) : '';
        const em = adaptor.fontSize(node);
        const [w, h] = adaptor.nodeSize(adaptor.childNode(node, 1));
        const ex = w ? h / 60 : em * this.options.exFactor;
        const containerWidth = !w
            ? 1000000
            : adaptor.getStyle(node, 'display') === 'table'
                ? adaptor.nodeSize(adaptor.lastChild(node))[0] - 1
                : adaptor.nodeBBox(adaptor.lastChild(node)).left -
                    adaptor.nodeBBox(adaptor.firstChild(node)).left -
                    2;
        const scale = Math.max(this.options.minScale, this.options.matchFontHeight ? ex / this.font.params.x_height / em : 1);
        return { em, ex, containerWidth, scale, family };
    }
    styleSheet(html) {
        this.setDocument(html);
        this.styleJson.clear();
        this.styleJson.addStyles(this.constructor.commonStyles);
        if ('getStyles' in html) {
            for (const styles of html.getStyles()) {
                this.styleJson.addStyles(styles);
            }
        }
        this.addWrapperStyles(this.styleJson);
        this.addFontStyles(this.styleJson);
        const sheet = this.html('style', { id: 'MJX-styles' }, [
            this.text('\n' + this.styleJson.cssText + '\n'),
        ]);
        return sheet;
    }
    addFontStyles(styles) {
        styles.addStyles(this.font.styles);
    }
    addWrapperStyles(styles) {
        for (const kind of this.factory.getKinds()) {
            this.addClassStyles(this.factory.getNodeClass(kind), styles);
        }
    }
    addClassStyles(CLASS, styles) {
        CLASS.addStyles(styles, this);
    }
    setDocument(html) {
        if (html) {
            this.document = html;
            this.adaptor.document = html.document;
        }
    }
    html(type, def = {}, content = [], ns) {
        return this.adaptor.node(type, def, content, ns);
    }
    text(text) {
        return this.adaptor.text(text);
    }
    fixed(m, n = 3) {
        if (Math.abs(m) < 0.0006) {
            return '0';
        }
        return m.toFixed(n).replace(/\.?0+$/, '');
    }
    measureText(text, variant, font = ['', false, false]) {
        const node = this.unknownText(text, variant);
        if (variant === '-explicitFont') {
            const styles = this.cssFontStyles(font);
            this.adaptor.setAttributes(node, { style: styles });
        }
        return this.measureTextNodeWithCache(node, text, variant, font);
    }
    measureTextNodeWithCache(text, chars, variant, font = ['', false, false]) {
        if (variant === '-explicitFont') {
            variant = [font[0], font[1] ? 'T' : 'F', font[2] ? 'T' : 'F', ''].join('-');
        }
        if (!this.unknownCache.has(variant)) {
            this.unknownCache.set(variant, new Map());
        }
        const map = this.unknownCache.get(variant);
        const cached = map.get(chars);
        if (cached)
            return cached;
        const bbox = this.measureTextNode(text);
        map.set(chars, bbox);
        return bbox;
    }
    cssFontStyles(font, styles = {}) {
        const [family, italic, bold] = font;
        styles['font-family'] = this.font.getFamily(family);
        if (italic)
            styles['font-style'] = 'italic';
        if (bold)
            styles['font-weight'] = 'bold';
        return styles;
    }
    getFontData(styles) {
        if (!styles) {
            styles = new Styles();
        }
        return [
            this.font.getFamily(styles.get('font-family')),
            styles.get('font-style') === 'italic',
            styles.get('font-weight') === 'bold',
        ];
    }
}
CommonOutputJax.NAME = 'Common';
CommonOutputJax.OPTIONS = Object.assign(Object.assign({}, AbstractOutputJax.OPTIONS), { scale: 1, minScale: .5, mtextInheritFont: false, merrorInheritFont: false, mtextFont: '', merrorFont: 'serif', mathmlSpacing: false, skipAttributes: {}, exFactor: .5, displayAlign: 'center', displayIndent: '0', displayOverflow: 'overflow', linebreaks: {
        inline: true,
        width: '100%',
        lineleading: .2,
        LinebreakVisitor: null,
    }, font: '', htmlHDW: 'auto', wrapperFactory: null, fontData: null, fontPath: FONTPATH, styleJson: null });
CommonOutputJax.commonStyles = {
    'mjx-container[overflow="scroll"][display]': {
        overflow: 'auto clip',
        'min-width': 'initial !important',
    },
    'mjx-container[overflow="truncate"][display]': {
        overflow: 'hidden clip',
        'min-width': 'initial !important',
    },
    'mjx-container[display]': {
        display: 'block',
        'text-align': 'center',
        'justify-content': 'center',
        margin: 'calc(1em - 2px) 0',
        padding: '2px 0',
    },
    'mjx-container[display][width="full"]': {
        display: 'flex',
    },
    'mjx-container[justify="left"]': {
        'text-align': 'left',
        'justify-content': 'left',
    },
    'mjx-container[justify="right"]': {
        'text-align': 'right',
        'justify-content': 'right',
    },
};
//# sourceMappingURL=common.js.map