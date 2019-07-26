<template>
  <v-container fluid>
    <!-- SIDEBAR: LEFT -->

    <v-toolbar color="blue-grey" dark fixed app clipped-right>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Forseti-Visualizer</v-toolbar-title>
    </v-toolbar>

    <v-navigation-drawer v-model="drawer" fixed app>
      <v-list dense>
        <v-list-tile @click.stop="left = !left">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{left}} {{drawer}} Drawer</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer v-model="left" temporary fixed></v-navigation-drawer>

    <v-navigation-drawer v-model="right" right temporary fixed></v-navigation-drawer>

    <!-- ./SIDEBAR: LEFT -->

    <v-layout text-xs-center wrap class="margin-top-30">
      <v-flex xs12 mb-5>
        <v-layout justify-center>
          <v-flex xs3 mb-5>
            <div class="control-panel">
              <v-container grid-list-md text-xs-center style="padding: 0;">
                <v-layout row wrap>
                  <v-flex xs6 style="text-align: left; margin-left: 0;">
                    <v-btn color="info" v-on:click="resetZoom" style="margin-left: 0;">Reset Zoom</v-btn>
                  </v-flex>

                  <v-flex xs6>
                    <p class="text-lg-right">
                      <v-btn v-on:click="dialog=!dialog">
                        <v-icon>fas fa-cog</v-icon>
                      </v-btn>

                      <v-dialog v-model="dialog" width="500">
                        <v-card>
                          <v-card-title class="headline grey lighten-2" primary-title>Settings</v-card-title>

                          <v-card-text>
                            <v-checkbox
                              :label="`Show Violations`"
                              v-model="showViolations"
                              v-on:change="toggleViolations"
                              disabled
                            ></v-checkbox>

                            <v-checkbox
                              :label="`Cached Data Enabled`"
                              v-model="useCache"
                              v-on:change="toggleCacheEnabled()"
                            ></v-checkbox>

                            <v-checkbox
                              :label="`Json On`"
                              v-model="useJson"
                              v-on:change="toggleJsonEnabled()"
                            ></v-checkbox>

                            <v-checkbox
                              :label="`Use Wide View`"
                              v-model="useWideView"
                              v-on:change="toggleWideView()"
                            ></v-checkbox>
                          </v-card-text>

                          <v-divider></v-divider>

                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" flat @click="dialog = false">Close</v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </p>
                  </v-flex>
                </v-layout>
              </v-container>

              <!--https://vuetifyjs.com/en/components/autocompletes -->
              <v-autocomplete
                v-model="nodeName"
                :hint="!isEditing ? 'Click the icon to edit' : 'Click the icon to save'"
                :items="resourceArray"
                :item-text="'resource_name'"
                :item-value="'resource_name'"
                :readonly="!isEditing"
                :label="`Resources`"
                persistent-hint
              >
                <v-slide-x-reverse-transition slot="append-outer" mode="out-in">
                  <v-icon
                    :color="isEditing ? 'success' : 'info'"
                    :key="`icon-${isEditing}`"
                    @click="isEditing = !isEditing"
                    v-text="isEditing ? 'mdi-check-outline' : 'mdi-circle-edit-outline'"
                  ></v-icon>
                </v-slide-x-reverse-transition>
              </v-autocomplete>

              <v-btn color="info" id="btn-search" v-on:click="search">Search</v-btn>

              <v-btn color="info" id="btn-search" v-on:click="resetParent">Reset to Org</v-btn>
              <v-btn color="info" id="btn-search" v-on:click="setParent">Set Parent</v-btn>

              <v-checkbox :label="`Expand/Collapse`" v-model="expand" v-on:change="toggleExpand"></v-checkbox>

              <v-checkbox
                :label="`Expand/Collapse All`"
                v-model="expandAll"
                v-on:change="toggleExpandAll"
              ></v-checkbox>

              <v-radio-group v-model="orientation" v-on:change="toggleOrientation">
                <v-radio v-for="n in orientations" :key="n" :label="`${n}`" :value="n"></v-radio>
              </v-radio-group>

              <v-text-field
                label="Explain (user/$USER, group/$GROUP, serviceAccount/$SA)"
                v-model="explainIdentitySearchTerm"
              ></v-text-field>
              <v-btn color="info" v-on:click="explainIdentity">Explain Identity</v-btn>
            </div>

            <v-combobox
              v-model="selectedFilterResources"
              :items="items"
              label="Filter by a list of resource types"
              v-on:change="filterResources"
              multiple
              chips
              :menu-props="{ maxHeight: '400px', overflowY: true }"
            ></v-combobox>
          </v-flex>

          <v-flex xs9 mb-5 style="position:relative;">
            <button
              v-on:click="zoomIn"
              class="zoom-button"
              style="position: absolute; left: 15px; top: 11px;"
            >+</button>
            <button
              v-on:click="zoomOut"
              class="zoom-button"
              style="position: absolute; left: 48px; top: 11px;"
            >-</button>

            <section id="d3-area"></section>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import * as d3 from 'd3';

import GoogleCloudImageService from '../services/GoogleCloudImageService';
import DataServiceFactory from '../services/DataServiceFactory';
import ForsetiResourceConverter from '../services/ForsetiResourceConverter';
import Orientation from '../models/Orientation';

