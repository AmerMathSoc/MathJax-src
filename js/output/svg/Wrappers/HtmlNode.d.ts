import { SVG } from '../../svg.js';
import { SvgWrapper, SvgWrapperClass } from '../Wrapper.js';
import { SvgWrapperFactory } from '../WrapperFactory.js';
import { SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass } from '../FontData.js';
import { CommonHtmlNode, CommonHtmlNodeClass } from '../../common/Wrappers/HtmlNode.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export interface SvgHtmlNodeNTD<N, T, D> extends SvgWrapper<N, T, D>, CommonHtmlNode<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
}
export interface SvgHtmlNodeClass<N, T, D> extends SvgWrapperClass<N, T, D>, CommonHtmlNodeClass<N, T, D, SVG<N, T, D>, SvgWrapper<N, T, D>, SvgWrapperFactory<N, T, D>, SvgWrapperClass<N, T, D>, SvgCharOptions, SvgVariantData, SvgDelimiterData, SvgFontData, SvgFontDataClass> {
    new (factory: SvgWrapperFactory<N, T, D>, node: MmlNode, parent?: SvgWrapper<N, T, D>): SvgHtmlNodeNTD<N, T, D>;
}
export declare const SvgHtmlNode: SvgHtmlNodeClass<any, any, any>;
