"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllPackages = void 0;
require("./base/BaseConfiguration.js");
require("./action/ActionConfiguration.js");
require("./ams/AmsConfiguration.js");
require("./amscd/AmsCdConfiguration.js");
require("./bbox/BboxConfiguration.js");
require("./boldsymbol/BoldsymbolConfiguration.js");
require("./braket/BraketConfiguration.js");
require("./bussproofs/BussproofsConfiguration.js");
require("./cancel/CancelConfiguration.js");
require("./color/ColorConfiguration.js");
require("./colorv2/ColorV2Configuration.js");
require("./configmacros/ConfigMacrosConfiguration.js");
require("./enclose/EncloseConfiguration.js");
require("./extpfeil/ExtpfeilConfiguration.js");
require("./gensymb/GensymbConfiguration.js");
require("./html/HtmlConfiguration.js");
require("./mathtools/MathtoolsConfiguration.js");
require("./mhchem/MhchemConfiguration.js");
require("./newcommand/NewcommandConfiguration.js");
require("./noerrors/NoErrorsConfiguration.js");
require("./noundefined/NoUndefinedConfiguration.js");
require("./physics/PhysicsConfiguration.js");
require("./tagformat/TagFormatConfiguration.js");
require("./textmacros/TextMacrosConfiguration.js");
require("./upgreek/UpgreekConfiguration.js");
require("./unicode/UnicodeConfiguration.js");
require("./verb/VerbConfiguration.js");
require("./numcases/NumcasesConfiguration.js");
require("./empheq/EmpheqConfiguration.js");
if (typeof MathJax !== 'undefined' && MathJax.loader) {
    MathJax.loader.preLoad('[tex]/action', '[tex]/ams', '[tex]/amscd', '[tex]/bbox', '[tex]/boldsymbol', '[tex]/braket', '[tex]/bussproofs', '[tex]/cancel', '[tex]/color', '[tex]/colorv2', '[tex]/enclose', '[tex]/extpfeil', '[tex]/gensymb', '[tex]/html', '[tex]/mathtools', '[tex]/mhchem', '[tex]/newcommand', '[tex]/noerrors', '[tex]/noundefined', '[tex]/physics', '[tex]/upgreek', '[tex]/unicode', '[tex]/verb', '[tex]/numcases', '[tex]/empheq', '[tex]/configmacros', '[tex]/tagformat', '[tex]/textmacros');
}
exports.AllPackages = [
    'base',
    'action',
    'ams',
    'amscd',
    'bbox',
    'boldsymbol',
    'braket',
    'bussproofs',
    'cancel',
    'color',
    'enclose',
    'extpfeil',
    'gensymb',
    'html',
    'mathtools',
    'mhchem',
    'newcommand',
    'noerrors',
    'noundefined',
    'upgreek',
    'unicode',
    'verb',
    'numcases',
    'empheq',
    'configmacros',
    'tagformat',
    'textmacros'
];
//# sourceMappingURL=AllPackages.js.map