<template>
  <div>
    <h4>Testing</h4>

    <!-- sliders -->
    <v-layout row wrap>
      <v-flex xs4>
        <v-btn color="primary" v-on:click="start">Start Race</v-btn>
        <v-btn color="warning" v-on:click="restart">Restart Race</v-btn>
      </v-flex>
      <v-inlineflex>
        <strong>Speed = (Current Speed *</strong>
      </v-inlineflex>
      <v-inlineflex shrink style="width: 50px">
        <v-text-field
          v-model="factor"
          style="padding:0 !important; margin-top:0; text-align:center;"
          class="numerical-input-custom"
          hide-details
          type="number"
        ></v-text-field>
      </v-inlineflex>
      <v-inlineflex>) +</v-inlineflex>
      <v-inlineflex shrink style="width: 30px">
        <v-text-field
          v-model="constant"
          style="padding:0 !important; margin-top:0; text-align:center;"
          class="numerical-input-custom"
          hide-details
          type="number"
        ></v-text-field>
      </v-inlineflex>

      <v-flex xs12>
        <v-slider label="Readonly" readonly inverse-label v-bind:value="racer1Position"></v-slider>
      </v-flex>

      <v-flex xs12>
        <v-slider label="Readonly" readonly inverse-label v-bind:value="racer2Position"></v-slider>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
    mounted() {
        // set interval
        // BOUNCE EFFECT
        // if (false) {
        // // if (true) {
        //     this.intervalid1 = setInterval(() => {
        //         this.racer1Position = (this.racer1Position + 1.25) * 1.17;
        //         this.racer2Position = (this.racer2Position + 1.15) * 1.23;
        //         if (this.racer1Position > 200) this.racer1Position = 0;
        //         if (this.racer2Position > 200) this.racer2Position = 0;
        //     }, 50);
        // }
    },

    methods: {
        start: function() {
            if (!this.raceActive) {
                this.raceActive = true;

                this.intervalid1 = setInterval(() => {
                    this.racer1Position =
                        this.racer1Position * this.factor + this.constant;

                    this.racer2Position = (this.racer2Position + 1.44) * 1.23;

                    if (
                        this.racer1Position > 200 &&
                        this.racer2Position > 200
                    ) {
                        clearInterval(this.intervalid1);

                        if (this.racer1Position > this.racer2Position) {
                            this.racer1Position = 80;
                            this.racer2Position = 30;
                        } else {
                            this.racer1Position = 30;
                            this.racer2Position = 80;
                        }

                        this.raceActive = false;
                    }
                }, 500);
            }
        },

        restart: function() {
            this.raceActive = false;
            if (this.intervalid1) {
                clearInterval(this.intervalid1);
            }

            this.racer1Position = 0;
            this.racer2Position = 0;
        },
    },

    data: () => ({
        racer1Position: 0,
        racer2Position: 0,

        raceActive: false,

        factor: 1,
        constant: 1,
    }),
};
</script>

<style>
.numerical-input-custom input {
    margin-top: 0 !important;
    padding-left: 8px !important;
    padding-top: 0px !important;
}
.numerical-input-custom > .v-text-field__slot {
    text-align: center;
}
</style>
