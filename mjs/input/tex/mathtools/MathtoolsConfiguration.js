import { Configuration } from '../Configuration.js';
import { CommandMap } from '../SymbolMap.js';
import NodeUtil from '../NodeUtil.js';
import { expandable } from '../../../util/Options.js';
import './MathtoolsMappings.js';
import { MathtoolsUtil } from './MathtoolsUtil.js';
import { MathtoolsTagFormat } from './MathtoolsTags.js';
import { MultlinedItem } from './MathtoolsItems.js';
export const PAIREDDELIMS = 'mathtools-paired-delims';
function initMathtools(config) {
    new CommandMap(PAIREDDELIMS, {}, {});
    config.append(Configuration.local({ handler: { macro: [PAIREDDELIMS] }, priority: -5 }));
}
function configMathtools(config, jax) {
    const parser = jax.parseOptions;
    const pairedDelims = parser.options.mathtools.pairedDelimiters;
    for (const cs of Object.keys(pairedDelims)) {
        MathtoolsUtil.addPairedDelims(parser, cs, pairedDelims[cs]);
    }
    MathtoolsTagFormat(config, jax);
}
export function fixPrescripts({ data }) {
    for (const node of data.getList('mmultiscripts')) {
        if (!node.getProperty('fixPrescript'))
            continue;
        const childNodes = NodeUtil.getChildren(node);
        let n = 0;
        for (const i of [1, 2]) {
            if (!childNodes[i]) {
                NodeUtil.setChild(node, i, data.nodeFactory.create('node', 'none'));
                n++;
            }
        }
        for (const i of [4, 5]) {
            if (NodeUtil.isType(childNodes[i], 'mrow') && NodeUtil.getChildren(childNodes[i]).length === 0) {
                NodeUtil.setChild(node, i, data.nodeFactory.create('node', 'none'));
            }
        }
        if (n === 2) {
            childNodes.splice(1, 2);
        }
    }
}
export const MathtoolsConfiguration = Configuration.create('mathtools', {
    handler: {
        macro: ['mathtools-macros', 'mathtools-delimiters'],
        environment: ['mathtools-environments'],
        delimiter: ['mathtools-delimiters'],
        character: ['mathtools-characters']
    },
    items: {
        [MultlinedItem.prototype.kind]: MultlinedItem
    },
    init: initMathtools,
    config: configMathtools,
    postprocessors: [[fixPrescripts, -6]],
    options: {
        mathtools: {
            'multlinegap': '1em',
            'multlined-pos': 'c',
            'firstline-afterskip': '',
            'lastline-preskip': '',
            'smallmatrix-align': 'c',
            'shortvdotsadjustabove': '.2em',
            'shortvdotsadjustbelow': '.2em',
            'centercolon': false,
            'centercolon-offset': '.04em',
            'thincolon-dx': '-.04em',
            'thincolon-dw': '-.08em',
            'use-unicode': false,
            'prescript-sub-format': '',
            'prescript-sup-format': '',
            'prescript-arg-format': '',
            'allow-mathtoolsset': true,
            pairedDelimiters: expandable({}),
            tagforms: expandable({}),
        }
    }
});
//# sourceMappingURL=MathtoolsConfiguration.js.map