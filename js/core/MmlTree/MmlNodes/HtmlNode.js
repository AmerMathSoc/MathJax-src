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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlNode = void 0;
var MmlNode_js_1 = require("../MmlNode.js");
var HtmlNode = (function (_super) {
    __extends(HtmlNode, _super);
    function HtmlNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.html = null;
        _this.adaptor = null;
        return _this;
    }
    Object.defineProperty(HtmlNode.prototype, "kind", {
        get: function () {
            return 'html';
        },
        enumerable: false,
        configurable: true
    });
    HtmlNode.prototype.getHTML = function () {
        return this.html;
    };
    HtmlNode.prototype.setHTML = function (html, adaptor) {
        if (adaptor === void 0) { adaptor = null; }
        try {
            adaptor.getAttribute(html, 'data-mjx-hdw');
        }
        catch (error) {
            html = adaptor.node('span', {}, [html]);
        }
        this.html = html;
        this.adaptor = adaptor;
        return this;
    };
    HtmlNode.prototype.getSerializedHTML = function () {
        return this.adaptor.outerHTML(this.html);
    };
    HtmlNode.prototype.textContent = function () {
        return this.adaptor.textContent(this.html);
    };
    HtmlNode.prototype.copy = function () {
        return this.factory.create(this.kind).setHTML(this.adaptor.clone(this.html));
    };
    HtmlNode.prototype.toString = function () {
        var kind = this.adaptor.kind(this.html);
        return "HTML=<".concat(kind, ">...</").concat(kind, ">");
    };
    HtmlNode.prototype.verifyTree = function (options) {
        if (this.parent && !this.parent.isToken) {
            this.mError('HTML can only be a child of a token element', options, true);
            return;
        }
    };
    return HtmlNode;
}(MmlNode_js_1.AbstractMmlEmptyNode));
exports.HtmlNode = HtmlNode;
//# sourceMappingURL=HtmlNode.js.map