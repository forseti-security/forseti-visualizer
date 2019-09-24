// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Vue from 'vue';
import './plugins/vuetify';
import VueRouter from 'vue-router';

import App from './App.vue';
import Violations from './components/Violations';
import Viz from './components/Body';
import Resources from './components/Resources';
import Visualizer from './components/Visualizer';

Vue.use(VueRouter);

const routes = [{
    path: '*',
    redirect: '/viz'
  },
  {
    path: '/viz',
    component: Viz
  },
  {
    path: '/viz/:projectId',
    component: Viz,
    props: true
  },
  {
    path: '/violations',
    component: Violations
  },
  {
    path: '/resources',
    component: Resources
  },
  {
    path: '/visualizer',
    component: Visualizer
  },
]

Vue.config.productionTip = false;
Vue.config.runtimeCompiler = true;

const router = new VueRouter({
  routes
});

/**
 * Vue init
 * @description sets up router and mounts the #app
 */
new Vue({
  router,
  render: h => h(App),
}).$mount('#app');