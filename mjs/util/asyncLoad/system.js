import { mathjax } from '../../mathjax.js';
let root = 'file://' + __dirname.replace(/\/[^/]*\/[^/]*$/, '/');
if (!mathjax.asyncLoad && typeof System !== 'undefined' && System.import) {
    mathjax.asyncLoad = (name) => {
        const file = (name.charAt(0) === '.' ? new URL(name, root) : new URL(name, 'file://')).href;
        return System.import(file).then((result) => { var _a; return (_a = result.default) !== null && _a !== void 0 ? _a : result; });
    };
}
export function setBaseURL(url) {
    root = new URL(url, 'file://').href;
    if (!root.match(/\/$/)) {
        root += '/';
    }
}
//# sourceMappingURL=system.js.map