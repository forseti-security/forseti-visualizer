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

let modalInstances = [];

document.addEventListener('DOMContentLoaded', function () {
   
    modalInstances = initializeModals();


    initSubmitText();
});

function initializeModals() {
    var elems = document.querySelectorAll('.modal');
    let options = {
        onOpenStart: function(a, b) {
            console.log(a, b);

            let href = b.getAttribute('href');

            console.log(href);

            let qNumReplaced = href.replace('#!/Q/', '');

            document.getElementById('q-num').innerText = qNumReplaced;
        }
    };

    var instances = M.Modal.init(elems, options);

    return instances;
}


function initSubmitText() {
    let submitTextBtn = document.getElementById('submit-text');
    submitTextBtn.addEventListener('click', function(event) {
        console.log(event);
        let textToAssociate = document.getElementById('text-to-associate').value;
        console.log(textToAssociate);
        
        let modalInstance = M.Modal.getInstance($('.modal'));

        alert(textToAssociate);
        
        if (textToAssociate !== '') {
            modalInstance.close();
        }
    });
}