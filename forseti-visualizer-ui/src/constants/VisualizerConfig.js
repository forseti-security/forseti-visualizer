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

/**
 * VisualizerConfig
 * @description generic configuration about the functionality of Forseti Visualizer
 */
const VisualizerConfig = {
    // a more strict computation of node sizing will be used when nodes across exceed this number
    MAX_NUMBER_NODES_ACROSS: 20,
    // distance between node levels
    DISTANCE_BETWEEN_NODE_LEVELS: 180,

    // margins for each side of the visualizer grid
    MARGIN: {
        top: 100, //px
        right: 0,
        bottom: 0,
        left: 0,
    },
    DEFAULT_HEIGHT: 800,
    DEFAULT_WIDTH: 1200,
    NODE_RADIUS: 22, // in 'px'

    // TOOLTIP
    TOOLTIP_VIOLATION_BG_COLOR: 'pink',

    // NODE BG IMAGE
    NODE_IMG_X: -16, 
    NODE_IMG_Y: -16, 
    NODE_IMG_HEIGHT: 35,
    NODE_IMG_WIDTH: 35,

    // INTERACTION
    PULSATE_MAX_RADIUS: 50,
    PULSATE_MIN_RADIUS: 35,
    HIGHLIGHT_RADIUS: 40,
    
    SCALE_RATIO: 1.5,
    ANIMATION_DURATION: 500, // in 'ms'

    /*
        0: "firewall"
        1: "folder"
        2: "appengine_app"
        3: "project"
        4: "bucket"
        5: "instance"
        6: "cloudsqlinstance"
        7: "organization"
        8: "dataset"
        9: "kubernetes_cluster"
    */
    DISTINCT_RESOURCE_TYPES: [
        'organization',
        'folder',
        'project',
        'firewall',
        'appengine_app',
        'bucket',
        'instance',
        'cloudsqlinstance',
        'dataset',
        'kubernetes_cluster',
        'serviceaccount_key'
    ],

    // DEMOABLE
    CACHED_FILE_MAP: {
        resourcesFile: 'dataset1_resources.json',
        violationsFile: 'dataset1_violations.json',
        iamexplainbyuserFile: 'dataset1_iamexplainbyuser.json',
    }
};

export default VisualizerConfig;