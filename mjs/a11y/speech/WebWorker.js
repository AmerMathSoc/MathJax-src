var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { hasWindow } from '../../util/context.js';
class Task {
    constructor(cmd, item, resolve, reject) {
        this.cmd = cmd;
        this.item = item;
        this.resolve = resolve;
        this.reject = reject;
    }
}
export class WorkerHandler {
    constructor(adaptor, options) {
        this.adaptor = adaptor;
        this.options = options;
        this.iframe = null;
        this.pool = null;
        this.ready = false;
        this.domain = '';
        this.tasks = [];
        this.Commands = {
            Ready(pool, _data) {
                pool.pool = pool.adaptor.getProperty(pool.iframe, 'contentWindow').document;
                pool.ready = true;
                pool.postNext();
            },
            Finished(pool, data) {
                const task = pool.tasks.shift();
                if (data.success) {
                    task.resolve(data.result);
                }
                else {
                    task.reject(data.error);
                }
                pool.postNext();
            },
        };
    }
    createIframe() {
        const src = this.computeSrc(this.rewriteFirefox(this.adaptor.domain()), this.options.worker, this.options.debug.toString());
        this.iframe = this.adaptor.node('iframe', {
            style: { display: 'none' },
            id: 'WorkerHandler-' + ++WorkerHandler.ID,
            properties: { src },
        });
        if (!hasWindow) {
            this.adaptor.setProperty(this.iframe, 'options', this.options);
        }
    }
    computeSrc(...parameters) {
        const hash = parameters.map((part) => encodeURIComponent(part)).join('&');
        return this.options.path + '/' + this.options.pool + '#' + hash;
    }
    rewriteFirefox(domain) {
        return domain.substring(0, 7) === 'file://' ? '*' : domain;
    }
    Start() {
        if (this.ready)
            throw Error('WorkerHandler already started');
        this.createIframe();
        this.adaptor.listener(this.Listener.bind(this));
        this.adaptor.append(this.adaptor.body(), this.iframe);
        this.domain = this.rewriteFirefox(this.adaptor.domain(this.iframe));
    }
    debug(msg, ...rest) {
        if (this.options.debug) {
            console.info(msg, ...rest);
        }
    }
    Listener(event) {
        this.debug('Iframe  >>>  Client:', event.data);
        let origin = event.origin;
        if (origin === 'null' || origin === 'file://')
            origin = '*';
        if (origin !== this.domain)
            return;
        if (Object.hasOwn(this.Commands, event.data.cmd)) {
            this.Commands[event.data.cmd](this, event.data.data);
        }
        else {
            this.debug('Invalid command from pool: ' + event.data.cmd);
        }
    }
    Post(msg, item) {
        const promise = new Promise((resolve, reject) => {
            this.tasks.push(new Task(msg, item, resolve, reject));
        });
        if (this.ready && this.tasks.length === 1) {
            this.postNext();
        }
        return promise;
    }
    postNext() {
        if (this.tasks.length) {
            this.adaptor.post(this.tasks[0].cmd, this.domain, this.pool);
        }
    }
    Cancel(item) {
        const i = this.tasks.findIndex((task) => task.item === item);
        if (i > 0) {
            this.tasks[i].reject(`Task ${this.tasks[i].cmd.cmd} cancelled`);
            this.tasks.splice(i, 1);
        }
    }
    Setup(options) {
        return this.Post({
            cmd: 'Worker',
            data: {
                cmd: 'setup',
                debug: this.options.debug,
                data: {
                    domain: options.domain,
                    style: options.style,
                    locale: options.locale,
                    modality: options.modality,
                },
            },
        });
    }
    Speech(math, options, item) {
        return __awaiter(this, void 0, void 0, function* () {
            this.Attach(item, yield this.Post({
                cmd: 'Worker',
                data: {
                    cmd: 'speech',
                    debug: this.options.debug,
                    data: { mml: math, options: options },
                },
            }, item));
        });
    }
    nextRules(math, options, item) {
        return __awaiter(this, void 0, void 0, function* () {
            this.Attach(item, yield this.Post({
                cmd: 'Worker',
                data: {
                    cmd: 'nextRules',
                    debug: this.options.debug,
                    data: { mml: math, options: options },
                },
            }, item));
        });
    }
    nextStyle(math, options, nodeId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            this.Attach(item, yield this.Post({
                cmd: 'Worker',
                data: {
                    cmd: 'nextStyle',
                    debug: this.options.debug,
                    data: {
                        mml: math,
                        options: options,
                        nodeId: nodeId,
                    },
                },
            }, item));
        });
    }
    Attach(item, structure) {
        const data = (typeof structure === 'string' ? JSON.parse(structure) : structure);
        const container = item.typesetRoot;
        if (!container)
            return;
        this.setSpecialAttributes(container, data.options, 'data-semantic-', [
            'locale',
            'domain',
            'style',
        ]);
        const adaptor = this.adaptor;
        this.setSpecialAttributes(container, data.translations, 'data-semantic-');
        if (data.label) {
            adaptor.setAttribute(container, 'aria-label', data.label);
        }
        if (data.braillelabel) {
            adaptor.setAttribute(container, 'aria-braillelabel', data.braillelabel);
        }
        for (const [id, sid] of Object.entries(data.mactions)) {
            let node = adaptor.getElement('#' + id, container);
            if (!node || !adaptor.childNodes(node)[0]) {
                continue;
            }
            node = adaptor.childNodes(node)[0];
            adaptor.setAttribute(node, 'data-semantic-type', 'dummy');
            this.setSpecialAttributes(node, sid, '');
        }
        this.setSpeechAttributes(adaptor.childNodes(container)[0], '', data);
        adaptor.setAttribute(container, 'data-speech-attached', 'true');
        if (data.braille) {
            adaptor.setAttribute(container, 'data-braille-attached', 'true');
        }
    }
    setSpeechAttribute(node, data) {
        const adaptor = this.adaptor;
        const id = adaptor.getAttribute(node, 'data-semantic-id');
        const speech = data.speech[id] || {};
        for (let [key, value] of Object.entries(speech)) {
            key = key.replace(/-ssml$/, '');
            if (value) {
                adaptor.setAttribute(node, `data-semantic-${key}`, value);
            }
        }
        if (data.braille) {
            const braille = data.braille[id];
            if (braille) {
                const value = braille['braille-none'] || '';
                adaptor.setAttribute(node, 'data-semantic-braille', value);
                adaptor.setAttribute(node, 'aria-braillelabel', value);
            }
        }
    }
    setSpeechAttributes(root, rootId, data) {
        const adaptor = this.adaptor;
        if (!root ||
            adaptor.kind(root) === '#text' ||
            adaptor.kind(root) === '#comment') {
            return rootId;
        }
        root = root;
        if (adaptor.hasAttribute(root, 'data-semantic-id')) {
            this.setSpeechAttribute(root, data);
            if (!rootId && !adaptor.hasAttribute(root, 'data-semantic-parent')) {
                rootId = adaptor.getAttribute(root, 'data-semantic-id');
            }
        }
        for (const child of Array.from(adaptor.childNodes(root))) {
            rootId = this.setSpeechAttributes(child, rootId, data);
        }
        return rootId;
    }
    setSpecialAttributes(node, map, prefix, keys) {
        if (!map)
            return;
        keys = keys || Object.keys(map);
        for (const key of keys) {
            const value = map[key];
            if (value) {
                this.adaptor.setAttribute(node, `${prefix}${key.toLowerCase()}`, value);
            }
        }
    }
    Terminate() {
        this.debug('Terminating pending tasks');
        for (const task of this.tasks) {
            task.reject(`${task.cmd.data.cmd} cancelled by WorkerHandler termination`);
        }
        this.tasks = [];
        this.debug('Terminating WorkerPool');
        return this.Post({ cmd: 'Terminate', data: {} });
    }
    Stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.iframe) {
                throw Error('WorkerHandler has not been started');
            }
            yield this.Terminate();
            this.adaptor.remove(this.iframe);
            this.iframe = this.pool = null;
            this.ready = false;
        });
    }
}
WorkerHandler.ID = 0;
//# sourceMappingURL=WebWorker.js.map