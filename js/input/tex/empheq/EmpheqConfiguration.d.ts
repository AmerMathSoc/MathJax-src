import { Configuration } from '../Configuration.js';
import TexParser from '../TexParser.js';
import { BeginItem } from '../base/BaseItems.js';
import { StackItem } from '../StackItem.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
import { MmlMtable } from '../../../core/MmlTree/MmlNodes/mtable.js';
import { MmlMtd } from '../../../core/MmlTree/MmlNodes/mtd.js';
export declare class EmpheqBeginItem extends BeginItem {
    options: {};
    get kind(): string;
    checkItem(item: StackItem): import("../StackItem.js").CheckType;
}
export declare const EmpheqUtil: {
    environment(parser: TexParser, env: string, func: Function, args: any[]): void;
    copyMml(node: MmlNode): MmlNode;
    splitOptions(text: string, allowed?: {
        [key: string]: number;
    }): import("../StackItem.js").EnvList;
    columnCount(table: MmlMtable): number;
    cellBlock(tex: string, table: MmlMtable, parser: TexParser, env: string): MmlNode;
    topRowTable(original: MmlMtable, parser: TexParser): MmlNode;
    rowspanCell(mtd: MmlMtd, tex: string, table: MmlMtable, parser: TexParser, env: string): void;
    left(table: MmlMtable, original: MmlMtable, left: string, parser: TexParser, env?: string): void;
    right(table: MmlMtable, original: MmlMtable, right: string, parser: TexParser, env?: string): void;
    adjustTable(empheq: EmpheqBeginItem, parser: TexParser): void;
    allowEnv: {
        equation: boolean;
        align: boolean;
        gather: boolean;
        flalign: boolean;
        alignat: boolean;
        multline: boolean;
    };
    checkEnv(env: string): any;
};
export declare const EmpheqMethods: {
    Empheq(parser: TexParser, begin: EmpheqBeginItem): void;
    EmpheqMO(parser: TexParser, _name: string, c: string): void;
    EmpheqDelim(parser: TexParser, name: string): void;
};
export declare const EmpheqConfiguration: Configuration;
