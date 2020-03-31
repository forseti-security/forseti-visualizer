// Copyright 2020 Google LLC
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

class ForsetiSetParentService {
    /**
     * @function determineIfOneNullParentId
     * @description determines if there is one null parent id (which is used to determine the root node)
     * @param resourceArray the resource array
     * @returns boolean whether there is one null parent id (root node) or not
     */
    determineIfOneNullParentId(resourceArray) {
        let resourceArrayHasOneNullParentId = false;

        for (let i = 0; i < resourceArray.length; i++) {
            if (resourceArray[i].parent_id === null) {
                resourceArrayHasOneNullParentId = true;
            }
        }

        return resourceArrayHasOneNullParentId;
    }

    /**
     * @function setMinParentIdToNull
     * @description function sets the minimum parent id in the resource array to null
     * @param resourceArray the resource array
     * @returns undefined
     */
    setMinParentIdToNull(resourceArray) {
        let minIndex = 0;
        let minValue = Number.MAX_VALUE;

        // find min
        for (let i = 0; i < resourceArray.length; i++) {
            if (minValue > resourceArray[i].parent_id) {
                minValue = resourceArray[i].parent_id;
                minIndex = i;
            }
        }
        resourceArray[minIndex].parent_id = null;
    }

    /**
     * @function getResourceArraySubset
     * @description uses a queue to store successive parent ids to obtain a subset of all resources within the tree
     * assumes that the first node has a parent_id of null
     * @param resourceArray - the resource array
     * @param parentNodeId - number indicating the id of the node that will become the new parent
     * @returns a subset of the resource array based on the passed in parent node id.  
     * any node not in the hierarchy will be filtered out.
     */
    getResourceArraySubset(resourceArray, parentNodeId) {
        let subResourceArray = [];
        let queue = [];
        queue.push(parentNodeId);

        // add parent node FIRST
        for (let i = 0; i < resourceArray.length; i++) {
            if (resourceArray[i].id == parentNodeId) {
                let firstNode = resourceArray[i];
                firstNode.parent_id = null; // remove parent id - compat requirement for d3 tree stratify
                subResourceArray.push(firstNode);
                break;
            }
        }

        // add rest of the nodes (down the tree)
        while (queue.length !== 0) {
            let curParentId = queue.splice(0, 1);

            for (let i = 0; i < resourceArray.length; i++) {
                if (resourceArray[i].parent_id == curParentId) {
                    subResourceArray.push(resourceArray[i]);

                    // add the child resource node's ID to the queue to recursively find its children next
                    queue.push(resourceArray[i].id);
                }
            }
        }

        return subResourceArray;
    }
}

export default new ForsetiSetParentService();