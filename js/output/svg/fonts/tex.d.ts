import { SvgFontData, SvgCharOptions, SvgVariantData, SvgDelimiterData, DelimiterMap, CharMapMap } from '../FontData.js';
import { OptionList } from '../../../util/Options.js';
declare const TeXFont_base: import("../FontData.js").FontDataClass<SvgCharOptions, SvgVariantData, SvgDelimiterData> & typeof SvgFontData;
export declare class TeXFont extends TeXFont_base {
    protected static defaultDelimiters: DelimiterMap<SvgDelimiterData>;
    protected static defaultChars: CharMapMap<SvgCharOptions>;
    protected static variantCacheIds: {
        [name: string]: string;
    };
    constructor(options?: OptionList);
}
export {};
