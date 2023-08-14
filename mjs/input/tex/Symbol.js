class _Symbol {
    constructor(_symbol, _char, _attributes) {
        this._symbol = _symbol;
        this._char = _char;
        this._attributes = _attributes;
    }
    get symbol() {
        return this._symbol;
    }
    get char() {
        return this._char;
    }
    get attributes() {
        return this._attributes;
    }
}
export { _Symbol as Symbol };
export class Macro {
    constructor(_symbol, _func, _args = []) {
        this._symbol = _symbol;
        this._func = _func;
        this._args = _args;
    }
    get symbol() {
        return this._symbol;
    }
    get func() {
        return this._func;
    }
    get args() {
        return this._args;
    }
}
//# sourceMappingURL=Symbol.js.map