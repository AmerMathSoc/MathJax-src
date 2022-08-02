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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChtmlMaction = void 0;
var Wrapper_js_1 = require("../Wrapper.js");
var maction_js_1 = require("../../common/Wrappers/maction.js");
var maction_js_2 = require("../../../core/MmlTree/MmlNodes/maction.js");
var maction_js_3 = require("../../common/Wrappers/maction.js");
exports.ChtmlMaction = (function () {
    var _a;
    var Base = (0, maction_js_1.CommonMactionMixin)(Wrapper_js_1.ChtmlWrapper);
    return _a = (function (_super) {
            __extends(ChtmlMaction, _super);
            function ChtmlMaction() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ChtmlMaction.prototype.setEventHandler = function (type, handler, dom) {
                if (dom === void 0) { dom = null; }
                (dom ? [dom] : this.dom).forEach(function (node) { return node.addEventListener(type, handler); });
            };
            ChtmlMaction.prototype.Em = function (m) {
                return this.em(m);
            };
            ChtmlMaction.prototype.toCHTML = function (parents) {
                if (this.toEmbellishedCHTML(parents))
                    return;
                var chtml = this.standardChtmlNodes(parents);
                var child = this.selected;
                child.toCHTML(chtml);
                this.action(this, this.data);
            };
            return ChtmlMaction;
        }(Base)),
        _a.kind = maction_js_2.MmlMaction.prototype.kind,
        _a.styles = {
            'mjx-maction': {
                position: 'relative'
            },
            'mjx-maction > mjx-tool': {
                display: 'none',
                position: 'absolute',
                bottom: 0, right: 0,
                width: 0, height: 0,
                'z-index': 500
            },
            'mjx-tool > mjx-tip': {
                display: 'inline-block',
                padding: '.2em',
                border: '1px solid #888',
                'font-size': '70%',
                'background-color': '#F8F8F8',
                color: 'black',
                'box-shadow': '2px 2px 5px #AAAAAA'
            },
            'mjx-maction[toggle]': {
                cursor: 'pointer'
            },
            'mjx-status': {
                display: 'block',
                position: 'fixed',
                left: '1em',
                bottom: '1em',
                'min-width': '25%',
                padding: '.2em .4em',
                border: '1px solid #888',
                'font-size': '90%',
                'background-color': '#F8F8F8',
                color: 'black'
            }
        },
        _a.actions = new Map([
            ['toggle', [function (node, _data) {
                        node.dom.forEach(function (dom) {
                            node.adaptor.setAttribute(dom, 'toggle', node.node.attributes.get('selection'));
                        });
                        var math = node.factory.jax.math;
                        var document = node.factory.jax.document;
                        var mml = node.node;
                        node.setEventHandler('click', function (event) {
                            if (!math.end.node) {
                                math.start.node = math.end.node = math.typesetRoot;
                                math.start.n = math.end.n = 0;
                            }
                            mml.nextToggleSelection();
                            math.rerender(document);
                            event.stopPropagation();
                        });
                    }, {}]],
            ['tooltip', [function (node, data) {
                        var e_1, _a;
                        var tip = node.childNodes[1];
                        if (!tip)
                            return;
                        if (tip.node.isKind('mtext')) {
                            var text_1 = tip.node.getText();
                            node.dom.forEach(function (dom) { return node.adaptor.setAttribute(dom, 'title', text_1); });
                        }
                        else {
                            var adaptor_1 = node.adaptor;
                            var _loop_1 = function (dom) {
                                var tool = adaptor_1.append(dom, node.html('mjx-tool', {
                                    style: { bottom: node.Em(-node.tipDy), right: node.Em(-node.tipDx) }
                                }, [node.html('mjx-tip')]));
                                tip.toCHTML([adaptor_1.firstChild(tool)]);
                                node.setEventHandler('mouseover', function (event) {
                                    data.stopTimers(dom, data);
                                    var timeout = setTimeout(function () { return adaptor_1.setStyle(tool, 'display', 'block'); }, data.postDelay);
                                    data.hoverTimer.set(dom, timeout);
                                    event.stopPropagation();
                                }, dom);
                                node.setEventHandler('mouseout', function (event) {
                                    data.stopTimers(dom, data);
                                    var timeout = setTimeout(function () { return adaptor_1.setStyle(tool, 'display', ''); }, data.clearDelay);
                                    data.clearTimer.set(dom, timeout);
                                    event.stopPropagation();
                                }, dom);
                            };
                            try {
                                for (var _b = __values(node.dom), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var dom = _c.value;
                                    _loop_1(dom);
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                        }
                    }, maction_js_3.TooltipData]],
            ['statusline', [function (node, data) {
                        var tip = node.childNodes[1];
                        if (!tip)
                            return;
                        if (tip.node.isKind('mtext')) {
                            var adaptor_2 = node.adaptor;
                            var text_2 = tip.node.getText();
                            node.dom.forEach(function (dom) { return adaptor_2.setAttribute(dom, 'statusline', text_2); });
                            node.setEventHandler('mouseover', function (event) {
                                if (data.status === null) {
                                    var body = adaptor_2.body(adaptor_2.document);
                                    data.status = adaptor_2.append(body, node.html('mjx-status', {}, [node.text(text_2)]));
                                }
                                event.stopPropagation();
                            });
                            node.setEventHandler('mouseout', function (event) {
                                if (data.status) {
                                    adaptor_2.remove(data.status);
                                    data.status = null;
                                }
                                event.stopPropagation();
                            });
                        }
                    }, {
                        status: null
                    }]]
        ]),
        _a;
})();
//# sourceMappingURL=maction.js.map