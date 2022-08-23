import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonHtmlNode, CommonHtmlNodeClass } from '../../common/Wrappers/HtmlNode.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlHtmlNodeNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonHtmlNode<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlHtmlNodeClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonHtmlNodeClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlHtmlNodeNTD<N, T, D>;
}
export declare const ChtmlHtmlNode: ChtmlHtmlNodeClass<any, any, any>;
