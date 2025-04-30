import { Info } from './mj-context-menu.js';
export declare class SelectableInfo extends Info {
    keydown(event: KeyboardEvent): void;
    selectAll(): void;
    copyToClipboard(): void;
    generateHtml(): void;
}
