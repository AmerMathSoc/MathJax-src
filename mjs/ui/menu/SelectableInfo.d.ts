import { Info } from './mj-context-menu.js';
export declare class SelectableInfo extends Info {
    addEvents(element: HTMLElement): void;
    selectAll(): void;
    copyToClipboard(): void;
    generateHtml(): void;
}
