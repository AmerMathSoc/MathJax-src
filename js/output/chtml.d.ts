import { CommonOutputJax } from './common.js';
import { CommonWrapper } from './common/Wrapper.js';
import { StyleList as CssStyleList, CssStyles } from '../util/StyleList.js';
import { OptionList } from '../util/Options.js';
import { MathDocument } from '../core/MathDocument.js';
import { MathItem } from '../core/MathItem.js';
import { ChtmlWrapper, ChtmlWrapperClass } from './chtml/Wrapper.js';
import { ChtmlWrapperFactory } from './chtml/WrapperFactory.js';
import { ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass } from './chtml/FontData.js';
import { Usage } from './chtml/Usage.js';
export declare class CHTML<N, T, D> extends CommonOutputJax<N, T, D, ChtmlWrapper<N, T, D>, ChtmlWrapperFactory<N, T, D>, ChtmlWrapperClass<N, T, D>, ChtmlCharOptions, ChtmlVariantData, ChtmlDelimiterData, ChtmlFontData, ChtmlFontDataClass> {
    static NAME: string;
    static OPTIONS: OptionList;
    static commonStyles: CssStyleList;
    static STYLESHEETID: string;
    wrapperUsage: Usage<string>;
    chtmlStyles: N;
    constructor(options?: OptionList);
    escaped(math: MathItem<N, T, D>, html: MathDocument<N, T, D>): N;
    styleSheet(html: MathDocument<N, T, D>): N;
    protected updateFontStyles(styles: CssStyles): void;
    protected addWrapperStyles(styles: CssStyles): void;
    protected addClassStyles(wrapper: typeof CommonWrapper, styles: CssStyles): void;
    processMath(wrapper: ChtmlWrapper<N, T, D>, parent: N): void;
    clearCache(): void;
    reset(): void;
    protected getInitialScale(): number;
    unknownText(text: string, variant: string, width?: number): N;
    measureTextNode(textNode: N): {
        w: number;
        h: number;
        d: number;
    };
}
