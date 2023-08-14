import ParseUtil from '../ParseUtil.js';
import TexError from '../TexError.js';
import { Macro, Symbol } from '../Symbol.js';
var NewcommandUtil;
(function (NewcommandUtil) {
    function disassembleSymbol(name, symbol) {
        let newArgs = [name, symbol.char];
        if (symbol.attributes) {
            for (let key in symbol.attributes) {
                newArgs.push(key);
                newArgs.push(symbol.attributes[key]);
            }
        }
        return newArgs;
    }
    NewcommandUtil.disassembleSymbol = disassembleSymbol;
    function assembleSymbol(args) {
        let name = args[0];
        let char = args[1];
        let attrs = {};
        for (let i = 2; i < args.length; i = i + 2) {
            attrs[args[i]] = args[i + 1];
        }
        return new Symbol(name, char, attrs);
    }
    NewcommandUtil.assembleSymbol = assembleSymbol;
    function GetCSname(parser, cmd) {
        let c = parser.GetNext();
        if (c !== '\\') {
            throw new TexError('MissingCS', '%1 must be followed by a control sequence', cmd);
        }
        let cs = ParseUtil.trimSpaces(parser.GetArgument(cmd));
        return cs.substr(1);
    }
    NewcommandUtil.GetCSname = GetCSname;
    function GetCsNameArgument(parser, name) {
        let cs = ParseUtil.trimSpaces(parser.GetArgument(name));
        if (cs.charAt(0) === '\\') {
            cs = cs.substr(1);
        }
        if (!cs.match(/^(.|[a-z]+)$/i)) {
            throw new TexError('IllegalControlSequenceName', 'Illegal control sequence name for %1', name);
        }
        return cs;
    }
    NewcommandUtil.GetCsNameArgument = GetCsNameArgument;
    function GetArgCount(parser, name) {
        let n = parser.GetBrackets(name);
        if (n) {
            n = ParseUtil.trimSpaces(n);
            if (!n.match(/^[0-9]+$/)) {
                throw new TexError('IllegalParamNumber', 'Illegal number of parameters specified in %1', name);
            }
        }
        return n;
    }
    NewcommandUtil.GetArgCount = GetArgCount;
    function GetTemplate(parser, cmd, cs) {
        let c = parser.GetNext();
        let params = [];
        let n = 0;
        let i = parser.i;
        while (parser.i < parser.string.length) {
            c = parser.GetNext();
            if (c === '#') {
                if (i !== parser.i) {
                    params[n] = parser.string.substr(i, parser.i - i);
                }
                c = parser.string.charAt(++parser.i);
                if (!c.match(/^[1-9]$/)) {
                    throw new TexError('CantUseHash2', 'Illegal use of # in template for %1', cs);
                }
                if (parseInt(c) !== ++n) {
                    throw new TexError('SequentialParam', 'Parameters for %1 must be numbered sequentially', cs);
                }
                i = parser.i + 1;
            }
            else if (c === '{') {
                if (i !== parser.i) {
                    params[n] = parser.string.substr(i, parser.i - i);
                }
                if (params.length > 0) {
                    return [n.toString()].concat(params);
                }
                else {
                    return n;
                }
            }
            parser.i++;
        }
        throw new TexError('MissingReplacementString', 'Missing replacement string for definition of %1', cmd);
    }
    NewcommandUtil.GetTemplate = GetTemplate;
    function GetParameter(parser, name, param) {
        if (param == null) {
            return parser.GetArgument(name);
        }
        let i = parser.i;
        let j = 0;
        let hasBraces = 0;
        while (parser.i < parser.string.length) {
            let c = parser.string.charAt(parser.i);
            if (c === '{') {
                if (parser.i === i) {
                    hasBraces = 1;
                }
                parser.GetArgument(name);
                j = parser.i - i;
            }
            else if (MatchParam(parser, param)) {
                if (hasBraces) {
                    i++;
                    j -= 2;
                }
                return parser.string.substr(i, j);
            }
            else if (c === '\\') {
                parser.i++;
                j++;
                hasBraces = 0;
                let match = parser.string.substr(parser.i).match(/[a-z]+|./i);
                if (match) {
                    parser.i += match[0].length;
                    j = parser.i - i;
                }
            }
            else {
                parser.i++;
                j++;
                hasBraces = 0;
            }
        }
        throw new TexError('RunawayArgument', 'Runaway argument for %1?', name);
    }
    NewcommandUtil.GetParameter = GetParameter;
    function MatchParam(parser, param) {
        if (parser.string.substr(parser.i, param.length) !== param) {
            return 0;
        }
        if (param.match(/\\[a-z]+$/i) &&
            parser.string.charAt(parser.i + param.length).match(/[a-z]/i)) {
            return 0;
        }
        parser.i += param.length;
        return 1;
    }
    NewcommandUtil.MatchParam = MatchParam;
    function addDelimiter(parser, cs, char, attr) {
        const handlers = parser.configuration.handlers;
        const handler = handlers.retrieve(NewcommandUtil.NEW_DELIMITER);
        handler.add(cs, new Symbol(cs, char, attr));
    }
    NewcommandUtil.addDelimiter = addDelimiter;
    function addMacro(parser, cs, func, attr, symbol = '') {
        const handlers = parser.configuration.handlers;
        const handler = handlers.retrieve(NewcommandUtil.NEW_COMMAND);
        handler.add(cs, new Macro(symbol ? symbol : cs, func, attr));
    }
    NewcommandUtil.addMacro = addMacro;
    function addEnvironment(parser, env, func, attr) {
        const handlers = parser.configuration.handlers;
        const handler = handlers.retrieve(NewcommandUtil.NEW_ENVIRONMENT);
        handler.add(env, new Macro(env, func, attr));
    }
    NewcommandUtil.addEnvironment = addEnvironment;
    NewcommandUtil.NEW_DELIMITER = 'new-Delimiter';
    NewcommandUtil.NEW_COMMAND = 'new-Command';
    NewcommandUtil.NEW_ENVIRONMENT = 'new-Environment';
})(NewcommandUtil || (NewcommandUtil = {}));
export default NewcommandUtil;
//# sourceMappingURL=NewcommandUtil.js.map