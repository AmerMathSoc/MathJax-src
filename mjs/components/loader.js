import { MathJax as MJGlobal, combineWithMathJax, combineDefaults, } from './global.js';
import { Package, } from './package.js';
import { FunctionList } from '../util/FunctionList.js';
import { mjxRoot } from '#root/root.js';
import { context } from '../util/context.js';
export const PathFilters = {
    source: (data) => {
        if (Object.hasOwn(CONFIG.source, data.name)) {
            data.name = CONFIG.source[data.name];
        }
        return true;
    },
    normalize: (data) => {
        const name = data.name;
        if (!name.match(/^(?:[a-z]+:\/)?\/|[a-z]:\\|\[/i)) {
            data.name = '[mathjax]/' + name.replace(/^\.\//, '');
        }
        return true;
    },
    prefix: (data) => {
        let match;
        while ((match = data.name.match(/^\[([^\]]*)\]/))) {
            if (!Object.hasOwn(CONFIG.paths, match[1]))
                break;
            data.name = CONFIG.paths[match[1]] + data.name.substring(match[0].length);
        }
        return true;
    },
    addExtension: (data) => {
        if (data.addExtension && !data.name.match(/\.[^/]+$/)) {
            data.name += '.js';
        }
        return true;
    },
};
const VERSION = MJGlobal.version;
export const Loader = {
    versions: new Map(),
    ready(...names) {
        if (names.length === 0) {
            names = Array.from(Package.packages.keys());
        }
        const promises = [];
        for (const name of names) {
            const extension = Package.packages.get(name) || new Package(name, true);
            promises.push(extension.promise);
        }
        return Promise.all(promises);
    },
    load(...names) {
        if (names.length === 0) {
            return Promise.resolve([]);
        }
        const promises = [];
        for (const name of names) {
            let extension = Package.packages.get(name);
            if (!extension) {
                extension = new Package(name);
                extension.provides(CONFIG.provides[name]);
            }
            extension.checkNoLoad();
            promises.push(extension.promise.then(() => {
                if (CONFIG.versionWarnings &&
                    extension.isLoaded &&
                    !Loader.versions.has(Package.resolvePath(name))) {
                    console.warn(`No version information available for component ${name}`);
                }
                return extension.result;
            }));
        }
        Package.loadAll();
        return Promise.all(promises);
    },
    preLoaded(...names) {
        for (const name of names) {
            let extension = Package.packages.get(name);
            if (!extension) {
                extension = new Package(name, true);
                extension.provides(CONFIG.provides[name]);
            }
            extension.loaded();
        }
    },
    addPackageData(name, data) {
        let config = CONFIG[name];
        if (!config) {
            config = CONFIG[name] = {};
        }
        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
                if (!config[key]) {
                    config[key] = [];
                }
                const set = new Set([...config[key], ...value]);
                config[key] = [...set];
            }
            else {
                config[key] = value;
            }
        }
    },
    defaultReady() {
        if (typeof MathJax.startup !== 'undefined') {
            MathJax.config.startup.ready();
        }
    },
    getRoot() {
        if (context.document) {
            const script = context.document.currentScript ||
                context.document.getElementById('MathJax-script');
            if (script && script instanceof HTMLScriptElement) {
                return script.src.replace(/\/[^/]*$/, '');
            }
        }
        return mjxRoot();
    },
    checkVersion(name, version, _type) {
        this.saveVersion(name);
        if (CONFIG.versionWarnings && version !== VERSION) {
            console.warn(`Component ${name} uses ${version} of MathJax; version in use is ${VERSION}`);
            return true;
        }
        return false;
    },
    saveVersion(name) {
        Loader.versions.set(Package.resolvePath(name), VERSION);
    },
    pathFilters: new FunctionList(),
};
Loader.pathFilters.add(PathFilters.source, 0);
Loader.pathFilters.add(PathFilters.normalize, 10);
Loader.pathFilters.add(PathFilters.prefix, 20);
Loader.pathFilters.add(PathFilters.addExtension, 30);
export const MathJax = MJGlobal;
if (typeof MathJax.loader === 'undefined') {
    combineDefaults(MathJax.config, 'loader', {
        paths: {
            mathjax: Loader.getRoot(),
        },
        source: {},
        dependencies: {},
        provides: {},
        load: [],
        ready: Loader.defaultReady.bind(Loader),
        failed: (error) => console.log(`MathJax(${error.package || '?'}): ${error.message}`),
        require: null,
        pathFilters: [],
        versionWarnings: true,
    });
    combineWithMathJax({
        loader: Loader,
    });
    for (const filter of MathJax.config.loader.pathFilters) {
        if (Array.isArray(filter)) {
            Loader.pathFilters.add(filter[0], filter[1]);
        }
        else {
            Loader.pathFilters.add(filter);
        }
    }
}
export const CONFIG = MathJax.config.loader;
//# sourceMappingURL=loader.js.map