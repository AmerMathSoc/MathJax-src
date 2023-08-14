import { mathjax } from '../../mathjax.js';
import * as path from 'path';
const root = path.dirname(path.dirname(__dirname));
if (!mathjax.asyncLoad && typeof require !== 'undefined') {
    mathjax.asyncLoad = (name) => {
        return require(name.charAt(0) === '.' ? path.resolve(root, name) : name);
    };
}
//# sourceMappingURL=node.js.map