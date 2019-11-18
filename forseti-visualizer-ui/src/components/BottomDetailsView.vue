<template>
  <div class="text-xs-center">
    <v-bottom-sheet v-model="sheetOpen" v-bind:hide-overlay="true">
      <v-btn slot="activator" color="purple" dark>Click me {{sheetOpen}}</v-btn>

      <v-card>
        <v-card-title primary-title>
          <div>
            <h3 class="headline mb-0">
              <a
                v-bind:href="'https://console.cloud.google.com/home/dashboard?project=' + title"
                target="_blank"
              >{{title}}</a>
            </h3>

            <div>
              {{ (node !== undefined && node.data !== undefined) ? node.data.resource_type : "" }}
              <br>

              <br>
              <h4>Violations:</h4>
              
              <table v-if="violation != null" class="table">
                <tr>
                  <td>Type:</td>
                  <td>{{violation.violation_type}}</td>
                </tr>
                <tr>
                  <td>Rule:</td>
                  <td>{{violation.rule_name}}</td>
                </tr>
                <tr>
                  <td>Result:</td>
                  <td>{{violation.violation_data}}</td>
                </tr>
              </table>

              <v-list two-line>
                <!-- <template v-for="(value, key) in violation">{{value}} {{key}}</template> -->
              </v-list>
            </div>
          </div>
        </v-card-title>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
export default {
    props: {
        title: String,
        node: Object,
        violation: Object,
        sheetOpen: Boolean,
    },
    data: () => ({
        tiles: [],
    }),
    mounted() {

    },
};
</script>

<style>
</style>
