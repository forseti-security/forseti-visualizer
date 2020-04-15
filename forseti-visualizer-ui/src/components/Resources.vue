<template>
    <v-container fluid>
        <v-layout class="margin-top-30">
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

                    <v-flex xs9 mb-5 style="max-height: 650px; overflow: scroll;">
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
                                    <td
                                        class="text-xs"
                                        style="max-width:120px; overflow: auto; text-overflow: ellipsis;"
                                    >{{ props.item.name }}</td>
                                    <td
                                        class="text-xs"
                                        style="max-width:120px; overflow: auto; text-overflow: ellipsis;"
                                    >{{ props.item.resource_data_name }}</td>
                                    <td class="text-xs">{{ props.item.resource_type }}</td>
                                    <td class="text-xs">{{ props.item.resource_id }}</td>
                                    <td class="text-xs">
                                        <v-btn
                                            class="mx-2"
                                            fab
                                            dark
                                            small
                                            color="primary"
                                            v-on:click="edit(props.item, $event)"
                                        >
                                            <v-icon dark title="View in Visualizer">fa-sitemap</v-icon>
                                        </v-btn>

                                        <v-btn
                                            class="mx-2"
                                            fab
                                            dark
                                            small
                                            color="primary"
                                            v-on:click="edit(props.item.resource_id, $event)"
                                        >
                                            <v-icon dark title="Edit">fa-edit</v-icon>
                                        </v-btn>
                                    </td>

                                    <!-- <td class="text-xs">{{ props.item }}</td> -->
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
import JSONBeautifier from '../services/JSONBeautifier';
import ResourceNavbar from './ResourceNavbar';

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
        // load initialization data
        this.loadData();
    },

    methods: {
        edit: function(resource, event) {
            if (
                // resource.resource_type === 'organization' ||
                // resource.resource_type === 'folder' ||
                resource.resource_type === 'project'
            ) {
                this.$router.push(`viz/${resource.resource_id}`);
            } else {
                alert(
                    'Navigating to Visualizer is not supported for non-project resources at this time.'
                );
            }

            event.stopPropagation();
        },

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
                // set databound variables
                this.resources = resourcesData.map(function(d) {
                    d.name =
                        d.resource_data_displayname || d.resource_data_name;
                    return d;
                });
                // this should be set the first time or after a full refresh
                this.originalResources = this.resources;

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
            if (!filterData) {
                this.resources = [];
            } else {
                this.resources = this.originalResources.filter(resourceData => {
                    if (filterData.selectedResourceTypes.length > 0) {
                        // Has the phrase, "Include ALL"
                        if (
                            filterData.selectedResourceTypes[0] ===
                            'Include ALL'
                        ) {
                            if (filterData.projectId) {
                                return (
                                    filterData.projectId ===
                                    resourceData.resource_id
                                );
                            } else {
                                return true;
                            }
                        }

                        // Resource Type check
                        if (
                            filterData.selectedResourceTypes.indexOf(
                                resourceData.resource_type
                            ) > -1
                        ) {
                            if (filterData.projectId) {
                                return (
                                    filterData.projectId ===
                                    resourceData.resource_id
                                );
                            } else {
                                return true;
                            }
                        }
                    } else {
                        return false;
                    }
                });
            }
        },

        clear: function() {
            // console.log('clear()');
        },

        filterResources: function() {
            // console.log('filterResources()');
        },
    },

    data: () => ({
        mainHeaders: [
            { text: 'Id', value: 'resource_id', align: 'left' },
            { text: 'Name', value: 'resource_data_name', align: 'left' },
            { text: 'Type', value: 'resource_type', align: 'left' },
            { text: 'Resource', value: 'resource_type', align: 'left' },
            { text: 'Actions', value: '', align: 'left' },
            // { text: '', value: '' },
        ],
        resources: [],
        originalResources: [],

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
