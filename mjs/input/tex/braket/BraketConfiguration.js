import { Configuration } from '../Configuration.js';
import { BraketItem } from './BraketItems.js';
import './BraketMappings.js';
export const BraketConfiguration = Configuration.create('braket', {
    handler: {
        character: ['Braket-characters'],
        macro: ['Braket-macros']
    },
    items: {
        [BraketItem.prototype.kind]: BraketItem,
    }
});
//# sourceMappingURL=BraketConfiguration.js.map