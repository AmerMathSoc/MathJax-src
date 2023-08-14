import TexError from '../TexError.js';
import * as sm from '../SymbolMap.js';
import BaseMethods from '../base/BaseMethods.js';
import ParseUtil from '../ParseUtil.js';
import NewcommandUtil from './NewcommandUtil.js';
let NewcommandMethods = {};
NewcommandMethods.NewCommand = function (parser, name) {
    let cs = NewcommandUtil.GetCsNameArgument(parser, name);
    let n = NewcommandUtil.GetArgCount(parser, name);
    let opt = parser.GetBrackets(name);
    let def = parser.GetArgument(name);
    NewcommandUtil.addMacro(parser, cs, NewcommandMethods.Macro, [def, n, opt]);
};
NewcommandMethods.NewEnvironment = function (parser, name) {
    let env = ParseUtil.trimSpaces(parser.GetArgument(name));
    let n = NewcommandUtil.GetArgCount(parser, name);
    let opt = parser.GetBrackets(name);
    let bdef = parser.GetArgument(name);
    let edef = parser.GetArgument(name);
    NewcommandUtil.addEnvironment(parser, env, NewcommandMethods.BeginEnv, [true, bdef, edef, n, opt]);
};
NewcommandMethods.MacroDef = function (parser, name) {
    let cs = NewcommandUtil.GetCSname(parser, name);
    let params = NewcommandUtil.GetTemplate(parser, name, '\\' + cs);
    let def = parser.GetArgument(name);
    !(params instanceof Array) ?
        NewcommandUtil.addMacro(parser, cs, NewcommandMethods.Macro, [def, params]) :
        NewcommandUtil.addMacro(parser, cs, NewcommandMethods.MacroWithTemplate, [def].concat(params));
};
NewcommandMethods.Let = function (parser, name) {
    const cs = NewcommandUtil.GetCSname(parser, name);
    let c = parser.GetNext();
    if (c === '=') {
        parser.i++;
        c = parser.GetNext();
    }
    const handlers = parser.configuration.handlers;
    if (c === '\\') {
        name = NewcommandUtil.GetCSname(parser, name);
        let macro = handlers.get('delimiter').lookup('\\' + name);
        if (macro) {
            NewcommandUtil.addDelimiter(parser, '\\' + cs, macro.char, macro.attributes);
            return;
        }
        const map = handlers.get('macro').applicable(name);
        if (!map) {
            return;
        }
        if (map instanceof sm.MacroMap) {
            const macro = map.lookup(name);
            NewcommandUtil.addMacro(parser, cs, macro.func, macro.args, macro.symbol);
            return;
        }
        macro = map.lookup(name);
        const newArgs = NewcommandUtil.disassembleSymbol(cs, macro);
        const method = (p, _cs, ...rest) => {
            const symb = NewcommandUtil.assembleSymbol(rest);
            return map.parser(p, symb);
        };
        NewcommandUtil.addMacro(parser, cs, method, newArgs);
        return;
    }
    parser.i++;
    const macro = handlers.get('delimiter').lookup(c);
    if (macro) {
        NewcommandUtil.addDelimiter(parser, '\\' + cs, macro.char, macro.attributes);
        return;
    }
    NewcommandUtil.addMacro(parser, cs, NewcommandMethods.Macro, [c]);
};
NewcommandMethods.MacroWithTemplate = function (parser, name, text, n, ...params) {
    const argCount = parseInt(n, 10);
    if (params.length) {
        let args = [];
        parser.GetNext();
        if (params[0] && !NewcommandUtil.MatchParam(parser, params[0])) {
            throw new TexError('MismatchUseDef', 'Use of %1 doesn\'t match its definition', name);
        }
        if (argCount) {
            for (let i = 0; i < argCount; i++) {
                args.push(NewcommandUtil.GetParameter(parser, name, params[i + 1]));
            }
            text = ParseUtil.substituteArgs(parser, args, text);
        }
    }
    parser.string = ParseUtil.addArgs(parser, text, parser.string.slice(parser.i));
    parser.i = 0;
    ParseUtil.checkMaxMacros(parser);
};
NewcommandMethods.BeginEnv = function (parser, begin, bdef, edef, n, def) {
    const name = begin.getName();
    if (begin.getProperty('end') && parser.stack.env['closing'] === name) {
        delete parser.stack.env['closing'];
        if (edef && parser.stack.env['processing'] !== name) {
            parser.stack.env['processing'] = name;
            parser.string = ParseUtil.addArgs(parser, `${edef}\\end{${begin.getName()}}`, parser.string.slice(parser.i));
            parser.i = 0;
            return null;
        }
        delete parser.stack.env['processing'];
        return parser.itemFactory.create('end').setProperty('name', name);
    }
    if (n) {
        let args = [];
        if (def != null) {
            let optional = parser.GetBrackets('\\begin{' + begin.getName() + '}');
            args.push(optional == null ? def : optional);
        }
        for (let i = args.length; i < n; i++) {
            args.push(parser.GetArgument('\\begin{' + begin.getName() + '}'));
        }
        bdef = ParseUtil.substituteArgs(parser, args, bdef);
        edef = ParseUtil.substituteArgs(parser, [], edef);
    }
    parser.string = ParseUtil.addArgs(parser, bdef, parser.string.slice(parser.i));
    parser.i = 0;
    return parser.itemFactory.create('beginEnv').setProperty('name', begin.getName());
};
NewcommandMethods.Macro = BaseMethods.Macro;
export default NewcommandMethods;
//# sourceMappingURL=NewcommandMethods.js.map