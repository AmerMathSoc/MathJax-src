import { VERSION } from './version.js';
const defaultGlobal = {};
export const GLOBAL = (() => {
    if (typeof window !== 'undefined')
        return window;
    if (typeof global !== 'undefined')
        return global;
    if (typeof globalThis !== 'undefined')
        return globalThis;
    return defaultGlobal;
})();
export function isObject(x) {
    return typeof x === 'object' && x !== null;
}
export function combineConfig(dst, src) {
    for (const id of Object.keys(src)) {
        if (id === '__esModule')
            continue;
        if (isObject(dst[id]) && isObject(src[id]) &&
            !(src[id] instanceof Promise)) {
            combineConfig(dst[id], src[id]);
        }
        else if (src[id] !== null && src[id] !== undefined && dst[id] !== src[id]) {
            dst[id] = src[id];
        }
    }
    return dst;
}
export function combineDefaults(dst, name, src) {
    if (!dst[name]) {
        dst[name] = {};
    }
    dst = dst[name];
    for (const id of Object.keys(src)) {
        if (isObject(dst[id]) && isObject(src[id])) {
            combineDefaults(dst, id, src[id]);
        }
        else if (dst[id] == null && src[id] != null) {
            dst[id] = src[id];
        }
    }
    return dst;
}
export function combineWithMathJax(config) {
    return combineConfig(MathJax, config);
}
if (typeof GLOBAL.MathJax === 'undefined') {
    GLOBAL.MathJax = {};
}
if (!GLOBAL.MathJax.version) {
    GLOBAL.MathJax = {
        version: VERSION,
        _: {},
        config: GLOBAL.MathJax
    };
}
export const MathJax = GLOBAL.MathJax;
//# sourceMappingURL=global.js.map