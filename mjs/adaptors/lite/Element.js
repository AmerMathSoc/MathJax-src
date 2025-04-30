var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { LiteWindow } from './Window.js';
import { asyncLoad } from '../../util/AsyncLoad.js';
export class LiteElement {
    constructor(kind, attributes = {}, children = []) {
        this.kind = kind;
        this.attributes = Object.assign({}, attributes);
        this.children = [...children];
        for (const child of this.children) {
            child.parent = this;
        }
        this.styles = null;
    }
}
export class LiteIFrame extends LiteElement {
    constructor(kind, attributes = {}, children = []) {
        super(kind, attributes, children);
        this.src = '';
        this.options = {};
        this.contentWindow = new LiteWindow();
    }
    loadWorker(parent) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Worker } = yield asyncLoad('node:worker_threads');
            class LiteWorker {
                constructor(url, options = {}) {
                    this.worker = new Worker(url, options);
                }
                addEventListener(kind, listener) {
                    this.worker.on(kind, listener);
                }
                postMessage(msg) {
                    this.worker.postMessage({ data: msg, origin: '*' });
                }
                terminate() {
                    this.worker.terminate();
                }
            }
            const hash = [
                '*',
                `${this.options.path}/${this.options.worker}`,
                this.options.debug,
            ];
            const { WorkerPool, setContext } = yield asyncLoad(`${this.options.path}/speech-workerpool.js`);
            setContext({
                Worker: LiteWorker,
                window: this.contentWindow,
                parent: parent,
                hash: hash.map((part) => encodeURIComponent(part)).join('&'),
            });
            WorkerPool.Create().Start();
        });
    }
}
//# sourceMappingURL=Element.js.map