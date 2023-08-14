import { Configuration } from '../Configuration.js';
import { BeginEnvItem } from './NewcommandItems.js';
import NewcommandUtil from './NewcommandUtil.js';
import './NewcommandMappings.js';
import ParseMethods from '../ParseMethods.js';
import * as sm from '../SymbolMap.js';
let init = function (config) {
    new sm.DelimiterMap(NewcommandUtil.NEW_DELIMITER, ParseMethods.delimiter, {});
    new sm.CommandMap(NewcommandUtil.NEW_COMMAND, {}, {});
    new sm.EnvironmentMap(NewcommandUtil.NEW_ENVIRONMENT, ParseMethods.environment, {}, {});
    config.append(Configuration.local({ handler: { character: [],
            delimiter: [NewcommandUtil.NEW_DELIMITER],
            macro: [NewcommandUtil.NEW_DELIMITER,
                NewcommandUtil.NEW_COMMAND],
            environment: [NewcommandUtil.NEW_ENVIRONMENT]
        },
        priority: -1 }));
};
export const NewcommandConfiguration = Configuration.create('newcommand', {
    handler: {
        macro: ['Newcommand-macros']
    },
    items: {
        [BeginEnvItem.prototype.kind]: BeginEnvItem,
    },
    options: { maxMacros: 1000 },
    init: init
});
//# sourceMappingURL=NewcommandConfiguration.js.map