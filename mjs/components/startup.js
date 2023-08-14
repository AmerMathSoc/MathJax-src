import { MathJax as MJGlobal, combineWithMathJax, combineDefaults, GLOBAL as global } from './global.js';
import { PrioritizedList } from '../util/PrioritizedList.js';
import { OPTIONS } from '../util/Options.js';
export var Startup;
(function (Startup) {
    const extensions = new PrioritizedList();
    let visitor;
    let mathjax;
    Startup.constructors = {};
    Startup.input = [];
    Startup.output = null;
    Startup.handler = null;
    Startup.adaptor = null;
    Startup.elements = null;
    Startup.document = null;
    Startup.promise = new Promise((resolve, reject) => {
        Startup.promiseResolve = resolve;
        Startup.promiseReject = reject;
    });
    Startup.pagePromise = new Promise((resolve, _reject) => {
        const doc = global.document;
        if (!doc || !doc.readyState || doc.readyState === 'complete' || doc.readyState === 'interactive') {
            resolve();
        }
        else {
            const listener = () => resolve();
            doc.defaultView.addEventListener('load', listener, true);
            doc.defaultView.addEventListener('DOMContentLoaded', listener, true);
        }
    });
    function toMML(node) {
        return visitor.visitTree(node, Startup.document);
    }
    Startup.toMML = toMML;
    function registerConstructor(name, constructor) {
        Startup.constructors[name] = constructor;
    }
    Startup.registerConstructor = registerConstructor;
    function useHandler(name, force = false) {
        if (!CONFIG.handler || force) {
            CONFIG.handler = name;
        }
    }
    Startup.useHandler = useHandler;
    function useAdaptor(name, force = false) {
        if (!CONFIG.adaptor || force) {
            CONFIG.adaptor = name;
        }
    }
    Startup.useAdaptor = useAdaptor;
    function useInput(name, force = false) {
        if (!inputSpecified || force) {
            CONFIG.input.push(name);
        }
    }
    Startup.useInput = useInput;
    function useOutput(name, force = false) {
        if (!CONFIG.output || force) {
            CONFIG.output = name;
        }
    }
    Startup.useOutput = useOutput;
    function extendHandler(extend, priority = 10) {
        extensions.add(extend, priority);
    }
    Startup.extendHandler = extendHandler;
    function defaultReady() {
        getComponents();
        makeMethods();
        Startup.pagePromise
            .then(() => CONFIG.pageReady())
            .then(() => Startup.promiseResolve())
            .catch((err) => Startup.promiseReject(err));
    }
    Startup.defaultReady = defaultReady;
    function defaultPageReady() {
        return (CONFIG.loadAllFontFiles && Startup.output.font ?
            Startup.output.font.loadDynamicFiles() : Promise.resolve())
            .then(CONFIG.typeset && MathJax.typesetPromise ?
            typesetPromise(CONFIG.elements) :
            Promise.resolve());
    }
    Startup.defaultPageReady = defaultPageReady;
    function typesetPromise(elements) {
        Startup.document.options.elements = elements;
        Startup.document.reset();
        return mathjax.handleRetriesFor(() => {
            Startup.document.render();
        });
    }
    Startup.typesetPromise = typesetPromise;
    function getComponents() {
        visitor = new MathJax._.core.MmlTree.SerializedMmlVisitor.SerializedMmlVisitor();
        mathjax = MathJax._.mathjax.mathjax;
        Startup.input = getInputJax();
        Startup.output = getOutputJax();
        Startup.adaptor = getAdaptor();
        if (Startup.handler) {
            mathjax.handlers.unregister(Startup.handler);
        }
        Startup.handler = getHandler();
        if (Startup.handler) {
            mathjax.handlers.register(Startup.handler);
            Startup.document = getDocument();
        }
    }
    Startup.getComponents = getComponents;
    function makeMethods() {
        if (Startup.input && Startup.output) {
            makeTypesetMethods();
        }
        const oname = (Startup.output ? Startup.output.name.toLowerCase() : '');
        for (const jax of Startup.input) {
            const iname = jax.name.toLowerCase();
            makeMmlMethods(iname, jax);
            makeResetMethod(iname, jax);
            if (Startup.output) {
                makeOutputMethods(iname, oname, jax);
            }
        }
    }
    Startup.makeMethods = makeMethods;
    function makeTypesetMethods() {
        MathJax.typeset = (elements = null) => {
            Startup.document.options.elements = elements;
            Startup.document.reset();
            Startup.document.render();
        };
        MathJax.typesetPromise = (elements = null) => {
            Startup.promise = Startup.promise.then(() => typesetPromise(elements));
            return Startup.promise;
        };
        MathJax.typesetClear = (elements = null) => {
            if (elements) {
                Startup.document.clearMathItemsWithin(elements);
            }
            else {
                Startup.document.clear();
            }
        };
    }
    Startup.makeTypesetMethods = makeTypesetMethods;
    function makeOutputMethods(iname, oname, input) {
        const name = iname + '2' + oname;
        MathJax[name] =
            (math, options = {}) => {
                options.format = input.name;
                return Startup.document.convert(math, options);
            };
        MathJax[name + 'Promise'] =
            (math, options = {}) => {
                Startup.promise = Startup.promise.then(() => {
                    options.format = input.name;
                    return mathjax.handleRetriesFor(() => Startup.document.convert(math, options));
                });
                return Startup.promise;
            };
        MathJax[oname + 'Stylesheet'] = () => Startup.output.styleSheet(Startup.document);
        if ('getMetricsFor' in Startup.output) {
            MathJax.getMetricsFor = (node, display) => {
                return Startup.output.getMetricsFor(node, display);
            };
        }
    }
    Startup.makeOutputMethods = makeOutputMethods;
    function makeMmlMethods(name, input) {
        const STATE = MathJax._.core.MathItem.STATE;
        MathJax[name + '2mml'] =
            (math, options = {}) => {
                options.end = STATE.CONVERT;
                options.format = input.name;
                return toMML(Startup.document.convert(math, options));
            };
        MathJax[name + '2mmlPromise'] =
            (math, options = {}) => {
                Startup.promise = Startup.promise.then(() => {
                    options.end = STATE.CONVERT;
                    options.format = input.name;
                    return mathjax.handleRetriesFor(() => toMML(Startup.document.convert(math, options)));
                });
                return Startup.promise;
            };
    }
    Startup.makeMmlMethods = makeMmlMethods;
    function makeResetMethod(name, input) {
        MathJax[name + 'Reset'] = (...args) => input.reset(...args);
    }
    Startup.makeResetMethod = makeResetMethod;
    function getInputJax() {
        const jax = [];
        for (const name of CONFIG.input) {
            const inputClass = Startup.constructors[name];
            if (inputClass) {
                jax[name] = new inputClass(MathJax.config[name]);
                jax.push(jax[name]);
            }
            else {
                throw Error('Input Jax "' + name + '" is not defined (has it been loaded?)');
            }
        }
        return jax;
    }
    Startup.getInputJax = getInputJax;
    function getOutputJax() {
        const name = CONFIG.output;
        if (!name)
            return null;
        const outputClass = Startup.constructors[name];
        if (!outputClass) {
            throw Error('Output Jax "' + name + '" is not defined (has it been loaded?)');
        }
        return new outputClass(MathJax.config[name]);
    }
    Startup.getOutputJax = getOutputJax;
    function getAdaptor() {
        const name = CONFIG.adaptor;
        if (!name || name === 'none')
            return null;
        const adaptor = Startup.constructors[name];
        if (!adaptor) {
            throw Error('DOMAdaptor "' + name + '" is not defined (has it been loaded?)');
        }
        return adaptor(MathJax.config[name]);
    }
    Startup.getAdaptor = getAdaptor;
    function getHandler() {
        const name = CONFIG.handler;
        if (!name || name === 'none' || !Startup.adaptor)
            return null;
        const handlerClass = Startup.constructors[name];
        if (!handlerClass) {
            throw Error('Handler "' + name + '" is not defined (has it been loaded?)');
        }
        let handler = new handlerClass(Startup.adaptor, 5);
        for (const extend of extensions) {
            handler = extend.item(handler);
        }
        return handler;
    }
    Startup.getHandler = getHandler;
    function getDocument(root = null) {
        return mathjax.document(root || CONFIG.document, Object.assign(Object.assign({}, MathJax.config.options), { InputJax: Startup.input, OutputJax: Startup.output }));
    }
    Startup.getDocument = getDocument;
})(Startup || (Startup = {}));
export const MathJax = MJGlobal;
if (typeof MathJax._.startup === 'undefined') {
    combineDefaults(MathJax.config, 'startup', {
        input: [],
        output: '',
        handler: null,
        adaptor: null,
        document: (typeof document === 'undefined' ? '' : document),
        elements: null,
        typeset: true,
        ready: Startup.defaultReady.bind(Startup),
        pageReady: Startup.defaultPageReady.bind(Startup)
    });
    combineWithMathJax({
        startup: Startup,
        options: {}
    });
    if (MathJax.config.startup.invalidOption) {
        OPTIONS.invalidOption = MathJax.config.startup.invalidOption;
    }
    if (MathJax.config.startup.optionError) {
        OPTIONS.optionError = MathJax.config.startup.optionError;
    }
}
export const CONFIG = MathJax.config.startup;
const inputSpecified = CONFIG.input.length !== 0;
//# sourceMappingURL=startup.js.map