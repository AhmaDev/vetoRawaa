<template>
  <div id="tracker">
    <v-app-bar app>
      <v-toolbar-title> حركة المندوب على الخريطة اخر 24 ساعة</v-toolbar-title>
    </v-app-bar>
    <v-row>
      <v-col cols="12">
        <l-map
          v-if="finishedLoading"
          style="height: 100vh"
          :zoom="map.zoom"
          :center="map.center"
        >
          <l-tile-layer
            :url="map.url"
            :attribution="map.attribution"
          ></l-tile-layer>
          <l-marker key="marker" :lat-lng="map.markerLatLng"></l-marker>
          <l-polyline
            :lat-lngs="polyline.latlngs"
            :color="polyline.color"
          ></l-polyline>
        </l-map>
      </v-col>
    </v-row>
    <v-card
      style="
        position: fixed;
        bottom: 10px;
        left: 10px;
        z-index: 10000;
        width: 300px;
      "
    >
      <v-card-text>
        <v-slider
          v-model="slider"
          :max="max"
          :min="min"
          thumb-size="50"
          @end="updateMarker()"
        ></v-slider>
        {{ parseDate(slider) }}

        <v-btn v-if="!play" @click="startPlayer()" icon>
          <v-icon>la-play</v-icon>
        </v-btn>
        <v-btn v-if="play" @click="stopPlayer()" icon>
          <v-icon>la-pause</v-icon>
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import * as moment from "moment";
export default {
  data: () => ({
    slider: 10,
    track: [],
    max: 100,
    min: 10,
    playSpeed: 500,
    play: false,
    interval: null,
    finishedLoading: true,
    map: {
      url: "https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      attribution: "veto",
      zoom: 12,
      center: [33.4, 44.3],
      markerLatLng: [33.4, 44.3],
    },
    polyline: {
      latlngs: [],
      color: "green",
    },
  }),
  mounted: function () {},
  created: function () {
    this.fetch();
  },
  methods: {
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$trackBaseUrl + "track/" + this.$route.params.id)
        .then((res) => {
          this.track = res.data;
          if (this.track.docs.length > 0) {
            this.polyline.latlngs = [
              ...this.track.docs.map((e) => [e.lat, e.lon]),
            ];

            this.map.center = [this.track.docs[0].lat, this.track.docs[0].lon];
            this.map.markerLatLng = [
              this.track.docs[0].lat,
              this.track.docs[0].lon,
            ];
            this.finishedLoading = false;
            this.finishedLoading = true;
            this.slider = this.track.docs[0].date;
            this.max = this.track.docs[this.track.docs.length - 1].date;
            this.min = this.track.docs[0].date;
            setTimeout(() => {
              this.map.zoom = 14;
            }, 1000);
          }
        })
        .finally(() => loading.hide());
    },
    parseDate(date) {
      return moment(date).format("YYYY-MM-DD h:mm:ss a");
    },
    updateMarker() {
      let marker = this.track.docs.filter((e) => e.date <= this.slider);
      console.log(marker);
      if (marker.length > 0) {
        this.map.markerLatLng = [
          marker[marker.length - 1].lat,
          marker[marker.length - 1].lon,
        ];
      }
    },
    startPlayer() {
      this.play = true;
      this.interval = setInterval(() => {
        if (this.slider < this.track.docs[this.track.docs.length - 1].date) {
          this.slider += 30000;
          this.updateMarker();
        }
      }, this.playSpeed);
    },
    stopPlayer() {
      this.play = false;
      clearInterval(this.interval);
    },
  },
};
</script>

<style>
.leaflet-control-toolbar,
.leaflet-popup-toolbar {
  padding-left: 0px !important;
}

.leaflet-control-toolbar {
  display: none !important;
}

.leaflet-container .leaflet-marker-pane img {
  width: 30px !important;
}
</style>