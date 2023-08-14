import { CONFIG, Loader } from './loader.js';
export class PackageError extends Error {
    constructor(message, name) {
        super(message);
        this.package = name;
    }
}
export class Package {
    get canLoad() {
        return this.dependencyCount === 0 && !this.noLoad && !this.isLoading && !this.hasFailed;
    }
    static resolvePath(name, addExtension = true) {
        const data = { name, original: name, addExtension };
        Loader.pathFilters.execute(data);
        return data.name;
    }
    static loadAll() {
        for (const extension of this.packages.values()) {
            if (extension.canLoad) {
                extension.load();
            }
        }
    }
    constructor(name, noLoad = false) {
        this.isLoaded = false;
        this.isLoading = false;
        this.hasFailed = false;
        this.dependents = [];
        this.dependencies = [];
        this.dependencyCount = 0;
        this.provided = [];
        this.name = name;
        this.noLoad = noLoad;
        Package.packages.set(name, this);
        this.promise = this.makePromise(this.makeDependencies());
    }
    makeDependencies() {
        const promises = [];
        const map = Package.packages;
        const noLoad = this.noLoad;
        const name = this.name;
        const dependencies = [];
        if (CONFIG.dependencies.hasOwnProperty(name)) {
            dependencies.push(...CONFIG.dependencies[name]);
        }
        else if (name !== 'core') {
            dependencies.push('core');
        }
        for (const dependent of dependencies) {
            const extension = map.get(dependent) || new Package(dependent, noLoad);
            if (this.dependencies.indexOf(extension) < 0) {
                extension.addDependent(this, noLoad);
                this.dependencies.push(extension);
                if (!extension.isLoaded) {
                    this.dependencyCount++;
                    promises.push(extension.promise);
                }
            }
        }
        return promises;
    }
    makePromise(promises) {
        let promise = new Promise(((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        }));
        const config = (CONFIG[this.name] || {});
        if (config.ready) {
            promise = promise.then((_name) => config.ready(this.name));
        }
        if (promises.length) {
            promises.push(promise);
            promise = Promise.all(promises).then((names) => names.join(', '));
        }
        if (config.failed) {
            promise.catch((message) => config.failed(new PackageError(message, this.name)));
        }
        return promise;
    }
    load() {
        if (!this.isLoaded && !this.isLoading && !this.noLoad) {
            this.isLoading = true;
            const url = Package.resolvePath(this.name);
            if (CONFIG.require) {
                this.loadCustom(url);
            }
            else {
                this.loadScript(url);
            }
        }
    }
    loadCustom(url) {
        try {
            const result = CONFIG.require(url);
            if (result instanceof Promise) {
                result.then(() => this.checkLoad())
                    .catch((err) => this.failed('Can\'t load "' + url + '"\n' + err.message.trim()));
            }
            else {
                this.checkLoad();
            }
        }
        catch (err) {
            this.failed(err.message);
        }
    }
    loadScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.charset = 'UTF-8';
        script.onload = (_event) => this.checkLoad();
        script.onerror = (_event) => this.failed('Can\'t load "' + url + '"');
        document.head.appendChild(script);
    }
    loaded() {
        this.isLoaded = true;
        this.isLoading = false;
        for (const dependent of this.dependents) {
            dependent.requirementSatisfied();
        }
        for (const provided of this.provided) {
            provided.loaded();
        }
        this.resolve(this.name);
    }
    failed(message) {
        this.hasFailed = true;
        this.isLoading = false;
        this.reject(new PackageError(message, this.name));
    }
    checkLoad() {
        const config = (CONFIG[this.name] || {});
        const checkReady = config.checkReady || (() => Promise.resolve());
        checkReady().then(() => this.loaded())
            .catch((message) => this.failed(message));
    }
    requirementSatisfied() {
        if (this.dependencyCount) {
            this.dependencyCount--;
            if (this.canLoad) {
                this.load();
            }
        }
    }
    provides(names = []) {
        for (const name of names) {
            let provided = Package.packages.get(name);
            if (!provided) {
                if (!CONFIG.dependencies[name]) {
                    CONFIG.dependencies[name] = [];
                }
                CONFIG.dependencies[name].push(name);
                provided = new Package(name, true);
                provided.isLoading = true;
            }
            this.provided.push(provided);
        }
    }
    addDependent(extension, noLoad) {
        this.dependents.push(extension);
        if (!noLoad) {
            this.checkNoLoad();
        }
    }
    checkNoLoad() {
        if (this.noLoad) {
            this.noLoad = false;
            for (const dependency of this.dependencies) {
                dependency.checkNoLoad();
            }
        }
    }
}
Package.packages = new Map();
//# sourceMappingURL=package.js.map