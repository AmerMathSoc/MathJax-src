import { Handler } from '../core/Handler.js';
import { MmlNode } from '../core/MmlTree/MmlNode.js';
import { MathML } from '../input/mathml.js';
import { SpeechMathItem, SpeechMathDocument } from './speech.js';
import { MathDocumentConstructor } from '../core/MathDocument.js';
import { ExplorerPool, RegionPool } from './explorer/ExplorerPool.js';
export type Constructor<T> = new (...args: any[]) => T;
export type HANDLER = Handler<HTMLElement, Text, Document>;
export type HTMLDOCUMENT = SpeechMathDocument<HTMLElement, Text, Document>;
export type HTMLMATHITEM = SpeechMathItem<HTMLElement, Text, Document>;
export type MATHML = MathML<HTMLElement, Text, Document>;
export interface ExplorerMathItem extends HTMLMATHITEM {
    explorers: ExplorerPool;
    explorable(document: HTMLDOCUMENT, force?: boolean): void;
}
export declare function ExplorerMathItemMixin<B extends Constructor<HTMLMATHITEM>>(BaseMathItem: B, toMathML: (node: MmlNode) => string): Constructor<ExplorerMathItem> & B;
export interface ExplorerMathDocument extends HTMLDOCUMENT {
    explorerRegions: RegionPool;
    explorable(): HTMLDOCUMENT;
}
export declare function ExplorerMathDocumentMixin<B extends MathDocumentConstructor<HTMLDOCUMENT>>(BaseDocument: B): MathDocumentConstructor<ExplorerMathDocument> & B;
export declare function ExplorerHandler(handler: HANDLER, MmlJax?: MATHML): HANDLER;
export declare function setA11yOptions(document: HTMLDOCUMENT, options: {
    [key: string]: any;
}): void;
export declare function setA11yOption(document: HTMLDOCUMENT, option: string, value: string | boolean): void;
