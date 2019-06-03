<template>
  <v-container fluid>
    <h4>Sub-Component</h4>

    {{count}}
  </v-container>

</template>

<script>
import $ from 'jquery';
import * as d3 from 'd3';
import Vuex from 'vuex';
import CounterStore from '../../stores/Counter';

export default {
    mounted() {
      
    },

    store: CounterStore,

    methods: {
      
    },

    data: () => ({
        
    }),

    computed: {
        count() {
            return this.$store.state.count;
        },
    },
};
</script>

<style>
</style>
