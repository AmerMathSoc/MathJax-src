import { CHTML } from '../../chtml.js';
import { ChtmlWrapper, ChtmlWrapperClass } from '../Wrapper.js';
import { ChtmlWrapperFactory } from '../WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from '../FontData.js';
import { CommonSemantics, CommonSemanticsClass } from '../../common/Wrappers/semantics.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface ChtmlSemanticsNTD<N, T, D> extends ChtmlWrapper<N, T, D>, CommonSemantics<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
}
export interface ChtmlSemanticsClass<N, T, D> extends ChtmlWrapperClass<N, T, D>, CommonSemanticsClass<N, T, D, CHTML<N, T, D>, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    new (factory: ChtmlWrapperFactory<N, T, D>, node: MmlNode, parent?: ChtmlWrapper<N, T, D>): ChtmlSemanticsNTD<N, T, D>;
}
export declare const ChtmlSemantics: ChtmlSemanticsClass<any, any, any>;
export declare const ChtmlAnnotation: ChtmlWrapperClass<any, any, any>;
export declare const ChtmlAnnotationXML: ChtmlWrapperClass<any, any, any>;
export declare const ChtmlXmlNode: ChtmlWrapperClass<any, any, any>;
