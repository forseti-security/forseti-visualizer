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

document.addEventListener('DOMContentLoaded', function () {
    let options = {};
    var elems = document.querySelectorAll('.tap-target');
    var instances = M.TapTarget.init(elems, options);



    let element = document.getElementById('open-menu-btn');
    console.log(element);
    element.addEventListener('click', function() {
        // get instance
        
        let instanceEls = document.getElementsByClassName('tap-target');
        let instance = M.TapTarget.getInstance(instanceEls[0]);
        console.log(instance);
        instance.open();
    });
});