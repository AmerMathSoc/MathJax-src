import { Configuration } from '../Configuration.js';
import NodeUtil from '../NodeUtil.js';
import { TexConstant } from '../TexConstants.js';
import { CommandMap } from '../SymbolMap.js';
import { NodeFactory } from '../NodeFactory.js';
let BOLDVARIANT = {};
BOLDVARIANT[TexConstant.Variant.NORMAL] = TexConstant.Variant.BOLD;
BOLDVARIANT[TexConstant.Variant.ITALIC] = TexConstant.Variant.BOLDITALIC;
BOLDVARIANT[TexConstant.Variant.FRAKTUR] = TexConstant.Variant.BOLDFRAKTUR;
BOLDVARIANT[TexConstant.Variant.SCRIPT] = TexConstant.Variant.BOLDSCRIPT;
BOLDVARIANT[TexConstant.Variant.SANSSERIF] = TexConstant.Variant.BOLDSANSSERIF;
BOLDVARIANT['-tex-calligraphic'] = '-tex-bold-calligraphic';
BOLDVARIANT['-tex-oldstyle'] = '-tex-bold-oldstyle';
BOLDVARIANT['-tex-mathit'] = TexConstant.Variant.BOLDITALIC;
export let BoldsymbolMethods = {};
BoldsymbolMethods.Boldsymbol = function (parser, name) {
    let boldsymbol = parser.stack.env['boldsymbol'];
    parser.stack.env['boldsymbol'] = true;
    let mml = parser.ParseArg(name);
    parser.stack.env['boldsymbol'] = boldsymbol;
    parser.Push(mml);
};
new CommandMap('boldsymbol', { boldsymbol: 'Boldsymbol' }, BoldsymbolMethods);
export function createBoldToken(factory, kind, def, text) {
    let token = NodeFactory.createToken(factory, kind, def, text);
    if (kind !== 'mtext' &&
        factory.configuration.parser.stack.env['boldsymbol']) {
        NodeUtil.setProperty(token, 'fixBold', true);
        factory.configuration.addNode('fixBold', token);
    }
    return token;
}
export function rewriteBoldTokens(arg) {
    for (let node of arg.data.getList('fixBold')) {
        if (NodeUtil.getProperty(node, 'fixBold')) {
            let variant = NodeUtil.getAttribute(node, 'mathvariant');
            if (variant == null) {
                NodeUtil.setAttribute(node, 'mathvariant', TexConstant.Variant.BOLD);
            }
            else {
                NodeUtil.setAttribute(node, 'mathvariant', BOLDVARIANT[variant] || variant);
            }
            NodeUtil.removeProperties(node, 'fixBold');
        }
    }
}
export const BoldsymbolConfiguration = Configuration.create('boldsymbol', {
    handler: { macro: ['boldsymbol'] },
    nodes: { 'token': createBoldToken },
    postprocessors: [rewriteBoldTokens]
});
//# sourceMappingURL=BoldsymbolConfiguration.js.map