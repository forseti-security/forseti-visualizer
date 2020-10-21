<template>
    <v-flex sm6 md3 mb-5>
        <div class="control-panel">
            <v-container grid-list-md text-xs-center style="padding: 0">
                <v-layout row wrap>
                    <v-flex xs6 style="text-align: left; margin-left: 0">
                        <h1
                            class="title grey--text text--darken-2"
                            style="margin-top: 16px"
                        >
                            Search Filters
                        </h1>
                    </v-flex>

                    <v-flex xs6>
                        <p class="text-lg-right">
                            <v-btn v-on:click="dialog = !dialog">
                                <v-icon>fas fa-question-circle</v-icon>
                            </v-btn>

                            <v-dialog v-model="dialog" width="500">
                                <v-card>
                                    <v-card-title
                                        class="headline grey lighten-2"
                                        primary-title
                                        >Help</v-card-title
                                    >

                                    <!-- HELP LIST -->
                                    <v-card-text>
                                        <v-list subheader three-line>
                                            <v-subheader
                                                >Filter by Resource
                                                Types</v-subheader
                                            >

                                            <v-list-item>
                                                <v-list-item-content>
                                                    <v-list-item-subtitle
                                                        >Select the resource
                                                        types to be searched for
                                                        - these resource types
                                                        are defined in
                                                        Forseti.</v-list-item-subtitle
                                                    >
                                                </v-list-item-content>
                                            </v-list-item>

                                            <v-subheader
                                                >Filter by Project</v-subheader
                                            >

                                            <v-list-item>
                                                <v-list-item-content>
                                                    <v-list-item-subtitle
                                                        >Select the Project ID
                                                        within the target
                                                        organization.</v-list-item-subtitle
                                                    >
                                                </v-list-item-content>
                                            </v-list-item>

                                            <v-subheader
                                                >Filter by Inventory Index
                                                Snapshot</v-subheader
                                            >

                                            <v-list-item>
                                                <v-list-item-content>
                                                    <v-list-item-subtitle
                                                        >The Inventory Index
                                                        Snapshot is a Forseti
                                                        construct for everytime
                                                        forseti inventories an
                                                        organization. A snapshot
                                                        is taken by default
                                                        every 2
                                                        hours.</v-list-item-subtitle
                                                    >
                                                </v-list-item-content>
                                            </v-list-item>
                                        </v-list>
                                    </v-card-text>

                                    <v-divider></v-divider>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            color="primary"
                                            flat
                                            @click="dialog = false"
                                            >Close</v-btn
                                        >
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </p>
                    </v-flex>
                </v-layout>
            </v-container>

            <hr />
            <br />

            <v-combobox
                v-model="filterData.selectedResourceTypes"
                :items="resourceTypes"
                label="Filter by resource types"
                multiple
                chips
                :menu-props="{ maxHeight: '400px', overflowY: true }"
                style="width: 98%"
            ></v-combobox>

            <!--https://vuetifyjs.com/en/components/autocompletes -->
            <v-autocomplete
                v-model="filterData.projectId"
                :items="gcpProjects"
                :item-text="'name'"
                :item-value="'id'"
                :label="`Filter by Project`"
                persistent-hint
            >
                <v-slide-x-reverse-transition slot="append-outer" mode="out-in">
                    <v-icon></v-icon>
                </v-slide-x-reverse-transition>
            </v-autocomplete>

            <br />

            <!--https://vuetifyjs.com/en/components/selects-->
            {{ filterData.selectedInventoryIndexId }}
            <v-select
                v-model="filterData.selectedInventoryIndexId"
                :items="inventoryIndexSnapshots"
                menu-props="auto"
                label="Filter by Inventory Index Snapshot"
                item-text="dateTime"
                item-value="id"
                hide-details
                single-line
                v-on:change="onVSelectChange"
                class="select-inventory-index-snapshot"
            ></v-select>

            <v-btn color="danger" class="btn-clear" v-on:click="clear"
                >Clear</v-btn
            >

            <v-btn color="info" class="btn-search" v-on:click="search"
                >Search</v-btn
            >
        </div>
    </v-flex>
</template>

<script>
import swal from 'sweetalert';

import ResourceArrayStore from '../stores/ResourceArray';
import { mapState } from 'vuex';

import 'vue-select/dist/vue-select.css';

let componentFunctionMap = {
    search: 'search',
    clear: 'clear',
};

export default {
    store: ResourceArrayStore,
    
    computed: mapState(['resourceArray']),
    watch: {},

    /**
     * Vue: mounted() - onload function
     */
    mounted() {
        // this.filterData.selectedResourceTypes = ['GCS Bucket', 'GCE Instance'];
    },

    /**
     * Vue: methods
     */
    methods: {
        onVSelectChange: function () {
            this.$nextTick(() => {
                swal('Info', this.filterData.selectedInventoryIndexId, 'info');
            });
        },

        /**
         * @function search
         * @description Searches for an exact text match of the node name and pans to that node
         */
        search: function () {
            this.$emit(componentFunctionMap.search, this.filterData);
        },

        clear: function () {
            swal('Notice', 'clear', 'error');
        },
    },

    props: {
        resourceTypes: Array,
        gcpProjects: Array,
        inventoryIndexSnapshots: Array,
    },

    /**
     * Vue: data
     */
    data: () => ({
        filterData: {
            selectedResourceTypes: ['Include ALL'],
            // selectedResourceTypes: ['Service Account Key'],
        },
        // resourceArray: [{}],

        dialog: false, // settings dialog
    }),
};
</script>

<style>
.control-panel {
    padding: 8px;
}
.btn-search {
    margin-right: 8px;
    float: right;
}
.btn-clear {
    margin-left: 0px;
}
.select-inventory-index-snapshot {
    margin-right: 8px;
    margin-top: -17px;
    margin-bottom: 16px;
}

/* help section */
.v-subheader {
    padding: 0;
}
</style>
