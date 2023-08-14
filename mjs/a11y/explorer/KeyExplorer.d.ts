import { A11yDocument, Region } from './Region.js';
import { Explorer, AbstractExplorer } from './Explorer.js';
import { ExplorerPool } from './ExplorerPool.js';
import { Sre } from '../sre.js';
export interface KeyExplorer extends Explorer {
    KeyDown(event: KeyboardEvent): void;
    FocusIn(event: FocusEvent): void;
    FocusOut(event: FocusEvent): void;
    Move(key: number): void;
    NoMove(): void;
}
export declare abstract class AbstractKeyExplorer<T> extends AbstractExplorer<T> implements KeyExplorer {
    attached: boolean;
    sound: boolean;
    walker: Sre.walker;
    private eventsAttached;
    protected events: [string, (x: Event) => void][];
    private oldIndex;
    abstract KeyDown(event: KeyboardEvent): void;
    FocusIn(_event: FocusEvent): void;
    FocusOut(_event: FocusEvent): void;
    Update(force?: boolean): void;
    Attach(): void;
    AddEvents(): void;
    Detach(): void;
    Stop(): void;
    Move(key: number): void;
    NoMove(): void;
}
export declare class SpeechExplorer extends AbstractKeyExplorer<string> {
    document: A11yDocument;
    pool: ExplorerPool;
    region: Region<string>;
    protected node: HTMLElement;
    private mml;
    private static updatePromise;
    speechGenerator: Sre.speechGenerator;
    showRegion: string;
    private init;
    private restarted;
    constructor(document: A11yDocument, pool: ExplorerPool, region: Region<string>, node: HTMLElement, mml: string);
    Start(): void;
    Update(force?: boolean): void;
    Speech(walker: Sre.walker): void;
    KeyDown(event: KeyboardEvent): void;
    protected triggerLink(code: number): boolean;
    private initWalker;
    private getOptions;
}
export declare class Magnifier extends AbstractKeyExplorer<HTMLElement> {
    document: A11yDocument;
    pool: ExplorerPool;
    region: Region<HTMLElement>;
    protected node: HTMLElement;
    private mml;
    constructor(document: A11yDocument, pool: ExplorerPool, region: Region<HTMLElement>, node: HTMLElement, mml: string);
    Update(force?: boolean): void;
    Start(): void;
    private showFocus;
    KeyDown(event: KeyboardEvent): void;
}
