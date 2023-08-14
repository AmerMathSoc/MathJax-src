import ParseUtil from './ParseUtil.js';
import Stack from './Stack.js';
import TexError from './TexError.js';
import { AbstractMmlNode } from '../../core/MmlTree/MmlNode.js';
export default class TexParser {
    constructor(_string, env, configuration) {
        this._string = _string;
        this.configuration = configuration;
        this.macroCount = 0;
        this.i = 0;
        this.currentCS = '';
        const inner = env.hasOwnProperty('isInner');
        const isInner = env['isInner'];
        delete env['isInner'];
        let ENV;
        if (env) {
            ENV = {};
            for (const id of Object.keys(env)) {
                ENV[id] = env[id];
            }
        }
        this.configuration.pushParser(this);
        this.stack = new Stack(this.itemFactory, ENV, inner ? isInner : true);
        this.Parse();
        this.Push(this.itemFactory.create('stop'));
        this.stack.env = ENV;
    }
    get options() {
        return this.configuration.options;
    }
    get itemFactory() {
        return this.configuration.itemFactory;
    }
    get tags() {
        return this.configuration.tags;
    }
    set string(str) {
        this._string = str;
    }
    get string() {
        return this._string;
    }
    parse(kind, input) {
        return this.configuration.handlers.get(kind).parse(input);
    }
    lookup(kind, symbol) {
        return this.configuration.handlers.get(kind).lookup(symbol);
    }
    contains(kind, symbol) {
        return this.configuration.handlers.get(kind).contains(symbol);
    }
    toString() {
        let str = '';
        for (const config of Array.from(this.configuration.handlers.keys())) {
            str += config + ': ' +
                this.configuration.handlers.get(config) + '\n';
        }
        return str;
    }
    Parse() {
        let c;
        while (this.i < this.string.length) {
            c = this.getCodePoint();
            this.i += c.length;
            this.parse('character', [this, c]);
        }
    }
    Push(arg) {
        if (arg instanceof AbstractMmlNode && arg.isInferred) {
            this.PushAll(arg.childNodes);
        }
        else {
            this.stack.Push(arg);
        }
    }
    PushAll(args) {
        for (const arg of args) {
            this.stack.Push(arg);
        }
    }
    mml() {
        if (!this.stack.Top().isKind('mml')) {
            return null;
        }
        let node = this.stack.Top().First;
        this.configuration.popParser();
        return node;
    }
    convertDelimiter(c) {
        const symbol = this.lookup('delimiter', c);
        return symbol ? symbol.char : null;
    }
    getCodePoint() {
        const code = this.string.codePointAt(this.i);
        return code === undefined ? '' : String.fromCodePoint(code);
    }
    nextIsSpace() {
        return !!this.string.charAt(this.i).match(/\s/);
    }
    GetNext() {
        while (this.nextIsSpace()) {
            this.i++;
        }
        return this.getCodePoint();
    }
    GetCS() {
        let CS = this.string.slice(this.i).match(/^(([a-z]+) ?|[\uD800-\uDBFF].|.)/i);
        if (CS) {
            this.i += CS[0].length;
            return CS[2] || CS[1];
        }
        else {
            this.i++;
            return ' ';
        }
    }
    GetArgument(_name, noneOK) {
        switch (this.GetNext()) {
            case '':
                if (!noneOK) {
                    throw new TexError('MissingArgFor', 'Missing argument for %1', this.currentCS);
                }
                return null;
            case '}':
                if (!noneOK) {
                    throw new TexError('ExtraCloseMissingOpen', 'Extra close brace or missing open brace');
                }
                return null;
            case '\\':
                this.i++;
                return '\\' + this.GetCS();
            case '{':
                let j = ++this.i, parens = 1;
                while (this.i < this.string.length) {
                    switch (this.string.charAt(this.i++)) {
                        case '\\':
                            this.i++;
                            break;
                        case '{':
                            parens++;
                            break;
                        case '}':
                            if (--parens === 0) {
                                return this.string.slice(j, this.i - 1);
                            }
                            break;
                    }
                }
                throw new TexError('MissingCloseBrace', 'Missing close brace');
        }
        const c = this.getCodePoint();
        this.i += c.length;
        return c;
    }
    GetBrackets(_name, def) {
        if (this.GetNext() !== '[') {
            return def;
        }
        let j = ++this.i, parens = 0;
        while (this.i < this.string.length) {
            switch (this.string.charAt(this.i++)) {
                case '{':
                    parens++;
                    break;
                case '\\':
                    this.i++;
                    break;
                case '}':
                    if (parens-- <= 0) {
                        throw new TexError('ExtraCloseLooking', 'Extra close brace while looking for %1', '\']\'');
                    }
                    break;
                case ']':
                    if (parens === 0) {
                        return this.string.slice(j, this.i - 1);
                    }
                    break;
            }
        }
        throw new TexError('MissingCloseBracket', 'Could not find closing \']\' for argument to %1', this.currentCS);
    }
    GetDelimiter(name, braceOK) {
        let c = this.GetNext();
        this.i += c.length;
        if (this.i <= this.string.length) {
            if (c === '\\') {
                c += this.GetCS();
            }
            else if (c === '{' && braceOK) {
                this.i--;
                c = this.GetArgument(name).trim();
            }
            if (this.contains('delimiter', c)) {
                return this.convertDelimiter(c);
            }
        }
        throw new TexError('MissingOrUnrecognizedDelim', 'Missing or unrecognized delimiter for %1', this.currentCS);
    }
    GetDimen(name) {
        if (this.GetNext() === '{') {
            let dimen = this.GetArgument(name);
            let [value, unit] = ParseUtil.matchDimen(dimen);
            if (value) {
                return value + unit;
            }
        }
        else {
            let dimen = this.string.slice(this.i);
            let [value, unit, length] = ParseUtil.matchDimen(dimen, true);
            if (value) {
                this.i += length;
                return value + unit;
            }
        }
        throw new TexError('MissingDimOrUnits', 'Missing dimension or its units for %1', this.currentCS);
    }
    GetUpTo(_name, token) {
        while (this.nextIsSpace()) {
            this.i++;
        }
        let j = this.i;
        let parens = 0;
        while (this.i < this.string.length) {
            let k = this.i;
            let c = this.GetNext();
            this.i += c.length;
            switch (c) {
                case '\\':
                    c += this.GetCS();
                    break;
                case '{':
                    parens++;
                    break;
                case '}':
                    if (parens === 0) {
                        throw new TexError('ExtraCloseLooking', 'Extra close brace while looking for %1', token);
                    }
                    parens--;
                    break;
            }
            if (parens === 0 && c === token) {
                return this.string.slice(j, k);
            }
        }
        throw new TexError('TokenNotFoundForCommand', 'Could not find %1 for %2', token, this.currentCS);
    }
    ParseArg(name) {
        return new TexParser(this.GetArgument(name), this.stack.env, this.configuration).mml();
    }
    ParseUpTo(name, token) {
        return new TexParser(this.GetUpTo(name, token), this.stack.env, this.configuration).mml();
    }
    GetDelimiterArg(name) {
        let c = ParseUtil.trimSpaces(this.GetArgument(name));
        if (c === '') {
            return null;
        }
        if (this.contains('delimiter', c)) {
            return c;
        }
        throw new TexError('MissingOrUnrecognizedDelim', 'Missing or unrecognized delimiter for %1', this.currentCS);
    }
    GetStar() {
        let star = (this.GetNext() === '*');
        if (star) {
            this.i++;
        }
        return star;
    }
    create(kind, ...rest) {
        return this.configuration.nodeFactory.create(kind, ...rest);
    }
}
//# sourceMappingURL=TexParser.js.map