import { userOptions, defaultOptions } from '../util/Options.js';
import { FunctionList } from '../util/FunctionList.js';
export class AbstractOutputJax {
    constructor(options = {}) {
        this.adaptor = null;
        const CLASS = this.constructor;
        this.options = userOptions(defaultOptions({}, CLASS.OPTIONS), options);
        this.postFilters = new FunctionList();
    }
    get name() {
        return this.constructor.NAME;
    }
    setAdaptor(adaptor) {
        this.adaptor = adaptor;
    }
    initialize() { }
    reset(..._args) { }
    getMetrics(_document) { }
    styleSheet(_document) {
        return null;
    }
    pageElements(_document) {
        return null;
    }
    executeFilters(filters, math, document, data) {
        const args = { math, document, data };
        filters.execute(args);
        return args.data;
    }
}
AbstractOutputJax.NAME = 'generic';
AbstractOutputJax.OPTIONS = {};
//# sourceMappingURL=OutputJax.js.map