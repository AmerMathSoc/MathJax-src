"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathtoolsConfiguration = exports.MultlinedItem = void 0;
var AmsItems_js_1 = require("../ams/AmsItems.js");
var ParseUtil_js_1 = require("../ParseUtil.js");
var ParseMethods_js_1 = require("../ParseMethods.js");
var Configuration_js_1 = require("../Configuration.js");
var AmsMethods_js_1 = require("../ams/AmsMethods.js");
var BaseMethods_js_1 = require("../base/BaseMethods.js");
var TexError_js_1 = require("../TexError.js");
var SymbolMap_js_1 = require("../SymbolMap.js");
var NodeUtil_js_1 = require("../NodeUtil.js");
var TexConstants_js_1 = require("../TexConstants.js");
var MathtoolsMethods = {};
var MultlinedItem = (function (_super) {
    __extends(MultlinedItem, _super);
    function MultlinedItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(MultlinedItem.prototype, "kind", {
        get: function () {
            return 'multlined';
        },
        enumerable: false,
        configurable: true
    });
    MultlinedItem.prototype.EndTable = function () {
        if (this.Size() || this.row.length) {
            this.EndEntry();
            this.EndRow();
        }
        if (this.table.length) {
            var first = NodeUtil_js_1.default.getChildren(this.table[0])[0];
            var m = this.table.length - 1;
            if (NodeUtil_js_1.default.getAttribute(first, 'columnalign') !== TexConstants_js_1.TexConstant.Align.RIGHT) {
                first.appendChild(this.create('node', 'mspace', [], { width: this.factory.configuration.options['MultlineGap'] || '2em' }));
            }
            var last = NodeUtil_js_1.default.getChildren(this.table[m])[0];
            if (NodeUtil_js_1.default.getAttribute(last, 'columnalign') !== TexConstants_js_1.TexConstant.Align.LEFT) {
                var top_1 = last.childNodes[0];
                top_1.childNodes.unshift(null);
                var space = this.create('node', 'mspace', [], { width: this.factory.configuration.options['MultlineGap'] || '2em' });
                NodeUtil_js_1.default.setChild(top_1, 0, space);
            }
        }
        _super.prototype.EndTable.call(this);
    };
    return MultlinedItem;
}(AmsItems_js_1.MultlineItem));
exports.MultlinedItem = MultlinedItem;
MathtoolsMethods.MtMatrix = function (parser, begin, open, close) {
    var align = parser.GetBrackets('\\begin{' + begin.getName() + '}') || 'c';
    return BaseMethods_js_1.default.Array(parser, begin, open, close, align);
},
    MathtoolsMethods.MtSmallMatrix = function (parser, begin, open, close, align) {
        if (!align) {
            align = parser.GetBrackets('\\begin{' + begin.getName() + '}') || 'c';
        }
        return BaseMethods_js_1.default.Array(parser, begin, open, close, align, ParseUtil_js_1.default.Em(1 / 3), '.2em', 'S', 1);
    },
    MathtoolsMethods.MtMultlined = function (parser, begin) {
        var pos = parser.GetBrackets('\\begin{' + begin.getName() + '}') || '';
        var width = pos ? parser.GetBrackets('\\begin{' + begin.getName() + '}') : null;
        if (!pos.match(/^[cbt]$/)) {
            var tmp = width;
            width = pos;
            pos = tmp;
        }
        parser.Push(begin);
        var item = parser.itemFactory.create('multlined', parser, begin);
        item.arraydef = {
            displaystyle: true,
            rowspacing: '.5em',
            width: width || parser.options['multlineWidth'],
            columnwidth: '100%',
        };
        return ParseUtil_js_1.default.setArrayAlign(item, pos || 'c');
    };
