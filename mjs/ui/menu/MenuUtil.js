var _a, _b, _c;
import { context } from '../../util/context.js';
export const isMac = ((_c = (_b = (_a = context.window) === null || _a === void 0 ? void 0 : _a.navigator) === null || _b === void 0 ? void 0 : _b.platform) === null || _c === void 0 ? void 0 : _c.substring(0, 3)) === 'Mac';
export function copyToClipboard(text) {
    const document = context.document;
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.cssText =
        'height: 1px; width: 1px; padding: 1px; position: absolute; left: -10px';
    document.body.appendChild(input);
    input.select();
    try {
        document.execCommand('copy');
    }
    catch (error) {
        alert(`Can't copy to clipboard: ${error.message}`);
    }
    document.body.removeChild(input);
}
//# sourceMappingURL=MenuUtil.js.map