import { AbstractWrapper } from '../../core/Tree/Wrapper.js';
import { TextNode, } from '../../core/MmlTree/MmlNode.js';
import { unicodeChars } from '../../util/string.js';
import * as LENGTHS from '../../util/lengths.js';
import { Styles } from '../../util/Styles.js';
import { lookup } from '../../util/Options.js';
import { BBox } from '../../util/BBox.js';
import { LineBBox } from './LineBBox.js';
import { DIRECTION, NOSTRETCH, } from './FontData.js';
const SMALLSIZE = 2 / 18;
const MOSPACE = 5 / 18;
function MathMLSpace(script, nodict, size) {
    return nodict ? MOSPACE : script ? (size < SMALLSIZE ? 0 : SMALLSIZE) : size;
}
export const SPACE = {
    [LENGTHS.em(0)]: '0',
    [LENGTHS.em(2 / 18)]: '1',
    [LENGTHS.em(3 / 18)]: '2',
    [LENGTHS.em(4 / 18)]: '3',
    [LENGTHS.em(5 / 18)]: '4',
    [LENGTHS.em(6 / 18)]: '5'
};
export class CommonWrapper extends AbstractWrapper {
    static addStyles(styles, _jax) {
        styles.addStyles(this.styles);
    }
    get jax() {
        return this.factory.jax;
    }
    get adaptor() {
        return this.factory.jax.adaptor;
    }
    get metrics() {
        return this.factory.jax.math.metrics;
    }
    get containerWidth() {
        return this.jax.containerWidth;
    }
    get linebreaks() {
        return this.jax.linebreaks;
    }
    get linebreakOptions() {
        return this.jax.options.linebreaks;
    }
    get fixesPWidth() {
        return !this.node.notParent && !this.node.isToken;
    }
    get breakCount() {
        if (this._breakCount < 0) {
            const node = this.node;
            this._breakCount = node.isEmbellished
                ? this.coreMO().embellishedBreakCount
                : node.arity < 0 &&
                    !node.linebreakContainer &&
                    this.childNodes[0]
                        .isStack
                    ? this.childNodes[0].breakCount
                    : 0;
        }
        return this._breakCount;
    }
    breakTop(mrow, _child) {
        return this.node.linebreakContainer || !this.parent
            ? mrow
            : this.parent.breakTop(mrow, this);
    }
    constructor(factory, node, parent = null) {
        super(factory, node);
        this.parent = null;
        this.dom = null;
        this.removedStyles = null;
        this.styles = null;
        this.styleData = null;
        this.variant = '';
        this.bboxComputed = false;
        this._breakCount = -1;
        this.lineBBox = [];
        this.stretch = NOSTRETCH;
        this.font = null;
        this.parent = parent;
        this.font = factory.jax.font;
        this.bbox = BBox.zero();
        this.getStyles();
        this.getStyleData();
        this.getVariant();
        this.getScale();
        this.getSpace();
        this.childNodes = node.childNodes.map((child) => {
            const wrapped = this.wrap(child);
            if (wrapped.bbox.pwidth && (node.notParent || node.isKind('math'))) {
                this.bbox.pwidth = BBox.fullWidth;
            }
            return wrapped;
        });
    }
    wrap(node, parent = null) {
        const wrapped = this.factory.wrap(node, parent || this);
        if (parent) {
            parent.childNodes.push(wrapped);
        }
        this.jax.nodeMap.set(node, wrapped);
        return wrapped;
    }
    getBBox(save = true) {
        if (this.bboxComputed) {
            return this.bbox;
        }
        const bbox = save ? this.bbox : BBox.zero();
        this.computeBBox(bbox);
        this.bboxComputed = save;
        return bbox;
    }
    getOuterBBox(save = true) {
        var _a;
        const bbox = this.getBBox(save);
        if (!this.styleData)
            return bbox;
        const padding = this.styleData.padding;
        const border = ((_a = this.styleData.border) === null || _a === void 0 ? void 0 : _a.width) || [0, 0, 0, 0];
        const obox = bbox.copy();
        for (const [, i, side] of BBox.boxSides) {
            obox[side] += padding[i] + border[i];
        }
        return obox;
    }
    getUnbrokenHD() {
        const n = this.breakCount + 1;
        let H = 0;
        let D = 0;
        for (let i = 0; i < n; i++) {
            const { h, d } = this.getLineBBox(i);
            if (h > H) {
                H = h;
            }
            if (d > D) {
                D = d;
            }
        }
        return [H, D];
    }
    computeBBox(bbox, recompute = false) {
        bbox.empty();
        for (const child of this.childNodes) {
            bbox.append(child.getOuterBBox());
        }
        bbox.clean();
        if (this.fixesPWidth && this.setChildPWidths(recompute)) {
            this.computeBBox(bbox, true);
        }
    }
    getLineBBox(i) {
        if (!this.lineBBox[i]) {
            const n = this.breakCount;
            if (n) {
                const line = this.embellishedBBox(i) || this.computeLineBBox(i);
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
                const obox = this.getOuterBBox();
                this.lineBBox[i] = LineBBox.from(obox, this.linebreakOptions.lineleading);
            }
        }
        return this.lineBBox[i];
    }
    embellishedBBox(i) {
        if (!this.node.isEmbellished || this.node.isKind('mo'))
            return null;
        const mo = this.coreMO();
        return mo.moLineBBox(i, mo.embellishedBreakStyle, this.getOuterBBox());
    }
    computeLineBBox(i) {
        return this.getChildLineBBox(this.childNodes[0], i);
    }
    getBreakNode(bbox) {
        var _a, _b;
        if (!bbox.start) {
            return [this, null];
        }
        const [i, j] = bbox.start;
        if (this.node.isEmbellished) {
            return [this, this.coreMO()];
        }
        const childNodes = ((_b = (_a = this.childNodes[0]) === null || _a === void 0 ? void 0 : _a.node) === null || _b === void 0 ? void 0 : _b.isInferred)
            ? this.childNodes[0].childNodes
            : this.childNodes;
        if (this.node.isToken || !childNodes[i]) {
            return [this, null];
        }
        return childNodes[i].getBreakNode(childNodes[i].getLineBBox(j));
    }
    getChildLineBBox(child, i) {
        const n = this.breakCount;
        let cbox = child.getLineBBox(i);
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
    }
    addLeftBorders(bbox) {
        var _a;
        if (!this.styleData)
            return;
        const border = this.styleData.border;
        const padding = this.styleData.padding;
        bbox.w += (((_a = border === null || border === void 0 ? void 0 : border.width) === null || _a === void 0 ? void 0 : _a[3]) || 0) + ((padding === null || padding === void 0 ? void 0 : padding[3]) || 0);
    }
    addMiddleBorders(bbox) {
        var _a, _b;
        if (!this.styleData)
            return;
        const border = this.styleData.border;
        const padding = this.styleData.padding;
        bbox.h += (((_a = border === null || border === void 0 ? void 0 : border.width) === null || _a === void 0 ? void 0 : _a[0]) || 0) + ((padding === null || padding === void 0 ? void 0 : padding[0]) || 0);
        bbox.d += (((_b = border === null || border === void 0 ? void 0 : border.width) === null || _b === void 0 ? void 0 : _b[2]) || 0) + ((padding === null || padding === void 0 ? void 0 : padding[2]) || 0);
    }
    addRightBorders(bbox) {
        var _a;
        if (!this.styleData)
            return;
        const border = this.styleData.border;
        const padding = this.styleData.padding;
        bbox.w += (((_a = border === null || border === void 0 ? void 0 : border.width) === null || _a === void 0 ? void 0 : _a[1]) || 0) + ((padding === null || padding === void 0 ? void 0 : padding[1]) || 0);
    }
    setChildPWidths(recompute, w = null, clear = true) {
        if (recompute) {
            return false;
        }
        if (clear) {
            this.bbox.pwidth = '';
        }
        let changed = false;
        for (const child of this.childNodes) {
            const cbox = child.getBBox();
            if (cbox.pwidth &&
                child.setChildPWidths(recompute, w === null ? cbox.w : w, clear)) {
                changed = true;
            }
        }
        return changed;
    }
    breakToWidth(_W) {
    }
    invalidateBBox(bubble = true) {
        if (this.bboxComputed || this._breakCount >= 0) {
            this.bboxComputed = false;
            this.lineBBox = [];
            this._breakCount = -1;
            if (this.parent && bubble) {
                this.parent.invalidateBBox();
            }
        }
    }
    copySkewIC(bbox) {
        var _a, _b, _c;
        const first = this.childNodes[0];
        if ((_a = first === null || first === void 0 ? void 0 : first.bbox) === null || _a === void 0 ? void 0 : _a.sk) {
            bbox.sk = first.bbox.sk;
        }
        if ((_b = first === null || first === void 0 ? void 0 : first.bbox) === null || _b === void 0 ? void 0 : _b.dx) {
            bbox.dx = first.bbox.dx;
        }
        const last = this.childNodes[this.childNodes.length - 1];
        if ((_c = last === null || last === void 0 ? void 0 : last.bbox) === null || _c === void 0 ? void 0 : _c.ic) {
            bbox.ic = last.bbox.ic;
            bbox.w += bbox.ic;
        }
    }
    getStyles() {
        const styleString = this.node.attributes.getExplicit('style');
        if (!styleString)
            return;
        const style = (this.styles = new Styles(styleString));
        for (let i = 0, m = CommonWrapper.removeStyles.length; i < m; i++) {
            const id = CommonWrapper.removeStyles[i];
            if (style.get(id)) {
                if (!this.removedStyles)
                    this.removedStyles = {};
                this.removedStyles[id] = style.get(id);
                style.set(id, '');
            }
        }
    }
    getStyleData() {
        if (!this.styles)
            return;
        const padding = Array(4).fill(0);
        const width = Array(4).fill(0);
        const style = Array(4);
        const color = Array(4);
        let hasPadding = false;
        let hasBorder = false;
        for (const [name, i] of BBox.boxSides) {
            const key = 'border' + name;
            const w = this.styles.get(key + 'Width');
            if (w) {
                hasBorder = true;
                width[i] = Math.max(0, this.length2em(w, 1));
                style[i] = this.styles.get(key + 'Style') || 'solid';
                color[i] = this.styles.get(key + 'Color');
            }
            const p = this.styles.get('padding' + name);
            if (p) {
                hasPadding = true;
                padding[i] = Math.max(0, this.length2em(p, 1));
            }
        }
        this.styleData =
            hasPadding || hasBorder
                ? {
                    padding,
                    border: hasBorder ? { width, style, color } : null,
                }
                : null;
    }
    getVariant() {
        if (!this.node.isToken)
            return;
        const attributes = this.node.attributes;
        let variant = attributes.get('mathvariant');
        if (attributes.hasExplicit('mathvariant')) {
            if (!this.font.getVariant(variant)) {
                console.warn(`Invalid variant: ${variant}`);
                variant = 'normal';
            }
        }
        else {
            const values = attributes.getList('fontfamily', 'fontweight', 'fontstyle');
            if (this.removedStyles) {
                const style = this.removedStyles;
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
                values.weight = parseInt(values.weight) > 600 ? 'bold' : 'normal';
            }
            if (values.family) {
                variant = this.explicitVariant(values.family, values.weight, values.style);
            }
            else {
                if (this.node.getProperty('variantForm'))
                    variant = '-tex-variant';
                variant =
                    (CommonWrapper.BOLDVARIANTS[values.weight] || {})[variant] || variant;
                variant =
                    (CommonWrapper.ITALICVARIANTS[values.style] || {})[variant] ||
                        variant;
            }
        }
        this.variant = variant;
    }
    explicitVariant(fontFamily, fontWeight, fontStyle) {
        let style = this.styles;
        if (!style)
            style = this.styles = new Styles();
        style.set('fontFamily', fontFamily);
        if (fontWeight)
            style.set('fontWeight', fontWeight);
        if (fontStyle)
            style.set('fontStyle', fontStyle);
        return '-explicitFont';
    }
    getScale() {
        let scale = 1;
        const parent = this.parent;
        const pscale = parent ? parent.bbox.scale : 1;
        const attributes = this.node.attributes;
        const scriptlevel = Math.min(attributes.get('scriptlevel'), 2);
        let fontsize = attributes.get('fontsize');
        let mathsize = this.node.isToken || this.node.isKind('mstyle')
            ? attributes.get('mathsize')
            : attributes.getInherited('mathsize');
        if (scriptlevel !== 0) {
            scale = Math.pow(attributes.get('scriptsizemultiplier'), scriptlevel);
        }
        if (this.removedStyles && this.removedStyles.fontSize && !fontsize) {
            fontsize = this.removedStyles.fontSize;
        }
        if (fontsize && !attributes.hasExplicit('mathsize')) {
            mathsize = fontsize;
        }
        if (mathsize !== '1') {
            scale *= this.length2em(mathsize, 1, 1);
        }
        if (scriptlevel !== 0) {
            const scriptminsize = this.length2em(attributes.get('scriptminsize'), 0.4, 1);
            if (scale < scriptminsize)
                scale = scriptminsize;
        }
        this.bbox.scale = scale;
        this.bbox.rscale = scale / pscale;
    }
    getSpace() {
        const isTop = this.isTopEmbellished();
        const hasSpacing = this.node.hasSpacingAttributes();
        if (this.jax.options.mathmlSpacing || hasSpacing) {
            if (isTop) {
                this.getMathMLSpacing();
            }
        }
        else {
            this.getTeXSpacing(isTop, hasSpacing);
        }
    }
    getMathMLSpacing() {
        const node = this.node.coreMO();
        const child = node.coreParent();
        const parent = child.parent;
        if (!parent || !parent.isKind('mrow') || parent.childNodes.length === 1) {
            return;
        }
        const noDictDef = node.getProperty('noDictDef');
        const attributes = node.attributes;
        const isScript = attributes.get('scriptlevel') > 0;
        this.bbox.L = attributes.isSet('lspace')
            ? Math.max(0, this.length2em(attributes.get('lspace')))
            : MathMLSpace(isScript, noDictDef, node.lspace);
        this.bbox.R = attributes.isSet('rspace')
            ? Math.max(0, this.length2em(attributes.get('rspace')))
            : MathMLSpace(isScript, noDictDef, node.rspace);
        const n = parent.childIndex(child);
        if (n === 0)
            return;
        const prev = parent.childNodes[n - 1];
        if (!prev.isEmbellished)
            return;
        const bbox = this.jax.nodeMap.get(prev).getBBox();
        if (bbox.R) {
            this.bbox.L = Math.max(0, this.bbox.L - bbox.R);
        }
    }
    getTeXSpacing(isTop, hasSpacing) {
        if (!hasSpacing) {
            const space = this.node.texSpacing();
            if (space) {
                this.bbox.L = this.length2em(space);
            }
        }
        if (isTop || hasSpacing) {
            const attributes = this.node.coreMO().attributes;
            if (attributes.isSet('lspace')) {
                this.bbox.L = Math.max(0, this.length2em(attributes.get('lspace')));
            }
            if (attributes.isSet('rspace')) {
                this.bbox.R = Math.max(0, this.length2em(attributes.get('rspace')));
            }
        }
    }
    isTopEmbellished() {
        return (this.node.isEmbellished &&
            !(this.node.parent && this.node.parent.isEmbellished));
    }
    core() {
        return this.jax.nodeMap.get(this.node.core());
    }
    coreMO() {
        return this.jax.nodeMap.get(this.node.coreMO());
    }
    coreRScale() {
        let rscale = this.bbox.rscale;
        let node = this.coreMO();
        while (node !== this && node) {
            rscale *= node.bbox.rscale;
            node = node.parent;
        }
        return rscale;
    }
    getRScale() {
        let rscale = 1;
        let node = this;
        while (node) {
            rscale *= node.bbox.rscale;
            node = node.parent;
        }
        return rscale;
    }
    getText() {
        let text = '';
        if (this.node.isToken) {
            for (const child of this.node.childNodes) {
                if (child instanceof TextNode) {
                    text += child.getText();
                }
            }
        }
        return text;
    }
    canStretch(direction) {
        this.stretch = NOSTRETCH;
        if (this.node.isEmbellished) {
            const core = this.core();
            if (core && core.node !== this.node) {
                if (core.canStretch(direction)) {
                    this.stretch = core.stretch;
                }
            }
        }
        return this.stretch.dir !== DIRECTION.None;
    }
    getAlignShift() {
        let { indentalign, indentshift, indentalignfirst, indentshiftfirst } = this.node.attributes.getAllAttributes();
        if (indentalignfirst !== 'indentalign') {
            indentalign = indentalignfirst;
        }
        if (indentshiftfirst !== 'indentshift') {
            indentshift = indentshiftfirst;
        }
        return this.processIndent(indentalign, indentshift);
    }
    processIndent(indentalign, indentshift, align = '', shift = '', width = this.metrics.containerWidth) {
        if (!this.jax.math.display) {
            return ['left', 0];
        }
        if (!align || align === 'auto') {
            align = this.jax.math.root.getProperty('inlineMarked')
                ? 'left'
                : this.jax.options.displayAlign;
        }
        if (!shift || shift === 'auto') {
            shift = this.jax.math.root.getProperty('inlineMarked')
                ? '0'
                : this.jax.options.displayIndent;
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
        const indent = this.length2em(indentshift, width);
        return [indentalign, indent];
    }
    getAlignX(W, bbox, align) {
        return align === 'right'
            ? W - (bbox.w + bbox.R) * bbox.rscale
            : align === 'left'
                ? bbox.L * bbox.rscale
                : (W - bbox.w * bbox.rscale) / 2;
    }
    getAlignY(H, D, h, d, align) {
        return align === 'top'
            ? H - h
            : align === 'bottom'
                ? d - D
                : align === 'center'
                    ? (H - h - (D - d)) / 2
                    : 0;
    }
    getWrapWidth(i) {
        return this.childNodes[i].getBBox().w;
    }
    getChildAlign(_i) {
        return 'left';
    }
    percent(m) {
        return LENGTHS.percent(m);
    }
    em(m) {
        return LENGTHS.em(m);
    }
    px(m, M = -LENGTHS.BIGDIMEN) {
        return LENGTHS.px(m, M, this.metrics.em);
    }
    length2em(length, size = 1, scale = null) {
        if (scale === null) {
            scale = this.bbox.scale;
        }
        const t = this.font.params.rule_thickness;
        const factor = lookup(length, { medium: 1, thin: 2 / 3, thick: 5 / 3 }, 0);
        return factor
            ? factor * t
            : LENGTHS.length2em(length, size, scale, this.jax.pxPerEm);
    }
    unicodeChars(text, name = this.variant) {
        let chars = unicodeChars(text);
        const variant = this.font.getVariant(name);
        if (variant && variant.chars) {
            const map = variant.chars;
            chars = chars.map((n) => { var _a, _b; return ((_b = (_a = map[n]) === null || _a === void 0 ? void 0 : _a[3]) === null || _b === void 0 ? void 0 : _b.smp) || n; });
        }
        return chars;
    }
    remapChars(chars) {
        return chars;
    }
    mmlText(text) {
        return this.node.factory.create('text').setText(text);
    }
    mmlNode(kind, properties = {}, children = []) {
        return this.node.factory.create(kind, properties, children);
    }
    createMo(text) {
        const mmlFactory = this.node.factory;
        const textNode = mmlFactory.create('text').setText(text);
        const mml = mmlFactory.create('mo', { stretchy: true }, [textNode]);
        mml.inheritAttributesFrom(this.node);
        mml.parent = this.node.parent;
        const node = this.wrap(mml);
        node.parent = this;
        return node;
    }
    getVariantChar(variant, n) {
        const char = this.font.getChar(variant, n) || [0, 0, 0, { unknown: true }];
        if (char.length === 3) {
            char[3] = {};
        }
        return char;
    }
    html(type, def = {}, content = []) {
        return this.jax.html(type, def, content);
    }
}
CommonWrapper.kind = 'unknown';
CommonWrapper.styles = {};
CommonWrapper.removeStyles = [
    'fontSize',
    'fontFamily',
    'fontWeight',
    'fontStyle',
    'fontVariant',
    'font',
];
CommonWrapper.skipAttributes = {
    fontfamily: true,
    fontsize: true,
    fontweight: true,
    fontstyle: true,
    color: true,
    background: true,
    class: true,
    href: true,
    style: true,
    xmlns: true,
};
CommonWrapper.BOLDVARIANTS = {
    bold: {
        normal: 'bold',
        italic: 'bold-italic',
        fraktur: 'bold-fraktur',
        script: 'bold-script',
        'sans-serif': 'bold-sans-serif',
        'sans-serif-italic': 'sans-serif-bold-italic',
    },
    normal: {
        bold: 'normal',
        'bold-italic': 'italic',
        'bold-fraktur': 'fraktur',
        'bold-script': 'script',
        'bold-sans-serif': 'sans-serif',
        'sans-serif-bold-italic': 'sans-serif-italic',
    },
};
CommonWrapper.ITALICVARIANTS = {
    italic: {
        normal: 'italic',
        bold: 'bold-italic',
        'sans-serif': 'sans-serif-italic',
        'bold-sans-serif': 'sans-serif-bold-italic',
    },
    normal: {
        italic: 'normal',
        'bold-italic': 'bold',
        'sans-serif-italic': 'sans-serif',
        'sans-serif-bold-italic': 'bold-sans-serif',
    },
};
//# sourceMappingURL=Wrapper.js.map