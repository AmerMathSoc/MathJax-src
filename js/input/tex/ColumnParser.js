"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnParser = void 0;
var TexError_js_1 = __importDefault(require("./TexError.js"));
var Options_js_1 = require("../../util/Options.js");
var ParseUtil_js_1 = __importDefault(require("./ParseUtil.js"));
var MmlNode_js_1 = require("../../core/MmlTree/MmlNode.js");
var ColumnParser = (function () {
    function ColumnParser() {
        var _this = this;
        this.columnHandler = {
            l: function (state) { return state.calign[state.j++] = 'left'; },
            c: function (state) { return state.calign[state.j++] = 'center'; },
            r: function (state) { return state.calign[state.j++] = 'right'; },
            p: function (state) { return _this.getColumn(state, MmlNode_js_1.TEXCLASS.VTOP); },
            m: function (state) { return _this.getColumn(state, MmlNode_js_1.TEXCLASS.VCENTER); },
            b: function (state) { return _this.getColumn(state, MmlNode_js_1.TEXCLASS.VBOX); },
            w: function (state) { return _this.getColumn(state, MmlNode_js_1.TEXCLASS.VTOP, ''); },
            W: function (state) { return _this.getColumn(state, MmlNode_js_1.TEXCLASS.VTOP, ''); },
            '|': function (state) { return state.clines[state.j] = 'solid'; },
            ':': function (state) { return state.clines[state.j] = 'dashed'; },
            '>': function (state) { return state.cstart[state.j] = (state.cstart[state.j] || '') + _this.getBraces(state); },
            '<': function (state) { return state.cend[state.j - 1] = (state.cend[state.j - 1] || '') + _this.getBraces(state); },
            P: function (state) { return _this.macroColumn(state, '>{$}p{#1}<{$}', 1); },
            M: function (state) { return _this.macroColumn(state, '>{$}m{#1}<{$}', 1); },
            B: function (state) { return _this.macroColumn(state, '>{$}b{#1}<{$}', 1); },
            '@': function (state) { return _this.getBraces(state); },
            '!': function (state) { return _this.getBraces(state); },
            ' ': function (_state) { },
        };
        this.MAXCOLUMNS = 10000;
    }
    ColumnParser.prototype.process = function (parser, template, array) {
        var state = {
            parser: parser,
            template: template,
            i: 0, j: 0, c: '',
            cwidth: [], calign: [], clines: [],
            cstart: array.cstart, cend: array.cend,
            ralign: array.ralign
        };
        var n = 0;
        while (state.i < state.template.length) {
            if (n++ > this.MAXCOLUMNS) {
                throw new TexError_js_1.default('MaxColumns', 'Too many column specifiers (perhaps looping column definitions?)');
            }
            var c = state.c = String.fromCodePoint(state.template.codePointAt(state.i));
            state.i += c.length;
            if (!this.columnHandler.hasOwnProperty(c)) {
                throw new TexError_js_1.default('BadColumnCharacter', 'Unknown column specifier: %1', c);
            }
            this.columnHandler[c](state);
        }
        var calign = state.calign;
        array.arraydef.columnalign = calign.join(' ');
        if (state.cwidth.length) {
            var cwidth = __spreadArray([], __read(state.cwidth), false);
            if (cwidth.length < calign.length) {
                cwidth.push('auto');
            }
            array.arraydef.columnwidth = cwidth.map(function (w) { return w || 'auto'; }).join(' ');
        }
        if (state.clines.length) {
            var clines = __spreadArray([], __read(state.clines), false);
            if (clines[0]) {
                array.frame.push('left');
                array.dashed = (clines[0] === 'dashed');
            }
            if (clines.length > calign.length) {
                array.frame.push('right');
                clines.pop();
            }
            else if (clines.length < calign.length) {
                clines.push('none');
            }
            array.arraydef.columnlines = clines.slice(1).map(function (l) { return l || 'none'; }).join(' ');
        }
    };
    ColumnParser.prototype.getColumn = function (state, ralign, calign) {
        if (calign === void 0) { calign = 'left'; }
        state.calign[state.j] = calign || this.getAlign(state);
        state.cwidth[state.j] = this.getDimen(state);
        state.ralign[state.j] = [ralign, state.cwidth[state.j], state.calign[state.j]];
        state.j++;
    };
    ColumnParser.prototype.getDimen = function (state) {
        var dim = this.getBraces(state) || '';
        if (!ParseUtil_js_1.default.matchDimen(dim)[0]) {
            throw new TexError_js_1.default('MissingColumnDimOrUnits', 'Missing dimension or its units for %1 column declaration', state.c);
        }
        return dim;
    };
    ColumnParser.prototype.getAlign = function (state) {
        var align = this.getBraces(state);
        return (0, Options_js_1.lookup)(align.toLowerCase(), { l: 'left', c: 'center', r: 'right' }, '');
    };
    ColumnParser.prototype.getBraces = function (state) {
        while (state.template[state.i] === ' ')
            state.i++;
        if (state.i > state.template.length) {
            throw new TexError_js_1.default('MissingArgForColumn', 'Missing argument for %1 column declaration', state.c);
        }
        if (state.template[state.i] !== '{') {
            return state.template[state.i++];
        }
        var i = ++state.i, braces = 1;
        while (state.i < state.template.length) {
            switch (state.template.charAt(state.i++)) {
                case '\\':
                    state.i++;
                    break;
                case '{':
                    braces++;
                    break;
                case '}':
                    if (--braces === 0) {
                        return state.template.slice(i, state.i - 1);
                    }
                    break;
            }
        }
        throw new TexError_js_1.default('MissingCloseBrace', 'Missing close brace');
    };
    ColumnParser.prototype.macroColumn = function (state, macro, n) {
        var args = [];
        while (n > 0 && n--) {
            args.push(this.getBraces(state));
        }
        state.template = ParseUtil_js_1.default.substituteArgs(state.parser, args, macro) + state.template.slice(state.i);
        state.i = 0;
    };
    return ColumnParser;
}());
exports.ColumnParser = ColumnParser;
//# sourceMappingURL=ColumnParser.js.map