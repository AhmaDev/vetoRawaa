import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import "@babel/polyfill";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";
import router from "./router";
import axios from "axios";
import Loading from "vue-loading-overlay";
import "line-awesome/dist/line-awesome/css/line-awesome.css";
import "vue-loading-overlay/dist/vue-loading.css";
import VueToast from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";
import store from "./store";
import VuePageTransition from "vue-page-transition";
import VueSweetalert2 from "vue-sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import Print from "vue-printjs";
import { LMap, LTileLayer, LMarker, LPolyline } from "vue2-leaflet";
import LDrawToolbar from "vue2-leaflet-draw-toolbar";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { firestorePlugin } from "vuefire";
import VueBottomSheet from "@webzlodimir/vue-bottom-sheet";
import JsonExcel from "vue-json-excel";
import "@/util/auth.js";
import "@/util/date.js";
import VueSocketIO from "vue-socket.io";
import { io } from "socket.io-client";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});
Vue.config.productionTip = false;
// Vue.prototype.$baseUrl = 'http://localhost:3000/';
Vue.prototype.$baseUrl = "https://api.rawaa-co.com/";
Vue.prototype.$trackBaseUrl = "https://track.rawaa-co.com/";
Vue.prototype.$appVersion = "1.6.0";
Vue.http = Vue.prototype.$http = axios;
Vue.prototype.$background = "#007BFF";
Vue.use(Loading, {
  color: Vue.prototype.$background,
  blur: "10px",
});
Vue.use(VueToast, {
  position: "bottom-left",
});
Vue.use(VuePageTransition);
Vue.use(VueSweetalert2);
Vue.use(Print);
Vue.use(firestorePlugin);
Vue.use(VueBottomSheet);
var userInfo = localStorage.getItem("userinfo");
const auth = io(Vue.prototype.$baseUrl, {
  transports: ["websocket", "polling", "flashsocket"],
  query: {
    userInfo: userInfo,
  },
  useConnectionNamespace: true,
  autoConnect: userInfo ? true : false,
  reconnection: userInfo ? true : false,
});
const track = io(Vue.prototype.$trackBaseUrl, {
  transports: ["websocket", "polling", "flashsocket"],
  useConnectionNamespace: true,
  autoConnect: userInfo ? true : false,
  reconnection: userInfo ? true : false,
});
Vue.use(
  new VueSocketIO({
    debug: true,
    connection: {
      auth,
      track,
    },
    vuex: {
      store,
      actionPrefix: "SOCKET_",
      mutationPrefix: "SOCKET_",
    },
    allowEIO3: true,
  }),
);

Vue.component("l-map", LMap);
Vue.component("l-tile-layer", LTileLayer);
Vue.component("l-marker", LMarker);
Vue.component("l-polyline", LPolyline);
Vue.component("downloadExcel", JsonExcel);
Vue.component("l-draw-toolbar", LDrawToolbar);

new Vue({
  vuetify,
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
