import { userOptions, defaultOptions } from '../../util/Options.js';
import { SubHandlers } from './MapHandler.js';
import { FunctionList } from '../../util/FunctionList.js';
import { PrioritizedList } from '../../util/PrioritizedList.js';
import { TagsFactory } from './Tags.js';
export class Configuration {
    static makeProcessor(func, priority) {
        return Array.isArray(func) ? func : [func, priority];
    }
    static _create(name, config = {}) {
        let priority = config.priority || PrioritizedList.DEFAULTPRIORITY;
        let init = config.init ? this.makeProcessor(config.init, priority) : null;
        let conf = config.config ? this.makeProcessor(config.config, priority) : null;
        let preprocessors = (config.preprocessors || []).map(pre => this.makeProcessor(pre, priority));
        let postprocessors = (config.postprocessors || []).map(post => this.makeProcessor(post, priority));
        let parser = config.parser || 'tex';
        return new Configuration(name, config.handler || {}, config.fallback || {}, config.items || {}, config.tags || {}, config.options || {}, config.nodes || {}, preprocessors, postprocessors, init, conf, priority, parser);
    }
    static create(name, config = {}) {
        let configuration = Configuration._create(name, config);
        ConfigurationHandler.set(name, configuration);
        return configuration;
    }
    static local(config = {}) {
        return Configuration._create('', config);
    }
    constructor(name, handler = {}, fallback = {}, items = {}, tags = {}, options = {}, nodes = {}, preprocessors = [], postprocessors = [], initMethod = null, configMethod = null, priority, parser) {
        this.name = name;
        this.handler = handler;
        this.fallback = fallback;
        this.items = items;
        this.tags = tags;
        this.options = options;
        this.nodes = nodes;
        this.preprocessors = preprocessors;
        this.postprocessors = postprocessors;
        this.initMethod = initMethod;
        this.configMethod = configMethod;
        this.priority = priority;
        this.parser = parser;
        this.handler = Object.assign({ character: [], delimiter: [], macro: [], environment: [] }, handler);
    }
    get init() {
        return this.initMethod ? this.initMethod[0] : null;
    }
    get config() {
        return this.configMethod ? this.configMethod[0] : null;
    }
}
export var ConfigurationHandler;
(function (ConfigurationHandler) {
    let maps = new Map();
    ConfigurationHandler.set = function (name, map) {
        maps.set(name, map);
    };
    ConfigurationHandler.get = function (name) {
        return maps.get(name);
    };
    ConfigurationHandler.keys = function () {
        return maps.keys();
    };
})(ConfigurationHandler || (ConfigurationHandler = {}));
export class ParserConfiguration {
    constructor(packages, parsers = ['tex']) {
        this.initMethod = new FunctionList();
        this.configMethod = new FunctionList();
        this.configurations = new PrioritizedList();
        this.parsers = [];
        this.handlers = new SubHandlers();
        this.items = {};
        this.tags = {};
        this.options = {};
        this.nodes = {};
        this.parsers = parsers;
        for (const pkg of packages.slice().reverse()) {
            this.addPackage(pkg);
        }
        for (let { item: config, priority: priority } of this.configurations) {
            this.append(config, priority);
        }
    }
    init() {
        this.initMethod.execute(this);
    }
    config(jax) {
        this.configMethod.execute(this, jax);
        for (const config of this.configurations) {
            this.addFilters(jax, config.item);
        }
    }
    addPackage(pkg) {
        const name = typeof pkg === 'string' ? pkg : pkg[0];
        const conf = this.getPackage(name);
        conf && this.configurations.add(conf, typeof pkg === 'string' ? conf.priority : pkg[1]);
    }
    add(name, jax, options = {}) {
        const config = this.getPackage(name);
        this.append(config);
        this.configurations.add(config, config.priority);
        this.init();
        const parser = jax.parseOptions;
        parser.nodeFactory.setCreators(config.nodes);
        for (const kind of Object.keys(config.items)) {
            parser.itemFactory.setNodeClass(kind, config.items[kind]);
        }
        TagsFactory.addTags(config.tags);
        defaultOptions(parser.options, config.options);
        userOptions(parser.options, options);
        this.addFilters(jax, config);
        if (config.config) {
            config.config(this, jax);
        }
    }
    getPackage(name) {
        const config = ConfigurationHandler.get(name);
        if (config && this.parsers.indexOf(config.parser) < 0) {
            throw Error(`Package ${name} doesn't target the proper parser`);
        }
        return config;
    }
    append(config, priority) {
        priority = priority || config.priority;
        if (config.initMethod) {
            this.initMethod.add(config.initMethod[0], config.initMethod[1]);
        }
        if (config.configMethod) {
            this.configMethod.add(config.configMethod[0], config.configMethod[1]);
        }
        this.handlers.add(config.handler, config.fallback, priority);
        Object.assign(this.items, config.items);
        Object.assign(this.tags, config.tags);
        defaultOptions(this.options, config.options);
        Object.assign(this.nodes, config.nodes);
    }
    addFilters(jax, config) {
        for (const [pre, priority] of config.preprocessors) {
            jax.preFilters.add(pre, priority);
        }
        for (const [post, priority] of config.postprocessors) {
            jax.postFilters.add(post, priority);
        }
    }
}
//# sourceMappingURL=Configuration.js.map