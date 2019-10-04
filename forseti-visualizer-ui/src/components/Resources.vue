<template>
    <v-container fluid>
        <v-layout wrap class="margin-top-30">
            <v-flex xs12 mb-5>
                <v-layout justify-center>
                    <!-- Navbar -->
                    <ResourceNavbar
                        v-on:search="search"
                        v-on:clear="clear"
                        v-on:filterResources="filterResources"
                        :resourceTypes="resourceTypes"
                        :gcpProjects="projects"
                        :inventoryIndexSnapshots="inventoryIndexSnapshots"
                    />

                    <v-flex xs9 mb-5 style="max-height: 550px; overflow: auto;">
                        <!-- Data Table -->
                        <v-data-table
                            :headers="mainHeaders"
                            :items="resources"
                            item-key="resource_id"
                            hide-actions
                            expand
                            class="elevation-1"
                        >
                            <template slot="items" scope="props">
                                <tr @click="props.expanded = !props.expanded">
                                    <td class="text-xs">{{ props.item.name }}</td>
                                    <td class="text-xs">{{ props.item.resource_data_name }}</td>
                                    <td class="text-xs">{{ props.item.resource_type }}</td>
                                    <td class="text-xs">{{ props.item.resource_id }}</td>

                                    <td class="text-xs">{{ props.item }}</td>
                                </tr>
                            </template>

                            <template slot="expand" scope="props">
                                <v-card class="elevation-10">
                                    <v-card-text>
                                        <pre>{{beautify(props.item) }}</pre>
                                    </v-card-text>
                                </v-card>
                            </template>
                        </v-data-table>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import $ from 'jquery';
import * as d3 from 'd3';
import JSONBeautifier from '../services/JSONBeautifier';
import ResourceNavbar from './ResourceNavbar';
import ResourceArrayStore from '../stores/ResourceArray';

// DataServices
import DataService from '../services/DataService';
import TestDataService from '../services/TestDataService';

export default {
    components: {
        ResourceNavbar,
    },

    /* TODO: The Resources file should support DataServer functionality pulling data from the Server */
    /* TODO: The cachedFileMap should support the alternative json file and possibly the .CSV option */

    mounted() {
        let cachedFileMap = {
            resourcesFile: 'dataset1_resources.json',
            violationsFile: 'dataset1_violations.json',
            iamexplainbyuserFile: 'dataset1_iamexplainbyuser.json',
        };

        // get violations and display
        d3.json(cachedFileMap.resourcesFile).then(resources => {
            this.resources = resources.map(function(d) {
                d.name = d.resource_data_displayname || d.resource_data_name;
                return d;
            });

            this.originalResources = this.resources; // assign only when a server-side refresh is made
        });

        // load initialization data
        this.loadData();
    },

    methods: {
        /**
         * @function beautify
         * @description JSON beautifier function
         */
        beautify: function(o) {
            return JSONBeautifier.beautify(o);
        },

        loadData: function() {
            let dataService;

            if (this.useCache) {
                dataService = new TestDataService();
            } else {
                // from the database
                dataService = new DataService();
            }

            dataService.getForsetiResources().then(resourcesData => {
                console.log('DataService!', resourcesData);

                // TODO: change this to server side request
                // TEMP: client-side filtering to get UNIQUE resource_type
                this.resourceTypes = [
                    ...new Set(
                        resourcesData.map(function(data) {
                            return data.resource_type;
                        })
                    ),
                ];
                this.resourceTypes.unshift('Include ALL');

                console.log(this.resourceTypes);

                // TODO: change this to server side request
                // TEMP: client-side filtering to get UNIQUE project_id
                this.projects = [];
                let mappedProjects = resourcesData.filter(function(resource) {
                    return resource.resource_type === 'project';
                });
                this.projects = mappedProjects.map(function(resourceData) {
                    return {
                        id: resourceData.resource_id,
                        name: resourceData.resource_id,
                    };
                });
                console.log(this.projects);

                // TODO: change this to server side request
                // TEMP: client-side filtering to
                this.inventoryIndexSnapshots = [];
                this.inventoryIndexSnapshots = resourcesData.map(function(
                    resourceData
                ) {
                    return {
                        id: resourceData.inventoryIndexId,
                        dateTime: '2019-10-03 03:57:14 PM',
                    };
                });
            });
        },

        search: function(filterData) {
            console.log('Resources: search', filterData);

            if (!filterData) {
                console.log('Filter data is not defined.');
                this.resources = [
                    {
                        id: 1086937,
                        resource_type: 'organization',
                        category: 'resource',
                        resource_id: '358329783624',
                        parent_id: null,
                        resource_data_displayname: 'henrychang.biz',
                        resource_data_name: 'organizations/358329783624',
                        qq: 'ACTIVE',
                        inventory_index_id: 1552609278876965,
                    },
                    {
                        id: 1087269,
                        resource_type: 'folder',
                        category: 'resource',
                        resource_id: '379678980128',
                        parent_id: 1086937,
                        resource_data_displayname: 'SUPERMAN',
                        resource_data_name: 'folders/379678980128',
                        qq: 'ACTIVE',
                        inventory_index_id: 1552609278876965,
                    },

                    {
                        id: 1087269,
                        resource_type: 'project',
                        category: 'resource',
                        resource_id: '379678980128',
                        parent_id: 1086937,
                        resource_data_displayname: 'PROJECT',
                        resource_data_name: 'folders/379678980128',
                        qq: 'ACTIVE',
                        inventory_index_id: 1552609278876965,
                    },
                ];
            } else {
                console.log('Filter data is defined.', filterData.selectedResourceTypes, this.originalResources);

                
                this.resources = this.originalResources.filter((
                    resourceData
                ) => {
                    if (filterData.selectedResourceTypes.length > 0) {
                        console.log(filterData.selectedResourceTypes, resourceData)
                        // if (filterData.hasIncludeAll) {
                        //     return true;
                        // }
                        if (
                            filterData.selectedResourceTypes.indexOf(
                                resourceData.resource_type
                            ) > -1
                        ) {
                            return true;
                        }
                    } else {
                        return false;
                    }
                });

                console.log(this.resources)
            }
        },

        clear: function() {
            console.log('Resources: clear');
        },

        filterResources: function() {
            console.log('Resources: filterResources');
        },
    },

    data: () => ({
        mainHeaders: [
            { text: 'Id', value: 'resource_id' },
            { text: 'Name', value: 'resource_daata_name' },
            { text: 'Type', value: 'resource_type' },
            { text: 'Resource', value: 'resource_type' },
            { text: '', value: '' },
        ],
        resources: [],

        // pass down parameters
        resourceTypes: [],
        projects: [],
        inventoryIndexSnapshots: [],

        useCache: true,
    }),
};
</script>

<style>
</style>
