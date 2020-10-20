<template>
  <div class="text-xs-center">
    <v-bottom-sheet v-model="sheetOpen" v-bind:hide-overlay="true">

      <v-layout>
        <v-flex xs12>
          <v-container fluid>
            <v-layout row no-wrap style="overflow: scroll;">
              <v-flex v-for="(roles, resourceName) in iamPolicies" :key="resourceName" xs3>
                <v-card style="height:160px;max-height:160px;overflow:scroll;">
                  <v-card-title>
                    <h4>{{ resourceName }} ({{roles.length}})</h4>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-list dense>
                    <v-list-tile v-for="role in roles" :key="role">
                      <v-list-tile-content>{{role}}:</v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
      </v-layout>
    </v-bottom-sheet>
  </div>
</template>

<script>
export default {
    props: {
        title: String,
        iamPolicies: Object,
        sheetOpen: Boolean,
    },
    data: () => ({
        // iamPolicies: {},
        rowsPerPageItems: [4, 8, 12],
        pagination: {
            rowsPerPage: 4,
        },

        items: [
            {
                name: 'Gingerbread',
                calories: 356,
                fat: 16.0,
                carbs: 49,
                protein: 3.9,
                sodium: 327,
                calcium: '7%',
                iron: '16%',
            },
            {
                name: 'KitKat',
                calories: 518,
                fat: 26.0,
                carbs: 65,
                protein: 7,
                sodium: 54,
                calcium: '12%',
                iron: '6%',
            },
        ],
    }),
    mounted() {},
};
</script>

<style>
</style>
