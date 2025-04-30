import { MathDocument } from '../../core/MathDocument.js';
import { StyleJsonSheet } from '../../util/StyleJson.js';
import * as Sre from '../sre.js';
import { SsmlElement } from '../speech/SpeechUtil.js';
export type A11yDocument = MathDocument<HTMLElement, Text, Document>;
export interface Region<T> {
    AddStyles(): void;
    AddElement(): void;
    Show(node: HTMLElement, highlighter: Sre.highlighter): void;
    Hide(): void;
    Clear(): void;
    Update(content: T): void;
}
export declare abstract class AbstractRegion<T> implements Region<T> {
    document: A11yDocument;
    protected static className: string;
    protected static styleAdded: boolean;
    protected static style: StyleJsonSheet;
    div: HTMLElement;
    protected inner: HTMLElement;
    protected CLASS: typeof AbstractRegion;
    constructor(document: A11yDocument);
    AddStyles(): void;
    AddElement(): void;
    Show(node: HTMLElement, highlighter: Sre.highlighter): void;
    protected abstract position(node: HTMLElement): void;
    protected abstract highlight(highlighter: Sre.highlighter): void;
    Hide(): void;
    abstract Clear(): void;
    abstract Update(content: T): void;
    protected stackRegions(node: HTMLElement): void;
}
export declare class DummyRegion extends AbstractRegion<void> {
    Clear(): void;
    Update(): void;
    Hide(): void;
    Show(): void;
    AddElement(): void;
    AddStyles(): void;
    position(): void;
    highlight(_highlighter: Sre.highlighter): void;
}
export declare class StringRegion extends AbstractRegion<string> {
    Clear(): void;
    Update(speech: string): void;
    protected position(node: HTMLElement): void;
    protected highlight(highlighter: Sre.highlighter): void;
}
export declare class ToolTip extends StringRegion {
    protected static className: string;
    protected static style: StyleJsonSheet;
}
export declare class LiveRegion extends StringRegion {
    protected static className: string;
    protected static style: StyleJsonSheet;
}
export declare class SpeechRegion extends LiveRegion {
    active: boolean;
    node: Element;
    private clear;
    highlighter: Sre.highlighter;
    Show(node: HTMLElement, highlighter: Sre.highlighter): void;
    private voiceRequest;
    Update(speech: string): void;
    private makeVoice;
    protected makeUtterances(ssml: SsmlElement[], locale: string): void;
    private highlightNode;
}
export declare class HoverRegion extends AbstractRegion<HTMLElement> {
    protected static className: string;
    protected static style: StyleJsonSheet;
    protected position(node: HTMLElement): void;
    protected highlight(highlighter: Sre.highlighter): void;
    Show(node: HTMLElement, highlighter: Sre.highlighter): void;
    Clear(): void;
    Update(node: HTMLElement): void;
    private cloneNode;
}
