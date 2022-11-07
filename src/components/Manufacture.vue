<template>
  <div v-if="customer != null" id="CustomerPage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>{{ customer.storeName }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn v-if="checkPermission('customers_edit')" @click="save()" icon>
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </v-app-bar>
    <v-row>
      <v-col cols="6">
        <v-text-field
          outlined
          :disabled="!checkPermission('customers_edit')"
          v-model="customer.storeName"
          label="اسم المصنع"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          outlined
          :disabled="!checkPermission('customers_edit')"
          v-model="customer.customerName"
          label="اسم المورد"
        ></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-text-field
          outlined
          :disabled="!checkPermission('customers_edit')"
          v-model="customer.phone"
          label="رقم الهاتف "
        ></v-text-field>
      </v-col>
      <!-- <v-col cols="4">
        <v-text-field
          outlined
          :disabled="!checkPermission('customers_edit')"
          v-model="customer.secondPhone"
          label="رقم الهاتف الثاني"
        ></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-text-field
          outlined
          :disabled="!checkPermission('customers_edit')"
          v-model="customer.email"
          label="البريد الالكتروني"
        ></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-autocomplete
          :items="days"
          outlined
          :disabled="!checkPermission('customers_edit')"
          item-text="displayName"
          item-value="day"
          v-model="customer.visitDay"
          label="يوم الزيارة"
        >
        </v-autocomplete>
      </v-col>
      <v-col cols="4">
        <v-autocomplete
          :items="days"
          outlined
          :disabled="!checkPermission('customers_edit')"
          item-text="displayName"
          item-value="day"
          v-model="customer.secondVisitDay"
          label="يوم الزيارة الثاني"
        >
        </v-autocomplete>
      </v-col>
      <v-col cols="4">
        <v-autocomplete
          :items="sellPrices"
          outlined
          :disabled="!checkPermission('customers_edit')"
          item-text="sellPriceName"
          item-value="idSellPrice"
          v-model="customer.sellPriceId"
          label="نوع البيع"
        >
        </v-autocomplete>
      </v-col>
      <v-col cols="4">
        <v-autocomplete
          :items="customerClasses"
          outlined
          :disabled="!checkPermission('customers_edit')"
          item-text="customerClassName"
          item-value="idCustomerClass"
          v-model="customer.customerClassId"
          label="فئة الزبون"
        >
        </v-autocomplete>
      </v-col> -->
      <v-col cols="8">
        <v-text-field
          outlined
          :disabled="!checkPermission('customers_edit')"
          v-model="customer.nearby"
          label="العنوان"
        ></v-text-field>
      </v-col>
      <!-- <v-col cols="6">
        <v-row>
          <v-col cols="6">
            <v-text-field
              type="time"
              outlined
              :disabled="!checkPermission('customers_edit')"
              v-model="customer.visitTimeFrom"
              label="بداية وقت الزيارة"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              type="time"
              outlined
              :disabled="!checkPermission('customers_edit')"
              v-model="customer.visitTimeTo"
              label="نهاية وقت الزيارة"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-autocomplete
              :items="delegates"
              outlined
              :disabled="!checkPermission('customers_edit')"
              item-text="username"
              item-value="idUser"
              v-model="customer.createdBy"
              label="الجهة"
            >
            </v-autocomplete>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="6">
        <l-map style="height: 300px" :zoom="map.zoom" :center="map.center">
          <l-tile-layer
            :url="map.url"
            :attribution="map.attribution"
          ></l-tile-layer>
          <l-marker
            draggable
            @update:lat-lng="changeLocation($event)"
            :lat-lng="map.markerLatLng"
          ></l-marker>
        </l-map>
      </v-col> -->
    </v-row>
  </div>
</template>

<script>
export default {
  name: "Manufacture",
  props: ["customerId"],
  data: () => ({
    permissions: [],
    customer: null,
    sellPrices: [],
    customerClasses: [],
    delegates: [],
    map: {
      url: "https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      attribution: "veto",
      zoom: 12,
      center: [33.4, 44.3],
      markerLatLng: [33.4, 44.3],
    },
    days: [
      { day: "sunday", displayName: "الاحد" },
      { day: "monday", displayName: "الاثنين" },
      { day: "tuesday", displayName: "الثلاثاء" },
      { day: "wednesday", displayName: "الاربعاء" },
      { day: "thursday", displayName: "الخميس" },
      { day: "friday", displayName: "الجمعة" },
      { day: "saturday", displayName: "السبت" },
    ],
  }),
  watch: {
    customerId: function () {
      this.fetch();
    },
  },
  methods: {
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
    fetch() {
      // LOAD PERMS START
      this.auth().then((res) => {
        this.permissions = res.permissions;
        // CHECK IF CAN SEE THIS PAGE
        // if (!this.checkPermission("customers_edit")) {
        //   this.$toast.open({
        //     type: "error",
        //     message: "غير مصرح لك بمشاهدة هذه الصفحة",
        //     duration: 3000,
        //   });
        //   this.$router.go(-1);
        // }
      });
      // LOAD PERMS END
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "manufacture/" + this.customerId)
        .then((res) => {
          this.customer = res.data;
          let gps = this.customer.location.split(",");
          this.map.center = [gps[0], gps[1]];
          this.map.markerLatLng = [gps[0], gps[1]];
        })
        .finally(() => loading.hide());
    },
    save() {
      let loading = this.$loading.show();
      let customerInfo = this.customer;
      delete customerInfo.idSellPrice;
      delete customerInfo.sellPriceName;
      delete customerInfo.createdAt;
      this.$http
        .put(this.$baseUrl + "manufacture/edit/" + this.customerId, customerInfo)
        .then(() => {
          this.$toast.open({
            type: "success",
            message: "تم تحديث المعلومات ",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    changeLocation(e) {
      this.customer.location = e.lat + "," + e.lng;
    },
  },
  created: function () {
    this.$http.get(this.$baseUrl + "sellprice").then((res) => {
      this.sellPrices = res.data;
    });
    this.$http.get(this.$baseUrl + "customerClass").then((res) => {
      this.customerClasses = res.data;
    });
    this.$http.get(this.$baseUrl + "users/role/4").then((res) => {
      this.delegates = res.data;
    });
  },
};
</script>

<style>
</style>