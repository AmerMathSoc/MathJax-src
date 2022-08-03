import { ArrayItem } from './base/BaseItems.js';
import TexParser from './TexParser.js';
export declare type ColumnState = {
    parser: TexParser;
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
    MAXCOLUMNS: number;
    process(parser: TexParser, template: string, array: ArrayItem): void;
    getColumn(state: ColumnState, ralign: number, calign?: string): void;
    getDimen(state: ColumnState): string;
    getAlign(state: ColumnState): any;
    getBraces(state: ColumnState): string;
    macroColumn(state: ColumnState, macro: string, n: number): void;
}
