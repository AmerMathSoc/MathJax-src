import { AbstractInputJax } from '../core/InputJax.js';
import { userOptions, separateOptions } from '../util/Options.js';
import { FindTeX } from './tex/FindTeX.js';
import FilterUtil from './tex/FilterUtil.js';
import NodeUtil from './tex/NodeUtil.js';
import TexParser from './tex/TexParser.js';
import TexError from './tex/TexError.js';
import ParseOptions from './tex/ParseOptions.js';
import { TagsFactory } from './tex/Tags.js';
import { ParserConfiguration } from './tex/Configuration.js';
import './tex/base/BaseConfiguration.js';
export class TeX extends AbstractInputJax {
    static configure(packages) {
        let configuration = new ParserConfiguration(packages, ['tex']);
        configuration.init();
        return configuration;
    }
    static tags(options, configuration) {
        TagsFactory.addTags(configuration.tags);
        TagsFactory.setDefault(options.options.tags);
        options.tags = TagsFactory.getDefault();
        options.tags.configuration = options;
    }
    constructor(options = {}) {
        const [rest, tex, find] = separateOptions(options, TeX.OPTIONS, FindTeX.OPTIONS);
        super(tex);
        this.findTeX = this.options['FindTeX'] || new FindTeX(find);
        const packages = this.options.packages;
        const configuration = this.configuration = TeX.configure(packages);
        const parseOptions = this._parseOptions =
            new ParseOptions(configuration, [this.options, TagsFactory.OPTIONS]);
        userOptions(parseOptions.options, rest);
        configuration.config(this);
        TeX.tags(parseOptions, configuration);
        this.postFilters.add(FilterUtil.cleanSubSup, -6);
        this.postFilters.add(FilterUtil.setInherited, -5);
        this.postFilters.add(FilterUtil.moveLimits, -4);
        this.postFilters.add(FilterUtil.cleanStretchy, -3);
        this.postFilters.add(FilterUtil.cleanAttributes, -2);
        this.postFilters.add(FilterUtil.combineRelations, -1);
    }
    setMmlFactory(mmlFactory) {
        super.setMmlFactory(mmlFactory);
        this._parseOptions.nodeFactory.setMmlFactory(mmlFactory);
    }
    get parseOptions() {
        return this._parseOptions;
    }
    reset(tag = 0) {
        this.parseOptions.tags.reset(tag);
    }
    compile(math, document) {
        this.parseOptions.clear();
        this.parseOptions.mathItem = math;
        this.executeFilters(this.preFilters, math, document, this.parseOptions);
        this.latex = math.math;
        let node;
        this.parseOptions.tags.startEquation(math);
        let globalEnv;
        let parser;
        try {
            parser = new TexParser(this.latex, { display: math.display, isInner: false }, this.parseOptions);
            node = parser.mml();
            globalEnv = parser.stack.global;
        }
        catch (err) {
            if (!(err instanceof TexError)) {
                throw err;
            }
            this.parseOptions.error = true;
            node = this.options.formatError(this, err);
        }
        node = this.parseOptions.nodeFactory.create('node', 'math', [node]);
        if (globalEnv === null || globalEnv === void 0 ? void 0 : globalEnv.indentalign) {
            NodeUtil.setAttribute(node, 'indentalign', globalEnv.indentalign);
        }
        if (math.display) {
            NodeUtil.setAttribute(node, 'display', 'block');
        }
        this.parseOptions.tags.finishEquation(math);
        this.parseOptions.root = node;
        this.executeFilters(this.postFilters, math, document, this.parseOptions);
        if (parser && parser.stack.env.hsize) {
            NodeUtil.setAttribute(node, 'maxwidth', parser.stack.env.hsize);
            NodeUtil.setAttribute(node, 'overflow', 'linebreak');
        }
        this.mathNode = this.parseOptions.root;
        return this.mathNode;
    }
    findMath(strings) {
        return this.findTeX.findMath(strings);
    }
    formatError(err) {
        let message = err.message.replace(/\n.*/, '');
        return this.parseOptions.nodeFactory.create('error', message, err.id, this.latex);
    }
}
TeX.NAME = 'TeX';
TeX.OPTIONS = Object.assign(Object.assign({}, AbstractInputJax.OPTIONS), { FindTeX: null, packages: ['base'], digits: /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/, maxBuffer: 5 * 1024, mathStyle: 'TeX', formatError: (jax, err) => jax.formatError(err) });
//# sourceMappingURL=tex.js.map