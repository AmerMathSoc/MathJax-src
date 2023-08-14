import { Configuration } from '../Configuration.js';
import { MultlineItem, FlalignItem } from './AmsItems.js';
import { AbstractTags } from '../Tags.js';
import { NEW_OPS } from './AmsMethods.js';
import './AmsMappings.js';
import { CommandMap } from '../SymbolMap.js';
export class AmsTags extends AbstractTags {
}
let init = function (config) {
    new CommandMap(NEW_OPS, {}, {});
    config.append(Configuration.local({ handler: { macro: [NEW_OPS] },
        priority: -1 }));
};
export const AmsConfiguration = Configuration.create('ams', {
    handler: {
        character: ['AMSmath-operatorLetter'],
        delimiter: ['AMSsymbols-delimiter', 'AMSmath-delimiter'],
        macro: ['AMSsymbols-mathchar0mi', 'AMSsymbols-mathchar0mo',
            'AMSsymbols-delimiter', 'AMSsymbols-macros',
            'AMSmath-mathchar0mo', 'AMSmath-macros', 'AMSmath-delimiter'],
        environment: ['AMSmath-environment']
    },
    items: {
        [MultlineItem.prototype.kind]: MultlineItem,
        [FlalignItem.prototype.kind]: FlalignItem,
    },
    tags: { 'ams': AmsTags },
    init: init,
    options: {
        multlineWidth: '',
        ams: {
            operatornamePattern: /^[-*a-zA-Z]+/,
            multlineWidth: '100%',
            multlineIndent: '1em',
        }
    }
});
//# sourceMappingURL=AmsConfiguration.js.map