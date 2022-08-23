"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TexHtmlConfiguration = exports.HtmlNodeMethods = void 0;
var Configuration_js_1 = require("../Configuration.js");
var SymbolMap_js_1 = require("../SymbolMap.js");
var TexError_js_1 = __importDefault(require("../TexError.js"));
var HTMLDomStrings_js_1 = require("../../../handlers/html/HTMLDomStrings.js");
exports.HtmlNodeMethods = {
    TexHTML: function (parser, _name) {
        if (!parser.options.allowTexHTML)
            return false;
        var match = parser.string.slice(parser.i).match(/^tex-html(?: n="(\d+)")?>/);
        if (!match)
            return false;
        parser.i += match[0].length;
        var end = (match[1] ? "<!".concat(match[1], ">") : '') + '</tex-html>';
        var i = parser.string.indexOf(end);
        if (i < 0) {
            throw new TexError_js_1.default('TokenNotFoundForCommand', 'Could not find %1 for %2', end, '<' + match[0]);
        }
        var html = parser.string.substr(parser.i, i - parser.i).trim();
        parser.i = i + 11 + (match[1] ? 3 + match[1].length : 0);
        var adaptor = parser.configuration.packageData.get('texhtml').adaptor;
        var nodes = adaptor.childNodes(adaptor.body(adaptor.parse(html)));
        if (nodes.length === 0)
            return true;
        var DOM = (nodes.length === 1 ? nodes[0] : adaptor.node('div', {}, nodes));
        var node = parser.create('node', 'html').setHTML(DOM, adaptor);
        parser.Push(parser.create('node', 'mtext', [node]));
        return true;
    }
};
new SymbolMap_js_1.MacroMap('tex-html', { '<': 'TexHTML' }, exports.HtmlNodeMethods);
exports.TexHtmlConfiguration = Configuration_js_1.Configuration.create('texhtml', {
    handler: {
        character: ['tex-html']
    },
    options: {
        allowTexHTML: false
    },
    config: function () {
        if (HTMLDomStrings_js_1.HTMLDomStrings) {
            var include = HTMLDomStrings_js_1.HTMLDomStrings.OPTIONS.includeHtmlTags;
            if (!include['tex-html']) {
                include['tex-html'] = function (node, adaptor) {
                    var html = adaptor.innerHTML(node);
                    var n = html.split(/<\/tex-html>/).length;
                    var N = (n > 1 ? " n=\"".concat(n, "\"") : '');
                    return "<tex-html".concat(N, ">") + html + (n > 1 ? "<!".concat(n, ">") : '') + "</tex-html>";
                };
            }
        }
    },
    preprocessors: [function (data) {
            data.data.packageData.set('texhtml', { adaptor: data.document.adaptor });
        }],
    postprocessors: [function (data) {
            data.data.packageData.set('texhtml', { adaptor: null });
        }]
});
//# sourceMappingURL=TexHtmlConfiguration.js.map