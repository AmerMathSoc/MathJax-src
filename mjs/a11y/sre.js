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
import * as WalkerFactory from '#sre/walker/walker_factory.js';
import * as SpeechGeneratorFactory from '#sre/speech_generator/speech_generator_factory.js';
import Engine from '#sre/common/engine.js';
import { ClearspeakPreferences } from '#sre/speech_rules/clearspeak_preferences.js';
import * as HighlighterFactory from '#sre/highlighter/highlighter_factory.js';
import { Variables } from '#sre/common/variables.js';
import MathMaps from './mathmaps.js';
export var Sre;
(function (Sre) {
    Sre.locales = Variables.LOCALES;
    Sre.sreReady = Api.engineReady;
    Sre.setupEngine = Api.setupEngine;
    Sre.engineSetup = Api.engineSetup;
    Sre.toEnriched = Api.toEnriched;
    Sre.toSpeech = Api.toSpeech;
    Sre.clearspeakPreferences = ClearspeakPreferences;
    Sre.getHighlighter = HighlighterFactory.highlighter;
    Sre.updateHighlighter = HighlighterFactory.update;
    Sre.getSpeechGenerator = SpeechGeneratorFactory.generator;
    Sre.getWalker = WalkerFactory.walker;
    Sre.preloadLocales = function (locale) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = MathMaps.get(locale);
            return json ? new Promise((res, _rej) => res(JSON.stringify(json))) :
                Api.localeLoader()(locale);
        });
    };
})(Sre || (Sre = {}));
export const sreReady = Sre.sreReady;
Engine.getInstance().delay = true;
export default Sre;
//# sourceMappingURL=sre.js.map