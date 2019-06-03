<template>
  <v-container fluid>
    <v-layout wrap class="margin-top-30">
      <v-flex xs12 mb-5>
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
              >{{ props.item.name }}</td>
              <td class="text-xs">{{ props.item.resource_type }}</td>
              <td class="text-xs">{{ props.item.resource_id }}</td>
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
  </v-container>
</template>

<script>
import $ from 'jquery';
import * as d3 from 'd3';
import JSONBeautifier from '../services/JSONBeautifier';

export default {
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
        });
    },

    methods: {
        /**
         * @function beautify
         * @description JSON beautifier function
         */
        beautify: function(o) {
            return JSONBeautifier.beautify(o);
        },
    },

    data: () => ({
        mainHeaders: [
            { text: 'Name', value: 'name' },
            { text: 'Type', value: 'resource_type' },
            { text: 'Resource', value: 'resource_type' },
        ],
        resources: [],
    }),
};
</script>

<style>
</style>
