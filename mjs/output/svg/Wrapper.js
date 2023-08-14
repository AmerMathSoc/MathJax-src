import { split } from '../../util/string.js';
import { CommonWrapper } from '../common/Wrapper.js';
import { XLINKNS } from '../svg.js';
export class SvgWrapper extends CommonWrapper {
    constructor() {
        super(...arguments);
        this.dx = 0;
        this.utext = '';
    }
    toSVG(parents) {
        if (this.toEmbellishedSVG(parents))
            return;
        this.addChildren(this.standardSvgNodes(parents));
    }
    toEmbellishedSVG(parents) {
        if (parents.length <= 1 || !this.node.isEmbellished)
            return false;
        const adaptor = this.adaptor;
        parents.forEach(dom => adaptor.append(dom, this.html('mjx-linestrut')));
        const style = this.coreMO().embellishedBreakStyle;
        const dom = [];
        for (const [parent, STYLE] of [[parents[0], 'before'], [parents[1], 'after']]) {
            if (style !== STYLE) {
                this.toSVG([parent]);
                dom.push(this.dom[0]);
                this.place(0, 0);
            }
            else {
                dom.push(this.createSvgNodes([parent])[0]);
            }
        }
        this.dom = dom;
        return true;
    }
    addChildren(parents) {
        let x = 0;
        for (const child of this.childNodes) {
            child.toSVG(parents);
            const bbox = child.getOuterBBox();
            if (child.dom) {
                child.place(x + bbox.L * bbox.rscale, 0);
            }
            x += (bbox.L + bbox.w + bbox.R) * bbox.rscale;
        }
    }
    standardSvgNodes(parents) {
        const svg = this.createSvgNodes(parents);
        this.handleStyles();
        this.handleScale();
        this.handleBorder();
        this.handleColor();
        this.handleAttributes();
        return svg;
    }
    createSvgNodes(parents) {
        this.dom = parents.map(_parent => this.svg('g', { 'data-mml-node': this.node.kind }));
        parents = this.handleHref(parents);
        for (const i of parents.keys()) {
            this.adaptor.append(parents[i], this.dom[i]);
        }
        return this.dom;
    }
    handleHref(parents) {
        const href = this.node.attributes.get('href');
        if (!href)
            return parents;
        let i = 0;
        const isEmbellished = this.node.isEmbellished && !this.node.isKind('mo');
        return parents.map(parent => {
            parent = this.adaptor.append(parent, this.svg('a', { href: href }));
            const { h, d, w } = (isEmbellished ? this.getOuterBBox() : this.getLineBBox(i));
            this.adaptor.append(this.dom[i++], this.svg('rect', {
                'data-hitbox': true, fill: 'none', stroke: 'none', 'pointer-events': 'all',
                width: this.fixed(w), height: this.fixed(h + d),
                x: (i === 1 || isEmbellished ? this.fixed(-this.dx) : 0), y: this.fixed(-d)
            }));
            return parent;
        });
    }
    handleStyles() {
        var _a, _b, _c;
        if (!this.styles)
            return;
        const styles = this.styles.cssText;
        if (styles) {
            this.dom.forEach(node => this.adaptor.setAttribute(node, 'style', styles));
        }
        const padding = (((_a = this.styleData) === null || _a === void 0 ? void 0 : _a.padding) || [0, 0, 0, 0])[3];
        const border = (((_c = (_b = this.styleData) === null || _b === void 0 ? void 0 : _b.border) === null || _c === void 0 ? void 0 : _c.width) || [0, 0, 0, 0])[3];
        if (padding || border) {
            this.dx = padding + border;
        }
    }
    handleScale() {
        if (this.bbox.rscale !== 1) {
            const scale = 'scale(' + this.fixed(this.bbox.rscale / 1000, 3) + ')';
            this.dom.forEach(node => this.adaptor.setAttribute(node, 'transform', scale));
        }
    }
    handleColor() {
        var _a;
        const adaptor = this.adaptor;
        const attributes = this.node.attributes;
        const color = (attributes.getExplicit('mathcolor') || attributes.getExplicit('color'));
        const background = (attributes.getExplicit('mathbackground') ||
            attributes.getExplicit('background') ||
            ((_a = this.styles) === null || _a === void 0 ? void 0 : _a.get('background-color')));
        if (color) {
            this.dom.forEach(node => {
                adaptor.setAttribute(node, 'fill', color);
                adaptor.setAttribute(node, 'stroke', color);
            });
        }
        if (background) {
            let i = 0;
            const isEmbellished = this.node.isEmbellished && !this.node.isKind('mo');
            this.dom.forEach(node => {
                const { h, d, w } = (isEmbellished ? this.getOuterBBox() : this.getLineBBox(i++));
                const rect = this.svg('rect', {
                    fill: background,
                    x: (i === 1 || isEmbellished ? this.fixed(-this.dx) : 0), y: this.fixed(-d),
                    width: this.fixed(w),
                    height: this.fixed(h + d),
                    'data-bgcolor': true
                });
                const child = adaptor.firstChild(node);
                if (child) {
                    adaptor.insert(rect, child);
                }
                else {
                    adaptor.append(node, rect);
                }
            });
        }
    }
    handleBorder() {
        var _a;
        const border = (_a = this.styleData) === null || _a === void 0 ? void 0 : _a.border;
        if (!border)
            return;
        const f = SvgWrapper.borderFuzz;
        const adaptor = this.adaptor;
        let k = 0;
        const n = this.dom.length - 1;
        const isEmbellished = this.node.isEmbellished && !this.node.isKind('mo');
        for (const dom of this.dom) {
            const L = (!n || !k ? 1 : 0);
            const R = (!n || k === n ? 1 : 0);
            const bbox = (isEmbellished ? this.getOuterBBox() : this.getLineBBox(k++));
            const [h, d, w] = [bbox.h + f, bbox.d + f, bbox.w + f];
            const outerRT = [w, h];
            const outerLT = [-f, h];
            const outerRB = [w, -d];
            const outerLB = [-f, -d];
            const innerRT = [w - R * border.width[1], h - border.width[0]];
            const innerLT = [-f + L * border.width[3], h - border.width[0]];
            const innerRB = [w - R * border.width[1], -d + border.width[2]];
            const innerLB = [-f + L * border.width[3], -d + border.width[2]];
            const paths = [
                [outerLT, outerRT, innerRT, innerLT],
                [outerRB, outerRT, innerRT, innerRB],
                [outerLB, outerRB, innerRB, innerLB],
                [outerLB, outerLT, innerLT, innerLB]
            ];
            const child = adaptor.firstChild(dom);
            const dx = L * this.dx;
            for (const i of [0, 1, 2, 3]) {
                if (!border.width[i] || (i === 3 && !L) || (i === 1 && !R))
                    continue;
                const path = paths[i];
                if (border.style[i] === 'dashed' || border.style[i] === 'dotted') {
                    this.addBorderBroken(path, border.color[i], border.style[i], border.width[i], i, dom, dx);
                }
                else {
                    this.addBorderSolid(path, border.color[i], child, dom, dx);
                }
            }
        }
    }
    addBorderSolid(path, color, child, parent, dx) {
        const border = this.svg('polygon', {
            points: path.map(([x, y]) => `${this.fixed(x - dx)},${this.fixed(y)}`).join(' '),
            stroke: 'none'
        });
        if (color) {
            this.adaptor.setAttribute(border, 'fill', color);
        }
        if (child) {
            this.adaptor.insert(border, child);
        }
        else {
            this.adaptor.append(parent, border);
        }
    }
    addBorderBroken(path, color, style, t, i, parent, dx) {
        const dot = (style === 'dotted');
        const t2 = t / 2;
        const [tx1, ty1, tx2, ty2] = [[t2, -t2, -t2, -t2], [-t2, t2, -t2, -t2], [t2, t2, -t2, t2], [t2, t2, t2, -t2]][i];
        const [A, B] = path;
        const x1 = A[0] + tx1 - dx, y1 = A[1] + ty1;
        const x2 = B[0] + tx2 - dx, y2 = B[1] + ty2;
        const W = Math.abs(i % 2 ? y2 - y1 : x2 - x1);
        const n = (dot ? Math.ceil(W / (2 * t)) : Math.ceil((W - t) / (4 * t)));
        const m = W / (4 * n + 1);
        const line = this.svg('line', {
            x1: this.fixed(x1), y1: this.fixed(y1),
            x2: this.fixed(x2), y2: this.fixed(y2),
            'stroke-width': this.fixed(t), stroke: color, 'stroke-linecap': dot ? 'round' : 'square',
            'stroke-dasharray': dot ? [1, this.fixed(W / n - .002)].join(' ') : [this.fixed(m), this.fixed(3 * m)].join(' ')
        });
        const adaptor = this.adaptor;
        const child = adaptor.firstChild(parent);
        if (child) {
            adaptor.insert(line, child);
        }
        else {
            adaptor.append(parent, line);
        }
    }
    handleAttributes() {
        const adaptor = this.adaptor;
        const attributes = this.node.attributes;
        const defaults = attributes.getAllDefaults();
        const skip = SvgWrapper.skipAttributes;
        for (const name of attributes.getExplicitNames()) {
            if (skip[name] === false || (!(name in defaults) && !skip[name] &&
                !adaptor.hasAttribute(this.dom[0], name))) {
                this.dom.forEach(dom => adaptor.setAttribute(dom, name, attributes.getExplicit(name)));
            }
        }
        if (attributes.get('class')) {
            for (const name of split(attributes.get('class'))) {
                this.dom.forEach(node => adaptor.addClass(node, name));
            }
        }
    }
    place(x, y, element = null) {
        if (!element) {
            x += this.dx * this.bbox.rscale;
        }
        if (!(x || y))
            return;
        if (!element) {
            element = this.dom[0];
            y = this.handleId(y);
        }
        const translate = `translate(${this.fixed(x)},${this.fixed(y)})`;
        const transform = this.adaptor.getAttribute(element, 'transform') || '';
        this.adaptor.setAttribute(element, 'transform', translate + (transform ? ' ' + transform : ''));
    }
    handleId(y) {
        if (!this.node.attributes || !this.node.attributes.get('id')) {
            return y;
        }
        const adaptor = this.adaptor;
        const h = this.getBBox().h;
        const children = adaptor.childNodes(this.dom[0]);
        children.forEach(child => adaptor.remove(child));
        const g = this.svg('g', { 'data-idbox': true, transform: `translate(0,${this.fixed(-h)})` }, children);
        adaptor.append(this.dom[0], this.svg('text', { 'data-id-align': true }, [this.text('')]));
        adaptor.append(this.dom[0], g);
        return y + h;
    }
    firstChild(dom = this.dom[0]) {
        const adaptor = this.adaptor;
        let child = adaptor.firstChild(dom);
        if (child && adaptor.kind(child) === 'text' && adaptor.getAttribute(child, 'data-id-align')) {
            child = adaptor.firstChild(adaptor.next(child));
        }
        if (child && adaptor.kind(child) === 'rect' && adaptor.getAttribute(child, 'data-hitbox')) {
            child = adaptor.next(child);
        }
        return child;
    }
    placeChar(n, x, y, parent, variant = null, buffer = false) {
        if (variant === null) {
            variant = this.variant;
        }
        const C = n.toString(16).toUpperCase();
        const [, , w, data] = this.getVariantChar(variant, n);
        if ('p' in data) {
            x += this.addUtext(x, y, parent, variant);
            const path = (data.p ? 'M' + data.p + 'Z' : '');
            this.place(x, y, this.adaptor.append(parent, this.charNode(variant, C, path)));
        }
        else if ('c' in data) {
            x += this.addUtext(x, y, parent, variant);
            const g = this.adaptor.append(parent, this.svg('g', { 'data-c': C }));
            this.place(x, y, g);
            x = 0;
            for (const n of this.unicodeChars(data.c, variant)) {
                x += this.placeChar(n, x, y, g, variant);
            }
        }
        else if (data.unknown) {
            this.utext += String.fromCodePoint(n);
            return (buffer ? 0 : this.addUtext(x, y, parent, variant));
        }
        return w;
    }
    addUtext(x, y, parent, variant) {
        const c = this.utext;
        if (!c) {
            return 0;
        }
        this.utext = '';
        const text = this.adaptor.append(parent, this.jax.unknownText(c, variant));
        this.place(x, y, text);
        return this.jax.measureTextNodeWithCache(text, c, variant).w;
    }
    charNode(variant, C, path) {
        const cache = this.jax.options.fontCache;
        return (cache !== 'none' ? this.useNode(variant, C, path) : this.pathNode(C, path));
    }
    pathNode(C, path) {
        return this.svg('path', { 'data-c': C, d: path });
    }
    useNode(variant, C, path) {
        const use = this.svg('use', { 'data-c': C });
        const id = '#' + this.jax.fontCache.cachePath(variant, C, path);
        this.adaptor.setAttribute(use, 'href', id, this.jax.options.useXlink ? XLINKNS : null);
        return use;
    }
    drawBBox() {
        var _a, _b;
        let { w, h, d } = this.getOuterBBox();
        const L = (((_b = (_a = this.styleData) === null || _a === void 0 ? void 0 : _a.border) === null || _b === void 0 ? void 0 : _b.width) || [0, 0, 0, 0])[3];
        const def = { style: { opacity: .25 } };
        if (L) {
            def.transform = `translate(${this.fixed(-L)}, 0)`;
        }
        const box = this.svg('g', def, [
            this.svg('rect', {
                fill: 'red',
                height: this.fixed(h),
                width: this.fixed(w)
            }),
            this.svg('rect', {
                fill: 'green',
                height: this.fixed(d),
                width: this.fixed(w),
                y: this.fixed(-d)
            })
        ]);
        const node = this.dom[0] || this.parent.dom[0];
        this.adaptor.append(node, box);
    }
    html(type, def = {}, content = []) {
        return this.jax.html(type, def, content);
    }
    svg(type, def = {}, content = []) {
        return this.jax.svg(type, def, content);
    }
    text(text) {
        return this.jax.text(text);
    }
    fixed(x, n = 1) {
        return this.jax.fixed(x * 1000, n);
    }
}
SvgWrapper.kind = 'unknown';
SvgWrapper.borderFuzz = 0.005;
//# sourceMappingURL=Wrapper.js.map