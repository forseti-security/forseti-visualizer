/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _src_services_JSONBeautifier__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



describe("JSONBeautifier.test.js", () => {
  let sut;
  beforeEach(() => {
    sut = _src_services_JSONBeautifier__WEBPACK_IMPORTED_MODULE_0__["default"];
  });
  
  it('beautify returns beautified json object', () => {
    let res = sut.beautify({hi: "world" }, 0, false);
    let expected = `{
    "hi": "world",
}
`;
    expect(res).toEqual(expected);
  });

  it('isJsonString returns true when valid json passed', () => {
    let res = sut.isJsonString('{"hi": "world" }');
    let expected = true;
    expect(res).toEqual(expected);
  });

  it('isJsonString returns false when invalid json passed', () => {
    let res = sut.isJsonString('{{: "world" }');
    let expected = false;
    expect(res).toEqual(expected);
  });

  it('convertStrToJsonObject returns expected 1-tiered json object', () => {
    let res = sut.convertStrToJsonObject('{"hi": "world" }');
    let expected = { hi: 'world' };
    expect(res).toEqual(expected);
  });

  it('convertStrToJsonObject returns expected 2-tiered json object', () => {
    let res = sut.convertStrToJsonObject('{"hi": "world", "hello": {"world": true }}');
    let expected = { hi: 'world', hello: {world: true } };
    expect(res).toEqual(expected);
  });
});

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

class JSONBeautifier {
    /**
     * @function getIndentions
     * @description gets a string containing the total number of indentions
     * @param indentions a indicating the number of indents
     * @returns the actual number of spaces (indention)
     */
    getIndentions(indentions) {
        const indent = '    ';

        let indentionStr = '';
        for (let j = 0; j < indentions; j++) {
            indentionStr += indent;
        }
        return indentionStr;
    }

    /**
     * @function beautify
     * @description create a formatted string representing a beautified JSON object
     * @param o the json object
     * @param indentions the total number of indentions (used to handle the recursion)
     * @param ignoreNextIndention a boolean indicating whether to ignore the next indention (for recursion)
     * @returns a beautified json object (similar to json beautifier online tool)
     */
    beautify(o, indentions, ignoreNextIndention) {
        if (!indentions) indentions = 0;

        if (this.isJsonString(o)) {
            o = this.convertStrToJsonObject(o);
        }

        var content = '';
        if (o instanceof Array) {
            if (!ignoreNextIndention) content += this.getIndentions(indentions);
            content += '[' + '\n';

            for (let i = 0; i < o.length; i++) {
                content += this.beautify(o[i], indentions + 1);
                content += ',';
                content += '\n';
            }

            content += this.getIndentions(indentions);
            content += ']';
            if (indentions === 0) {
                // this is the end
                content += '\n';
            }
        } else if (o instanceof Object) {
            if (!ignoreNextIndention) content += this.getIndentions(indentions);
            content += '{' + '\n';

            for (var key in o) {
                // write key
                content += this.getIndentions(indentions + 1);
                content += this.beautifyObject(key, o[key], indentions + 1);

                content += ',';
                content += '\n';
            }

            content += this.getIndentions(indentions);
            content += '}';

            if (indentions === 0) {
                // this is the end
                content += '\n';
            }
        } else {
            if (!ignoreNextIndention) content += this.getIndentions(indentions);
            content += JSON.stringify(o);
        }

        return content;
    }

    /**
     * @function beautifyObject
     * @description a helper function to handle formatting the key/value properties of a JSON object
     * @param key a string denoting the JSON key
     * @param value a dynamic JSON object/string/array
     * @param indentions the current number of indentions
     * @returns a beautified json object
     */
    beautifyObject(key, value, indentions) {
        return '"' + key + '"' + ': ' + this.beautify(value, indentions, true);
    }

    /**
     * @function isJsonString
     * @description determines whether the string passed is or is close to a JSON object
     * @param str the string which may or may not be a JSON 
     * @returns returns a boolean indicating whether the string is JSON compatible
     */
    isJsonString(str) {
        try {
            this.convertStrToJsonObject(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * @function convertStrToJsonObject
     * @description converts a string to a json object
     * @param str the json object string
     * @returns the parsed JSON object
     */
    convertStrToJsonObject(str) {
        str = str.replace(/'/g, '"').replace(/u"/g, '"');
        return JSON.parse(str);
    }
}

/* harmony default export */ __webpack_exports__["default"] = (new JSONBeautifier());

/***/ })
/******/ ]);