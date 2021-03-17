import { ArrayItem } from '../base/BaseItems.js';
import { Configuration } from '../Configuration.js';
export declare class XalignArrayItem extends ArrayItem {
    name: string;
    numbered: boolean;
    padded: boolean;
    center: boolean;
    maxrow: number;
    get kind(): string;
    constructor(factory: any, name: string, numbered: boolean, padded: boolean, center: boolean);
    EndRow(): void;
    EndTable(): void;
}
export declare const XalignConfiguration: Configuration;
