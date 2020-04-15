<template>
    <v-container fluid>
        <v-layout text-xs-center wrap class="margin-top-30">
            <v-flex xs12 mb-5>
                <v-layout justify-center>
                    <Navbar
                        v-on:resetZoom="resetZoom"
                        v-on:toggleViolations="toggleViolations"
                        v-on:toggleCacheEnabled="toggleCacheEnabled"
                        v-on:toggleJsonEnabled="toggleJsonEnabled"
                        v-on:toggleWideView="toggleWideView"
                        v-on:search="search"
                        v-on:resetParent="resetParent"
                        v-on:setParent="setParent"
                        v-on:expandAll="expandAll"
                        v-on:toggleExpand="toggleExpand"
                        v-on:toggleExpandAll="toggleExpandAll"
                        v-on:toggleOrientation="toggleOrientation"
                        v-on:explainIdentity="explainIdentity"
                        v-on:filterResources="filterResources"
                        
                        v-bind:parentData="this"
                    />

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

                        <div
                            style="position: absolute; right: 48px; top: 11px;"
                        >{{projectId ? 'Project: ' + projectId : ''}}</div>

                        <section id="d3-area"></section>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import * as d3 from 'd3';

import DataService from '../services/DataService';
import TestDataService from '../services/TestDataService';
import ForsetiSetParentService from '../services/ForsetiSetParentService';
import ForsetiResourceConverter from '../services/ForsetiResourceConverter';
import ResourceDataServiceHandler from '../services/ResourceDataServiceHandler';
import Filters from '../services/Filters';
import Sorters from '../services/Sorters';
import TooltipRenderer from '../services/TooltipRenderer';

import Orientation from '../constants/Orientation';
import ColorConfig from '../constants/ColorConfig';
import ResourceType from '../constants/ResourceType';
import VisualizerConfig from '../constants/VisualizerConfig';

// components
import Navbar from './Navbar';
import ResourceArrayStore from '../stores/ResourceArray';

