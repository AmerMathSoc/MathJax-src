import { PoolCommand, WorkerCommand } from '../speech/MessageTypes.js';
declare const context: {
    Worker: {
        new (scriptURL: string | URL, options?: WorkerOptions): Worker;
        prototype: Worker;
    };
    window: Window & typeof globalThis;
    parent: Window;
    hash: string;
};
export declare function setContext(config: typeof context): void;
export declare class WorkerPool {
    domain: string;
    static Create(): WorkerPool;
    parent: Window;
    WORKER: string;
    DEBUG: boolean;
    worker: Worker;
    constructor(domain: string, src: string, debug?: string);
    debug(msg: string, ...rest: string[]): void;
    Start(): WorkerPool;
    Listener(event: MessageEvent): void;
    Execute(data: PoolCommand): void;
    Log(msg: string): void;
    createWorker(): void;
    Terminate(): void;
}
export declare const PoolCommands: {
    [cmd: string]: (pool: WorkerPool, msg: PoolCommand) => void;
};
export declare const WorkerCommands: {
    [cmd: string]: (pool: WorkerPool, msg: WorkerCommand) => void;
};
export {};
