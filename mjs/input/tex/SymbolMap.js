import { Symbol, Macro } from './Symbol.js';
import { MapHandler } from './MapHandler.js';
export function parseResult(result) {
    return result === void 0 ? true : result;
}
export class AbstractSymbolMap {
    constructor(_name, _parser) {
        this._name = _name;
        this._parser = _parser;
        MapHandler.register(this);
    }
    get name() {
        return this._name;
    }
    parserFor(symbol) {
        return this.contains(symbol) ? this.parser : null;
    }
    parse([env, symbol]) {
        let parser = this.parserFor(symbol);
        let mapped = this.lookup(symbol);
        return (parser && mapped) ? parseResult(parser(env, mapped)) : null;
    }
    set parser(parser) {
        this._parser = parser;
    }
    get parser() {
        return this._parser;
    }
}
export class RegExpMap extends AbstractSymbolMap {
    constructor(name, parser, _regExp) {
        super(name, parser);
        this._regExp = _regExp;
    }
    contains(symbol) {
        return this._regExp.test(symbol);
    }
    lookup(symbol) {
        return this.contains(symbol) ? symbol : null;
    }
}
export class AbstractParseMap extends AbstractSymbolMap {
    constructor() {
        super(...arguments);
        this.map = new Map();
    }
    lookup(symbol) {
        return this.map.get(symbol);
    }
    contains(symbol) {
        return this.map.has(symbol);
    }
    add(symbol, object) {
        this.map.set(symbol, object);
    }
    remove(symbol) {
        this.map.delete(symbol);
    }
}
export class CharacterMap extends AbstractParseMap {
    constructor(name, parser, json) {
        super(name, parser);
        for (const key of Object.keys(json)) {
            let value = json[key];
            let [char, attrs] = (typeof (value) === 'string') ? [value, null] : value;
            let character = new Symbol(key, char, attrs);
            this.add(key, character);
        }
    }
}
export class DelimiterMap extends CharacterMap {
    parse([env, symbol]) {
        return super.parse([env, '\\' + symbol]);
    }
}
export class MacroMap extends AbstractParseMap {
    constructor(name, json, functionMap) {
        super(name, null);
        for (const key of Object.keys(json)) {
            let value = json[key];
            let [func, ...attrs] = (typeof (value) === 'string') ? [value] : value;
            let character = new Macro(key, functionMap[func], attrs);
            this.add(key, character);
        }
    }
    parserFor(symbol) {
        let macro = this.lookup(symbol);
        return macro ? macro.func : null;
    }
    parse([env, symbol]) {
        let macro = this.lookup(symbol);
        let parser = this.parserFor(symbol);
        if (!macro || !parser) {
            return null;
        }
        return parseResult(parser(env, macro.symbol, ...macro.args));
    }
}
export class CommandMap extends MacroMap {
    parse([env, symbol]) {
        let macro = this.lookup(symbol);
        let parser = this.parserFor(symbol);
        if (!macro || !parser) {
            return null;
        }
        let saveCommand = env.currentCS;
        env.currentCS = '\\' + symbol;
        let result = parser(env, '\\' + macro.symbol, ...macro.args);
        env.currentCS = saveCommand;
        return parseResult(result);
    }
}
export class EnvironmentMap extends MacroMap {
    constructor(name, parser, json, functionMap) {
        super(name, json, functionMap);
        this.parser = parser;
    }
    parse([env, symbol]) {
        let macro = this.lookup(symbol);
        let envParser = this.parserFor(symbol);
        if (!macro || !envParser) {
            return null;
        }
        return parseResult(this.parser(env, macro.symbol, envParser, macro.args));
    }
}
//# sourceMappingURL=SymbolMap.js.map