import { OptionList } from '../../util/Options.js';
import { Styles } from '../../util/Styles.js';
import { LiteText } from './Text.js';
import { LiteDocument } from './Document.js';
import { LiteWindow } from './Window.js';
export type LiteAttributeList = OptionList;
export type LiteNode = LiteElement | LiteText;
export declare class LiteElement {
    kind: string;
    attributes: LiteAttributeList;
    children: LiteNode[];
    parent: LiteElement;
    styles: Styles;
    constructor(kind: string, attributes?: LiteAttributeList, children?: LiteNode[]);
}
export declare class LiteIFrame extends LiteElement {
    src: string;
    contentWindow: LiteWindow;
    options: OptionList;
    constructor(kind: string, attributes?: LiteAttributeList, children?: LiteNode[]);
    loadWorker(parent: LiteDocument): Promise<void>;
}
