export const TRBL = ['top', 'right', 'bottom', 'left'];
export const WSC = ['width', 'style', 'color'];
function splitSpaces(text) {
    const parts = text.split(/((?:'[^']*'|"[^"]*"|,[\s\n]|[^\s\n])*)/g);
    const split = [];
    while (parts.length > 1) {
        parts.shift();
        split.push(parts.shift());
    }
    return split;
}
function splitTRBL(name) {
    const parts = splitSpaces(this.styles[name]);
    if (parts.length === 0) {
        parts.push('');
    }
    if (parts.length === 1) {
        parts.push(parts[0]);
    }
    if (parts.length === 2) {
        parts.push(parts[0]);
    }
    if (parts.length === 3) {
        parts.push(parts[1]);
    }
    for (const child of Styles.connect[name].children) {
        this.setStyle(this.childName(name, child), parts.shift());
    }
}
function combineTRBL(name) {
    const children = Styles.connect[name].children;
    const parts = [];
    for (const child of children) {
        const part = this.styles[name + '-' + child];
        if (!part) {
            delete this.styles[name];
            return;
        }
        parts.push(part);
    }
    if (parts[3] === parts[1]) {
        parts.pop();
        if (parts[2] === parts[0]) {
            parts.pop();
            if (parts[1] === parts[0]) {
                parts.pop();
            }
        }
    }
    this.styles[name] = parts.join(' ');
}
function splitSame(name) {
    for (const child of Styles.connect[name].children) {
        this.setStyle(this.childName(name, child), this.styles[name]);
    }
}
function combineSame(name) {
    const children = [...Styles.connect[name].children];
    const value = this.styles[this.childName(name, children.shift())];
    for (const child of children) {
        if (this.styles[this.childName(name, child)] !== value) {
            delete this.styles[name];
            return;
        }
    }
    this.styles[name] = value;
}
const BORDER = {
    width: /^(?:[\d.]+(?:[a-z]+)|thin|medium|thick|inherit|initial|unset)$/,
    style: /^(?:none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit|initial|unset)$/,
};
function splitWSC(name) {
    const parts = { width: '', style: '', color: '' };
    for (const part of splitSpaces(this.styles[name])) {
        if (part.match(BORDER.width) && parts.width === '') {
            parts.width = part;
        }
        else if (part.match(BORDER.style) && parts.style === '') {
            parts.style = part;
        }
        else {
            parts.color = part;
        }
    }
    for (const child of Styles.connect[name].children) {
        this.setStyle(this.childName(name, child), parts[child]);
    }
}
function combineWSC(name) {
    const parts = [];
    for (const child of Styles.connect[name].children) {
        const value = this.styles[this.childName(name, child)];
        if (value) {
            parts.push(value);
        }
    }
    if (parts.length) {
        this.styles[name] = parts.join(' ');
    }
    else {
        delete this.styles[name];
    }
}
const FONT = {
    style: /^(?:normal|italic|oblique|inherit|initial|unset)$/,
    variant: new RegExp('^(?:' +
        [
            'normal|none',
            'inherit|initial|unset',
            'common-ligatures|no-common-ligatures',
            'discretionary-ligatures|no-discretionary-ligatures',
            'historical-ligatures|no-historical-ligatures',
            'contextual|no-contextual',
            '(?:stylistic|character-variant|swash|ornaments|annotation)\\([^)]*\\)',
            'small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps',
            'lining-nums|oldstyle-nums|proportional-nums|tabular-nums',
            'diagonal-fractions|stacked-fractions',
            'ordinal|slashed-zero',
            'jis78|jis83|jis90|jis04|simplified|traditional',
            'full-width|proportional-width',
            'ruby',
        ].join('|') +
        ')$'),
    weight: /^(?:normal|bold|bolder|lighter|[1-9]00|inherit|initial|unset)$/,
    stretch: new RegExp('^(?:' +
        [
            'normal',
            '(?:(?:ultra|extra|semi)-)?(?:condensed|expanded)',
            'inherit|initial|unset',
        ].join('|') +
        ')$'),
    size: new RegExp('^(?:' +
        [
            'xx-small|x-small|small|medium|large|x-large|xx-large|larger|smaller',
            '[\\d.]+%|[\\d.]+[a-z]+',
            'inherit|initial|unset',
        ].join('|') +
        ')' +
        '(?:/(?:normal|[\\d.]+(?:%|[a-z]+)?))?$'),
};
function splitFont(name) {
    const parts = splitSpaces(this.styles[name]);
    const value = {
        style: '',
        variant: [],
        weight: '',
        stretch: '',
        size: '',
        family: '',
        'line-height': '',
    };
    for (const part of parts) {
        if (!value.family) {
            value.family = part;
        }
        for (const name of Object.keys(FONT)) {
            if ((Array.isArray(value[name]) || value[name] === '') &&
                part.match(FONT[name])) {
                if (value.family === part) {
                    value.family = '';
                }
                if (name === 'size') {
                    const [size, height] = part.split(/\//);
                    value[name] = size;
                    if (height) {
                        value['line-height'] = height;
                    }
                }
                else if (value.size === '') {
                    if (Array.isArray(value[name])) {
                        value[name].push(part);
                    }
                    else if (value[name] === '') {
                        value[name] = part;
                    }
                }
            }
        }
    }
    saveFontParts.call(this, name, value);
    delete this.styles[name];
}
function saveFontParts(name, value) {
    for (const child of Styles.connect[name].children) {
        const cname = this.childName(name, child);
        if (Array.isArray(value[child])) {
            const values = value[child];
            if (values.length) {
                this.styles[cname] = values.join(' ');
            }
        }
        else if (value[child] !== '') {
            this.styles[cname] = value[child];
        }
    }
}
function combineFont(_name) { }
export class Styles {
    constructor(cssText = '') {
        this.parse(cssText);
    }
    sanitizeValue(text) {
        const PATTERN = this.constructor.pattern;
        if (!text.match(PATTERN.sanitize)) {
            return text;
        }
        text = text.replace(PATTERN.value, '$1');
        const test = text
            .replace(/\\./g, '')
            .replace(/(['"]).*?\1/g, '')
            .replace(/[^'"]/g, '');
        if (test.length) {
            text += test.charAt(0);
        }
        return text;
    }
    get cssText() {
        const styles = [];
        for (const name of Object.keys(this.styles)) {
            const parent = this.parentName(name);
            if (!this.styles[parent]) {
                styles.push(`${name}: ${this.styles[name]};`);
            }
        }
        return styles.join(' ');
    }
    get styleList() {
        return Object.assign({}, this.styles);
    }
    set(name, value) {
        name = this.normalizeName(name);
        this.setStyle(name, String(value));
        if (Styles.connect[name] && !Styles.connect[name].combine) {
            this.combineChildren(name);
            delete this.styles[name];
        }
        while (name.match(/-/)) {
            name = this.parentName(name);
            if (!Styles.connect[name])
                break;
            Styles.connect[name].combine.call(this, name);
        }
    }
    get(name) {
        name = this.normalizeName(name);
        return Object.hasOwn(this.styles, name) ? this.styles[name] : '';
    }
    setStyle(name, value) {
        this.styles[name] = this.sanitizeValue(value);
        if (Styles.connect[name] && Styles.connect[name].children) {
            Styles.connect[name].split.call(this, name);
        }
        if (value === '') {
            delete this.styles[name];
        }
    }
    combineChildren(name) {
        const parent = this.parentName(name);
        for (const child of Styles.connect[name].children) {
            const cname = this.childName(parent, child);
            Styles.connect[cname].combine.call(this, cname);
        }
    }
    parentName(name) {
        const parent = name.replace(/-[^-]*$/, '');
        return name === parent ? '' : parent;
    }
    childName(name, child) {
        if (child.match(/-/)) {
            return child;
        }
        if (Styles.connect[name] && !Styles.connect[name].combine) {
            child += name.replace(/.*-/, '-');
            name = this.parentName(name);
        }
        return name + '-' + child;
    }
    normalizeName(name) {
        return name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
    }
    parse(cssText = '') {
        const PATTERN = this.constructor.pattern;
        this.styles = {};
        const parts = cssText
            .replace(/\n/g, ' ')
            .replace(PATTERN.comment, '')
            .split(PATTERN.style);
        while (parts.length > 1) {
            const [space, name, value] = parts.splice(0, 3);
            if (space.match(/[^\s\n;]/))
                return;
            this.set(name, value);
        }
    }
}
Styles.pattern = {
    sanitize: /['";]/,
    value: /^((:?'(?:\\.|[^'])*(?:'|$)|"(?:\\.|[^"])*(?:"|$)|\n|\\.|[^'";])*?)[\s\n]*(?:;|$).*/,
    style: /([-a-z]+)[\s\n]*:[\s\n]*((?:'(?:\\.|[^'])*(?:'|$)|"(?:\\.|[^"])*(?:"|$)|\n|\\.|[^'";])*?)[\s\n]*(?:;|$)/g,
    comment: /\/\*[^]*?\*\//g,
};
Styles.connect = {
    padding: {
        children: TRBL,
        split: splitTRBL,
        combine: combineTRBL,
    },
    border: {
        children: TRBL,
        split: splitSame,
        combine: combineSame,
    },
    'border-top': {
        children: WSC,
        split: splitWSC,
        combine: combineWSC,
    },
    'border-right': {
        children: WSC,
        split: splitWSC,
        combine: combineWSC,
    },
    'border-bottom': {
        children: WSC,
        split: splitWSC,
        combine: combineWSC,
    },
    'border-left': {
        children: WSC,
        split: splitWSC,
        combine: combineWSC,
    },
    'border-width': {
        children: TRBL,
        split: splitTRBL,
        combine: null,
    },
    'border-style': {
        children: TRBL,
        split: splitTRBL,
        combine: null,
    },
    'border-color': {
        children: TRBL,
        split: splitTRBL,
        combine: null,
    },
    font: {
        children: [
            'style',
            'variant',
            'weight',
            'stretch',
            'line-height',
            'size',
            'family',
        ],
        split: splitFont,
        combine: combineFont,
    },
};
//# sourceMappingURL=Styles.js.map