import { LiteElement } from './Element.js';
import { LiteWindow } from './Window.js';
export type LiteListener = (event: any) => void;
export declare class LiteDocument {
    defaultView: LiteWindow;
    root: LiteElement;
    head: LiteElement;
    body: LiteElement;
    type: string;
    listeners: LiteListener[];
    get kind(): string;
    constructor(window?: LiteWindow);
    addEventListener(kind: string, listener: (event: any) => void): void;
    postMessage(msg: any, domain: string): void;
}
