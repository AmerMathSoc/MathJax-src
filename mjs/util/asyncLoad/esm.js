import { mathjax } from '../../mathjax.js';
let root = new URL(import.meta.url).href.replace(/\/util\/asyncLoad\/esm.js$/, '');
if (!mathjax.asyncLoad) {
    mathjax.asyncLoad = (name) => {
        return import(new URL(name, root).href);
    };
}
export function setBaseURL(URL) {
    root = URL;
    if (!root.match(/\/$/)) {
        root += '/';
    }
}
//# sourceMappingURL=esm.js.map