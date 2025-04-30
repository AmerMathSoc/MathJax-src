import { mathjax } from '../../mathjax.js';
import * as path from 'path';
import { src } from '#source/source.cjs';
let root = path.resolve(src, '..', '..', 'cjs');
if (!mathjax.asyncLoad && typeof require !== 'undefined') {
    mathjax.asyncLoad = (name) => {
        return require(name.charAt(0) === '.' ? path.resolve(root, name) : name);
    };
    mathjax.asyncIsSynchronous = true;
}
export function setBaseURL(URL) {
    root = URL;
    if (!root.match(/\/$/)) {
        root += '/';
    }
}
//# sourceMappingURL=node.js.map