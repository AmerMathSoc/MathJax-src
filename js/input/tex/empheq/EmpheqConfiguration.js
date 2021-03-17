"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpheqConfiguration = exports.EmpheqMethods = exports.EmpheqUtil = exports.EmpheqBeginItem = void 0;
var Configuration_js_1 = require("../Configuration.js");
var SymbolMap_js_1 = require("../SymbolMap.js");
var ParseUtil_js_1 = require("../ParseUtil.js");
var TexParser_js_1 = require("../TexParser.js");
var TexError_js_1 = require("../TexError.js");
var BaseItems_js_1 = require("../base/BaseItems.js");
var EmpheqBeginItem = (function (_super) {
    __extends(EmpheqBeginItem, _super);
    function EmpheqBeginItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.options = {};
        return _this;
    }
    Object.defineProperty(EmpheqBeginItem.prototype, "kind", {
        get: function () {
            return 'empheq-begin';
        },
        enumerable: false,
        configurable: true
    });
    EmpheqBeginItem.prototype.checkItem = function (item) {
        if (item.isKind('end') && item.getName() === this.getName()) {
            this.setProperty('end', false);
        }
        return _super.prototype.checkItem.call(this, item);
    };
    return EmpheqBeginItem;
}(BaseItems_js_1.BeginItem));
exports.EmpheqBeginItem = EmpheqBeginItem;
exports.EmpheqUtil = {
    environment: function (parser, env, func, args) {
        var name = args[0];
        var item = parser.itemFactory.create(name + '-begin').setProperties({ name: env, end: name });
        parser.Push(func.apply(void 0, __spread([parser, item], args.slice(1))));
    },
    copyMml: function (node) {
        var e_1, _a, e_2, _b;
        if (!node)
            return null;
        var mml = node.factory.create(node.kind);
        if (node.isKind('text')) {
            mml.setText(node.getText());
            return mml;
        }
        if (node.attributes) {
            var attributes = node.attributes.getAllAttributes();
            try {
                for (var _c = __values(Object.keys(attributes)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var name_1 = _d.value;
                    if (name_1 !== 'id') {
                        mml.attributes.set(name_1, attributes[name_1]);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        if (node.childNodes && node.childNodes.length) {
            var children = node.childNodes;
            if (children.length === 1 && children[0].isKind('inferredMrow')) {
                children = children[0].childNodes;
            }
            try {
                for (var children_1 = __values(children), children_1_1 = children_1.next(); !children_1_1.done; children_1_1 = children_1.next()) {
                    var child = children_1_1.value;
                    if (child)
                        mml.appendChild(this.copyMml(child));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (children_1_1 && !children_1_1.done && (_b = children_1.return)) _b.call(children_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return mml;
    },
    splitOptions: function (text, allowed) {
        if (allowed === void 0) { allowed = null; }
        return ParseUtil_js_1.default.keyvalOptions(text, allowed, true);
    },
    columnCount: function (table) {
        var e_3, _a;
        var m = 0;
        try {
            for (var _b = __values(table.childNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
                var row = _c.value;
                var n = row.childNodes.length - (row.isKind('mlabeledtr') ? 1 : 0);
                if (n > m)
                    m = n;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return m;
    },
    cellBlock: function (tex, table, parser, env) {
        var e_4, _a;
        var mpadded = parser.create('node', 'mpadded', [], { height: 0, depth: 0, voffset: '-1height' });
        var result = new TexParser_js_1.default(tex, parser.stack.env, parser.configuration);
        var mml = result.mml();
        if (env && result.configuration.tags.label) {
            result.configuration.tags.currentTag.env = env;
            result.configuration.tags.getTag(true);
        }
        try {
            for (var _b = __values((mml.isInferred ? mml.childNodes : [mml])), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                mpadded.appendChild(child);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        mpadded.appendChild(parser.create('node', 'mphantom', [
            parser.create('node', 'mpadded', [table], { width: 0 })
        ]));
        return mpadded;
    },
    topRowTable: function (original, parser) {
        var table = this.copyMml(original);
        table.setChildren(table.childNodes.slice(0, 1));
        table.attributes.set('align', 'baseline 1');
        return original.factory.create('mphantom', {}, [parser.create('node', 'mpadded', [table], { width: 0 })]);
    },
    rowspanCell: function (mtd, tex, table, parser, env) {
        mtd.appendChild(parser.create('node', 'mpadded', [
            this.cellBlock(tex, this.copyMml(table), parser, env),
            this.topRowTable(table, parser)
        ], { height: 0, depth: 0, voffset: 'height' }));
    },
    left: function (table, original, left, parser, env) {
        var e_5, _a;
        if (env === void 0) { env = ''; }
        table.attributes.set('columnalign', 'right ' + (table.attributes.get('columnalign') || ''));
        table.attributes.set('columnspacing', '0em ' + (table.attributes.get('columnspacing') || ''));
        var mtd;
        try {
            for (var _b = __values(table.childNodes.slice(0).reverse()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var row = _c.value;
                mtd = parser.create('node', 'mtd');
                row.childNodes.unshift(mtd);
                row.replaceChild(mtd, mtd);
                if (row.isKind('mlabeledtr')) {
                    row.childNodes[0] = row.childNodes[1];
                    row.childNodes[1] = mtd;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        this.rowspanCell(mtd, left, original, parser, env);
    },
    right: function (table, original, right, parser, env) {
        if (env === void 0) { env = ''; }
        if (table.childNodes.length === 0) {
            table.appendChild(parser.create('node', 'mtr'));
        }
        var m = exports.EmpheqUtil.columnCount(table);
        var row = table.childNodes[0];
        while (row.childNodes.length < m)
            row.appendChild(parser.create('node', 'mtd'));
        var mtd = row.appendChild(parser.create('node', 'mtd'));
        exports.EmpheqUtil.rowspanCell(mtd, right, original, parser, env);
        table.attributes.set('columnalign', (table.attributes.get('columnalign') || '').split(/ /).slice(0, m).join(' ') + ' left');
        table.attributes.set('columnspacing', (table.attributes.get('columnspacing') || '').split(/ /).slice(0, m - 1).join(' ') + ' 0em');
    },
    adjustTable: function (empheq, parser) {
        var options = empheq.options;
        if (options.left || options.right) {
            var table = empheq.Last;
            var original = this.copyMml(table);
            if (options.left)
                this.left(table, original, options.left, parser);
            if (options.right)
                this.right(table, original, options.right, parser);
        }
    },
    allowEnv: {
        equation: true,
        align: true,
        gather: true,
        flalign: true,
        alignat: true,
        multline: true
    },
    checkEnv: function (env) {
        return this.allowEnv[env.replace(/\*$/, '')] || false;
    }
};
exports.EmpheqMethods = {
    Empheq: function (parser, begin) {
        if (parser.stack.env.closing === begin.getName()) {
            delete parser.stack.env.closing;
            parser.Push(parser.itemFactory.create('end').setProperty('name', parser.stack.global.empheq));
            parser.stack.global.empheq = '';
            var empheq = parser.stack.Top();
            exports.EmpheqUtil.adjustTable(empheq, parser);
            parser.Push(parser.itemFactory.create('end').setProperty('name', 'empheq'));
        }
        else {
            ParseUtil_js_1.default.checkEqnEnv(parser);
            delete parser.stack.global.eqnenv;
            var opts = parser.GetBrackets('\\begin{' + begin.getName() + '}') || '';
            var _a = __read((parser.GetArgument('\\begin{' + begin.getName() + '}') || '').split(/=/), 2), env = _a[0], n = _a[1];
            if (!exports.EmpheqUtil.checkEnv(env)) {
                throw new TexError_js_1.default('UnknownEnv', 'Unknown environment "%1"', env);
            }
            begin.options = (opts ? exports.EmpheqUtil.splitOptions(opts, { left: 1, right: 1 }) : {});
            parser.stack.global.empheq = env;
            parser.string = '\\begin{' + env + '}' + (n ? '{' + n + '}' : '') + parser.string.slice(parser.i);
            parser.i = 0;
            parser.Push(begin);
        }
    },
    EmpheqMO: function (parser, _name, c) {
        parser.Push(parser.create('token', 'mo', {}, c));
    },
    EmpheqDelim: function (parser, name) {
        var c = parser.GetDelimiter(name);
        parser.Push(parser.create('token', 'mo', { stretchy: true, symmetric: true }, c));
    }
};
new SymbolMap_js_1.EnvironmentMap('empheq-env', exports.EmpheqUtil.environment, {
    empheq: ['Empheq', 'empheq'],
}, exports.EmpheqMethods);
new SymbolMap_js_1.CommandMap('empheq-macros', {
    empheqlbrace: ['EmpheqMO', '{'],
    empheqrbrace: ['EmpheqMO', '}'],
    empheqlbrack: ['EmpheqMO', '['],
    empheqrbrack: ['EmpheqMO', ']'],
    empheqlangle: ['EmpheqMO', '\u27E8'],
    empheqrangle: ['EmpheqMO', '\u27E9'],
    empheqlparen: ['EmpheqMO', '('],
    empheqrparen: ['EmpheqMO', ')'],
    empheqlvert: ['EmpheqMO', '|'],
    empheqrvert: ['EmpheqMO', '|'],
    empheqlVert: ['EmpheqMO', '\u2016'],
    empheqrVert: ['EmpheqMO', '\u2016'],
    empheqlfloor: ['EmpheqMO', '\u230A'],
    empheqrfloor: ['EmpheqMO', '\u230B'],
    empheqlceil: ['EmpheqMO', '\u2308'],
    empheqrceil: ['EmpheqMO', '\u2309'],
    empheqbiglbrace: ['EmpheqMO', '{'],
    empheqbigrbrace: ['EmpheqMO', '}'],
    empheqbiglbrack: ['EmpheqMO', '['],
    empheqbigrbrack: ['EmpheqMO', ']'],
    empheqbiglangle: ['EmpheqMO', '\u27E8'],
    empheqbigrangle: ['EmpheqMO', '\u27E9'],
    empheqbiglparen: ['EmpheqMO', '('],
    empheqbigrparen: ['EmpheqMO', ')'],
    empheqbiglvert: ['EmpheqMO', '|'],
    empheqbigrvert: ['EmpheqMO', '|'],
    empheqbiglVert: ['EmpheqMO', '\u2016'],
    empheqbigrVert: ['EmpheqMO', '\u2016'],
    empheqbiglfloor: ['EmpheqMO', '\u230A'],
    empheqbigrfloor: ['EmpheqMO', '\u230B'],
    empheqbiglceil: ['EmpheqMO', '\u2308'],
    empheqbigrceil: ['EmpheqMO', '\u2309'],
    empheql: 'EmpheqDelim',
    empheqr: 'EmpheqDelim',
    empheqbigl: 'EmpheqDelim',
    empheqbigr: 'EmpheqDelim'
}, exports.EmpheqMethods);
exports.EmpheqConfiguration = Configuration_js_1.Configuration.create('empheq', {
    handler: {
        macro: ['empheq-macros'],
        environment: ['empheq-env'],
    },
    items: (_a = {},
        _a[EmpheqBeginItem.prototype.kind] = EmpheqBeginItem,
        _a)
});
//# sourceMappingURL=EmpheqConfiguration.js.map