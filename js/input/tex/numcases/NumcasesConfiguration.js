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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumcasesConfiguration = exports.NumcasesMethods = exports.CasesTags = exports.CasesBeginItem = void 0;
var Configuration_js_1 = require("../Configuration.js");
var SymbolMap_js_1 = require("../SymbolMap.js");
var ParseUtil_js_1 = require("../ParseUtil.js");
var BaseMethods_js_1 = require("../base/BaseMethods.js");
var TexError_js_1 = require("../TexError.js");
var BaseItems_js_1 = require("../base/BaseItems.js");
var AmsConfiguration_js_1 = require("../ams/AmsConfiguration.js");
var EmpheqConfiguration_js_1 = require("../empheq/EmpheqConfiguration.js");
var CasesBeginItem = (function (_super) {
    __extends(CasesBeginItem, _super);
    function CasesBeginItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(CasesBeginItem.prototype, "kind", {
        get: function () {
            return 'cases-begin';
        },
        enumerable: false,
        configurable: true
    });
    CasesBeginItem.prototype.checkItem = function (item) {
        if (item.isKind('end') && item.getName() === this.getName()) {
            if (this.getProperty('end')) {
                this.setProperty('end', false);
                return [[], true];
            }
        }
        return _super.prototype.checkItem.call(this, item);
    };
    return CasesBeginItem;
}(BaseItems_js_1.BeginItem));
exports.CasesBeginItem = CasesBeginItem;
var CasesTags = (function (_super) {
    __extends(CasesTags, _super);
    function CasesTags() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.subcounter = 0;
        return _this;
    }
    CasesTags.prototype.start = function (env, taggable, defaultTags) {
        this.subcounter = 0;
        _super.prototype.start.call(this, env, taggable, defaultTags);
    };
    CasesTags.prototype.autoTag = function () {
        if (this.currentTag.tag != null)
            return;
        if (this.currentTag.env === 'subnumcases') {
            if (this.subcounter === 0)
                this.counter++;
            this.subcounter++;
            this.tag(this.formatNumber(this.counter, this.subcounter), false);
        }
        else {
            if (this.subcounter === 0 || this.currentTag.env !== 'numcases-left')
                this.counter++;
            this.tag(this.formatNumber(this.counter), false);
        }
    };
    CasesTags.prototype.formatNumber = function (n, m) {
        if (m === void 0) { m = null; }
        return n.toString() + (m === null ? '' : String.fromCharCode(0x60 + m));
    };
    return CasesTags;
}(AmsConfiguration_js_1.AmsTags));
exports.CasesTags = CasesTags;
exports.NumcasesMethods = {
    NumCases: function (parser, begin) {
        if (parser.stack.env.closing === begin.getName()) {
            delete parser.stack.env.closing;
            parser.Push(parser.itemFactory.create('end').setProperty('name', begin.getName()));
            var cases = parser.stack.Top();
            var table = cases.Last;
            var original = EmpheqConfiguration_js_1.EmpheqUtil.copyMml(table);
            var left = cases.getProperty('left');
            EmpheqConfiguration_js_1.EmpheqUtil.left(table, original, left + '\\empheqlbrace\\,', parser, 'numcases-left');
            parser.Push(parser.itemFactory.create('end').setProperty('name', begin.getName()));
            return null;
        }
        else {
            var left = parser.GetArgument('\\begin{' + begin.getName() + '}');
            begin.setProperty('left', left);
            var array = BaseMethods_js_1.default.EqnArray(parser, begin, true, true, 'll');
            array.arraydef.displaystyle = false;
            array.arraydef.rowspacing = '.2em';
            array.setProperty('numCases', true);
            parser.Push(begin);
            return array;
        }
    },
    Entry: function (parser, name) {
        if (!parser.stack.Top().getProperty('numCases')) {
            return BaseMethods_js_1.default.Entry(parser, name);
        }
        parser.Push(parser.itemFactory.create('cell').setProperties({ isEntry: true, name: name }));
        var tex = parser.string;
        var braces = 0, i = parser.i, m = tex.length;
        while (i < m) {
            var c = tex.charAt(i);
            if (c === '{') {
                braces++;
                i++;
            }
            else if (c === '}') {
                if (braces === 0) {
                    break;
                }
                else {
                    braces--;
                    i++;
                }
            }
            else if (c === '&' && braces === 0) {
                throw new TexError_js_1.default('ExtraCasesAlignTab', 'Extra alignment tab in text for numcase environment');
            }
            else if (c === '\\' && braces === 0) {
                var cs = (tex.slice(i + 1).match(/^[a-z]+|./i) || [])[0];
                if (cs === '\\' || cs === 'cr' || cs === 'end' || cs === 'label') {
                    break;
                }
                else {
                    i += cs.length;
                }
            }
            else {
                i++;
            }
        }
        var text = tex.substr(parser.i, i - parser.i);
        parser.PushAll(ParseUtil_js_1.default.internalMath(parser, text, 0));
        parser.i = i;
    }
};
new SymbolMap_js_1.EnvironmentMap('numcases-env', EmpheqConfiguration_js_1.EmpheqUtil.environment, {
    numcases: ['NumCases', 'cases'],
    subnumcases: ['NumCases', 'cases']
}, exports.NumcasesMethods);
new SymbolMap_js_1.MacroMap('numcases-macros', {
    '&': 'Entry'
}, exports.NumcasesMethods);
exports.NumcasesConfiguration = Configuration_js_1.Configuration.create('numcases', {
    handler: {
        environment: ['numcases-env'],
        character: ['numcases-macros']
    },
    items: (_a = {},
        _a[CasesBeginItem.prototype.kind] = CasesBeginItem,
        _a),
    tags: { 'numcases': CasesTags }
});
//# sourceMappingURL=NumcasesConfiguration.js.map