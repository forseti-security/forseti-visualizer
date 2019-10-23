<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Forseti</span>
        <span class="font-weight-light">Visualizer v2.0</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <router-link to="/viz">
        <v-btn flat>Visualizer</v-btn>
      </router-link>
      <router-link to="/resources">
        <v-btn flat>Resources</v-btn>
      </router-link>
    </v-toolbar>

    <v-content>
      <router-view></router-view>
    </v-content>

    <!-- primary content: SINGLE COMPONENT: <Body /> -->
    <!-- <v-content>
      <Body/>
    </v-content>-->
    <!-- bottom details -->
    <bottom-details-view
      v-bind:title="nodeName"
      v-bind:node="node"
      v-bind:violation="violation"
      v-bind:sheet-open="sheetOpen"
    ></bottom-details-view>

    <bottom-details-violations
      v-bind:title="title"
      v-bind:iamPolicies="iamPolicies"
      v-bind:sheet-open="sheetOpen2"
    ></bottom-details-violations>
  </v-app>
</template>

<script>
import BottomDetailsView from './components/BottomDetailsView';
import BottomDetailsViolations from './components/BottomDetailsViolations';

export default {
    name: 'App',
    components: {
        BottomDetailsView,
        BottomDetailsViolations,
    },
    data() {
        return {
            sheetOpen: false,
            node: {},
            nodeName: '',
            violation: {},

            title: '',
            sheetOpen2: false,
            iamPolicies: {},
        };
    },

    /**
     * @function mounted()
     * @description sets up events at the App (parent-level)
     */
    mounted() {
        // BottomDetailsView showing Violations on a particular Node
        this.$root.$on('send', (node, violation) => {
            this.nodeName = node.name;
            this.node = node;
            this.violation = violation;

            this.sheetOpen2 = false;
            this.sheetOpen = true;
        });

        // BottomDetailsView showing details on IAM Explain Resources
        this.$root.$on('updateResources', resources => {
            this.title = 'IAM Explain';

            let formattedResources = {};

            /* 
              { 
                resources: ['organization/358329783625'], 
                role: 'roles/compute.admin', 
                member: 'user/garrettwong@mycloud.com' 
              }
            */
            for (let i = 0; i < resources.length; i++) {
                let resource = resources[i];

                // { resource: { name: '', id: '' }, policies: [
                // 'roles/resourceManager.projectIamAdmin',
                // 'roles/compute.admin'
                // ]}
                for (let j = 0; j < resource.resources.length; j++) {
                    if (!formattedResources[resource.resources[j]]) {
                        formattedResources[resource.resources[j]] = [];
                    }

                    formattedResources[resource.resources[j]].push(
                        resources[i].role
                    );
                }
            }

            this.iamPolicies = formattedResources;
            this.sheetOpen = false;
            this.sheetOpen2 = true;
        });
    },
};
</script>

<style>
a {
    text-decoration: none;
}
</style>