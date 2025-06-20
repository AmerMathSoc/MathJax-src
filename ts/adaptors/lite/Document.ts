/*************************************************************
 *
 *  Copyright (c) 2018-2025 The MathJax Consortium
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

/**
 * @file  Implements a lightweight DOM adaptor
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import { LiteElement } from './Element.js';
import { LiteWindow } from './Window.js';

export type LiteListener = (event: any) => void;

/************************************************************/
/**
 * Implements a lightweight Document replacement
 */
export class LiteDocument {
  /**
   * The document's parent window
   */
  public defaultView: LiteWindow = null;
  /**
   * The document's <html> element
   */
  public root: LiteElement;
  /**
   * The document's <head> element
   */
  public head: LiteElement;
  /**
   * The document's <body> element
   */
  public body: LiteElement;

  /**
   * The DOCTYPE comment
   */
  public type: string;

  /**
   * The listeners for postMessage() calls
   */
  public listeners: LiteListener[] = [];

  /**
   * The kind is always #document
   *
   * @returns {string} The document string.
   */
  public get kind(): string {
    return '#document';
  }

  /**
   * @class
   * @param {LiteWindow} window   The window for the document (if given)
   */
  constructor(window: LiteWindow = null) {
    this.root = new LiteElement('html', {}, [
      (this.head = new LiteElement('head')),
      (this.body = new LiteElement('body')),
    ]);
    this.type = '';
    this.defaultView = window;
  }

  /**
   * @param {string} kind                    The event type to listen for
   * @param {(event: any) => void} listener  The listener function
   */
  public addEventListener(kind: string, listener: (event: any) => void) {
    if (kind === 'message') {
      this.listeners.push(listener);
    }
  }

  /**
   * @param {any} msg        The message to send
   * @param {string} domain  The domain to use for the message
   */
  public postMessage(msg: any, domain: string) {
    new Promise(() => {
      for (const listener of this.listeners) {
        listener({ data: msg, origin: domain });
      }
    });
  }
}
