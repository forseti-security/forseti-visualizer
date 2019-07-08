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

import Vue from 'vue';
import Vuex from 'vuex';

export default new Vuex.Store({
    state: {
        resourceArray: [],
        g:0
    },
    getters: {
        resourceArray: state => state.resourceArray
    },
    mutations: {
        add(state, item) {
            state.resourceArray.add(item);
        },
        removeAt(state, index) {
            state.resourceArray.splice(index, 1);
        },
        set(state, resourceArray) {
            
            if (resourceArray instanceof Array) {
                Vue.set(state, 'resourceArray', resourceArray);
            }
        }
    }
});