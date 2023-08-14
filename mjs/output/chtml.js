import { CommonOutputJax } from './common.js';
import { CssStyles } from '../util/StyleList.js';
import { ChtmlWrapperFactory } from './chtml/WrapperFactory.js';
import { Usage } from './chtml/Usage.js';
import * as LENGTHS from '../util/lengths.js';
import { unicodeChars } from '../util/string.js';
import { DefaultFont } from './chtml/DefaultFont.js';
export class CHTML extends CommonOutputJax {
    constructor(options = null) {
        super(options, ChtmlWrapperFactory, DefaultFont);
        this.chtmlStyles = null;
        this.font.adaptiveCSS(this.options.adaptiveCSS);
        this.wrapperUsage = new Usage();
    }
    escaped(math, html) {
        this.setDocument(html);
        return this.html('span', {}, [this.text(math.math)]);
    }
    styleSheet(html) {
        if (this.chtmlStyles) {
            const styles = new CssStyles();
            if (this.options.adaptiveCSS) {
                this.addWrapperStyles(styles);
                this.updateFontStyles(styles);
            }
            styles.addStyles(this.font.updateDynamicStyles());
            this.adaptor.insertRules(this.chtmlStyles, styles.getStyleRules());
            return this.chtmlStyles;
        }
        const sheet = this.chtmlStyles = super.styleSheet(html);
        this.adaptor.setAttribute(sheet, 'id', CHTML.STYLESHEETID);
        this.wrapperUsage.update();
        return sheet;
    }
    updateFontStyles(styles) {
        styles.addStyles(this.font.updateStyles({}));
    }
    addWrapperStyles(styles) {
        if (!this.options.adaptiveCSS) {
            super.addWrapperStyles(styles);
            return;
        }
        for (const kind of this.wrapperUsage.update()) {
            const wrapper = this.factory.getNodeClass(kind);
            wrapper && this.addClassStyles(wrapper, styles);
        }
    }
    addClassStyles(wrapper, styles) {
        const CLASS = wrapper;
        if (CLASS.autoStyle && CLASS.kind !== 'unknown') {
            styles.addStyles({
                ['mjx-' + CLASS.kind]: {
                    display: 'inline-block',
                    'text-align': 'left'
                }
            });
        }
        this.wrapperUsage.add(CLASS.kind);
        super.addClassStyles(wrapper, styles);
    }
    processMath(wrapper, parent) {
        wrapper.toCHTML([parent]);
    }
    clearCache() {
        this.cssStyles.clear();
        this.font.clearCache();
        this.wrapperUsage.clear();
        this.chtmlStyles = null;
    }
    reset() {
        this.clearCache();
    }
    getInitialScale() {
        return this.math.metrics.scale;
    }
    unknownText(text, variant, width = null, rscale = 1) {
        const styles = {};
        const scale = 100 / this.math.metrics.scale;
        if (scale !== 100) {
            styles['font-size'] = this.fixed(scale, 1) + '%';
            styles.padding = LENGTHS.em(75 / scale) + ' 0 ' + LENGTHS.em(20 / scale) + ' 0';
        }
        if (variant !== '-explicitFont') {
            const c = unicodeChars(text);
            if (c.length !== 1 || c[0] < 0x1D400 || c[0] > 0x1D7FF) {
                this.cssFontStyles(this.font.getCssFont(variant), styles);
            }
        }
        if (width !== null) {
            const metrics = this.math.metrics;
            styles.width = Math.round(width * metrics.em * metrics.scale * rscale) + 'px';
        }
        return this.html('mjx-utext', { variant: variant, style: styles }, [this.text(text)]);
    }
    measureTextNode(textNode) {
        const adaptor = this.adaptor;
        const text = adaptor.clone(textNode);
        adaptor.setStyle(text, 'font-family', adaptor.getStyle(text, 'font-family').replace(/MJXZERO, /g, ''));
        const style = { position: 'absolute', 'white-space': 'nowrap' };
        const node = this.html('mjx-measure-text', { style }, [text]);
        adaptor.append(adaptor.parent(this.math.start.node), this.container);
        adaptor.append(this.container, node);
        let w = adaptor.nodeSize(text, this.math.metrics.em)[0] / this.math.metrics.scale;
        adaptor.remove(this.container);
        adaptor.remove(node);
        return { w: w, h: .75, d: .2 };
    }
}
CHTML.NAME = 'CHTML';
CHTML.OPTIONS = Object.assign(Object.assign({}, CommonOutputJax.OPTIONS), { adaptiveCSS: true, matchFontHeight: true });
CHTML.commonStyles = Object.assign(Object.assign({}, CommonOutputJax.commonStyles), { 'mjx-container[jax="CHTML"]': {
        'white-space': 'nowrap'
    }, 'mjx-container [space="1"]': { 'margin-left': '.111em' }, 'mjx-container [space="2"]': { 'margin-left': '.167em' }, 'mjx-container [space="3"]': { 'margin-left': '.222em' }, 'mjx-container [space="4"]': { 'margin-left': '.278em' }, 'mjx-container [space="5"]': { 'margin-left': '.333em' }, 'mjx-container [rspace="1"]': { 'margin-right': '.111em' }, 'mjx-container [rspace="2"]': { 'margin-right': '.167em' }, 'mjx-container [rspace="3"]': { 'margin-right': '.222em' }, 'mjx-container [rspace="4"]': { 'margin-right': '.278em' }, 'mjx-container [rspace="5"]': { 'margin-right': '.333em' }, 'mjx-container [size="s"]': { 'font-size': '70.7%' }, 'mjx-container [size="ss"]': { 'font-size': '50%' }, 'mjx-container [size="Tn"]': { 'font-size': '60%' }, 'mjx-container [size="sm"]': { 'font-size': '85%' }, 'mjx-container [size="lg"]': { 'font-size': '120%' }, 'mjx-container [size="Lg"]': { 'font-size': '144%' }, 'mjx-container [size="LG"]': { 'font-size': '173%' }, 'mjx-container [size="hg"]': { 'font-size': '207%' }, 'mjx-container [size="HG"]': { 'font-size': '249%' }, 'mjx-container [width="full"]': { width: '100%' }, 'mjx-box': { display: 'inline-block' }, 'mjx-block': { display: 'block' }, 'mjx-itable': { display: 'inline-table' }, 'mjx-row': { display: 'table-row' }, 'mjx-row > *': { display: 'table-cell' }, 'mjx-container [inline-breaks]': { display: 'inline' }, 'mjx-mtext': {
        display: 'inline-block'
    }, 'mjx-mstyle': {
        display: 'inline-block'
    }, 'mjx-merror': {
        display: 'inline-block',
        color: 'red',
        'background-color': 'yellow'
    }, 'mjx-mphantom': {
        visibility: 'hidden'
    } });
CHTML.STYLESHEETID = 'MJX-CHTML-styles';
//# sourceMappingURL=chtml.js.map