/*************************************************************
 *
 *  Copyright (c) 2018-2024 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*****************************************************************/
(() => __awaiter(void 0, void 0, void 0, function* () {
    //
    // Set up for node worker_threads versus browser webworker
    //
    if (typeof self === 'undefined') {
        self = global.self = global; // for node, make self be the global object
        global.DedicatedWorkerGlobalScope = global.constructor; // so SRE knows we are a worker
        global.copyStructure = (structure) => JSON.stringify(structure);
        //
        // Create addEventListener() and postMessage() function
        //
        const { parentPort } = yield import(
        /* webpackIgnore: true */ 'node:worker_threads');
        global.addEventListener = (kind, listener) => {
            parentPort.on(kind, listener);
        };
        global.postMessage = (msg) => {
            parentPort.postMessage({ data: msg });
        };
        //
        // SRE needs require(), and we use it to load mathmaps
        //
        if (!global.require) {
            yield import(/* webpackIgnore: true */ './require.mjs');
        }
        //
        // Custom loader for mathmaps
        //
        global.SREfeature = {
            custom: (locale) => {
                const file = 'speech-rule-engine/lib/mathmaps/' + locale + '.json';
                return Promise.resolve(JSON.stringify(global.require(file)));
            },
        };
    }
    else {
        global = self.global = self; // for web workers make global be the self object
        global.copyStructure = (structure) => structure;
        global.SREfeature = { json: './mathmaps' };
    }
    global.exports = self; // lets SRE get defined as a global variable
    //
    // Load SRE
    //
    yield import('./sre.js')
        .catch((_) => import(/* webpackIgnore: true */ './sre-lab.js')) // for use in the lab
        .then((SRE) => {
        global.SRE = SRE;
    });
    /*****************************************************************/
    /**
     * Add an event listener so that we can act on commands from Iframe.
     * We extract the command and data from the event, and look for the
     * command in the Commands object below.  If the command is defined,
     * we try to run the command, and if there is an error, we send it to
     * the calling Rule. If the command was not found in the list of valid
     * commands, we produce an error.
     */
    self.addEventListener('message', function (event) {
        if (event.data.debug) {
            console.log('Iframe  >>>  Worker:', event.data);
        }
        const { cmd, data } = event.data;
        if (Object.hasOwn(Commands, cmd)) {
            Pool('Log', `running ${cmd}`);
            Commands[cmd](data)
                .then((result) => Finished(cmd, { result }))
                .catch((error) => Finished(cmd, { error: error.message }));
        }
        else {
            Finished(cmd, { error: `Invalid worker command: ${cmd}` });
        }
    }, false);
    /**
     * These are the commands that can be sent from the main window via the iframe.
     */
    const Commands = {
        /**
         * This loads one or more libraries.
         *
         * @param {Message} data The data object
         * @returns {WorkerResult} A promise the completes when the imports are done
         */
        import(data) {
            return Array.isArray(data.imports)
                ? Promise.all(data.imports.map((file) => import(file)))
                : import(data.imports);
        },
        /**
         * Setup the speech rule engine.
         *
         * @param {Message} data The feature vector for SRE.
         * @returns {WorkerResult} A promise that completes when the imports are done
         */
        setup(data) {
            if (!data) {
                return Promise.resolve();
            }
            SRE.setupEngine(data);
            return SRE.engineReady();
        },
        /**
         * Compute speech
         *
         * @param {Message} data The data object
         * @returns {WorkerResult} Promise fulfilled when computation is complete.
         */
        speech(data) {
            return Speech(SRE.workerSpeech, data.mml, data.options);
        },
        /**
         * Compute speech for the next rule set
         *
         * @param {Message} data The data object
         * @returns {WorkerResult} Promise fulfilled when computation is complete.
         */
        nextRules(data) {
            return Speech(SRE.workerNextRules, data.mml, data.options);
        },
        /**
         * Compute speech for the next style or preference
         *
         * @param {Message} data The data object
         * @returns {WorkerResult} Promise fulfilled when computation is complete.
         */
        nextStyle(data) {
            return Speech(SRE.workerNextStyle, data.mml, data.options, data.nodeId);
        },
    };
    /**
     * Post a command back to the pool. Catches the error in case the data cannot be
     * JSON stringified.
     *
     * @param {string} cmd The command to be posted.
     * @param {Message} data The data object to be send.
     */
    function Pool(cmd, data) {
        try {
            self.postMessage({ cmd: cmd, data: data });
        }
        catch (err) {
            console.log('Posting error in worker for ', copyError(err));
        }
    }
    /**
     * Post a command back to the client.
     *
     * @param {string} cmd The client command to be sent to the client.
     * @param {Message} data The payload data to be sent to the client.
     */
    function Client(cmd, data) {
        Pool('Client', { cmd: cmd, data: data });
    }
    /**
     * Post that the current command is finished to the client.
     *
     * @param {string} cmd The command that has finished.
     * @param {Message} msg The data to send back (error or result)
     */
    function Finished(cmd, msg) {
        Client('Finished', Object.assign(Object.assign({}, msg), { cmd: cmd, success: !msg.error }));
    }
    /**
     * Post a command that returns a new speech structure.
     *
     * @param {(mml: string, options: OptionList, rest: string[]) =>
     *             {[id: string]: string}} func
     *     The function to call for speech computation.
     * @param {string} mml The mml expression.
     * @param {OptionList} options Setup options for SRE.
     * @param {string[]} rest Remaining arguments.
     * @returns {Promise<StructureData>} A promise returning the data to be attached to the DOM
     */
    function Speech(func, mml, options, ...rest) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!mml)
                return '';
            const structure = (_a = (yield func.call(null, mml, options, ...rest))) !== null && _a !== void 0 ? _a : {};
            return global.copyStructure(structure);
        });
    }
    /**
     * Make a copy of an Error object (since those can't be stringified).
     *
     * @param {Error} error The error object.
     * @returns {Message} The copied error object.
     */
    function copyError(error) {
        return {
            message: error.message,
            stack: error.stack,
            fileName: error.fileName,
            lineNumber: error.lineNumber,
        };
    }
    /**
     * Wait for SRE to set itself up,
     * then tell the WorkerPool that we are ready.
     */
    yield SRE.engineReady();
    Pool('Ready', {});
}))();
export {};
//# sourceMappingURL=speech-worker.js.map