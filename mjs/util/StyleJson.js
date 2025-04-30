export class StyleJsonSheet {
    get cssText() {
        return this.getStyleString();
    }
    constructor(styles = null) {
        this.styles = {};
        this.addStyles(styles);
    }
    addStyles(styles) {
        if (!styles)
            return;
        for (const style of Object.keys(styles)) {
            if (!this.styles[style]) {
                this.styles[style] = {};
            }
            Object.assign(this.styles[style], styles[style]);
        }
    }
    removeStyles(...selectors) {
        for (const selector of selectors) {
            delete this.styles[selector];
        }
    }
    clear() {
        this.styles = {};
    }
    getStyleString() {
        return this.getStyleRules().join('\n\n');
    }
    getStyleRules() {
        const selectors = Object.keys(this.styles);
        const defs = new Array(selectors.length);
        let i = 0;
        for (const selector of selectors) {
            defs[i++] =
                selector +
                    ' {\n' +
                    this.getStyleDefString(this.styles[selector]) +
                    '\n}';
        }
        return defs;
    }
    getStyleDefString(styles) {
        const properties = Object.keys(styles);
        const values = new Array(properties.length);
        let i = 0;
        for (const property of properties) {
            values[i++] = '  ' + property + ': ' + styles[property] + ';';
        }
        return values.join('\n');
    }
}
//# sourceMappingURL=StyleJson.js.map