import { liteAdaptor } from './liteAdaptor.js';
import { browserAdaptor } from './browserAdaptor.js';
let choose;
try {
    document;
    choose = browserAdaptor;
}
catch (e) {
    choose = liteAdaptor;
}
export const chooseAdaptor = choose;
//# sourceMappingURL=chooseAdaptor.js.map