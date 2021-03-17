import { FontDataClass, CharOptions, VariantData, DelimiterData } from '../FontData.js';
export declare function CommonSTIX2FontMixin<C extends CharOptions, V extends VariantData<C>, D extends DelimiterData, B extends FontDataClass<C, V, D>>(Base: B): FontDataClass<C, V, D> & B;