export default {
    /**
     * Vue: mounted() - onload function
     */
    mounted() {
        // Use the parsed tree data to dynamically create height & width
        // want computed width
        this.width = this.defaultWidth - this.margin.left - this.margin.right;
        this.height = this.defaultHeight - this.margin.top - this.margin.bottom;

        // append the svg object to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        this.svg = d3
            .select('#d3-area')
            .append('svg')
            // the reason we do not use this.width as the width, is it does not resize appropriately for varying screen sizes
            // .attr('width', this.width) // + margin.left + margin.right)
            .attr('width', '100%')
            .attr('height', this.height) // + margin.top + margin.bottom);
            .style('pointer-events', 'all');

        this.init(this.orientation);
    },

    /**
     * Vue: methods
     */
    methods: {
        /* Utility Helper Methods for Visualizer */

        /**
         * @function capitalize
         * @description capitalize the string
         */
        capitalize: function(str) {
            if (str.length > 0) {
                return str.substr(0, 1).toUpperCase() + str.substr(1);
            }
            return str;
        },

        /**
         * @function findResourceNodeByName
         * @description returns a resource node by name
         * @returns node:ResourceNode (ResourceNode.js)
         */
        findResourceNodeByName(nodeName) {
            let resourceNode = null;
            
            // must expand all nodes
            this.treeData.each(this.expandNodes);
            this.treeData.each(function(d) {
                if (d.name === nodeName) {
                    resourceNode = d;
                }
            });

            return resourceNode;
        },

        /**
         * @function filterResourceArray
         * @description filter resource array
         */
        filterResourceArray: function() {
            /*
            var distinctResourceTypes = [
                ...new Set(
                    this.resourceArray.map(a => {
                        return a.resource_type;
                    })
                ),
            ];
            console.log('resourceTypes', distinctResourceTypes);
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
            let mappedResourceFilter = this.selectedFilterResources.map(
                ForsetiResourceConverter.convertResource
            );

            // set resource array
            this.resourceArray = this.resourceArray.filter(res => {
                if (
                    res.resource_type === 'folder' ||
                    res.resource_type === 'project' ||
                    res.resource_type === 'organization'
                )
                    return true;
                for (let i = 0; i < mappedResourceFilter.length; i++) {
                    if (mappedResourceFilter[i] === res.resource_type) {
                        return true;
                    }
                }

                return false;
            });

            // Filter based on set parent ( setParent() ) being clicked

            // ensure at least one node has a parent_id of null
            let resourceArrayHasOneNullParentId = false;
            for(let i = 0; i < this.resourceArray.length; i++) {
                if (this.resourceArray[i].parent_id === null) resourceArrayHasOneNullParentId = true;
            }
            if (!resourceArrayHasOneNullParentId) {
                let minIndex = 0;
                let minValue = Number.MAX_VALUE;

                // find min
                for(let i = 0; i < this.resourceArray.length; i++) {
                    if (minValue > this.resourceArray[i].parent_id) {
                        minValue = this.resourceArray[i].parent_id;
                        minIndex = i;
                    }
                }    
                this.resourceArray[minIndex].parent_id = null;
            }
            
            if (this.parentNode) {
                let subResourceArray = [];
                let queue = [];
                queue.push(this.parentNode.id);

                // Add FIRST Node
                for (let i = 0; i < this.resourceArray.length; i++) {
                    if (this.resourceArray[i].id == this.parentNode.id) {
                        let firstNode = this.resourceArray[i];
                        firstNode.parent_id = null; // remove parent id - compat requirement for d3 tree stratify
                        subResourceArray.push(firstNode);
                        break;
                    }
                }

                while (queue.length !== 0) {
                    let firstId = queue.splice(0, 1);

                    for (let i = 0; i < this.resourceArray.length; i++) {
                        if (this.resourceArray[i].parent_id == firstId) {
                            subResourceArray.push(this.resourceArray[i]);

                            // add the child resource node's ID to the queue to recursively find its children next
                            queue.push(this.resourceArray[i].id);
                        }
                    }
                }

                return subResourceArray;
            } else {
                return this.resourceArray;
            }
        },

        /**
         * @function init
         * @description Initializes the Vue Component and the Tree Visualization
         * @param orientation - [Orientation.Vertical, Orientation.Horizontal]
         */
        init: function(orientation) {
            // Get DataService depending on useJson, useCache
            let dataServiceFactory = DataServiceFactory.getDataServiceFactory(
                this.useJson,
                this.useCache
            );

            dataServiceFactory.getForsetiResources().then(resourcesData => {
                // get inventory index id
                if (resourcesData.length > 0) {
                    let filteredResourcesData = resourcesData;

                    /* filtered data */
                    filteredResourcesData = resourcesData.filter(data => {
                        if (data.qq === null || data.qq === 'ACTIVE')
                            return true;
                        return false;
                    });
                    resourcesData.forEach(curVal => {
                        if (curVal.resource_data_displayname === '') {
                            curVal.resource_data_displayname =
                                curVal.resource_data_name;
                        }
                    });
                    /* end filtered data */
                    let inventoryIndexId =
                        filteredResourcesData[0].inventory_index_id;

                    dataServiceFactory
                        .getViolations(inventoryIndexId)
                        .then(violationsData => {
                            for (let i = 0; i < violationsData.length; i++) {
                                this.violationsMap[
                                    violationsData[i].resource_id
                                ] = violationsData[i];
                            }

                            this.resourceArray = filteredResourcesData
                                .map(function(a) {
                                    a.parent_id =
                                        a.resource_type == 'organization'
                                            ? ''
                                            : a.parent_id;
                                    a.image = GoogleCloudImageService.getImageUrl(
                                        a.resource_type
                                    );
                                    a.resource_name =
                                        a.resource_data_displayname !== ''
                                            ? a.resource_data_displayname
                                            : a.resource_data_name;
                                    return a;
                                })
                                .sort(function(a, b) {
                                    // sort alphabetically, ignoring case
                                    if (
                                        a.resource_name.toLowerCase() <
                                        b.resource_name.toLowerCase()
                                    )
                                        return -1;
                                    if (
                                        a.resource_name.toLowerCase() <
                                        b.resource_name.toLowerCase()
                                    )
                                        return 1;
                                    return 0;
                                });

                            let filteredResourceArray = this.filterResourceArray();

                            // initialize tree
                            this.initTree(orientation, filteredResourceArray);
                        });
                }
            });
        },

        /**
         * @function initTree
         * @description Initializes the tree visualization
         * @param orientation - [Orientation.Vertical, Orientation.Horizontal]
         * @param data - json array of objects
         * {
         *      id, resource_type, category, resource_id, parent_id, resource_data_displayname,
         *      resource_data_name, qq, image, resource_name
         * }
         */
        initTree: function(orientation, data) {
            let margin = this.margin;

            // d3 tree sizing
            this.tree = d3
                .tree()
                .size([this.width - this.margin.top, this.height]);

            // d3 tree data
            this.treeData = d3
                .stratify()
                .id(function(d) {
                    return d.id;
                })
                .parentId(function(d) {
                    return d.parent_id;
                })(data);

            // assign the name to each node
            this.treeData.each(function(d) {
                if (d.data.resource_type === 'serviceaccount_key') {
                    d.name = d.data.resource_id;
                } else {
                    d.name = d.data.resource_name;
                }
            });

            // treeData is the root of the tree,
            // and the tree has all the data we need in it now.
            // let's draw that thing...

            // set up zoomListener function
            this.zoomListener = d3
                .zoom()
                .scaleExtent([1 / 2, 10])
                .on('zoom', () => {
                    this.g.attr(
                        'transform',
                        'translate(' +
                            (orientation === Orientation.Vertical
                                ? d3.event.transform.x + margin.left
                                : d3.event.transform.x + margin.top) +
                            ', ' +
                            (orientation === Orientation.Vertical
                                ? d3.event.transform.y + margin.top
                                : d3.event.transform.y + margin.left) +
                            ')scale(' +
                            d3.event.transform.k +
                            ')'
                    );

                    this.zoomScale = d3.event.transform.k;
                });

            // set initial zoom
            if (orientation === Orientation.Vertical) {
                this.svg.call(
                    this.zoomListener,
                    d3.zoomIdentity.translate(this.width / 2, this.height / 2)
                );

                // g "container", initially translated by the margin left and top
                this.g = this.svg
                    .append('g')
                    .attr(
                        'transform',
                        'translate(' + margin.left + ',' + margin.top + ')'
                    );

                // prevent dbl click
                this.svg.on('dblclick.zoom', null);
            } else {
                this.svg
                    .call(
                        this.zoomListener,
                        d3.zoomIdentity.translate(
                            this.width / 2,
                            this.height / 2
                        )
                    )
                    .on('dblclick', null);

                this.g = this.svg
                    .append('g')
                    .attr(
                        'transform',
                        'translate(' + margin.top + ',' + margin.left + ')'
                    );

                // prevent dbl click
                this.svg.on('dblclick.zoom', null);
            }

            // DEBUG: add rectangle representing the "g" dimension
            this.g
                .append('rect')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('fill', '#fff')
                .attr('fill-opacity', '0.0');

            // Collapse after the second level
            if (this.treeData.children) 
                this.treeData.children.forEach(this.collapse);

            this.update(this.tree, this.treeData, this.treeData);
        },

        /**
         * @function collapse
         * @description Collapse the node and all of it's children
         */
        collapse: function(node) {
            if (node.children) {
                node._children = node.children;
                node._children.forEach(this.collapse);
                node.children = null;
            }
        },

        /**
         * @function expandNodes
         * @description Expand the node to the next tier or if the org node; then the previous position
         */
        expandNodes: function(node) {
            if (node._children) {
                node.children = node._children;
                node.children.forEach(this.expandNodes);
                node._children = null;
            }
        },

        /**
         * @function toggle
         * @description Toggle children on node click (expand, collapse)
         */
        toggle: function(node, tree) {
            if (node.children) {
                node._children = node.children;
                node.children = null;
            } else {
                node.children = node._children;
                node._children = null;
            }

            this.update(tree, this.treeData, node);
        },

        /**
         * @function update
         * @description Handles the majority of D3 Visualization Interactivity
         */
        update: function(tree, treeData, source) {
            let circleRadius = this.circleRadius;
            let orientation = this.orientation;
            let duration = this.duration;

            // tooltip
            let tooltipDiv = d3
                .select('body')
                .append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

            tree(treeData);

            treeData.each(function(d) {
                d.y = d.depth * 180; // compute depth
            });

            let depthArr = [];
            let maxDepth = 10;
            let NUM_NODES_ACROSS_EXCEEDED = 20;
            for (let j = 0; j < maxDepth; j++) {
                depthArr.push(0);
            }

            let node = this.g
                .selectAll('.node')
                .data(treeData.descendants(), function(d) {
                    // console.log('descendant', d);
                    depthArr[d.depth]++;

                    return d.id || (d.id = ++this.nodeIdCounter);
                });

            // calculate: size adjustment based on depth, max-nodes-across-width
            let adjustSize = false;
            let adjustedWidth = 0;
            let adjustedHeight = 100;

            for (let i = 0; i < maxDepth; i++) {
                if (depthArr[i] === 0) break;

                adjustedHeight += 100;

                if (depthArr[i] > NUM_NODES_ACROSS_EXCEEDED) {
                    let newWidth = depthArr[i] * 100;

                    if (newWidth > adjustedWidth) {
                        adjustedWidth = newWidth;
                    }
                    adjustSize = true;
                }
            }
            if (adjustSize) {
                // comment this to use alternate sizing (once you exceed about 20 across)
                if (!this.useWideView) {
                    if (adjustedWidth > this.width) {
                        adjustedWidth = this.width;
                    }
                }
                tree.size([adjustedWidth, adjustedHeight]);
                tree(treeData);
            }

            let nodeEnter = node
                .enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', function() {
                    return 'translate(' + source.x + ',' + source.y + ')';
                    // return orientation === Orientation.Vertical
                    //     ? 'translate(' + source.x + ',' + source.y + ')'
                    //     : 'translate(' + source.y + ',' + source.x + ')';
                })
                .on('click', d => {
                    this.toggle(d, tree, treeData);
                })
                .on('mouseover', d => {
                    tooltipDiv
                        .transition()
                        .duration(duration)
                        .style('opacity', 0.9);

                    // if d.data.resource_id matches a violations id
                    // console.log(d.data.resource_id, this.violationsMap);

                    let tooltipContent = '';
                    if (this.violationsMap[d.data.resource_id]) {
                        tooltipDiv.style('background', '#ff8c84'); //lighten-2.error

                        // ${violationsMap[d.data.resource_id].violation_data}
                        tooltipContent = `
                            <div>
                                <h4>${
                                    this.violationsMap[d.data.resource_id]
                                        .violation_type
                                }</h4>
                                ${
                                    this.violationsMap[d.data.resource_id]
                                        .rule_name
                                }<br>
                            </div>`;

                        // send event
                        if (this.bottomSheetEnabled) {
                            this.$root.$emit(
                                'send',
                                d,
                                this.violationsMap[d.data.resource_id]
                            );
                        }
                    } else {
                        tooltipDiv.style('background', '#b3d4fc'); // .lighten-2.blue

                        // default tooltipContent
                        tooltipContent = `
                            <div>
                                <h4>${d.data.resource_name}</h4>
                                
                                ${d.data.resource_data_name}
                                <br />
                                ${d.data.resource_type}
                            </div>`;

                        // send event
                        if (this.bottomSheetEnabled) {
                            this.$root.$emit('send', d, {});
                        }
                    }

                    tooltipDiv
                        .html(tooltipContent)
                        .style('left', d3.event.pageX + 32 + 'px')
                        .style('top', d3.event.pageY - 32 + 'px');
                })
                .on('mouseout', function() {
                    tooltipDiv
                        .transition()
                        .duration(duration)
                        .style('opacity', 0);
                });

            nodeEnter
                .append('circle')
                .attr('r', circleRadius)
                .style('fill', function(d) {
                    return d._children ? 'lightsteelblue' : 'none';
                })
                .style('fill-opacity', function(d) {
                    return d._children ? 1 : 0;
                })
                .style('stroke-opacity', d => {
                    // if (!this.showViolations) return 0;

                    return this.violationsMap[d.data.resource_id] !== undefined
                        ? 1
                        : 0;
                })
                .style('stroke', d => {
                    /* VIOLATIONS!!! */
                    // if (!this.showViolations) return 'black';
                    // set to red
                    return this.violationsMap[d.data.resource_id] !== undefined
                        ? '#DB4437'
                        : 'black';
                });

            // adds the image to the node
            nodeEnter
                .append('image')
                .attr('xlink:href', function(d) {
                    return d.data.image;
                })
                .attr('x', function() {
                    return -16;
                })
                .attr('y', function() {
                    return -16;
                })
                .attr('height', 35)
                .attr('width', function() {
                    return 35;
                });

            // adds the text to the node
            nodeEnter
                .append('text')
                .attr('x', function(d) {
                    return d.children ? -25 : 25;
                })
                .attr('dy', '.35em')
                .style('text-anchor', function(d) {
                    return d.children ? 'end' : 'start';
                })

                .attr('transform', function(d) {
                    if (d.data.resource_type === 'organization') {
                        // there is only one of these
                        return 'translate(100, -100) rotate(-45)';
                    }
                    return orientation === Orientation.Vertical
                        ? 'translate(0,0) rotate(-45)'
                        : 'translate(0,0) rotate(0)';
                })
                .text(function(d) {
                    return d.name;
                });

            let nodeUpdate = nodeEnter.merge(node);

            nodeUpdate
                .transition()
                .duration(duration)
                .attr('transform', function(d) {
                    return orientation === Orientation.Vertical
                        ? 'translate(' + d.x + ',' + d.y + ')'
                        : 'translate(' + d.y + ',' + d.x + ')';
                });

            nodeUpdate
                .select('circle')
                .attr('r', circleRadius)
                .style('fill', function(d) {
                    return d._children ? 'lightsteelblue' : '#fff';
                })
                .style('fill-opacity', function(d) {
                    return d._children ? 1 : 0;
                })
                .style('stroke-opacity', d => {
                    return this.violationsMap[d.data.resource_id] !== undefined
                        ? 1
                        : 0;
                })
                .style('stroke', (d) => {
                    // set to red
                    return this.violationsMap[d.data.resource_id] !== undefined
                        ? '#DB4437'
                        : 'black';
                });

            nodeUpdate.select('text').style('fill-opacity', 1);

            let nodeExit = node
                .exit()
                .transition()
                .duration(duration)
                .attr('transform', function() {
                    return orientation === Orientation.Vertical
                        ? 'translate(' + source.x + ',' + source.y + ')'
                        : 'translate(' + source.y + ',' + source.x + ')';
                })
                .remove();

            nodeExit.select('circle').attr('r', 1e-6);
            nodeExit.select('text').style('fill-opacity', 1e-6);

            let link = this.g
                .selectAll('.link')
                .data(treeData.links(), function(d) {
                    return d.target.id;
                });
            let linkEnter = link
                .enter()
                .insert('path', 'g')
                .attr('class', 'link')

                .attr(
                    'd',
                    d3
                        .linkHorizontal()
                        .x(function() {
                            return orientation === Orientation.Vertical
                                ? source.x
                                : source.y;
                        })
                        .y(function(d) {
                            return orientation === Orientation.Vertical
                                ? d.y
                                : d.x;
                        })
                );

            let linkUpdate = linkEnter.merge(link);
            linkUpdate
                .transition()
                .duration(duration)
                .attr(
                    'd',
                    d3
                        .linkHorizontal()
                        .x(function(d) {
                            return orientation === Orientation.Vertical
                                ? d.x
                                : d.y;
                        })
                        .y(function(d) {
                            return orientation === Orientation.Vertical
                                ? d.y
                                : d.x;
                        })
                );

            link.exit()
                .transition()
                .duration(duration)
                .attr(
                    'd',
                    d3
                        .linkHorizontal()
                        .x(function() {
                            return orientation === Orientation.Vertical
                                ? source.x
                                : source.y;
                        })
                        .y(function() {
                            return orientation === Orientation.Vertical
                                ? source.y
                                : source.x;
                        })
                )
                .remove();

            node.each(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        },

        /**
         * @function resetZoom
         * @description Resets the SVG zoom to the default.
         */
        resetZoom: function() {
            this.svg
                .transition()
                .duration(this.duration)
                .call(this.zoomListener.transform, d3.zoomIdentity);
        },

        /**
         * @function pulsate
         * @description Pulses a given node
         */
        pulsate: function(filterFn) {
            this.g
                .selectAll('.node')
                .filter(filterFn)
                .selectAll('circle')

                .transition()
                .duration(this.duration)
                .attr('r', 50)
                .style('fill', function() {
                    return '#b3d4fc'; // green
                })
                .style('fill-opacity', function() {
                    return 1;
                })
                .transition()
                .duration(this.duration)
                //PULSATE CODE
                .attr('r', 35)
                .style('fill', function() {
                    return '#b3d4fc'; // green
                })
                .style('fill-opacity', function() {
                    return 1;
                });
        },

        /**
         * @function resetNodeStyles
         * @description Resets node styles to default
         */
        resetNodeStyles: function() {
            this.g
                .selectAll('.node')
                .selectAll('circle')
                .transition()
                .duration(this.duration)
                .attr('r', 22)
                .style('fill', function(d) {
                    return d._children ? 'lightsteelblue' : 'none';
                })
                .style('fill-opacity', function(d) {
                    return d._children ? 1 : 0;
                });
        },

        /**
         * @function highlight
         * @description Highlights a given node
         */
        highlight: function(filterFn) {
            this.g
                .selectAll('.node')
                .filter(filterFn)
                .selectAll('circle')

                .transition()
                .duration(this.duration)
                .attr('r', 40)
                .style('fill', function() {
                    return '#b3d4fc'; // some ugly green
                })
                .style('fill-opacity', function() {
                    return 1;
                });
        },

        /**
         * @function explainIdentity
         * @description Executes explain plan via a GRPC call
         *      if (cacheOn) --> then use cached data
         */
        explainIdentity: function() {
            if (this.explainIdentitySearchTerm === '') {
                alert('Explain input must not be empty');
                return;
            }

            let callbackFn = resources => {
                // make nodes jump up or highlighted or something notable
                let matchingDataElements = [];
                let matchingDataMap = {}; // { resourceName: [violations] }

                // get all matching data elements
                this.treeData.each(d => {
                    for (let i = 0; i < resources.length; i++) {
                        let match = resources[i].resources[0]
                            .replace('organization', 'organizations')
                            .replace('folder', 'folders')
                            .replace('project/', '');

                        if (match === d.data.resource_data_name) {
                            matchingDataElements.push(d);

                            if (!matchingDataMap[d.data.resource_data_name]) {
                                matchingDataMap[d.data.resource_data_name] = [];
                            }
                            matchingDataMap[d.data.resource_data_name].push(d);

                            // this.$root.$emit('send', d, {});
                        }
                    }
                });

                var ct = 0;

                // filter down our elements into only unique nodes
                let uniqueMatchingDataElements = {}; // dictionary to track unique elements
                matchingDataElements.forEach(function(d,) {
                    if (!uniqueMatchingDataElements[d.name]) {
                        uniqueMatchingDataElements[d.name] = [];
                    }
                    uniqueMatchingDataElements[d.name].push(d);
                });

                let uniqueKeys = Object.keys(uniqueMatchingDataElements);

                // emit: updateResources...
                // resources in forseti are stored in an odd format, organization/$ORG_ID (instead of organizations/$ORG_ID), so, we are mapping the resource_ids to the Node Names
                // change out all resource names with the actual folder name
                resources = ForsetiResourceConverter.convertResources(
                    resources,
                    this.resourceArray
                );

                this.$root.$emit('updateResources', resources);

                // hacky matching collection
                let matchingCollection = [];

                this.resetNodeStyles();

                for (let i in uniqueKeys) {
                    ct++;
                    let delay = 1200 * ct;

                    let el = uniqueMatchingDataElements[uniqueKeys[i]][0]; // get first

                    let x = el.x;
                    let y = el.y;
                    let t = d3.zoomTransform(this.svg.node());

                    // pulsate nodes
                    setTimeout(() => {
                        // update data
                        this.pulsate(
                            (function(el) {
                                return function(d) {
                                    if (d.id === el.id) {
                                        matchingCollection.push(d.id);
                                        return true;
                                    }

                                    // all existing
                                    // for (
                                    //     let j = 0;
                                    //     j < matchingCollection.length;
                                    //     j++
                                    // ) {
                                    //     if (d.id === matchingCollection[j])
                                    //         return true;
                                    // }

                                    return false;
                                };
                            })(el)
                        );

                        // move
                        this.g
                            .transition()
                            .duration(this.duration)
                            .attr('transform', () => {
                                if (this.orientation === Orientation.Vertical) {
                                    return (
                                        'translate(' +
                                        (-x + this.width / 2) * t.k +
                                        ',' +
                                        (-y + this.height / 3) * t.k +
                                        ')scale(' +
                                        t.k +
                                        ')'
                                    );
                                } else {
                                    return (
                                        'translate(' +
                                        (-y + this.height / 3) * t.k +
                                        ',' +
                                        (-x + this.width / 2) * t.k +
                                        ')scale(' +
                                        t.k +
                                        ')'
                                    );
                                }
                            })
                            .on('end', () => {
                                let transX =
                                    this.orientation === Orientation.Vertical
                                        ? (-x + this.width / 2) * t.k
                                        : (-y + this.height / 3) * t.k - 100;
                                let transY =
                                    this.orientation === Orientation.Vertical
                                        ? (-y + this.height / 3) * t.k - 100
                                        : (-x + this.width / 2) * t.k;

                                this.svg.call(
                                    this.zoomListener.transform,
                                    d3.zoomIdentity
                                        .translate(transX, transY)
                                        .scale(t.k)
                                );
                            });
                    }, delay);
                }
            };

            // explain - iam user
            DataServiceFactory.getDataServiceFactory(
                this.useJson,
                this.useCache
            )
                .getExplainIdentity(this.explainIdentitySearchTerm)
                .then(callbackFn);
        },

        /**
         * @function filterResources
         * @description Event executed when the resource filter multiselect box changes
         */
        filterResources: function() {
            this._resetSvg();

            this.init(this.orientation);
        },

        /**
         * @function resetParent
         * @description Resets to the original parent and refreshes visualization
         */
        resetParent: function() {
            this.parentNode = null;

            this._resetSvg();
            this.init(this.orientation);
        },

        /**
         * @function setParent
         * @description Sets to a new parent (root) and refreshes visualization
         */
        setParent: function() {
            // set parent, and find from current tree data
            this.parentNode = this.findResourceNodeByName(this.nodeName);

            if (!this.parentNode) alert(this.nodeName + ' is not found.  Resetting view.');

            // so we have the Audit Node, we just want to reconstruct treeData SUCH THAT it begins with Audit
            this._resetSvg();

            this.init(this.orientation);
        },

        /**
         * @function resetZoom
         * @description Searches for an exact text match of the node name and pans to that node
         */
        search: function() {
            let searchText = this.nodeName;

            // get the data element
            let el = null;
            this.treeData.each(function(d) {
                if (d.name === searchText) {
                    el = d;
                }
            });

            // add PULSE effect
            let ref = d3.selectAll(el);

            ref.attr('height', 400)
                .attr('r', 44)
                .style('fill', function(d) {
                    return d._children ? 'green' : '#241490';
                })
                .style('fill-opacity', function(d) {
                    return d._children ? 1 : 0;
                })
                .style('stroke', 'white')
                .style('stroke-opacity', 0)
                .enter()
                .append('circle')
                .filter(function(d, i) {
                    return i === 1;
                });

            /*
             * Notes:
             * x - the x-coord of the node searched
             * y - the y-coord of the node searched
             * w - the width
             * h - the height
             * m - the margin
             */
            let x = el.x;
            let y = el.y;

            /* Moving the transform zoom layer on the screen which is tied to the svg */
            let t = d3.zoomTransform(this.svg.node());

            // move to the node and zoom to it
            this.g
                .transition()
                .duration(this.duration)
                .attr('transform', () => {
                    if (this.orientation === Orientation.Vertical) {
                        return (
                            'translate(' +
                            (-x + this.width / 2) * t.k +
                            ',' +
                            (-y + this.height / 3) * t.k +
                            ')scale(' +
                            t.k +
                            ')'
                        );
                    } else {
                        return (
                            'translate(' +
                            (-y + this.height / 3) * t.k +
                            ',' +
                            (-x + this.width / 2) * t.k +
                            ')scale(' +
                            t.k +
                            ')'
                        );
                    }
                })
                .on('end', () => {
                    // move drag position accordingly
                    // -100: account for margin on the height end
                    let transX =
                        this.orientation === Orientation.Vertical
                            ? (-x + this.width / 2) * t.k
                            : (-y + this.height / 3) * t.k - 100;
                    let transY =
                        this.orientation === Orientation.Vertical
                            ? (-y + this.height / 3) * t.k - 100
                            : (-x + this.width / 2) * t.k;

                    this.svg.call(
                        this.zoomListener.transform,
                        d3.zoomIdentity.translate(transX, transY).scale(t.k)
                    );
                });

            // reset existing node fx
            this.resetNodeStyles();

            // pulsate effect
            setTimeout(() => {
                this.pulsate(
                    (function(el) {
                        return function(d) {
                            if (d.id === el.id) {
                                return true;
                            }

                            return false;
                        };
                    })(el)
                );
            }, 200);
        },

        /**
         * @function _resetSvg
         * @description Refresh the grid: clears and recreates
         */
        _resetSvg: function() {
            d3.select('#d3-area')
                .selectAll('svg')
                .remove();

            // reset
            this.svg = d3
                .select('#d3-area')
                .append('svg')
                .attr('width', this.width)
                .attr('height', this.height)
                .style('pointer-events', 'all');

            // reset vars
            this.expand = true;
            this.expandAll = false;
        },

        /**
         * @function toggleCacheEnabled
         * @description Refresh the grid and alternate between live / cached data
         */
        toggleCacheEnabled: function() {
            this._resetSvg();

            this.init(this.orientation);
        },

        /**
         * @function toggleJsonEnabled
         * @description Refresh the grid and alternate between json / csv file format (only works when useCache true)
         */
        toggleJsonEnabled: function() {
            this._resetSvg();

            this.init(this.orientation);
        },

        /**
         * @function toggleWideView
         * @description Update node width
         */
        toggleWideView: function() {
            this._resetSvg();

            this.init(this.orientation);
        },

        /**
         * @function toggleExpand
         * @description Expand/Collapse the [currently expanded] tree hierarchy.
         */
        toggleExpand: function() {
            document
                .getElementsByClassName('node')[0]
                .dispatchEvent(new Event('click'));
        },

        /**
         * @function toggleExpandAll
         * @description Expand/Collapse the entire tree hierarchy.
         */
        toggleExpandAll: function() {
            if (!this.expandAll) {
                // collapse all
                this.collapse(this.treeData);
            } else {
                if (this.treeData.children === null) {
                    this.treeData.children = this.treeData._children;
                    this.treeData._children = null;
                }
                this.treeData.children.forEach(this.expandNodes);
            }

            this.update(this.tree, this.treeData, this.treeData);
        },

        /**
         * @function toggleOrientation
         * @description Change direction from horizontal to vertical and vice-versa
         */
        toggleOrientation: function() {
            this._resetSvg();

            this.init(this.orientation);
        },

        /**
         * @function toggleViolations
         * @description show or hide violations
         */
        toggleViolations: function() {
            if (this.showViolations) {
                let nodes = this.svg.selectAll('.node');

                let circleRadius = this.circleRadius;
                // let allCircles = nodes.selectAll('circle');
                let violationsMap = this.violationsMap;

                nodes
                    .selectAll('circle')
                    .transition(this.duration)
                    .attr('r', circleRadius * 2)
                    .attr('cx', 1)
                    .attr('cy', 2)

                    .style('fill', function(d) {
                        return d._children ? 'lightsteelblue' : 'none';
                    })
                    .style('fill-opacity', function(d) {
                        return d._children ? 1 : 0;
                    })
                    .style('stroke-opacity', function(d) {
                        return violationsMap[d.data.resource_id] !== undefined
                            ? 1
                            : 0;
                    })
                    .style('stroke', function(d) {
                        return violationsMap[d.data.resource_id] !== undefined
                            ? '#DB4437'
                            : 'black';
                    });
            } else {
                let nodes = this.svg.selectAll('.node');

                let circleRadius = this.circleRadius;
                nodes
                    .selectAll('circle')
                    .transition(this.duration)
                    .attr('r', circleRadius)
                    .attr('cx', 1)
                    .attr('cy', 2)

                    .attr('r', circleRadius)
                    .style('fill', function(d) {
                        return d._children ? 'lightsteelblue' : 'none';
                    })
                    .style('fill-opacity', function(d) {
                        return d._children ? 1 : 0;
                    })
                    .style('stroke-opacity', function(d) {
                        return this.violationsMap[d.data.resource_id] !==
                            undefined
                            ? 1
                            : 0;
                    })
                    .style('stroke', function(d) {
                        // set to red
                        return this.violationsMap[d.data.resource_id] !==
                            undefined
                            ? '#DB4437'
                            : 'black';
                    });
            }
        },

        /**
         * Zoom Button (+) in
         */
        zoomIn: function() {
            /* Moving the transform zoom layer on the screen which is tied to the svg */
            let t = d3.zoomTransform(this.svg.node());

            // move to the node and zoom to it
            this.g
                .transition()
                .duration(this.duration)
                .attr('transform', () => {
                    if (this.orientation === Orientation.Vertical) {
                        return (
                            'translate(' +
                            t.x +
                            ',' +
                            (this.margin.top + t.y) +
                            ')scale(' +
                            t.k * 1.5 +
                            ')'
                        );
                    } else {
                        return (
                            'translate(' +
                            t.y +
                            ',' +
                            t.x +
                            ')scale(' +
                            t.k * 1.5 +
                            ')'
                        );
                    }
                })
                .on('end', () => {
                    // move drag position accordingly
                    this.svg.call(
                        this.zoomListener.transform,
                        d3.zoomIdentity.translate(t.x, t.y).scale(t.k * 1.5)
                    );
                });
        },

        /**
         * Zoom Button (-) out
         */
        zoomOut: function() {
            let t = d3.zoomTransform(this.svg.node());

            // move to the node and zoom to it
            this.g
                .transition()
                .duration(this.duration)
                .attr('transform', () => {
                    if (this.orientation === Orientation.Vertical) {
                        return (
                            'translate(' +
                            t.x * t.k +
                            ',' +
                            (this.margin.top + t.y * t.k) +
                            ')scale(' +
                            t.k / 1.5 +
                            ')'
                        );
                    } else {
                        return (
                            'translate(' +
                            (this.margin.top + t.y * t.k) +
                            ',' +
                            t.x * t.k +
                            ')scale(' +
                            t.k / 1.5 +
                            ')'
                        );
                    }
                })
                .on('end', () => {
                    // console.log('Transform D3 Object', t);
                    this.svg.call(
                        this.zoomListener.transform,
                        d3.zoomIdentity
                            .translate(t.x * t.k, t.y * t.k)
                            .scale(t.k / 1.5)
                    );
                });
        },
    },

    /**
     * Vue: data
     */
    data: () => ({
        // global: set this to use JSON files vs. dynamic
        // useCache: false, // default to using server data
        useCache: true, // default to using cached files.json
        useJson: true, // false defers to using a .csv
        useWideView: false, // false defers to keeping node view default screen (hxw)

        // filter variables
        nodeName: 'dia-dog-flow',
        expand: true,
        expandAll: false,
        showViolations: true,
        orientation: Orientation.Vertical,
        explainIdentitySearchTerm: '',
        orientations: Object.keys(Orientation),
        bottomSheetEnabled: false, // for violations view on the bottom
        dialog: false, // settings dialog
        selectedFilterResources: [
            // 'GCS Bucket',
            'GCE Instance',
            'GKE Cluster',
            'Network',
            // 'BQ Dataset',
            // 'App Engine',
            // 'Service Account',
            // 'Service Account Key'
        ],
        items: [
            'GCS Bucket',
            'GCE Instance',
            'GKE Cluster',
            'App Engine',
            'Cloud SQL',
            'Firewall',
            'Network',
            'BQ Dataset',
            'Service Account',
            'Service Account Key',
        ],

        // svg node elements
        svg: {},
        g: {},
        tree: {},
        zoomListener: {},
        zoomScale: 1,

        // autocomp
        isEditing: true,
        model: null,
        resourceArray: [{ text: 'hi', value: 1, resource_name: 'test' }],
        resources: [
            'dia-dog-flow',
            'mycloud.com',
            'Machine Learning',
            'Common Services',
            'sandbox',
        ],

        // svg data
        treeData: {},
        violationsMap: {},
        nodeIdCounter: 0, // the node id count and duration for animations

        // svg node configurable lengths/distances
        duration: 500, //ms
        circleRadius: 22, //px

        margin: {
            top: 100, //px
            right: 0,
            bottom: 0,
            left: 0,
        },
        defaultWidth: 1200,
        defaultHeight: 800,

        // computed
        width: 0, //px
        height: 0, //px

        // sidebar
        drawer: false,
        drawerRight: null,
        right: false,
        left: false,

        // parent-child-view
        parentNode: null,
    }),
};
</script>

<style>
.margin-top-30 {
    margin-top: 0px;
}

.control-panel {
    padding: 8px;
    /* background: #eef; */
    /* border-bottom: 2px solid #bbd; */
}

/* d3 CSS */
#d3-area {
    margin-top: 8px;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
}

svg {
    border: 2px silver solid;
    margin-left: auto;
    margin-right: auto;
}

.node circle {
    fill: #fff;
    stroke: steelblue;
    stroke-width: 3px;
}

.node text {
    font: 12px sans-serif;
}

.node--internal text {
    text-shadow: 0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff;
}

.link {
    fill: none;
    stroke: #ccc;
    stroke-width: 2px;
}

div.tooltip {
    position: absolute;
    text-align: center;
    width: 300px;
    height: 100px;
    padding: 12px;
    font: 14px sans-serif;
    background: lightsteelblue;
    border: 0px;
    opacity: 0.5;
    border-radius: 8px;
    pointer-events: none;
}

.zoom-button {
    width: 32px;
    height: 32px;
    background: #e2e2e2;
    border-radius: 5px;
    opacity: 0.8;
    font-size: 32px;
    padding: 0;
    text-align: center;
    line-height: 20px;
    border: 2px solid #c9c9c9;
}
</style>
