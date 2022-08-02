import { ArrayItem } from './base/BaseItems.js';
export declare type ColumnState = {
    template: string;
    i: number;
    c: string;
    j: number;
    calign: string[];
    cwidth: string[];
    clines: string[];
    cstart: string[];
    cend: string[];
    ralign: [number, string, string][];
};
export declare type ColumnHandler = (state: ColumnState) => void;
export declare class ColumnParser {
    columnHandler: {
        [c: string]: ColumnHandler;
    };
    process(template: string, array: ArrayItem): void;
    getColumn(state: ColumnState, ralign: number, calign?: string): void;
    getDimen(state: ColumnState): string;
    getAlign(state: ColumnState): any;
    getBraces(state: ColumnState): string;
}
