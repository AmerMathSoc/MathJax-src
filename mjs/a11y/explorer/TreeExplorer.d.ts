import { A11yDocument, Region } from './Region.js';
import { Explorer, AbstractExplorer } from './Explorer.js';
import { ExplorerPool } from './ExplorerPool.js';
export interface TreeExplorer extends Explorer {
}
export declare class AbstractTreeExplorer extends AbstractExplorer<void> {
    document: A11yDocument;
    pool: ExplorerPool;
    region: Region<void>;
    protected node: HTMLElement;
    protected mml: HTMLElement;
    protected constructor(document: A11yDocument, pool: ExplorerPool, region: Region<void>, node: HTMLElement, mml: HTMLElement);
    readonly stoppable = false;
    Attach(): void;
    Detach(): void;
}
export declare class FlameColorer extends AbstractTreeExplorer {
    Start(): void;
    Stop(): void;
}
export declare class TreeColorer extends AbstractTreeExplorer {
    Start(): void;
    Stop(): void;
}
