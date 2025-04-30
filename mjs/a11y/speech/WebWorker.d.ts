import { DOMAdaptor } from '../../core/DOMAdaptor.js';
import { OptionList } from '../../util/Options.js';
import { Message, PoolCommand, Structure, StructureData } from './MessageTypes.js';
import { MathItem } from '../../core/MathItem.js';
export declare class WorkerHandler<N, T, D> {
    adaptor: DOMAdaptor<N, T, D>;
    private options;
    private static ID;
    iframe: N;
    pool: D;
    ready: boolean;
    domain: string;
    private tasks;
    constructor(adaptor: DOMAdaptor<N, T, D>, options: OptionList);
    private createIframe;
    private computeSrc;
    private rewriteFirefox;
    Start(): void;
    private debug;
    Listener(event: MessageEvent): void;
    Post(msg: PoolCommand, item?: MathItem<N, T, D>): Promise<any>;
    private postNext;
    Cancel(item: MathItem<N, T, D>): void;
    Setup(options: OptionList): Promise<void>;
    Speech(math: string, options: OptionList, item: MathItem<N, T, D>): Promise<void>;
    nextRules(math: string, options: OptionList, item: MathItem<N, T, D>): Promise<void>;
    nextStyle(math: string, options: OptionList, nodeId: string, item: MathItem<N, T, D>): Promise<void>;
    Attach(item: MathItem<N, T, D>, structure: StructureData): void;
    protected setSpeechAttribute(node: N, data: Structure): void;
    protected setSpeechAttributes(root: N | T, rootId: string, data: Structure): string;
    protected setSpecialAttributes(node: N, map: OptionList, prefix: string, keys?: string[]): void;
    Terminate(): Promise<void>;
    Stop(): Promise<void>;
    Commands: {
        [id: string]: (pool: WorkerHandler<N, T, D>, data: Message) => void;
    };
}
