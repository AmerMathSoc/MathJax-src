import { MathJax as MJGlobal, combineWithMathJax, combineDefaults } from './global.js';
import { Package } from './package.js';
import { FunctionList } from '../util/FunctionList.js';
import { esRoot } from '#root/root.js';
export const PathFilters = {
    source: (data) => {
        if (CONFIG.source.hasOwnProperty(data.name)) {
            data.name = CONFIG.source[data.name];
        }
        return true;
    },
    normalize: (data) => {
        const name = data.name;
        if (!name.match(/^(?:[a-z]+:\/)?\/|[a-z]:\\|\[/i)) {
            data.name = '[mathjax]/' + name.replace(/^\.\//, '');
        }
        if (data.addExtension && !name.match(/\.[^\/]+$/)) {
            data.name += '.js';
        }
        return true;
    },
    prefix: (data) => {
        let match;
        while ((match = data.name.match(/^\[([^\]]*)\]/))) {
            if (!CONFIG.paths.hasOwnProperty(match[1]))
                break;
            data.name = CONFIG.paths[match[1]] + data.name.substr(match[0].length);
        }
        return true;
    }
};
export var Loader;
(function (Loader) {
    const VERSION = MJGlobal.version;
    Loader.versions = new Map();
    function ready(...names) {
        if (names.length === 0) {
            names = Array.from(Package.packages.keys());
        }
        const promises = [];
        for (const name of names) {
            const extension = Package.packages.get(name) || new Package(name, true);
            promises.push(extension.promise);
        }
        return Promise.all(promises);
    }
    Loader.ready = ready;
    function load(...names) {
        if (names.length === 0) {
            return Promise.resolve();
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
                if (!CONFIG.versionWarnings)
                    return;
                if (extension.isLoaded && !Loader.versions.has(Package.resolvePath(name))) {
                    console.warn(`No version information available for component ${name}`);
                }
            }));
        }
        Package.loadAll();
        return Promise.all(promises);
    }
    Loader.load = load;
    function preLoad(...names) {
        for (const name of names) {
            let extension = Package.packages.get(name);
            if (!extension) {
                extension = new Package(name, true);
                extension.provides(CONFIG.provides[name]);
            }
            extension.loaded();
        }
    }
    Loader.preLoad = preLoad;
    function defaultReady() {
        if (typeof MathJax.startup !== 'undefined') {
            MathJax.config.startup.ready();
        }
    }
    Loader.defaultReady = defaultReady;
    function getRoot() {
        if (typeof document !== 'undefined') {
            const script = document.currentScript || document.getElementById('MathJax-script');
            if (script) {
                return script.src.replace(/\/[^\/]*$/, '');
            }
        }
        return esRoot();
    }
    Loader.getRoot = getRoot;
    function checkVersion(name, version, _type) {
        saveVersion(name);
        if (CONFIG.versionWarnings && version !== VERSION) {
            console.warn(`Component ${name} uses ${version} of MathJax; version in use is ${VERSION}`);
            return true;
        }
        return false;
    }
    Loader.checkVersion = checkVersion;
    function saveVersion(name) {
        Loader.versions.set(Package.resolvePath(name), VERSION);
    }
    Loader.saveVersion = saveVersion;
    Loader.pathFilters = new FunctionList();
    Loader.pathFilters.add(PathFilters.source, 0);
    Loader.pathFilters.add(PathFilters.normalize, 10);
    Loader.pathFilters.add(PathFilters.prefix, 20);
})(Loader || (Loader = {}));
export const MathJax = MJGlobal;
if (typeof MathJax.loader === 'undefined') {
    combineDefaults(MathJax.config, 'loader', {
        paths: {
            mathjax: Loader.getRoot()
        },
        source: {},
        dependencies: {},
        provides: {},
        load: [],
        ready: Loader.defaultReady.bind(Loader),
        failed: (error) => console.log(`MathJax(${error.package || '?'}): ${error.message}`),
        require: null,
        pathFilters: [],
        versionWarnings: true
    });
    combineWithMathJax({
        loader: Loader
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