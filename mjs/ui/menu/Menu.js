var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { mathjax } from '../../mathjax.js';
import { STATE } from '../../core/MathItem.js';
import { MathJax as MJX } from '../../components/global.js';
import { userOptions, defaultOptions, expandable, } from '../../util/Options.js';
import * as AnnotationMenu from './AnnotationMenu.js';
import { MJContextMenu } from './MJContextMenu.js';
import { RadioCompare } from './RadioCompare.js';
import { MmlVisitor } from './MmlVisitor.js';
import { SelectableInfo } from './SelectableInfo.js';
import * as MenuUtil from './MenuUtil.js';
import { Info, Parser, Rule, CssStyles, Submenu } from './mj-context-menu.js';
const MathJax = MJX;
const XMLDECLARATION = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
export class Menu {
    get isLoading() {
        return Menu.loading > 0;
    }
    get loadingPromise() {
        if (!this.isLoading) {
            return Promise.resolve();
        }
        if (!Menu._loadingPromise) {
            Menu._loadingPromise = new Promise((ok, failed) => {
                Menu._loadingOK = ok;
                Menu._loadingFailed = failed;
            });
        }
        return Menu._loadingPromise;
    }
    constructor(document, options = {}) {
        this.settings = null;
        this.defaultSettings = null;
        this.menu = null;
        this.MmlVisitor = new MmlVisitor();
        this.jax = {
            CHTML: null,
            SVG: null,
        };
        this.rerenderStart = STATE.LAST;
        this.requiredExtensions = [];
        this.about = new Info('<b style="font-size:120%;">MathJax</b> v' + mathjax.version, () => {
            const lines = [];
            lines.push('Input Jax: ' + this.document.inputJax.map((jax) => jax.name).join(', '));
            lines.push('Output Jax: ' + this.document.outputJax.name);
            lines.push('Document Type: ' + this.document.kind);
            return lines.join('<br/>');
        }, '<a href="https://www.mathjax.org">www.mathjax.org</a>');
        this.help = new Info('<b>MathJax Help</b>', () => {
            return [
                '<p><b>MathJax</b> is a JavaScript library that allows page',
                ' authors to include mathematics within their web pages.',
                " As a reader, you don't need to do anything to make that happen.</p>",
                '<p><b>Browsers</b>: MathJax works with all modern browsers including',
                ' Edge, Firefox, Chrome, Safari, Opera, and most mobile browsers.</p>',
                '<p><b>Math Menu</b>: MathJax adds a contextual menu to equations.',
                ' Right-click or CTRL-click on any mathematics to access the menu.</p>',
                '<div style="margin-left: 1em;">',
                "<p><b>Show Math As:</b> These options allow you to view the formula's",
                ' source markup (as MathML or in its original format).</p>',
                "<p><b>Copy to Clipboard:</b> These options copy the formula's source markup,",
                ' as MathML or in its original format, to the clipboard',
                ' (in browsers that support that).</p>',
                '<p><b>Math Settings:</b> These give you control over features of MathJax,',
                ' such the size of the mathematics, the mechanism used to display equations,',
                ' how to handle equations that are too wide, and the language to use for',
                " MathJax's menus and error messages (not yet implemented in v4).",
                '</p>',
                '<p><b>Accessibility</b>: MathJax can work with screen',
                ' readers to make mathematics accessible to the visually impaired.',
                ' Turn on speech or braille generation to enable creation of speech strings',
                ' and the ability to investigate expressions interactively.  You can control',
                ' the style of the explorer in its menu.</p>',
                '</div>',
                '<p><b>Math Zoom</b>: If you are having difficulty reading an',
                ' equation, MathJax can enlarge it to help you see it better, or',
                ' you can scale all the math on the page to make it larger.',
                ' Turn these features on in the <b>Math Settings</b> menu.</p>',
                "<p><b>Preferences</b>: MathJax uses your browser's localStorage database",
                ' to save the preferences set via this menu locally in your browser.  These',
                ' are not used to track you, and are not transferred or used remotely by',
                ' MathJax in any way.</p>',
            ].join('\n');
        }, '<a href="https://www.mathjax.org">www.mathjax.org</a>');
        this.mathmlCode = new SelectableInfo('MathJax MathML Expression', () => {
            if (!this.menu.mathItem)
                return '';
            const text = this.toMML(this.menu.mathItem);
            return '<pre>' + this.formatSource(text) + '</pre>';
        }, '');
        this.originalText = new SelectableInfo('MathJax Original Source', () => {
            if (!this.menu.mathItem)
                return '';
            const text = this.menu.mathItem.math;
            return ('<pre style="font-size:125%; margin:0">' +
                this.formatSource(text) +
                '</pre>');
        }, '');
        this.annotationBox = new SelectableInfo('MathJax Annotation Text', () => {
            const text = AnnotationMenu.annotation;
            return ('<pre style="font-size:125%; margin:0">' +
                this.formatSource(text) +
                '</pre>');
        }, '');
        this.svgImage = new SelectableInfo('MathJax SVG Image', () => {
            return ('<div id="svg-image" style="font-family: monospace; font-size:125%; margin:0">' +
                'Generative SVG Image...</div>');
        }, '');
        this.speechText = new SelectableInfo('MathJax Speech Text', () => {
            if (!this.menu.mathItem)
                return '';
            return ('<div style="font-size:125%; margin:0">' +
                this.formatSource(this.menu.mathItem.outputData.speech) +
                '</div>');
        }, '');
        this.brailleText = new SelectableInfo('MathJax Braille Code', () => {
            if (!this.menu.mathItem)
                return '';
            return ('<div style="font-size:125%; margin:0">' +
                this.formatSource(this.menu.mathItem.outputData.braille) +
                '</div>');
        }, '');
        this.errorMessage = new SelectableInfo('MathJax Error Message', () => {
            if (!this.menu.mathItem)
                return '';
            return ('<pre style="font-size:125%; margin:0">' +
                this.formatSource(this.menu.errorMsg) +
                '</pre>');
        }, '');
        this.zoomBox = new Info('MathJax Zoomed Expression', () => {
            if (!this.menu.mathItem)
                return '';
            const element = this.menu.mathItem.typesetRoot.cloneNode(true);
            element.style.margin = '0';
            const scale = 1.25 * parseFloat(this.settings.zscale);
            return ('<div style="font-size: ' + scale + '%">' + element.outerHTML + '</div>');
        }, '');
        this.document = document;
        this.options = userOptions(defaultOptions({}, this.constructor.OPTIONS), options);
        this.initSettings();
        this.mergeUserSettings();
        this.initMenu();
        this.applySettings();
    }
    initSettings() {
        this.settings = this.options.settings;
        this.jax = this.options.jax;
        const jax = this.document.outputJax;
        this.jax[jax.name] = jax;
        this.settings.renderer = jax.name;
        this.settings.scale = jax.options.scale;
        this.settings.overflow =
            jax.options.displayOverflow.substring(0, 1).toUpperCase() +
                jax.options.displayOverflow.substring(1).toLowerCase();
        this.settings.breakInline = jax.options.linebreaks.inline;
        this.defaultSettings = Object.assign({}, this.document.options.a11y, this.settings);
    }
    initMenu() {
        const parser = new Parser([
            ['contextMenu', MJContextMenu.fromJson.bind(MJContextMenu)],
            ['radioCompare', RadioCompare.fromJson.bind(RadioCompare)],
        ]);
        this.menu = parser.parse({
            type: 'contextMenu',
            id: 'MathJax_Menu',
            pool: [
                this.variable('showSRE'),
                this.variable('showTex'),
                this.variable('texHints'),
                this.variable('semantics'),
                this.variable('zoom'),
                this.variable('zscale'),
                this.variable('renderer', (jax) => this.setRenderer(jax)),
                this.variable('overflow', (overflow) => this.setOverflow(overflow)),
                this.variable('breakInline', (breaks) => this.setInlineBreaks(breaks)),
                this.variable('alt'),
                this.variable('cmd'),
                this.variable('ctrl'),
                this.variable('shift'),
                this.variable('scale', (scale) => this.setScale(scale)),
                this.a11yVar('speech', (speech) => this.setSpeech(speech)),
                this.a11yVar('braille', (braille) => this.setBraille(braille)),
                this.variable('brailleCode', (code) => this.setBrailleCode(code)),
                this.a11yVar('highlight', (value) => this.setHighlight(value)),
                this.a11yVar('backgroundColor'),
                this.a11yVar('backgroundOpacity'),
                this.a11yVar('foregroundColor'),
                this.a11yVar('foregroundOpacity'),
                this.a11yVar('subtitles'),
                this.a11yVar('viewBraille'),
                this.a11yVar('voicing'),
                this.a11yVar('locale', (locale) => this.setLocale(locale)),
                this.variable('speechRules', (value) => {
                    const [domain, style] = value.split('-');
                    this.document.options.sre.domain = domain;
                    this.document.options.sre.style = style;
                    this.rerender(STATE.COMPILED);
                }),
                this.a11yVar('magnification'),
                this.a11yVar('magnify'),
                this.a11yVar('treeColoring'),
                this.a11yVar('infoType'),
                this.a11yVar('infoRole'),
                this.a11yVar('infoPrefix'),
                this.variable('autocollapse'),
                this.variable('collapsible', (collapse) => this.setCollapsible(collapse)),
                this.variable('enrich', (enrich) => this.setEnrichment(enrich)),
                this.variable('inTabOrder', (tab) => this.setTabOrder(tab)),
                this.variable('assistiveMml', (mml) => this.setAssistiveMml(mml)),
            ],
            items: [
                this.submenu('Show', 'Show Math As', [
                    this.command('MathMLcode', 'MathML Code', () => this.mathmlCode.post()),
                    this.command('Original', 'Original Form', () => this.originalText.post()),
                    this.rule(),
                    this.command('Speech', 'Speech Text', () => this.speechText.post(), {
                        disabled: true,
                    }),
                    this.command('Braille', 'Braille Code', () => this.brailleText.post(), { disabled: true }),
                    this.command('SVG', 'SVG Image', () => this.postSvgImage(), {
                        disabled: true,
                    }),
                    this.submenu('ShowAnnotation', 'Annotation'),
                    this.rule(),
                    this.command('Error', 'Error Message', () => this.errorMessage.post(), { disabled: true }),
                ]),
                this.submenu('Copy', 'Copy to Clipboard', [
                    this.command('MathMLcode', 'MathML Code', () => this.copyMathML()),
                    this.command('Original', 'Original Form', () => this.copyOriginal()),
                    this.rule(),
                    this.command('Speech', 'Speech Text', () => this.copySpeechText(), {
                        disabled: true,
                    }),
                    this.command('Braille', 'Braille Code', () => this.copyBrailleText(), { disabled: true }),
                    this.command('SVG', 'SVG Image', () => this.copySvgImage(), {
                        disabled: true,
                    }),
                    this.submenu('CopyAnnotation', 'Annotation'),
                    this.rule(),
                    this.command('Error', 'Error Message', () => this.copyErrorMessage(), { disabled: true }),
                ]),
                this.rule(),
                this.submenu('Settings', 'Math Settings', [
                    this.submenu('Renderer', 'Math Renderer', this.radioGroup('renderer', [['CHTML'], ['SVG']])),
                    this.submenu('Overflow', 'Wide Expressions', [
                        this.radioGroup('overflow', [
                            ['Overflow'],
                            ['Scroll'],
                            ['Linebreak'],
                            ['Scale'],
                            ['Truncate'],
                            ['Elide'],
                        ]),
                        this.rule(),
                        this.checkbox('BreakInline', 'Allow In-line Breaks', 'breakInline'),
                    ]),
                    this.rule(),
                    this.submenu('MathmlIncludes', 'MathML/SVG has', [
                        this.checkbox('showSRE', 'Semantic attributes', 'showSRE'),
                        this.checkbox('showTex', 'LaTeX attributes', 'showTex'),
                        this.checkbox('texHints', 'TeX hints', 'texHints'),
                        this.checkbox('semantics', 'Original as annotation', 'semantics'),
                    ]),
                    this.submenu('Language', 'Language'),
                    this.rule(),
                    this.submenu('ZoomTrigger', 'Zoom Trigger', [
                        this.command('ZoomNow', 'Zoom Once Now', () => this.zoom(null, '', this.menu.mathItem)),
                        this.rule(),
                        this.radioGroup('zoom', [
                            ['Click'],
                            ['DoubleClick', 'Double-Click'],
                            ['NoZoom', 'No Zoom'],
                        ]),
                        this.rule(),
                        this.label('TriggerRequires', 'Trigger Requires:'),
                        this.checkbox(MenuUtil.isMac ? 'Option' : 'Alt', MenuUtil.isMac ? 'Option' : 'Alt', 'alt'),
                        this.checkbox('Command', 'Command', 'cmd', {
                            hidden: !MenuUtil.isMac,
                        }),
                        this.checkbox('Control', 'Control', 'ctrl', {
                            hiddne: MenuUtil.isMac,
                        }),
                        this.checkbox('Shift', 'Shift', 'shift'),
                    ]),
                    this.submenu('ZoomFactor', 'Zoom Factor', this.radioGroup('zscale', [
                        ['150%'],
                        ['175%'],
                        ['200%'],
                        ['250%'],
                        ['300%'],
                        ['400%'],
                    ])),
                    this.rule(),
                    this.command('Scale', 'Scale All Math...', () => this.scaleAllMath()),
                    this.rule(),
                    this.command('Reset', 'Reset to defaults', () => this.resetDefaults()),
                ]),
                this.rule(),
                this.label('Accessibility', '\xA0\xA0 Accessibility:'),
                this.submenu('Speech', '\xA0 \xA0 Speech', [
                    this.checkbox('Generate', 'Generate', 'speech'),
                    this.checkbox('Subtitles', 'Show Subtitles', 'subtitles'),
                    this.checkbox('Auto Voicing', 'Auto Voicing', 'voicing'),
                    this.rule(),
                    this.label('Rules', 'Rules:'),
                    this.submenu('Mathspeak', 'Mathspeak', this.radioGroup('speechRules', [
                        ['mathspeak-default', 'Verbose'],
                        ['mathspeak-brief', 'Brief'],
                        ['mathspeak-sbrief', 'Superbrief'],
                    ])),
                    this.submenu('Clearspeak', 'Clearspeak', this.radioGroup('speechRules', [['clearspeak-default', 'Auto']])),
                    this.submenu('ChromeVox', 'ChromeVox', this.radioGroup('speechRules', [
                        ['chromevox-default', 'Standard'],
                        ['chromevox-alternative', 'Alternative'],
                    ])),
                    this.rule(),
                    this.submenu('A11yLanguage', 'Language'),
                ]),
                this.submenu('Braille', '\xA0 \xA0 Braille', [
                    this.checkbox('Generate', 'Generate', 'braille'),
                    this.checkbox('Subtitles', 'Show Subtitles', 'viewBraille'),
                    this.rule(),
                    this.label('Code', 'Code Format:'),
                    this.radioGroup('brailleCode', [
                        ['nemeth', 'Nemeth'],
                        ['ueb', 'UEB'],
                        ['euro', 'Euro'],
                    ]),
                ]),
                this.submenu('Explorer', '\xA0 \xA0 Explorer', [
                    this.submenu('Highlight', 'Highlight', [
                        this.submenu('Background', 'Background', this.radioGroup('backgroundColor', [
                            ['Blue'],
                            ['Red'],
                            ['Green'],
                            ['Yellow'],
                            ['Cyan'],
                            ['Magenta'],
                            ['White'],
                            ['Black'],
                        ])),
                        { type: 'slider', variable: 'backgroundOpacity', content: ' ' },
                        this.submenu('Foreground', 'Foreground', this.radioGroup('foregroundColor', [
                            ['Black'],
                            ['White'],
                            ['Magenta'],
                            ['Cyan'],
                            ['Yellow'],
                            ['Green'],
                            ['Red'],
                            ['Blue'],
                        ])),
                        { type: 'slider', variable: 'foregroundOpacity', content: ' ' },
                        this.rule(),
                        this.radioGroup('highlight', [['None'], ['Hover'], ['Flame']]),
                        this.rule(),
                        this.checkbox('TreeColoring', 'Tree Coloring', 'treeColoring'),
                    ]),
                    this.submenu('Magnification', 'Magnification', [
                        this.radioGroup('magnification', [
                            ['None'],
                            ['Keyboard'],
                            ['Mouse'],
                        ]),
                        this.rule(),
                        this.radioGroup('magnify', [
                            ['200%'],
                            ['300%'],
                            ['400%'],
                            ['500%'],
                        ]),
                    ]),
                    this.submenu('Semantic Info', 'Semantic Info', [
                        this.checkbox('Type', 'Type', 'infoType'),
                        this.checkbox('Role', 'Role', 'infoRole'),
                        this.checkbox('Prefix', 'Prefix', 'infoPrefix'),
                    ], true),
                ]),
                this.submenu('Options', '\xA0 \xA0 Options', [
                    this.checkbox('Enrich', 'Semantic Enrichment', 'enrich'),
                    this.checkbox('Collapsible', 'Collapsible Math', 'collapsible'),
                    this.checkbox('AutoCollapse', 'Auto Collapse', 'autocollapse', {
                        disabled: true,
                    }),
                    this.rule(),
                    this.checkbox('InTabOrder', 'Include in Tab Order', 'inTabOrder'),
                    this.checkbox('AssistiveMml', 'Include Hidden MathML', 'assistiveMml'),
                ]),
                this.rule(),
                this.command('About', 'About MathJax', () => this.about.post()),
                this.command('Help', 'MathJax Help', () => this.help.post()),
            ],
        });
        const menu = this.menu;
        menu.settings = this.settings;
        menu.findID('Settings', 'Overflow', 'Elide').disable();
        menu.findID('Braille', 'ueb').hide();
        menu.setJax(this.jax);
        this.attachDialogMenus(menu);
        this.checkLoadableItems();
        const cache = [];
        MJContextMenu.DynamicSubmenus.set('ShowAnnotation', [
            AnnotationMenu.showAnnotations(this.annotationBox, this.options.annotationTypes, cache),
            '',
        ]);
        MJContextMenu.DynamicSubmenus.set('CopyAnnotation', [
            AnnotationMenu.copyAnnotations(cache),
            '',
        ]);
        CssStyles.addInfoStyles(this.document.document);
        CssStyles.addMenuStyles(this.document.document);
    }
    attachDialogMenus(menu) {
        this.about.attachMenu(menu);
        this.help.attachMenu(menu);
        this.originalText.attachMenu(menu);
        this.mathmlCode.attachMenu(menu);
        this.originalText.attachMenu(menu);
        this.svgImage.attachMenu(menu);
        this.speechText.attachMenu(menu);
        this.brailleText.attachMenu(menu);
        this.errorMessage.attachMenu(menu);
        this.zoomBox.attachMenu(menu);
    }
    checkLoadableItems() {
        var _a, _b, _c, _d, _e, _f;
        if (MathJax && MathJax._ && MathJax.loader && MathJax.startup) {
            if ((this.settings.enrich ||
                this.settings.collapsible ||
                this.settings.speech ||
                this.settings.braille) &&
                !((_b = (_a = MathJax._) === null || _a === void 0 ? void 0 : _a.a11y) === null || _b === void 0 ? void 0 : _b['semantic-enrich']) &&
                !((_d = (_c = MathJax._) === null || _c === void 0 ? void 0 : _c.a11y) === null || _d === void 0 ? void 0 : _d['speech'])) {
                this.loadA11y('explorer');
            }
            if (this.settings.assistiveMml && !((_f = (_e = MathJax._) === null || _e === void 0 ? void 0 : _e.a11y) === null || _f === void 0 ? void 0 : _f['assistive-mml'])) {
                this.loadA11y('assistive-mml');
            }
        }
        else {
            const menu = this.menu;
            for (const name of Object.keys(this.jax)) {
                if (!this.jax[name]) {
                    menu.findID('Settings', 'Renderer', name).disable();
                }
            }
            menu.findID('Speech').disable();
            menu.findID('Braille').disable();
            menu.findID('Explorer').disable();
            menu.findID('Options', 'AutoCollapse').disable();
            menu.findID('Options', 'Collapsible').disable();
            menu.findID('Options', 'Enrich').disable();
            menu.findID('Options', 'AssistiveMml').disable();
        }
    }
    enableAccessibilityItems(name, enable) {
        const menu = this.menu.findID(name).submenu;
        for (const item of menu.items.slice(1)) {
            if (item instanceof Rule)
                continue;
            enable && (!(item instanceof Submenu) || item.submenu.items.length)
                ? item.enable()
                : item.disable();
        }
    }
    mergeUserSettings() {
        try {
            const settings = localStorage.getItem(Menu.MENU_STORAGE);
            if (!settings)
                return;
            Object.assign(this.settings, JSON.parse(settings));
            this.setA11y(this.settings);
        }
        catch (err) {
            console.log('MathJax localStorage error: ' + err.message);
        }
    }
    saveUserSettings() {
        const settings = {};
        for (const name of Object.keys(this.settings)) {
            if (this.settings[name] !== this.defaultSettings[name]) {
                settings[name] = this.settings[name];
            }
        }
        try {
            if (Object.keys(settings).length) {
                localStorage.setItem(Menu.MENU_STORAGE, JSON.stringify(settings));
            }
            else {
                localStorage.removeItem(Menu.MENU_STORAGE);
            }
        }
        catch (err) {
            console.log('MathJax localStorage error: ' + err.message);
        }
    }
    setA11y(options) {
        var _a, _b;
        if ((_b = (_a = MathJax._) === null || _a === void 0 ? void 0 : _a.a11y) === null || _b === void 0 ? void 0 : _b.explorer) {
            MathJax._.a11y.explorer_ts.setA11yOptions(this.document, options);
        }
    }
    getA11y(option) {
        var _a, _b;
        if ((_b = (_a = MathJax._) === null || _a === void 0 ? void 0 : _a.a11y) === null || _b === void 0 ? void 0 : _b.explorer) {
            if (this.document.options.a11y[option] !== undefined) {
                return this.document.options.a11y[option];
            }
            return this.document.options.sre[option];
        }
    }
    applySettings() {
        this.setTabOrder(this.settings.inTabOrder);
        const options = this.document.options;
        options.enableAssistiveMml = this.settings.assistiveMml;
        this.enableAccessibilityItems('Speech', this.settings.speech);
        this.enableAccessibilityItems('Braille', this.settings.braille);
        this.setAccessibilityMenus();
        const renderer = this.settings.renderer.replace(/[^a-zA-Z0-9]/g, '') || 'CHTML';
        const promise = (Menu._loadingPromise || Promise.resolve()).then(() => renderer !== this.defaultSettings.renderer
            ? this.setRenderer(renderer, false)
            : Promise.resolve());
        promise.then(() => {
            const settings = this.settings;
            const options = this.document.outputJax.options;
            options.scale = parseFloat(settings.scale);
            options.displayOverflow = settings.overflow.toLowerCase();
            options.linebreaks.inline = settings.breakInline;
            if (!settings.speechRules) {
                const sre = this.document.options.sre;
                settings.speechRules = `${sre.domain || 'clearspeak'}-${sre.style || 'default'}`;
            }
        });
    }
    setOverflow(overflow) {
        this.document.outputJax.options.displayOverflow = overflow.toLowerCase();
        if (!Menu.loading) {
            this.document.rerender();
        }
    }
    setInlineBreaks(breaks) {
        this.document.outputJax.options.linebreaks.inline = breaks;
        if (!Menu.loading) {
            this.document.rerender();
        }
    }
    setScale(scale) {
        this.document.outputJax.options.scale = parseFloat(scale);
        if (!Menu.loading) {
            this.document.rerender();
        }
    }
    setRenderer(jax, rerender = true) {
        if (Object.hasOwn(this.jax, jax) && this.jax[jax]) {
            return this.setOutputJax(jax, rerender);
        }
        const name = jax.toLowerCase();
        return new Promise((ok, fail) => {
            this.loadComponent('output/' + name, () => {
                const startup = MathJax.startup;
                if (!(name in startup.constructors)) {
                    return fail(new Error(`Component ${name} not loaded`));
                }
                startup.useOutput(name, true);
                startup.output = startup.getOutputJax();
                startup.output.setAdaptor(this.document.adaptor);
                startup.output.initialize();
                this.jax[jax] = startup.output;
                this.setOutputJax(jax, rerender)
                    .then(() => ok())
                    .catch((err) => fail(err));
            });
        });
    }
    setOutputJax(jax, rerender = true) {
        this.jax[jax].setAdaptor(this.document.adaptor);
        this.document.outputJax = this.jax[jax];
        const promise = this.loadRequiredExtensions();
        return rerender
            ? promise.then(() => mathjax.handleRetriesFor(() => this.rerender()))
            : promise;
    }
    loadRequiredExtensions() {
        const jax = this.document.outputJax.name.toLowerCase();
        const promises = [];
        for (const path of this.requiredExtensions) {
            promises.push(MathJax.loader.load(`[${path}]/${jax}`));
        }
        this.requiredExtensions = [];
        return Promise.all(promises);
    }
    addRequiredExtensions(extensions) {
        if (extensions) {
            const set = new Set([...this.requiredExtensions, ...extensions]);
            this.requiredExtensions = [...set];
        }
    }
    setTabOrder(tab) {
        this.menu.store.inTaborder(tab);
    }
    setAssistiveMml(mml) {
        var _a, _b;
        this.document.options.enableAssistiveMml = mml;
        if (!mml || ((_b = (_a = MathJax._) === null || _a === void 0 ? void 0 : _a.a11y) === null || _b === void 0 ? void 0 : _b['assistive-mml'])) {
            this.rerender();
        }
        else {
            this.loadA11y('assistive-mml');
        }
    }
    setAccessibilityMenus() {
        const enable = this.settings.enrich;
        const method = enable ? 'enable' : 'disable';
        ['Speech', 'Braille', 'Explorer'].forEach((id) => this.menu.findID(id)[method]());
        const options = this.document.options;
        options.enableSpeech =
            options.enableBraille =
                options.enableExplorer =
                    enable;
        if (!enable) {
            this.settings.collapsible = false;
            this.document.options.enableCollapsible = false;
        }
    }
    setSpeech(speech) {
        var _a, _b;
        this.enableAccessibilityItems('Speech', speech);
        this.document.options.enableSpeech = speech;
        if (!speech || ((_b = (_a = MathJax._) === null || _a === void 0 ? void 0 : _a.a11y) === null || _b === void 0 ? void 0 : _b['speech'])) {
            this.rerender(STATE.COMPILED);
        }
        else {
            this.loadA11y('explorer');
        }
    }
    setBraille(braille) {
        var _a, _b;
        this.enableAccessibilityItems('Braille', braille);
        this.document.options.enableBraille = braille;
        if (!braille || ((_b = (_a = MathJax._) === null || _a === void 0 ? void 0 : _a.a11y) === null || _b === void 0 ? void 0 : _b['speech'])) {
            this.rerender(STATE.COMPILED);
        }
        else {
            this.loadA11y('explorer');
        }
    }
    setBrailleCode(code) {
        this.document.options.sre.braille = code;
        this.rerender(STATE.COMPILED);
    }
    setLocale(locale) {
        this.document.options.sre.locale = locale;
        this.rerender(STATE.COMPILED);
    }
    setEnrichment(enrich) {
        var _a, _b;
        this.document.options.enableEnrichment = enrich;
        this.setAccessibilityMenus();
        if (!enrich || ((_b = (_a = MathJax._) === null || _a === void 0 ? void 0 : _a.a11y) === null || _b === void 0 ? void 0 : _b['semantic-enrich'])) {
            this.rerender(STATE.COMPILED);
        }
        else {
            this.loadA11y('explorer');
        }
    }
    setCollapsible(collapse) {
        var _a, _b, _c, _d;
        this.document.options.enableComplexity = collapse;
        if (collapse && !this.settings.enrich) {
            this.settings.enrich = this.document.options.enableEnrichment = true;
            this.setAccessibilityMenus();
        }
        if (!collapse) {
            this.menu.pool.lookup('highlight').setValue('None');
        }
        if (!collapse || ((_b = (_a = MathJax._) === null || _a === void 0 ? void 0 : _a.a11y) === null || _b === void 0 ? void 0 : _b.complexity)) {
            this.rerender(STATE.COMPILED);
        }
        else {
            this.loadA11y('complexity');
            if (!((_d = (_c = MathJax._) === null || _c === void 0 ? void 0 : _c.a11y) === null || _d === void 0 ? void 0 : _d.explorer)) {
                this.loadA11y('explorer');
            }
        }
    }
    setHighlight(value) {
        var _a, _b;
        if (value === 'None')
            return;
        if (!this.settings.collapsible) {
            const variable = this.menu.pool.lookup('collapsible');
            variable.setValue(true);
            (_b = (_a = variable.items[0]) === null || _a === void 0 ? void 0 : _a.executeCallbacks_) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
    }
    scaleAllMath() {
        const scale = (parseFloat(this.settings.scale) * 100)
            .toFixed(1)
            .replace(/.0$/, '');
        const percent = prompt('Scale all mathematics (compared to surrounding text) by', scale + '%');
        if (percent) {
            if (percent.match(/^\s*\d+(\.\d*)?\s*%?\s*$/)) {
                const scale = parseFloat(percent) / 100;
                if (scale) {
                    this.menu.pool.lookup('scale').setValue(String(scale));
                }
                else {
                    alert('The scale should not be zero');
                }
            }
            else {
                alert('The scale should be a percentage (e.g., 120%)');
            }
        }
    }
    resetDefaults() {
        Menu.loading++;
        const pool = this.menu.pool;
        const settings = this.defaultSettings;
        for (const name of Object.keys(settings)) {
            const variable = pool.lookup(name);
            if (variable) {
                if (variable.getValue() !== settings[name]) {
                    variable.setValue(settings[name]);
                    const item = variable.items[0];
                    if (item) {
                        item.executeCallbacks_();
                    }
                }
            }
            else if (Object.hasOwn(this.settings, name)) {
                this.settings[name] = settings[name];
            }
        }
        Menu.loading--;
        this.rerender(STATE.COMPILED);
    }
    checkComponent(name) {
        const promise = Menu.loadingPromises.get(name);
        if (promise) {
            mathjax.retryAfter(promise);
        }
    }
    loadComponent(name, callback) {
        if (Menu.loadingPromises.has(name))
            return;
        const loader = MathJax.loader;
        if (!loader)
            return;
        Menu.loading++;
        const promise = loader
            .load(name)
            .then(() => {
            Menu.loading--;
            Menu.loadingPromises.delete(name);
            callback();
            if (Menu.loading === 0 && Menu._loadingPromise) {
                Menu._loadingPromise = null;
                Menu._loadingOK();
            }
        })
            .catch((err) => {
            if (Menu._loadingPromise) {
                Menu._loadingPromise = null;
                Menu._loadingFailed(err);
            }
            else {
                console.log(err);
            }
        });
        Menu.loadingPromises.set(name, promise);
    }
    loadA11y(component) {
        const noEnrich = !STATE.ENRICHED;
        this.loadComponent('a11y/' + component, () => {
            var _a, _b;
            const startup = MathJax.startup;
            mathjax.handlers.unregister(startup.handler);
            startup.handler = startup.getHandler();
            mathjax.handlers.register(startup.handler);
            const document = this.document;
            this.document = startup.document = startup.getDocument();
            this.document.menu = this;
            this.setA11y(this.settings);
            this.defaultSettings = Object.assign({}, this.document.options.a11y, ((_b = (_a = MathJax.config) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.a11y) || {}, this.defaultSettings);
            this.document.outputJax.reset();
            this.transferMathList(document);
            this.document.processed = document.processed;
            if (!Menu._loadingPromise) {
                this.document.outputJax.reset();
                mathjax.handleRetriesFor(() => {
                    this.rerender(component === 'complexity' || noEnrich
                        ? STATE.COMPILED
                        : STATE.TYPESET);
                });
            }
        });
    }
    transferMathList(document) {
        const MathItem = this.document.options.MathItem;
        for (const item of document.math) {
            const math = new MathItem();
            Object.assign(math, item);
            this.document.math.push(math);
        }
    }
    formatSource(text) {
        return text
            .trim()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    toMML(math) {
        return this.MmlVisitor.visitTree(math.root, math, {
            filterSRE: !this.settings.showSRE,
            filterTex: !this.settings.showTex,
            texHints: this.settings.texHints,
            semantics: this.settings.semantics && math.inputJax.name !== 'MathML',
        });
    }
    toSVG(math) {
        const jax = this.jax.SVG;
        if (!jax)
            return Promise.resolve("SVG can't be produced.<br>Try switching to SVG output first.");
        const adaptor = jax.adaptor;
        const cache = jax.options.fontCache;
        const breaks = !!math.root.getProperty('process-breaks');
        if (cache !== 'global' &&
            (math.display || !breaks) &&
            adaptor.getAttribute(math.typesetRoot, 'jax') === 'SVG') {
            for (const child of adaptor.childNodes(math.typesetRoot)) {
                if (adaptor.kind(child) === 'svg') {
                    return Promise.resolve(this.formatSvg(adaptor.serializeXML(child)));
                }
            }
        }
        return this.typesetSVG(math, cache, breaks);
    }
    typesetSVG(math, cache, breaks) {
        return __awaiter(this, void 0, void 0, function* () {
            const jax = this.jax.SVG;
            const div = jax.html('div');
            if (cache === 'global') {
                jax.options.fontCache = 'local';
            }
            const root = math.root;
            math.root = root.copy(true);
            math.root.setInheritedAttributes({}, math.display, 0, false);
            if (breaks) {
                jax.unmarkInlineBreaks(math.root);
                math.root.setProperty('inlineMarked', false);
            }
            const promise = mathjax.handleRetriesFor(() => {
                jax.toDOM(math, div, jax.document);
            });
            return promise.then(() => {
                math.root = root;
                jax.options.fontCache = cache;
                return this.formatSvg(jax.adaptor.innerHTML(div));
            });
        });
    }
    formatSvg(svg) {
        const css = this.constructor.SvgCss;
        svg = svg.match(/^<svg.*?><defs>/)
            ? svg.replace(/<defs>/, `<defs><style>${css}</style>`)
            : svg.replace(/^(<svg.*?>)/, `$1<defs><style>${css}</style></defs>`);
        svg = svg
            .replace(/ (?:role|focusable)=".*?"/g, '')
            .replace(/"currentColor"/g, '"black"');
        if (!this.settings.showSRE) {
            svg = svg.replace(/ (?:data-semantic-.*?|role|aria-(?:level|posinset|setsize|owns))=".*?"/g, '');
        }
        if (!this.settings.showTex) {
            svg = svg.replace(/ data-latex(?:-item)?=".*?"/g, '');
        }
        if (!this.settings.texHints) {
            svg = svg
                .replace(/ data-mjx-(?:texclass|alternate|variant|pseudoscript|smallmatrix|mathaccent|auto-op|script-align|vbox)=".*?"/g, '')
                .replace(/ data-mml-node="TeXAtom"/g, '');
        }
        return `${XMLDECLARATION}\n${svg}`;
    }
    postSvgImage() {
        this.svgImage.post();
        this.toSVG(this.menu.mathItem).then((svg) => {
            const html = this.svgImage.html.querySelector('#svg-image');
            html.innerHTML = this.formatSource(svg).replace(/\n/g, '<br>');
        });
    }
    zoom(event, type, math) {
        if (!event || this.isZoomEvent(event, type)) {
            this.menu.mathItem = math;
            if (event) {
                this.menu.post(event);
            }
            this.zoomBox.post();
        }
    }
    isZoomEvent(event, zoom) {
        return (this.settings.zoom === zoom &&
            (!this.settings.alt || event.altKey) &&
            (!this.settings.ctrl || event.ctrlKey) &&
            (!this.settings.cmd || event.metaKey) &&
            (!this.settings.shift || event.shiftKey));
    }
    rerender(start = STATE.TYPESET) {
        this.rerenderStart = Math.min(start, this.rerenderStart);
        const startup = MathJax.startup;
        if (!Menu.loading && startup.hasTypeset) {
            startup.document.whenReady(() => {
                if (this.rerenderStart <= STATE.COMPILED) {
                    this.document.reset({ inputJax: [] });
                }
                this.document.rerender(this.rerenderStart);
                this.rerenderStart = STATE.LAST;
            });
        }
    }
    copyMathML() {
        MenuUtil.copyToClipboard(this.toMML(this.menu.mathItem));
    }
    copyOriginal() {
        MenuUtil.copyToClipboard(this.menu.mathItem.math.trim());
    }
    copySvgImage() {
        this.toSVG(this.menu.mathItem).then((svg) => {
            MenuUtil.copyToClipboard(svg);
        });
    }
    copySpeechText() {
        MenuUtil.copyToClipboard(this.menu.mathItem.outputData.speech);
    }
    copyBrailleText() {
        MenuUtil.copyToClipboard(this.menu.mathItem.outputData.braille);
    }
    copyErrorMessage() {
        MenuUtil.copyToClipboard(this.menu.errorMsg.trim());
    }
    addMenu(math) {
        const element = math.typesetRoot;
        element.addEventListener('contextmenu', () => {
            this.menu.mathItem = math;
            math.outputData.nofocus = true;
        }, true);
        element.addEventListener('keydown', () => (this.menu.mathItem = math), true);
        element.addEventListener('click', (event) => this.zoom(event, 'Click', math), true);
        element.addEventListener('dblclick', (event) => this.zoom(event, 'DoubleClick', math), true);
        this.menu.store.insert(element);
        element.tabIndex = this.settings.inTabOrder ? 0 : -1;
    }
    clear() {
        this.menu.store.clear();
    }
    variable(name, action) {
        return {
            name: name,
            getter: () => this.settings[name],
            setter: (value) => {
                this.settings[name] = value;
                if (action) {
                    action(value);
                }
                this.saveUserSettings();
            },
        };
    }
    a11yVar(name, action) {
        return {
            name: name,
            getter: () => this.getA11y(name),
            setter: (value) => {
                this.settings[name] = value;
                this.setA11y({ [name]: value });
                if (action) {
                    action(value);
                }
                this.saveUserSettings();
            },
        };
    }
    submenu(id, content, entries = [], disabled = false) {
        let items = [];
        for (const entry of entries) {
            if (Array.isArray(entry)) {
                items = items.concat(entry);
            }
            else {
                items.push(entry);
            }
        }
        return {
            type: 'submenu',
            id,
            content,
            menu: { items },
            disabled: items.length === 0 || disabled,
        };
    }
    command(id, content, action, other = {}) {
        return Object.assign({ type: 'command', id, content, action }, other);
    }
    checkbox(id, content, variable, other = {}) {
        return Object.assign({ type: 'checkbox', id, content, variable }, other);
    }
    radioGroup(variable, radios) {
        return radios.map((def) => this.radio(def[0], def[1] || def[0], variable));
    }
    radio(id, content, variable, other = {}) {
        return Object.assign({ type: 'radio', id, content, variable }, other);
    }
    label(id, content) {
        return { type: 'label', id, content };
    }
    rule() {
        return { type: 'rule' };
    }
}
Menu.MENU_STORAGE = 'MathJax-Menu-Settings';
Menu.OPTIONS = {
    settings: {
        showSRE: false,
        showTex: false,
        texHints: true,
        semantics: false,
        zoom: 'NoZoom',
        zscale: '200%',
        renderer: 'CHTML',
        alt: false,
        cmd: false,
        ctrl: false,
        shift: false,
        scale: 1,
        overflow: 'Scroll',
        breakInline: true,
        autocollapse: false,
        collapsible: false,
        enrich: true,
        inTabOrder: true,
        assistiveMml: false,
        speech: true,
        braille: true,
        brailleCode: 'nemeth',
        speechRules: 'clearspeak-default',
    },
    jax: {
        CHTML: null,
        SVG: null,
    },
    annotationTypes: expandable({
        TeX: ['TeX', 'LaTeX', 'application/x-tex'],
        StarMath: ['StarMath 5.0'],
        Maple: ['Maple'],
        ContentMathML: ['MathML-Content', 'application/mathml-content+xml'],
        OpenMath: ['OpenMath'],
    }),
};
Menu.SvgCss = [
    'svg a{fill:blue;stroke:blue}',
    '[data-mml-node="merror"]>g{fill:red;stroke:red}',
    '[data-mml-node="merror"]>rect[data-background]{fill:yellow;stroke:none}',
    '[data-frame],[data-line]{stroke-width:70px;fill:none}',
    '.mjx-dashed{stroke-dasharray:140}',
    '.mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}',
    'use[data-c]{stroke-width:3px}',
].join('');
Menu.loading = 0;
Menu.loadingPromises = new Map();
Menu._loadingPromise = null;
Menu._loadingOK = null;
Menu._loadingFailed = null;
//# sourceMappingURL=Menu.js.map