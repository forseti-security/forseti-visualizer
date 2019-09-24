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

let Filters = {
    nonNullAndActive: function (data) {
        if (data.qq === null || data.qq === 'ACTIVE') return true;
        return false;
    },
    /**
     * @function capitalize
     * @description Capitalizes the first letter
     * @returns the capitalized string
     */
    capitalize: function (str) {
        if (str.length > 0) {
            return str.substr(0, 1).toUpperCase() + str.substr(1);
        }
        return str;
    },
};

export default Filters;