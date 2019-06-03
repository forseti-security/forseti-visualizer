<template>
  <v-container fluid>
    <v-layout wrap class="margin-top-30">
      <v-flex xs12 mb-5>
        <v-data-table
          :headers="mainHeaders"
          :items="mainItems"
          item-key="id"
          hide-actions
          expand
          class="elevation-1"
        >
          <template slot="items" scope="props">
            <tr @click="props.expanded = !props.expanded">
              <td class="text-xs">{{ props.item.violationType }}</td>
              <td class="text-xs">{{ props.item.resourceName }}</td>
              <td class="text-xs">{{ props.item.violationData }}</td>
            </tr>
          </template>

          <template slot="expand" scope="props">
            <v-card class="elevation-10">
              <v-card-text>
                <h4>
                  Resource data for:  <b style="font-weight:400;">{{props.item.resourcePath}}</b>
                </h4>
                <pre>{{ beautify(props.item.resourceData) }}</pre>
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
        d3.json(cachedFileMap.violationsFile).then(violations => {
            this.violations = violations;
            console.log('violations', this.violations);
            this.mainItems = this.violations.map(function(data) {
                return {
                    id: data.id,
                    violationType: data.violation_type,
                    resourceName: data.resource_name,
                    resourceData: data.resource_data,
                    resourcePath: data.full_name,
                    violationData: data.violation_data,
                };
            });
        });
    },

    methods: {
        /**
         * @function beautify
         * @description JSON beautifier function
         */
        beautify: function(o, indentions) {
            return JSONBeautifier.beautify(o, indentions);
        },
    },

    data: () => ({
        violations: [],

        mainHeaders: [
            { text: 'Violation', value: 'violationType' },
            { text: 'Resource Name', value: 'resourceName' },
            { text: 'Resource Path', value: 'resourcePath' },
            { text: 'Violation Data', value: 'violationData' },
        ],
        mainItems: [],
        
        // mainItems: [
            // {
            //     id: 27,
            //     violationType: 'FIREWALL_BLACKLIST_VIOLATION',
            //     resourceName: 'gke-tf-lb-https-gke-aa62a218-all',
            //     resourceData: '{}',
            //     resourcePath:
            //         'organization/358329783625/folder/379678980128/project/machine-learning-space-60f8/firewall/3803766427012574135/',
            //     violationData:
            //         '{"policy_names": ["gke-tf-lb-https-gke-aa62a218-all"], "recommended_actions": {"DELETE_FIREWALL_RULES": ["gke-tf-lb-https-gke-aa62a218-all"]}}',
            // },
        // ],
    }),
};
</script>

<style>
</style>
