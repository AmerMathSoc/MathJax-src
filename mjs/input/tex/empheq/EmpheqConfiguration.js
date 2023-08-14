import { Configuration } from '../Configuration.js';
import { CommandMap, EnvironmentMap } from '../SymbolMap.js';
import ParseUtil from '../ParseUtil.js';
import TexError from '../TexError.js';
import { BeginItem } from '../base/BaseItems.js';
import { EmpheqUtil } from './EmpheqUtil.js';
export class EmpheqBeginItem extends BeginItem {
    get kind() {
        return 'empheq-begin';
    }
    checkItem(item) {
        if (item.isKind('end') && item.getName() === this.getName()) {
            this.setProperty('end', false);
        }
        return super.checkItem(item);
    }
}
export const EmpheqMethods = {
    Empheq(parser, begin) {
        if (parser.stack.env.closing === begin.getName()) {
            delete parser.stack.env.closing;
            parser.Push(parser.itemFactory.create('end').setProperty('name', parser.stack.global.empheq));
            parser.stack.global.empheq = '';
            const empheq = parser.stack.Top();
            EmpheqUtil.adjustTable(empheq, parser);
            parser.Push(parser.itemFactory.create('end').setProperty('name', 'empheq'));
        }
        else {
            ParseUtil.checkEqnEnv(parser);
            const opts = parser.GetBrackets('\\begin{' + begin.getName() + '}') || '';
            const [env, n] = (parser.GetArgument('\\begin{' + begin.getName() + '}') || '').split(/=/);
            if (!EmpheqUtil.checkEnv(env)) {
                throw new TexError('UnknownEnv', 'Unknown environment "%1"', env);
            }
            begin.setProperty('nestable', true);
            if (opts) {
                begin.setProperties(EmpheqUtil.splitOptions(opts, { left: 1, right: 1 }));
            }
            parser.stack.global.empheq = env;
            parser.string = '\\begin{' + env + '}' + (n ? '{' + n + '}' : '') + parser.string.slice(parser.i);
            parser.i = 0;
            parser.Push(begin);
        }
    },
    EmpheqMO(parser, _name, c) {
        parser.Push(parser.create('token', 'mo', {}, c));
    },
    EmpheqDelim(parser, name) {
        const c = parser.GetDelimiter(name);
        parser.Push(parser.create('token', 'mo', { stretchy: true, symmetric: true }, c));
    }
};
new EnvironmentMap('empheq-env', EmpheqUtil.environment, {
    empheq: ['Empheq', 'empheq'],
}, EmpheqMethods);
new CommandMap('empheq-macros', {
    empheqlbrace: ['EmpheqMO', '{'],
    empheqrbrace: ['EmpheqMO', '}'],
    empheqlbrack: ['EmpheqMO', '['],
    empheqrbrack: ['EmpheqMO', ']'],
    empheqlangle: ['EmpheqMO', '\u27E8'],
    empheqrangle: ['EmpheqMO', '\u27E9'],
    empheqlparen: ['EmpheqMO', '('],
    empheqrparen: ['EmpheqMO', ')'],
    empheqlvert: ['EmpheqMO', '|'],
    empheqrvert: ['EmpheqMO', '|'],
    empheqlVert: ['EmpheqMO', '\u2016'],
    empheqrVert: ['EmpheqMO', '\u2016'],
    empheqlfloor: ['EmpheqMO', '\u230A'],
    empheqrfloor: ['EmpheqMO', '\u230B'],
    empheqlceil: ['EmpheqMO', '\u2308'],
    empheqrceil: ['EmpheqMO', '\u2309'],
    empheqbiglbrace: ['EmpheqMO', '{'],
    empheqbigrbrace: ['EmpheqMO', '}'],
    empheqbiglbrack: ['EmpheqMO', '['],
    empheqbigrbrack: ['EmpheqMO', ']'],
    empheqbiglangle: ['EmpheqMO', '\u27E8'],
    empheqbigrangle: ['EmpheqMO', '\u27E9'],
    empheqbiglparen: ['EmpheqMO', '('],
    empheqbigrparen: ['EmpheqMO', ')'],
    empheqbiglvert: ['EmpheqMO', '|'],
    empheqbigrvert: ['EmpheqMO', '|'],
    empheqbiglVert: ['EmpheqMO', '\u2016'],
    empheqbigrVert: ['EmpheqMO', '\u2016'],
    empheqbiglfloor: ['EmpheqMO', '\u230A'],
    empheqbigrfloor: ['EmpheqMO', '\u230B'],
    empheqbiglceil: ['EmpheqMO', '\u2308'],
    empheqbigrceil: ['EmpheqMO', '\u2309'],
    empheql: 'EmpheqDelim',
    empheqr: 'EmpheqDelim',
    empheqbigl: 'EmpheqDelim',
    empheqbigr: 'EmpheqDelim'
}, EmpheqMethods);
export const EmpheqConfiguration = Configuration.create('empheq', {
    handler: {
        macro: ['empheq-macros'],
        environment: ['empheq-env'],
    },
    items: {
        [EmpheqBeginItem.prototype.kind]: EmpheqBeginItem
    }
});
//# sourceMappingURL=EmpheqConfiguration.js.map