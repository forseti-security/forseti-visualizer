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

export default new JSONBeautifier();