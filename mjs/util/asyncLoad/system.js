import { mathjax } from '../../mathjax.js';
let root = 'file://' + __dirname.replace(/\/\/[^\/]*$/, '/');
if (!mathjax.asyncLoad && typeof System !== 'undefined' && System.import) {
    mathjax.asyncLoad = (name) => {
        return System.import(name, root);
    };
}
export function setBaseURL(URL) {
    root = URL;
    if (!root.match(/\/$/)) {
        root += '/';
    }
}
//# sourceMappingURL=system.js.map