import { ChtmlWrapper } from '../Wrapper.js';
import { CommonHtmlNodeMixin } from '../../common/Wrappers/HtmlNode.js';
import { HtmlNode } from '../../../core/MmlTree/MmlNodes/HtmlNode.js';
export const ChtmlHtmlNode = (function () {
    var _a;
    const Base = CommonHtmlNodeMixin(ChtmlWrapper);
    return _a = class ChtmlHtmlNode extends Base {
            toCHTML(parents) {
                this.markUsed();
                this.dom = [this.adaptor.append(parents[0], this.getHTML())];
            }
        },
        _a.kind = HtmlNode.prototype.kind,
        _a.styles = {
            'mjx-html': {
                'line-height': 'normal',
                'text-align': 'initial'
            },
            'mjx-html-holder': {
                display: 'block',
                position: 'absolute',
                width: '100%',
                height: '100%'
            }
        },
        _a;
})();
//# sourceMappingURL=HtmlNode.js.map