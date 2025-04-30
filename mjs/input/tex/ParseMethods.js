import { HandlerType } from './HandlerTypes.js';
import NodeUtil from './NodeUtil.js';
import { TexConstant } from './TexConstants.js';
import { ParseUtil } from './ParseUtil.js';
const MATHVARIANT = TexConstant.Variant;
const ParseMethods = {
    variable(parser, c) {
        var _a;
        const def = ParseUtil.getFontDef(parser);
        const env = parser.stack.env;
        if (env.multiLetterIdentifiers && env.font !== '') {
            c =
                ((_a = parser.string
                    .substring(parser.i - 1)
                    .match(env.multiLetterIdentifiers)) === null || _a === void 0 ? void 0 : _a[0]) || c;
            parser.i += c.length - 1;
            if (def.mathvariant === MATHVARIANT.NORMAL &&
                env.noAutoOP &&
                c.length > 1) {
                def.autoOP = false;
            }
        }
        if (!def.mathvariant && ParseUtil.isLatinOrGreekChar(c)) {
            const variant = parser.configuration.mathStyle(c);
            if (variant) {
                def.mathvariant = variant;
            }
        }
        const node = parser.create('token', 'mi', def, c);
        parser.Push(node);
    },
    digit(parser, _c) {
        const pattern = parser.configuration.options['numberPattern'];
        const n = parser.string.slice(parser.i - 1).match(pattern);
        const def = ParseUtil.getFontDef(parser);
        if (!n) {
            return false;
        }
        const mml = parser.create('token', 'mn', def, n[0].replace(/[{}]/g, ''));
        parser.i += n[0].length - 1;
        parser.Push(mml);
        return true;
    },
    controlSequence(parser, _c) {
        const name = parser.GetCS();
        parser.parse(HandlerType.MACRO, [parser, name]);
    },
    lcGreek(parser, mchar) {
        const def = {
            mathvariant: parser.configuration.mathStyle(mchar.char) || MATHVARIANT.ITALIC,
        };
        const node = parser.create('token', 'mi', def, mchar.char);
        parser.Push(node);
    },
    ucGreek(parser, mchar) {
        const def = {
            mathvariant: parser.stack.env['font'] ||
                parser.configuration.mathStyle(mchar.char, true) ||
                MATHVARIANT.NORMAL,
        };
        const node = parser.create('token', 'mi', def, mchar.char);
        parser.Push(node);
    },
    mathchar0mi(parser, mchar) {
        const def = mchar.attributes || { mathvariant: MATHVARIANT.ITALIC };
        const node = parser.create('token', 'mi', def, mchar.char);
        parser.Push(node);
    },
    mathchar0mo(parser, mchar) {
        const def = mchar.attributes || {};
        def['stretchy'] = false;
        const node = parser.create('token', 'mo', def, mchar.char);
        NodeUtil.setProperty(node, 'fixStretchy', true);
        parser.configuration.addNode('fixStretchy', node);
        parser.Push(node);
    },
    mathchar7(parser, mchar) {
        const def = mchar.attributes || { mathvariant: MATHVARIANT.NORMAL };
        if (parser.stack.env['font']) {
            def['mathvariant'] = parser.stack.env['font'];
        }
        const node = parser.create('token', 'mi', def, mchar.char);
        parser.Push(node);
    },
    delimiter(parser, delim) {
        let def = delim.attributes || {};
        def = Object.assign({ fence: false, stretchy: false }, def);
        const node = parser.create('token', 'mo', def, delim.char);
        parser.Push(node);
    },
    environment(parser, env, func, args) {
        const mml = parser.itemFactory.create('begin').setProperty('name', env);
        parser.Push(func(parser, mml, ...args.slice(1)));
    },
};
export default ParseMethods;
//# sourceMappingURL=ParseMethods.js.map