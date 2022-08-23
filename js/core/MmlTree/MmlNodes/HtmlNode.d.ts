import { AbstractMmlEmptyNode } from '../MmlNode.js';
import { DOMAdaptor } from '../../DOMAdaptor.js';
import { PropertyList } from '../../Tree/Node.js';
export declare class HtmlNode<N> extends AbstractMmlEmptyNode {
    protected html: N;
    protected adaptor: DOMAdaptor<any, any, any>;
    get kind(): string;
    getHTML(): Object;
    setHTML(html: N, adaptor?: DOMAdaptor<any, any, any>): HtmlNode<N>;
    getSerializedHTML(): string;
    textContent(): string;
    copy(): HtmlNode<N>;
    toString(): string;
    verifyTree(options: PropertyList): void;
}
