import NodeUtil from './NodeUtil.js';
import { TexConstant } from './TexConstants.js';
import ParseUtil from './ParseUtil.js';
const MATHVARIANT = TexConstant.Variant;
var ParseMethods;
(function (ParseMethods) {
    function variable(parser, c) {
        var _a;
        const def = ParseUtil.getFontDef(parser);
        const env = parser.stack.env;
        if (env.multiLetterIdentifiers && env.font !== '') {
            c = ((_a = parser.string.substr(parser.i - 1).match(env.multiLetterIdentifiers)) === null || _a === void 0 ? void 0 : _a[0]) || c;
            parser.i += c.length - 1;
            if (def.mathvariant === MATHVARIANT.NORMAL && env.noAutoOP && c.length > 1) {
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
    }
    ParseMethods.variable = variable;
    function digit(parser, c) {
        let mml;
        const pattern = parser.configuration.options['digits'];
        const n = parser.string.slice(parser.i - 1).match(pattern);
        const def = ParseUtil.getFontDef(parser);
        if (n) {
            mml = parser.create('token', 'mn', def, n[0].replace(/[{}]/g, ''));
            parser.i += n[0].length - 1;
        }
        else {
            mml = parser.create('token', 'mo', def, c);
        }
        parser.Push(mml);
    }
    ParseMethods.digit = digit;
    function controlSequence(parser, _c) {
        const name = parser.GetCS();
        parser.parse('macro', [parser, name]);
    }
    ParseMethods.controlSequence = controlSequence;
    function lcGreek(parser, mchar) {
        const def = { mathvariant: parser.configuration.mathStyle(mchar.char) || MATHVARIANT.ITALIC };
        const node = parser.create('token', 'mi', def, mchar.char);
        parser.Push(node);
    }
    ParseMethods.lcGreek = lcGreek;
    function ucGreek(parser, mchar) {
        const def = { mathvariant: parser.stack.env['font'] ||
                parser.configuration.mathStyle(mchar.char, true) ||
                MATHVARIANT.NORMAL };
        const node = parser.create('token', 'mi', def, mchar.char);
        parser.Push(node);
    }
    ParseMethods.ucGreek = ucGreek;
    function mathchar0mi(parser, mchar) {
        const def = mchar.attributes || { mathvariant: MATHVARIANT.ITALIC };
        const node = parser.create('token', 'mi', def, mchar.char);
        parser.Push(node);
    }
    ParseMethods.mathchar0mi = mathchar0mi;
    function mathchar0mo(parser, mchar) {
        const def = mchar.attributes || {};
        def['stretchy'] = false;
        const node = parser.create('token', 'mo', def, mchar.char);
        NodeUtil.setProperty(node, 'fixStretchy', true);
        parser.configuration.addNode('fixStretchy', node);
        parser.Push(node);
    }
    ParseMethods.mathchar0mo = mathchar0mo;
    function mathchar7(parser, mchar) {
        const def = mchar.attributes || { mathvariant: MATHVARIANT.NORMAL };
        if (parser.stack.env['font']) {
            def['mathvariant'] = parser.stack.env['font'];
        }
        const node = parser.create('token', 'mi', def, mchar.char);
        parser.Push(node);
    }
    ParseMethods.mathchar7 = mathchar7;
    function delimiter(parser, delim) {
        let def = delim.attributes || {};
        def = Object.assign({ fence: false, stretchy: false }, def);
        const node = parser.create('token', 'mo', def, delim.char);
        parser.Push(node);
    }
    ParseMethods.delimiter = delimiter;
    function environment(parser, env, func, args) {
        const end = args[0];
        let mml = parser.itemFactory.create('begin').setProperties({ name: env, end: end });
        mml = func(parser, mml, ...args.slice(1));
        parser.Push(mml);
    }
    ParseMethods.environment = environment;
})(ParseMethods || (ParseMethods = {}));
export default ParseMethods;
//# sourceMappingURL=ParseMethods.js.map