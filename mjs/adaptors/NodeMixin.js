import { userOptions, defaultOptions } from '../util/Options.js';
export const NodeMixinOptions = {
    badCSS: true,
    badSizes: true,
};
export function NodeMixin(Base, options = {}) {
    var _a;
    options = userOptions(defaultOptions({}, NodeMixinOptions), options);
    return _a = class NodeAdaptor extends Base {
            constructor(...args) {
                super(args[0]);
                this.canMeasureNodes = false;
                const CLASS = this.constructor;
                this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), args[1]);
            }
            fontSize(node) {
                return options.badCSS ? this.options.fontSize : super.fontSize(node);
            }
            fontFamily(node) {
                return options.badCSS ? this.options.fontFamily : super.fontFamily(node);
            }
            nodeSize(node, em = 1, local = null) {
                if (!options.badSizes) {
                    return super.nodeSize(node, em, local);
                }
                const text = this.textContent(node);
                const non = Array.from(text.replace(_a.cjkPattern, '')).length;
                const CJK = Array.from(text).length - non;
                return [
                    CJK * this.options.cjkCharWidth + non * this.options.unknownCharWidth,
                    this.options.unknownCharHeight,
                ];
            }
            nodeBBox(node) {
                return options.badSizes
                    ? { left: 0, right: 0, top: 0, bottom: 0 }
                    : super.nodeBBox(node);
            }
        },
        _a.OPTIONS = Object.assign(Object.assign({}, (options.badCSS ? {
            fontSize: 16,
            fontFamily: 'Times',
        } : {})), (options.badSizes ? {
            cjkCharWidth: 1,
            unknownCharWidth: .6,
            unknownCharHeight: .8,
        } : {})),
        _a.cjkPattern = new RegExp([
            '[',
            '\u1100-\u115F',
            '\u2329\u232A',
            '\u2E80-\u303E',
            '\u3040-\u3247',
            '\u3250-\u4DBF',
            '\u4E00-\uA4C6',
            '\uA960-\uA97C',
            '\uAC00-\uD7A3',
            '\uF900-\uFAFF',
            '\uFE10-\uFE19',
            '\uFE30-\uFE6B',
            '\uFF01-\uFF60\uFFE0-\uFFE6',
            '\u{1B000}-\u{1B001}',
            '\u{1F200}-\u{1F251}',
            '\u{20000}-\u{3FFFD}',
            ']',
        ].join(''), 'gu'),
        _a;
}
//# sourceMappingURL=NodeMixin.js.map