MathtoolsMethods.HandleShove = function (parser, name, shove) {
    var top = parser.stack.Top();
    if (top.kind !== 'multline' && top.kind !== 'multlined') {
        throw new TexError_js_1.default('CommandInMultlined', '%1 can only appear within the multline or multlined environments', name);
    }
    if (top.Size()) {
        throw new TexError_js_1.default('CommandAtTheBeginingOfLine', '%1 must come at the beginning of the line', name);
    }
    top.setProperty('shove', shove);
    var shift = parser.GetBrackets(name);
    var mml = parser.ParseArg(name);
    if (shift) {
        var mrow = parser.create('node', 'mrow', []);
        var mspace = parser.create('node', 'mspace', [], { width: shift });
        if (shove === 'left') {
            mrow.appendChild(mspace);
            mrow.appendChild(mml);
        }
        else {
            mrow.appendChild(mml);
            mrow.appendChild(mspace);
        }
        mml = mrow;
    }
    parser.Push(mml);
};
MathtoolsMethods.Array = BaseMethods_js_1.default.Array;
MathtoolsMethods.Macro = BaseMethods_js_1.default.Macro;
MathtoolsMethods.xArrow = AmsMethods_js_1.AmsMethods.xArrow;
new SymbolMap_js_1.CommandMap('mathtools-macros', {
    shoveleft: ['HandleShove', TexConstants_js_1.TexConstant.Align.LEFT],
    shoveright: ['HandleShove', TexConstants_js_1.TexConstant.Align.RIGHT],
    coloneqq: ['Macro', '\\mathrel{≔}'],
    xleftrightarrow: ['xArrow', 0x2194, 7, 6]
}, MathtoolsMethods);
new SymbolMap_js_1.EnvironmentMap('mathtools-environment', ParseMethods_js_1.default.environment, {
    dcases: ['Array', null, '\\{', '.', 'll', null, '.2em', 'D'],
    rcases: ['Array', null, '.', '\\}', 'll', null, '.2em', 'D'],
    drcases: ['Array', null, '\\{', '\\}', 'll', null, '.2em', 'D'],
    'matrix*': ['MtMatrix', null, null, null],
    'pmatrix*': ['MtMatrix', null, '(', ')'],
    'bmatrix*': ['MtMatrix', null, '[', ']'],
    'Bmatrix*': ['MtMatrix', null, '\\{', '\\}'],
    'vmatrix*': ['MtMatrix', null, '\\vert', '\\vert'],
    'Vmatrix*': ['MtMatrix', null, '\\Vert', '\\Vert'],
    'smallmatrix*': ['MtSmallMatrix', null, null, null],
    psmallmatrix: ['MtSmallMatrix', null, '(', ')', 'c'],
    'psmallmatrix*': ['MtSmallMatrix', null, '(', ')'],
    bsmallmatrix: ['MtSmallMatrix', null, '[', ']', 'c'],
    'bsmallmatrix*': ['MtSmallMatrix', null, '[', ']'],
    Bsmallmatrix: ['MtSmallMatrix', null, '\\{', '\\}', 'c'],
    'Bsmallmatrix*': ['MtSmallMatrix', null, '\\{', '\\}'],
    vsmallmatrix: ['MtSmallMatrix', null, '\\vert', '\\vert', 'c'],
    'vsmallmatrix*': ['MtSmallMatrix', null, '\\vert', '\\vert'],
    Vsmallmatrix: ['MtSmallMatrix', null, '\\Vert', '\\Vert', 'c'],
    'Vsmallmatrix*': ['MtSmallMatrix', null, '\\Vert', '\\Vert'],
    multlined: 'MtMultlined',
}, MathtoolsMethods);
exports.MathtoolsConfiguration = Configuration_js_1.Configuration.create('mathtools', {
    handler: {
        macro: ['mathtools-macros'],
        environment: ['mathtools-environment']
    },
    items: (_a = {}, _a[MultlinedItem.prototype.kind] = MultlinedItem, _a)
});
//# sourceMappingURL=MathtoolsConfiguration.js.map