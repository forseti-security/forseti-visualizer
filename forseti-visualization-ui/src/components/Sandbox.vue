<template>
  <v-container fluid>
    
    <v-toolbar
      color="blue-grey"
      dark
      fixed
      app
      clipped-right
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Forseti-Visualization</v-toolbar-title>
    </v-toolbar>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
    >
      <v-list dense>

        <v-list-tile v-for="n in pokemon">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              <div v-if="n === selectedPokemon">TURD</div>
              {{n}}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer
      v-model="left"
      temporary
      fixed
    ></v-navigation-drawer>
    <!-- <v-content>
      <v-container fluid fill-height>
        <v-layout justify-center align-center>
          <v-flex shrink>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn :href="source" icon large target="_blank" v-on="on">
                  <v-icon large>code</v-icon>
                </v-btn>
              </template>
              <span>Source</span>
            </v-tooltip>
            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <v-btn icon large href="https://codepen.io/johnjleider/pen/KQrPKJ" target="_blank" v-on="on">
                  <v-icon large>mdi-codepen</v-icon>
                </v-btn>
              </template>
              <span>Codepen</span>
            </v-tooltip>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content> -->
    <v-navigation-drawer
      v-model="right"
      right
      temporary
      fixed
    ></v-navigation-drawer>


    <h1>#i{{text}}</h1>

    <!-- sliders -->
    <v-layout row wrap>
      <v-flex xs6>
        {{count}}
        <button dark v-on:click="inc()">Inc</button>
        <button dark v-on:click="dec()">D2</button>
        <button dark v-on:click="decFaster()">D3</button>
      </v-flex>

      <v-flex xs6>
        <v-slider label="Counter" inverse-label v-bind:value="count"></v-slider>

        <verify-store></verify-store>
      </v-flex>
    </v-layout>

    <!-- Pokemon Selection -->
    <v-layout row wrap>
      <v-flex sx12>
        <ul>
          <li v-for="n in pokemon" sytle="display: inline-block">{{n}}</li>
        </ul>
      </v-flex>
    </v-layout>

    <h2>{{selectedPokemon}}</h2>

    <race></race>

    <!-- sliders -->
    <v-layout row wrap>
      <v-flex xs12>
        <v-slider v-model="slider" label="Pokemon Selector" v-on:input="onSliderUpdate()"></v-slider>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import $ from 'jquery';
import * as d3 from 'd3';
import Vuex from 'vuex';
import CounterStore from '../stores/Counter';
import VerifyStore from './Sandbox/VerifyStore';
import Race from './Sandbox/Race';

export default {
    components: {
        VerifyStore,
        Race,
    },
    mounted() {
        console.log('test', this, this.$store.state.count);
    },

    store: CounterStore,

    methods: {
        inc: function() {
            this.$store.commit('increment');
        },
        dec: function() {
            this.$store.commit('decrement');
        },
        decFaster: function(t) {
            this.$store.commit('decrement', 40);
        },

        onSliderUpdate: function() {
            console.log('osu', this.slider);

            if (this.slider === 100) this.slider = 99.9;
            let elementIndexInArray = Math.floor(
                (this.slider / 100) * this.pokemon.length
            );

            this.selectedPokemon = this.pokemon[elementIndexInArray];
        },
    },

    data: () => ({
        selectedPokemon: 'Pikachu',
        pokemon: [
            'Pikachu',
            'Tyrannitar',
            'Altaria',
            'Staryu',
            'Mew',
            'Vaporeon',
            'Flareon',
            'Articuno',
        ],
        text: 'Sandbox',
        slider: 45,
        volume: 10,
        price: [110, 440],
        count2: CounterStore.state.count,

        // sidebar
        drawer: null,
        drawerRight: null,
        right: false,
        left: false,
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
