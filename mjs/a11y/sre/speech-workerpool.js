const context = typeof window === 'undefined'
    ? {
        Worker: null,
        window: null,
        parent: null,
        hash: '',
    }
    : {
        Worker: Worker,
        window: window,
        parent: window.parent,
        hash: location.hash.substring(1),
    };
export function setContext(config) {
    Object.assign(context, config);
}
export class WorkerPool {
    static Create() {
        const data = context.hash
            .split(/&/)
            .map((part) => decodeURIComponent(part));
        return new WorkerPool(data[0], data[1], data[2]);
    }
    constructor(domain, src, debug = 'true') {
        this.domain = domain;
        this.DEBUG = false;
        this.worker = null;
        this.parent = context.parent;
        this.WORKER = src;
        this.DEBUG = debug.toLowerCase() === 'true';
        this.worker = null;
    }
    debug(msg, ...rest) {
        if (this.DEBUG) {
            console.info(msg, ...rest);
        }
    }
    Start() {
        context.window.addEventListener('message', this.Listener.bind(this), false);
        this.createWorker();
        return this;
    }
    Listener(event) {
        this.debug('Client  >>>  Iframe:', event.data);
        let origin = event.origin;
        if (origin === 'null' || origin === 'file://') {
            origin = '*';
        }
        if (origin !== this.domain) {
            return;
        }
        this.Execute(event.data);
    }
    Execute(data) {
        if (Object.hasOwn(PoolCommands, data.cmd)) {
            PoolCommands[data.cmd](this, data);
        }
        else {
            this.Log(`WorkerPool: invalid Pool command: ${data.cmd}`);
        }
    }
    Log(msg) {
        this.parent.postMessage({ cmd: 'Log', data: { msg: msg } }, this.domain);
    }
    createWorker() {
        this.worker = new context.Worker(this.WORKER, { type: 'module' });
        this.worker.addEventListener('message', (event) => {
            this.debug('Worker  >>>  Iframe:', event.data);
            const data = event.data;
            if (Object.hasOwn(WorkerCommands, data.cmd)) {
                WorkerCommands[data.cmd](this, data);
            }
            else {
                this.Log(`WorkerPool: invalid Worker command ${data.cmd}`);
            }
        });
    }
    Terminate() {
        if (!this.worker)
            return;
        this.Log(`Terminate worker`);
        this.worker.terminate();
        this.worker = null;
    }
}
export const PoolCommands = {
    Start(pool, msg) {
        pool.Log('WorkerPool: starting worker.');
        pool.worker.postMessage({ cmd: 'start', data: msg.data });
    },
    Worker(pool, msg) {
        if (!pool.worker) {
            pool.Start();
        }
        pool.worker.postMessage(msg.data);
    },
    Terminate(pool, _msg) {
        pool.Terminate();
    },
};
export const WorkerCommands = {
    Ready(pool, _msg) {
        pool.parent.postMessage({ cmd: 'Ready' }, pool.domain);
    },
    Client: function (pool, msg) {
        pool.parent.postMessage(msg.data, pool.domain);
    },
    Pool: function (pool, msg) {
        pool.Execute(msg);
    },
    Log: function (pool, msg) {
        pool.Log(`Worker log: ${msg.data}`);
    },
    Error: function (pool, msg) {
        pool.Log(`Worker error: ${JSON.stringify(msg.data)}`);
    },
};
//# sourceMappingURL=speech-workerpool.js.map