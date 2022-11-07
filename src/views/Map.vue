<template>
  <div id="MapPage">
    <v-app-bar app>
      <v-toolbar-title>الخريطة</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="this.checkPermission('map_edit')">
        <v-btn
          @click="customers = allCustomers.filter((e) => e.totalInvoices > 0)"
          v-if="editCustomers"
          color="primary"
        >
          المعاميل
        </v-btn>
        <v-btn
          @click="customers = allCustomers.filter((e) => e.totalInvoices == 0)"
          v-if="editCustomers"
          color="primary"
        >
          غير المعاميل
        </v-btn>
        <v-btn
          @click="customers = allCustomers"
          v-if="editCustomers"
          color="primary"
        >
          الكل
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          @click="editCustomers = true"
          v-if="!editCustomers"
          color="primary"
        >
          رسم المسار
        </v-btn>
        <v-btn
          @click="editCustomers = false"
          v-if="editCustomers"
          color="error"
        >
          الخروج من رسم المسار
        </v-btn>
        <v-btn @click="selectByDrag()" v-if="editCustomers" color="success">
          تحديد
        </v-btn>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-if="editCustomers" app>
      <div class="pa-5">
        <v-autocomplete
          :items="users"
          item-text="username"
          item-value="idUser"
          label="الجهة"
          v-model="search.selectedUser"
          outlined
          dense
        ></v-autocomplete>
        <v-autocomplete
          :items="searchDays"
          item-text="displayName"
          item-value="day"
          label="يوم الزيارة"
          v-model="search.selectedDay"
          outlined
          dense
        ></v-autocomplete>
        <v-list-item>
          <v-list-item-content>
            الزبائن : {{ customers.length }}
          </v-list-item-content>
        </v-list-item>
        <v-btn @click="searchCustomers()" block color="primary">بحث</v-btn>
        <br /><br />
        <v-text-field
          v-if="customers.length > 0"
          label="البحث عن كود زبون"
          outlined
          type="number"
          hint="اضغط Enter بعد كتابة كود الزبون"
          dense
          @keypress.enter="searchCustomerOnmap($event)"
        ></v-text-field>

        <template v-if="selectedCustomers.length > 0">
          <v-list-item>
            <v-list-item-content>
              الزبائن المحددين : {{ selectedCustomers.length }}
            </v-list-item-content>
            <v-list-item-action>
              <v-btn @click="selectedCustomers = []" icon>
                <v-icon color="grey lighten-1">mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <br />
          <v-btn @click="dialogs.setDelegate = true" block color="primary"
            >تحويل الجهة</v-btn
          >
          <br />
          <br />
          <br />
          <v-btn
            v-if="userInfo.roleId == 1"
            @click="deleteCustomers()"
            block
            color="error"
            >حذف</v-btn
          >
        </template>
      </div>
    </v-navigation-drawer>
    <v-card
      v-if="!editCustomers"
      style="
        position: fixed;
        left: 20px;
        bottom: 20px;
        height: 70vh;
        z-index: 100000;
        width: 350px;
        overflow: scroll;
      "
    >
      <v-card-text>
        <h3>المندوبين</h3>
        <small>اضغط على اسم المندوب لمشاهدة الحركة</small>
        <v-list>
          <v-list-item
            v-for="user in users.filter((e) => e.roleId == 4)"
            :key="'USER_' + user.idUser"
            link
            :to="'/track/' + user.idUser"
          >
            <v-list-item-content>
              <v-list-item-title>{{ user.username }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-chip
                v-if="mapData.filter((e) => e.userId == user.idUser).length > 0"
                small
                color="success"
                >متصل</v-chip
              >
              <v-chip
                v-if="
                  mapData.filter((e) => e.userId == user.idUser).length == 0
                "
                small
                color="error"
                >غير متصل</v-chip
              >
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
    <l-map
      :key="forceRerender"
      style="height: 100vh"
      :zoom="map.zoom"
      ref="map"
      :center="map.center"
    >
      <l-draw-toolbar position="topleft" v-if="editCustomers" />
      <l-tile-layer
        :url="map.url"
        :attribution="map.attribution"
      ></l-tile-layer>
      <template v-if="this.checkPermission('map_tacking')">
        <template v-if="!editCustomers">
          <template v-if="reloadMarkers">
            <l-marker
              v-for="marker in mapData"
              :key="'MARKER' + marker.userId"
              :lat-lng.sync="marker.fixedLocation"
            >
              <l-icon>
                <div class="userMarker">
                  <b style="color: white"> {{ getUserName(marker.userId) }}</b>
                </div>
                <img
                  src="@/assets/user.svg"
                  v-if="checkDate(marker.date)"
                  width="30px"
                  alt=""
                />
                <img
                  v-if="!checkDate(marker.date)"
                  src="@/assets/disconnected.png"
                  width="40px"
                  alt=""
                />
              </l-icon>
              <l-popup ref="marker">
                اخر تحديث للموقع قبل
                {{ getLocationDate(marker.date) * -1 }} دقيقة
              </l-popup>
            </l-marker>
          </template>
        </template>
      </template>
      <template v-if="editCustomers">
        <l-circle-marker
          v-for="marker in customers"
          :key="marker.idCustomer"
          :radius="15"
          :stroke="false"
          :fillOpacity="0.8"
          @update="forceRerender++"
          :fillColor="checkIfSelected(marker)"
          @click="selectCustomer(marker)"
          @contextmenu="openCustomer(marker.idCustomer)"
          :lat-lng="getCustomerLocation(marker.location)"
        >
          <l-tooltip
            >{{ marker.storeName }} - {{ marker.idCustomer }}
            <br />
            اضفط زر الفأرة الايمن لمشاهدة معلومات الزبون
          </l-tooltip>
        </l-circle-marker>
      </template>
    </l-map>

    <v-dialog v-model="dialogs.setDelegate" persistent max-width="500">
      <v-card>
        <v-card-title class="text-h5"> قم بأختيار الجهة </v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="selectedDelegateId"
            :items="users"
            item-text="username"
            item-value="idUser"
          >
          </v-autocomplete>
          <v-autocomplete
            v-model="selectedVisitDay"
            :items="days"
            item-text="displayName"
            item-value="day"
            label="يوم الزيارة الاول"
          >
          </v-autocomplete>
          <v-autocomplete
            v-model="selectedSecondVisitDay"
            :items="days"
            item-text="displayName"
            item-value="day"
            label="يوم الزيارة الثاني"
          >
          </v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="red" @click="dialogs.setDelegate = false">
            الغاء
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn :color="$background" dark @click="setDelegate()">
            تحويل
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// import { db } from "../firebase/db";
import { LIcon, LPopup, LMarker, LCircleMarker, LTooltip } from "vue2-leaflet";
import moment from "moment";
export default {
  name: "Map",
  components: {
    LIcon,
    LPopup,
    LMarker,
    LCircleMarker,
    LTooltip,
  },
  sockets: {
    track: {
      connect: function () {
        console.log("Track socket connected");
      },
      trackData: function (data) {
        console.log(data);
        let mark = this.mapData.filter((e) => e.userId == data.userId);
        if (mark.length == 0) {
          this.mapData.push(data);
        } else {
          let index = this.mapData.indexOf(mark[0]);
          this.mapData[index] = data;
        }
        this.reloadMarkers = false;
        this.reloadMarkers = true;
      },
    },
  },
  data: () => ({
    permissions: [],
    editCustomers: false,
    customers: [],
    allCustomers: [],
    selectedCustomers: [],
    forceRerender: 0,
    users: [],
    search: {
      selectedUser: 0,
      selectedDay: "all",
    },
    map: {
      url: "https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      attribution: "veto",
      zoom: 12,
      center: [33.4, 44.3],
      markerLatLng: [33.4, 44.3],
    },
    mapData: [],
    popUpOptions: {
      keepInView: true,
      closeButton: false,
      autoClose: false,
      closeOnClick: false,
    },
    searchDays: [
      { day: "all", displayName: "الكل" },
      { day: "sunday", displayName: "الاحد" },
      { day: "monday", displayName: "الاثنين" },
      { day: "tuesday", displayName: "الثلاثاء" },
      { day: "wednesday", displayName: "الاربعاء" },
      { day: "thursday", displayName: "الخميس" },
      { day: "friday", displayName: "الجمعة" },
      { day: "saturday", displayName: "السبت" },
    ],
    days: [
      { day: "sunday", displayName: "الاحد" },
      { day: "monday", displayName: "الاثنين" },
      { day: "tuesday", displayName: "الثلاثاء" },
      { day: "wednesday", displayName: "الاربعاء" },
      { day: "thursday", displayName: "الخميس" },
      { day: "friday", displayName: "الجمعة" },
      { day: "saturday", displayName: "السبت" },
    ],
    selectedDelegateId: 0,
    selectedVisitDay: "sunday",
    selectedSecondVisitDay: "sunday",
    dialogs: {
      setDelegate: false,
    },
    reloadMarkers: true,
  }),
  methods: {
    selectByDrag() {
      document.getElementsByClassName("leaflet-draw-draw-rectangle")[0].click();
    },
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },

    getUserName(id) {
      let user = this.users.filter((e) => e.idUser == id);
      if (user.length > 0) return user[0].username;
      else return "User not found";
    },
    checkDate(date) {
      console.log("d2", date);

      let now = moment.now();
      let d = new Date(date).toISOString();
      let postDate = moment(d);
      if (postDate.diff(now, "minutes") < -15) {
        return false;
      } else {
        return true;
      }
    },
    getLocationDate(date) {
      console.log("d1", date);
      let now = moment.now();
      let d = new Date(date).toISOString();
      let postDate = moment(d);
      return postDate.diff(now, "minutes");
    },
    searchCustomers() {
      let loading = this.$loading.show();
      let query = "";
      if (this.search.selectedDay == "all") {
        query = `user=${this.search.selectedUser}&totalInvoices=1`;
      } else {
        query = `user=${this.search.selectedUser}&visitDay=${this.search.selectedDay}&totalInvoices=1`;
      }
      this.$http
        .get(this.$baseUrl + `customer/filter/query?${query}`)
        .then((res) => {
          this.customers = res.data;
          this.allCustomers = res.data;
        })
        .finally(() => loading.hide());
    },
    getCustomerLocation(loc) {
      var location = loc.split(",");
      return [location[0], location[1]];
    },
    selectCustomer(customer) {
      var index = this.selectedCustomers.findIndex(
        (e) => e.idCustomer == customer.idCustomer
      );
      if (index == -1) {
        this.selectedCustomers.push(customer);
      } else {
        this.selectedCustomers.splice(index, 1);
      }
    },
    checkIfSelected(customer) {
      var index = this.selectedCustomers.findIndex(
        (e) => e.idCustomer == customer.idCustomer
      );

      if (index == -1) {
        return "#005EC9";
      } else {
        return "#EC0000";
      }
    },
    setDelegate() {
      let c = confirm("هل انت متأكد من تحويل الزبائن");
      if (!c) {
        return;
      }
      if (this.selectedDelegateId == 0) {
        this.$toast.open({
          type: "error",
          message: "يرجى اختيار جهة",
          duration: 3000,
        });
        return;
      }
      let loading = this.$loading.show();
      var customerIds = JSON.stringify(
        this.selectedCustomers.map((e) => e.idCustomer)
      );
      var ids = customerIds.slice(1, -1);
      this.$http
        .put(this.$baseUrl + "customer/edit/multiple/" + ids, {
          createdBy: this.selectedDelegateId,
          visitDay: this.selectedVisitDay,
          secondVisitDay: this.selectedSecondVisitDay,
        })
        .then((res) => {
          console.log(res);
          this.searchCustomers();
          this.$toast.open({
            type: "success",
            message: "تم تغيير الجهة بنجاح",
            duration: 3000,
          });
          this.selectedCustomers = [];
          this.dialogs.setDelegate = false;
          this.selectedDelegateId = 0;
        })
        .finally(() => loading.hide());
    },
    searchCustomerOnmap(e) {
      let id = parseInt(e.target.value);
      let customer = this.customers.filter((x) => x.idCustomer == id);
      if (customer.length > 0) {
        let cords = customer[0].location.split(",");
        this.$refs.map.mapObject.flyTo([cords[0], cords[1]], 17);
        this.selectCustomer(customer[0]);
      } else {
        this.$toast.open({
          type: "warning",
          message: "لا يوجد نتائج بحث",
          duration: 3000,
        });
      }
    },
    deleteCustomers() {
      let x = confirm("هل انت متأكد من حذف الزبائن");
      if (x) {
        let loading = this.$loading.show();
        var customerIds = JSON.stringify(
          this.selectedCustomers.map((e) => e.idCustomer)
        );
        var ids = customerIds.slice(1, -1);
        this.$http
          .delete(this.$baseUrl + "customer/delete/" + ids)
          .finally(() => loading.hide())
          .then(() => {
            this.$toast.open({
              type: "success",
              message: "تم حذف الزبائن",
              duration: 3000,
            });
            this.searchCustomers();
            this.selectedCustomers = [];
            this.dialogs.setDelegate = false;
            this.selectedDelegateId = 0;
          });
      }
    },
    testGps() {
      this.$socket.track.emit("addNewTrack", {
        userId: "s",
      });
    },
    openCustomer(id) {
      let routeData = this.$router.resolve({
        path: "/customer/" + id,
        query: { data: "someData" },
      });
      window.open(routeData.href, "_blank");
    },
  },
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("map")) {
        this.$toast.open({
          type: "error",
          message: "غير مصرح لك بمشاهدة هذه الصفحة",
          duration: 3000,
        });
        this.$router.go(-1);
      }
    });
    // LOAD PERMS END
    this.$http.get(this.$baseUrl + "users").then((res) => {
      this.users = res.data;
    });
  },
  mounted: function () {
    var map = this.$refs.map;
    map.mapObject.on("draw:created", (e) => {
      for (let i = 0; i < this.customers.length; i++) {
        var gps = this.customers[i].location.split(",");
        if (e.layer.getBounds().contains({ lat: gps[0], lon: gps[1] })) {
          this.selectCustomer(this.customers[i]);
        }
      }
      e.layer.remove();
    });
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    userInfo() {
      return this.$store.getters.getLoginInfo;
    },
  },
  // firestore: {
  //   mapData: db.collection("gpsTracking"),
  // },
};
</script>

<style>
.userMarker {
  background-color: #000000a8;
  padding: 10px;
  border-radius: 20px;
  width: 100px;
  height: 40px;
  text-align: center;
}
.disconnected {
  position: absolute;
  top: 0px;
}
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