export default {
    components: {
        Navbar,
    },

    store: ResourceArrayStore,

    /**
     * @function mounted
     * @description The ENTRY POINT
     */
    mounted() {
        // Dynamic height and width computation
        this.width =
            VisualizerConfig.DEFAULT_WIDTH -
            VisualizerConfig.MARGIN.left -
            VisualizerConfig.MARGIN.right;
        this.height =
            VisualizerConfig.DEFAULT_HEIGHT -
            VisualizerConfig.MARGIN.top -
            VisualizerConfig.MARGIN.bottom;

        // Append the 'svg' to the '#d3-area' section
        this.svg = d3
            .select('#d3-area')
            .append('svg')
            .attr('width', '100%') // 100% width provides better responsive behavior
            .attr('height', this.height)
            .style('pointer-events', 'all');

        // if (this.projectId) {
        //     alert('project id: ' + this.projectId);
        // }

        this.init(this.orientation, this.projectId);
    },

    /**
     * @function methods
     * @description Vue methods that are bound to 'this'
     */
    methods: {
        /**
         * @function findResourceNodeByName
         * @description returns a resource node by name
         * @returns type:ResourceNode (types/ResourceNode.js)
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
         * @function setViolationsMap
         * @description convert violationsData to violations map
         * @returns undefined
         */
        setViolationsMap: function(violationsData) {
            for (let i = 0; i < violationsData.length; i++) {
                const KEY = violationsData[i].full_name;
                if (!this.violationsMap[KEY]) {
                    this.violationsMap[KEY] = [];
                }
                this.violationsMap[KEY].push(violationsData[i]);
            }
        },

        /**
         * @function getDistinctResourceTypes
         * @description gets distinct resource types that exist in this.resourceArray
         * @returns list of strings containing distinct resource types
         */
        getDistinctResourceTypes: function() {
            var distinctResourceTypes = [
                ...new Set(
                    this.resourceArray.map(a => {
                        return a.resource_type;
                    })
                ),
            ];

            return distinctResourceTypes;
        },

        /**
         * @function filterResourceArray
         * @description filters based on user selection, sanitizes and dedupes resource array
         * @returns array of resources
         */
        filterResourceArray: function() {
            let mappedResourceFilter = this.selectedFilterResources.map(
                ForsetiResourceConverter.convertResource
            );

            // apply resource filter.  always include organization/folder/projects so that resource paths are maintained
            this.resourceArray = this.resourceArray.filter(res => {
                if (
                    res.resource_type === ResourceType.ORGANIZATION ||
                    res.resource_type === ResourceType.FOLDER ||
                    res.resource_type === ResourceType.PROJECT
                ) {
                    return true;
                }

                for (let i = 0; i < mappedResourceFilter.length; i++) {
                    if (mappedResourceFilter[i] === res.resource_type) {
                        return true;
                    }
                }

                return false;
            });
            // Filter based on set parent ( setParent() ) being clicked

            // At least one node has a null parent_id field infers that there is a node at the top of the tree
            let resourceArrayHasOneNullParentId = ForsetiSetParentService.determineIfOneNullParentId(
                this.resourceArray
            );

            if (!resourceArrayHasOneNullParentId) {
                ForsetiSetParentService.setMinParentIdToNull(
                    this.resourceArray
                );
            }

            if (this.parentNode) {
                let subResourceArray = ForsetiSetParentService.getResourceArraySubset(
                    this.resourceArray,
                    this.parentNode.id
                );

                this.$store.commit('set', subResourceArray);
                return subResourceArray;
            } else {
                this.$store.commit('set', this.resourceArray);
                return this.resourceArray;
            }
        },

        /**
         * @function init
         * @description Initializes the Vue Component and the Tree Visualization
         * @param orientation - [Orientation.Vertical, Orientation.Horizontal]
         */
        init: function(orientation, parentId = undefined) {
            let dataService;

            if (this.useCache) {
                dataService = new TestDataService();
            } else {
                // from the database
                dataService = new DataService();
            }

            // ELSE: useCache=false: (fetch from the database)
            dataService.getForsetiResources(parentId).then(resourcesData => {
                // get inventory index id
                if (resourcesData.length > 0) {
                    let filteredResourcesData = resourcesData;

                    /* filtered data */
                    filteredResourcesData = resourcesData.filter(
                        Filters.nonNullAndActive
                    );
                    resourcesData.forEach(curVal => {
                        if (curVal.resource_data_displayname === '') {
                            curVal.resource_data_displayname =
                                curVal.resource_data_name;
                        }
                    });

                    /* end filtered data */
                    let inventoryIndexId =
                        filteredResourcesData[0].inventory_index_id;

                    dataService
                        .getViolations(inventoryIndexId)
                        .then(violationsData => {
                            // { full_name: { violation } }
                            this.setViolationsMap(violationsData);

                            this.resourceArray = filteredResourcesData
                                .map(ResourceDataServiceHandler.handle)
                                .sort(Sorters.sortAscendingCaseInsensitive);

                            let filteredResourceArray = this.filterResourceArray();

                            // initialize tree
                            this.initTree(orientation, filteredResourceArray);
                        });
                } else {
                    if (parentId) {
                        alert(
                            `No resources found for the project: ${parentId}`
                        );
                    } else {
                        alert(
                            'No resources found for the Forseti GCP Organization'
                        );
                    }
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
            this.tree = d3
                .tree()
                .size([this.width - VisualizerConfig.MARGIN.top, this.height]);

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
                if (d.data.resource_type === ResourceType.SERVICE_ACCOUNT_KEY) {
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
                                ? d3.event.transform.x +
                                  VisualizerConfig.MARGIN.left
                                : d3.event.transform.x +
                                  VisualizerConfig.MARGIN.top) +
                            ', ' +
                            (orientation === Orientation.Vertical
                                ? d3.event.transform.y +
                                  VisualizerConfig.MARGIN.top
                                : d3.event.transform.y +
                                  VisualizerConfig.MARGIN.left) +
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
                this.svg.selectAll('g').remove();
                this.g = this.svg
                    .append('g')
                    .attr(
                        'transform',
                        'translate(' +
                            VisualizerConfig.MARGIN.left +
                            ',' +
                            VisualizerConfig.MARGIN.top +
                            ')'
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

                this.svg.selectAll('g').remove();
                this.g = this.svg
                    .append('g')
                    .attr(
                        'transform',
                        'translate(' +
                            VisualizerConfig.MARGIN.top +
                            ',' +
                            VisualizerConfig.MARGIN.left +
                            ')'
                    );

                // prevent dbl click
                this.svg.on('dblclick.zoom', null);
            }

            // DEBUG: add rectangle representing the "g" dimension
            this.g
                .append('rect')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('fill', ColorConfig.WHITE)
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
            let orientation = this.orientation;
            let duration = VisualizerConfig.ANIMATION_DURATION;

            // tooltip
            let tooltipDiv = d3
                .select('body')
                .append('div')
                .attr('class', 'tooltip')
                .style('background', ColorConfig.NODE_BG_COLOR)
                .style('opacity', 0);

            tree(treeData);

            treeData.each(function(d) {
                d.y = d.depth * VisualizerConfig.DISTANCE_BETWEEN_NODE_LEVELS; // compute depth
            });

            let depthArr = [];
            let maxDepth = 10;
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

                if (depthArr[i] > VisualizerConfig.MAX_NUMBER_NODES_ACROSS) {
                    let newWidth = depthArr[i] * 100;

                    if (newWidth > adjustedWidth) {
                        adjustedWidth = newWidth;
                    }
                    adjustSize = true;
                }
            }
            if (adjustSize) {
                /* comment this to use alternate sizing (once you exceed about 20 across) */
                if (!this.useWideView) {
                    if (adjustedWidth > this.width) {
                        adjustedWidth = this.width;
                    }
                }
                /* end comment this */

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
                        .duration(VisualizerConfig.ANIMATION_DURATION)
                        .style('opacity', 0.9);

                    let violationExists =
                        this.violationsMap[d.data.full_name] !== undefined
                            ? true
                            : false;

                    let tooltipContent = TooltipRenderer.getTooltipHtml(
                        violationExists,
                        d,
                        this.violationsMap
                    );

                    tooltipDiv.style(
                        'background',
                        TooltipRenderer.getTooltipBackground(violationExists)
                    );

                    // send event
                    if (this.bottomSheetEnabled) {
                        this.$root.$emit(
                            'send',
                            d,
                            this.violationsMap[d.data.full_name]
                        );
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
                .attr('r', VisualizerConfig.NODE_RADIUS)
                .style('fill', function(d) {
                    return d._children
                        ? ColorConfig.NODE_BG_COLOR
                        : ColorConfig.NONE;
                })
                .style('fill-opacity', function(d) {
                    return d._children ? 1 : 0;
                })
                .style('stroke-opacity', d => {
                    return this.violationsMap[d.data.full_name] !== undefined
                        ? 1
                        : 0;
                })
                .style('stroke', d => {
                    return this.violationsMap[d.data.full_name] !== undefined
                        ? ColorConfig.DANGER
                        : ColorConfig.BLACK;
                });

            // adds the image to the node
            nodeEnter
                .append('image')
                .attr('xlink:href', function(d) {
                    return d.data.image;
                })
                .attr('x', function() {
                    return VisualizerConfig.NODE_IMG_X;
                })
                .attr('y', function() {
                    return VisualizerConfig.NODE_IMG_Y;
                })
                .attr('height', VisualizerConfig.NODE_IMG_HEIGHT)
                .attr('width', function() {
                    return VisualizerConfig.NODE_IMG_WIDTH;
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
                    if (d.data.resource_type === ResourceType.ORGANIZATION) {
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
                .attr('r', VisualizerConfig.NODE_RADIUS)
                .style('fill', function(d) {
                    return d._children
                        ? ColorConfig.NODE_BG_COLOR
                        : ColorConfig.WHITE;
                })
                .style('fill-opacity', function(d) {
                    return d._children ? 1 : 0;
                })
                .style('stroke-opacity', d => {
                    return this.violationsMap[d.data.full_name] !== undefined
                        ? 1
                        : 0;
                })
                .style('stroke', d => {
                    // set to red
                    return this.violationsMap[d.data.full_name] !== undefined
                        ? ColorConfig.DANGER
                        : ColorConfig.BLACK;
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
                .duration(VisualizerConfig.ANIMATION_DURATION)
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
                .duration(VisualizerConfig.ANIMATION_DURATION)
                .attr('r', VisualizerConfig.PULSATE_MAX_RADIUS)
                .style('fill', function() {
                    return ColorConfig.SUCCESS;
                })
                .style('fill-opacity', function() {
                    return 1;
                })
                .transition()
                .duration(VisualizerConfig.ANIMATION_DURATION)
                //PULSATE CODE
                .attr('r', VisualizerConfig.PULSATE_MIN_RADIUS)
                .style('fill', function() {
                    return ColorConfig.SUCCESS;
                })
                .style('fill-opacity', function() {
                    return 1;
                });
        },

        /**
         * @function resetNodeStyles
         * @description Resets node styles to the default
         */
        resetNodeStyles: function() {
            this.g
                .selectAll('.node')
                .selectAll('circle')
                .transition()
                .duration(VisualizerConfig.ANIMATION_DURATION)
                .attr('r', VisualizerConfig.NODE_RADIUS)
                .style('fill', function(d) {
                    return d._children
                        ? ColorConfig.NODE_BG_COLOR
                        : ColorConfig.NONE;
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
                .duration(VisualizerConfig.ANIMATION_DURATION)
                .attr('r', VisualizerConfig.HIGHLIGHT_RADIUS)
                .style('fill', function() {
                    return ColorConfig.SUCCESS;
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
        explainIdentity: function(explainIdentitySearchTerm) {
            this.explainIdentitySearchTerm = explainIdentitySearchTerm;

            let callbackFn = resources => {
                // make nodes jump up or highlighted or something notable
                let matchingDataElements = [];
                let matchingDataMap = {}; // { resourceName: [violations] }

                // get all matching data elements
                this.treeData.each(d => {
                    for (let i = 0; i < resources.length; i++) {
                        let match = resources[i].resources[0]
                            .replace(ResourceType.ORGANIZATION, 'organizations')
                            .replace(ResourceType.FOLDER, 'folders')
                            .replace(`${ResourceType.PROJECT}/`, '');

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
                matchingDataElements.forEach(function(d) {
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

                                    return false;
                                };
                            })(el)
                        );

                        // move
                        this.g
                            .transition()
                            .duration(VisualizerConfig.ANIMATION_DURATION)
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
            if (this.useCache && !this.useJson) {
                d3.json(
                    VisualizerConfig.CACHED_FILE_MAP.iamexplainbyuserFile2
                ).then(callbackFn);
            } else if (this.useCache) {
                d3.json(
                    VisualizerConfig.CACHED_FILE_MAP.iamexplainbyuserFile
                ).then(callbackFn);
            } else {
                new DataService()
                    .getExplainIdentity(this.explainIdentitySearchTerm)
                    .then(callbackFn);
            }
        },
        /**
         * @function filterResources
         * @description Event executed when the resource filter multiselect box changes
         */
        filterResources: function(selectedFilterResources) {
            this.selectedFilterResources = selectedFilterResources;

            this._resetSvg();
            this.init(this.orientation, this.projectId);
        },

        /**
         * @function setParent
         * @description Sets the parent resource of the folder node
         */
        resetParent: function() {
            this.parentNode = null;
            this.projectId = null;

            this._resetSvg();
            this.init(this.orientation, this.projectId);
        },

        /**
         * @function setParent
         * @description Sets to a new parent (root) and refreshes visualization
         */
        setParent: function(nodeName) {
            // set parent, and find from current tree data
            this.parentNode = this.findResourceNodeByName(nodeName);

            if (!this.parentNode) {
                alert(nodeName + ' is not found.  Resetting view.');
            }

            // so we have the Audit Node, we just want to reconstruct treeData SUCH THAT it begins with Audit
            this._resetSvg();

            this.init(this.orientation);
        },

        /**
         * @function resetZoom
         * @description Searches for an exact text match of the node name and pans to that node
         */
        search: function(searchText) {
            // get the data element
            let el = null;
            this.treeData.each(function(d) {
                if (d.name === searchText) {
                    el = d;
                }
            });

            // add PULSE effect
            let ref = d3.selectAll(el);
            ref.style('fill', function(d) {
                return d._children ? ColorConfig.SUCCESS : ColorConfig.WHITE;
            })
                .style('fill-opacity', function(d) {
                    return d._children ? 1 : 0;
                })
                .style('stroke', ColorConfig.WHITE)
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
                .duration(VisualizerConfig.ANIMATION_DURATION)
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

            // append a new svg?
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
        toggleCacheEnabled: function(useCache) {
            this.useCache = useCache;

            this._resetSvg();

            this.init(this.orientation, this.projectId);
        },

        /**
         * @function toggleJsonEnabled
         * @description Refresh the grid and alternate between json / csv file format (only works when useCache true)
         */
        toggleJsonEnabled: function(useJson) {
            this.useJson = useJson;

            this._resetSvg();

            this.init(this.orientation);
        },

        /**
         * @function toggleWideView
         * @description Update node width
         */
        toggleWideView: function(useWideView) {
            this.useWideView = useWideView;

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
        toggleExpandAll: function(expandAll) {
            this.expandAll = expandAll;

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
        toggleOrientation: function(orientation) {
            this.orientation = orientation;

            this._resetSvg();

            this.init(this.orientation);
        },

        /**
         * @function toggleViolations
         * @description show or hide violations
         */
        toggleViolations: function(showViolations) {
            this.showViolations = showViolations;
            let violationsMap = this.violationsMap;
            
            if (this.showViolations) {
                let nodes = this.svg.selectAll('.node');

                let allCircles = nodes.selectAll('circle');

                allCircles
                    .transition(VisualizerConfig.ANIMATION_DURATION)
                    .attr('r', VisualizerConfig.NODE_RADIUS * 2)
                    .attr('cx', 1)
                    .attr('cy', 2)

                    .style('fill', function(d) {
                        return d._children
                            ? ColorConfig.NODE_BG_COLOR
                            : ColorConfig.NONE;
                    })
                    .style('fill-opacity', function(d) {
                        return d._children ? 1 : 0;
                    })
                    .style('stroke-opacity', function(d) {
                        return violationsMap[d.data.full_name] !== undefined
                            ? 1
                            : 0;
                    })
                    .style('stroke', function(d) {
                        return violationsMap[d.data.full_name] !== undefined
                            ? ColorConfig.DANGER
                            : ColorConfig.BLACK;
                    });
            } else {
                let nodes = this.svg.selectAll('.node');

                nodes
                    .selectAll('circle')
                    .transition(VisualizerConfig.ANIMATION_DURATION)
                    .attr('r', VisualizerConfig.NODE_RADIUS)
                    .attr('cx', 1)
                    .attr('cy', 2)

                    .attr('r', VisualizerConfig.NODE_RADIUS)
                    .style('fill', function(d) {
                        return d._children
                            ? ColorConfig.NODE_BG_COLOR
                            : ColorConfig.NONE;
                    })
                    .style('fill-opacity', function(d) {
                        return d._children ? 1 : 0;
                    })
                    .style('stroke-opacity', function(d) {
                        return violationsMap[d.data.full_name] !==
                            undefined
                            ? 1
                            : 0;
                    })
                    .style('stroke', function(d) {
                        // set to red
                        return violationsMap[d.data.full_name] !==
                            undefined
                            ? ColorConfig.DANGER
                            : ColorConfig.BLACK;
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
                .duration(VisualizerConfig.ANIMATION_DURATION)
                .attr('transform', () => {
                    if (this.orientation === Orientation.Vertical) {
                        return (
                            'translate(' +
                            t.x +
                            ',' +
                            (VisualizerConfig.MARGIN.top + t.y) +
                            ')scale(' +
                            t.k * VisualizerConfig.SCALE_RATIO +
                            ')'
                        );
                    } else {
                        return (
                            'translate(' +
                            t.y +
                            ',' +
                            t.x +
                            ')scale(' +
                            t.k * VisualizerConfig.SCALE_RATIO +
                            ')'
                        );
                    }
                })
                .on('end', () => {
                    // move drag position accordingly
                    this.svg.call(
                        this.zoomListener.transform,
                        d3.zoomIdentity
                            .translate(t.x, t.y)
                            .scale(t.k * VisualizerConfig.SCALE_RATIO)
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
                .duration(VisualizerConfig.ANIMATION_DURATION)
                .attr('transform', () => {
                    if (this.orientation === Orientation.Vertical) {
                        return (
                            'translate(' +
                            t.x * t.k +
                            ',' +
                            (VisualizerConfig.MARGIN.top + t.y * t.k) +
                            ')scale(' +
                            t.k / VisualizerConfig.SCALE_RATIO +
                            ')'
                        );
                    } else {
                        return (
                            'translate(' +
                            (VisualizerConfig.MARGIN.top + t.y * t.k) +
                            ',' +
                            t.x * t.k +
                            ')scale(' +
                            t.k / VisualizerConfig.SCALE_RATIO +
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
                            .scale(t.k / VisualizerConfig.SCALE_RATIO)
                    );
                });
        },
    },

    props: ['projectId'],

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
        expand: true,
        expandAll: false,
        showViolations: true,
        orientation: Orientation.Vertical,
        explainIdentitySearchTerm: '',
        orientations: Object.keys(Orientation),
        bottomSheetEnabled: false, // for violations view on the bottom
        dialog: false, // settings dialog
        selectedFilterResources: [
            'GCE Instance',
            'GKE Cluster',
            'Network',
            // 'GCS Bucket',
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
        resourceArray: [], //[{ text: 'hi', value: 1, resource_name: 'test' }],
        resources: [], // ['dia-dog-flow', 'mycloud.com', 'Machine Learning', 'Common Services', 'sandbox' ]

        // svg data
        treeData: {},
        violationsMap: {},
        nodeIdCounter: 0, // the node id count and duration for animations

        // computed
        width: 0, //px
        height: 0, //px

        // parent-child-view
        parentNode: null,
    }),
};
</script>

<style>
.margin-top-30 {
    margin-top: 0px;
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
    text-align: left;
    width: 300px;
    padding: 8px 6px;
    font: 14px sans-serif;
    border: 4px solid black;
    opacity: 0.5;
    border-radius: 8px;
    pointer-events: none;

    stroke-width: 3px;
    /* overflow: scroll; */
    word-wrap: break-word;
}
div.tooltip-content {
    text-align: left;
    margin-left: 20px;
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
