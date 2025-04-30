var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Api from '#sre/common/system.js';
import { Engine } from '#sre/common/engine.js';
import { ClearspeakPreferences } from '#sre/speech_rules/clearspeak_preferences.js';
import * as HighlighterFactory from '#sre/highlighter/highlighter_factory.js';
import { parseInput } from '#sre/common/dom_util.js';
import { Variables } from '#sre/common/variables.js';
export { semanticMathmlNode } from '#sre/enrich_mathml/enrich.js';
export const locales = Variables.LOCALES;
export const sreReady = Api.engineReady;
export const setupEngine = Api.setupEngine;
export const engineSetup = Api.engineSetup;
export const toEnriched = Api.toEnriched;
export const toSpeech = Api.toSpeech;
export const clearspeakPreferences = ClearspeakPreferences;
export const getHighlighter = HighlighterFactory.highlighter;
export const updateHighlighter = HighlighterFactory.update;
export const parseDOM = parseInput;
export const preloadLocales = function (_locale) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.resolve('{}');
    });
};
Engine.getInstance().delay = true;
//# sourceMappingURL=sre.js.map