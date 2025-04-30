import { HandlerType } from '../HandlerTypes.js';
import { SubHandler } from '../MapHandler.js';
import { UnitUtil } from '../UnitUtil.js';
import TexError from '../TexError.js';
import { Macro, Token } from '../Token.js';
export var NewcommandTables;
(function (NewcommandTables) {
    NewcommandTables["NEW_DELIMITER"] = "new-Delimiter";
    NewcommandTables["NEW_COMMAND"] = "new-Command";
    NewcommandTables["NEW_ENVIRONMENT"] = "new-Environment";
})(NewcommandTables || (NewcommandTables = {}));
export const NewcommandPriority = -100;
export const NewcommandUtil = {
    GetCSname(parser, cmd) {
        const c = parser.GetNext();
        if (c !== '\\') {
            throw new TexError('MissingCS', '%1 must be followed by a control sequence', cmd);
        }
        const cs = UnitUtil.trimSpaces(parser.GetArgument(cmd)).substring(1);
        this.checkProtectedMacros(parser, cs);
        return cs;
    },
    GetCsNameArgument(parser, name) {
        let cs = UnitUtil.trimSpaces(parser.GetArgument(name));
        if (cs.charAt(0) === '\\') {
            cs = cs.substring(1);
        }
        if (!cs.match(/^(.|[a-z]+)$/i)) {
            throw new TexError('IllegalControlSequenceName', 'Illegal control sequence name for %1', name);
        }
        this.checkProtectedMacros(parser, cs);
        return cs;
    },
    GetArgCount(parser, name) {
        let n = parser.GetBrackets(name);
        if (n) {
            n = UnitUtil.trimSpaces(n);
            if (!n.match(/^[0-9]+$/)) {
                throw new TexError('IllegalParamNumber', 'Illegal number of parameters specified in %1', name);
            }
        }
        return n;
    },
    GetTemplate(parser, cmd, cs) {
        let c = parser.GetNext();
        const params = [];
        let n = 0;
        let i = parser.i;
        while (parser.i < parser.string.length) {
            c = parser.GetNext();
            if (c === '#') {
                if (i !== parser.i) {
                    params[n] = parser.string.substring(i, parser.i);
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
                    params[n] = parser.string.substring(i, parser.i);
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
    },
    GetParameter(parser, name, param) {
        if (param == null) {
            return parser.GetArgument(name);
        }
        let i = parser.i;
        let j = 0;
        let hasBraces = 0;
        while (parser.i < parser.string.length) {
            const c = parser.string.charAt(parser.i);
            if (c === '{') {
                if (parser.i === i) {
                    hasBraces = 1;
                }
                parser.GetArgument(name);
                j = parser.i - i;
            }
            else if (this.MatchParam(parser, param)) {
                if (hasBraces) {
                    i++;
                    j -= 2;
                }
                return parser.string.substring(i, i + j);
            }
            else if (c === '\\') {
                parser.i++;
                j++;
                hasBraces = 0;
                const match = parser.string.substring(parser.i).match(/[a-z]+|./i);
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
    },
    MatchParam(parser, param) {
        if (parser.string.substring(parser.i, parser.i + param.length) !== param) {
            return 0;
        }
        if (param.match(/\\[a-z]+$/i) &&
            parser.string.charAt(parser.i + param.length).match(/[a-z]/i)) {
            return 0;
        }
        parser.i += param.length;
        return 1;
    },
    checkGlobal(parser, tokens, maps) {
        return (parser.stack.env.isGlobal
            ? parser.configuration.packageData
                .get('begingroup')
                .stack.checkGlobal(tokens, maps)
            : maps.map((name) => parser.configuration.handlers.retrieve(name)));
    },
    checkProtectedMacros(parser, cs) {
        var _a;
        if ((_a = parser.options.protectedMacros) === null || _a === void 0 ? void 0 : _a.includes(cs)) {
            throw new TexError('ProtectedMacro', "The control sequence %1 can't be redefined", `\\${cs}`);
        }
    },
    addDelimiter(parser, cs, char, attr) {
        const name = cs.substring(1);
        this.checkProtectedMacros(parser, name);
        const [macros, delims] = NewcommandUtil.checkGlobal(parser, [name, cs], [NewcommandTables.NEW_COMMAND, NewcommandTables.NEW_DELIMITER]);
        if (name !== cs) {
            macros.remove(name);
        }
        delims.add(cs, new Token(cs, char, attr));
        delete parser.stack.env.isGlobal;
    },
    addMacro(parser, cs, func, attr, token = '') {
        this.checkProtectedMacros(parser, cs);
        const macros = NewcommandUtil.checkGlobal(parser, [cs], [NewcommandTables.NEW_COMMAND])[0];
        this.undefineDelimiter(parser, '\\' + cs);
        macros.add(cs, new Macro(token ? token : cs, func, attr));
        delete parser.stack.env.isGlobal;
    },
    addEnvironment(parser, env, func, attr) {
        const envs = NewcommandUtil.checkGlobal(parser, [env], [NewcommandTables.NEW_ENVIRONMENT])[0];
        envs.add(env, new Macro(env, func, attr));
        delete parser.stack.env.isGlobal;
    },
    undefineMacro(parser, cs) {
        const macros = NewcommandUtil.checkGlobal(parser, [cs], [NewcommandTables.NEW_COMMAND])[0];
        macros.remove(cs);
        if (parser.configuration.handlers.get(HandlerType.MACRO).applicable(cs)) {
            macros.add(cs, new Macro(cs, () => SubHandler.FALLBACK, []));
            this.undefineDelimiter(parser, '\\' + cs);
        }
        delete parser.stack.env.isGlobal;
    },
    undefineDelimiter(parser, cs) {
        const delims = NewcommandUtil.checkGlobal(parser, [cs], [NewcommandTables.NEW_DELIMITER])[0];
        delims.remove(cs);
        if (parser.configuration.handlers.get(HandlerType.DELIMITER).applicable(cs)) {
            delims.add(cs, new Token(cs, null, {}));
        }
        delete parser.stack.env.isGlobal;
    },
};
//# sourceMappingURL=NewcommandUtil.js.map