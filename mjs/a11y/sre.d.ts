import * as Api from '#sre/common/system.js';
import { Walker } from '#sre/walker/walker.js';
import * as WalkerFactory from '#sre/walker/walker_factory.js';
import * as SpeechGeneratorFactory from '#sre/speech_generator/speech_generator_factory.js';
import { ClearspeakPreferences } from '#sre/speech_rules/clearspeak_preferences.js';
import { Highlighter } from '#sre/highlighter/highlighter.js';
import * as HighlighterFactory from '#sre/highlighter/highlighter_factory.js';
import { SpeechGenerator } from '#sre/speech_generator/speech_generator.js';
export declare namespace Sre {
    type highlighter = Highlighter;
    type speechGenerator = SpeechGenerator;
    type walker = Walker;
    const locales: Map<string, string>;
    const sreReady: typeof Api.engineReady;
    const setupEngine: typeof Api.setupEngine;
    const engineSetup: typeof Api.engineSetup;
    const toEnriched: typeof Api.toEnriched;
    const toSpeech: typeof Api.toSpeech;
    const clearspeakPreferences: typeof ClearspeakPreferences;
    const getHighlighter: typeof HighlighterFactory.highlighter;
    const updateHighlighter: typeof HighlighterFactory.update;
    const getSpeechGenerator: typeof SpeechGeneratorFactory.generator;
    const getWalker: typeof WalkerFactory.walker;
    const preloadLocales: (locale: string) => Promise<unknown>;
}
export declare const sreReady: typeof Api.engineReady;
export default Sre;
