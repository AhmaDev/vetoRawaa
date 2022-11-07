<template>
  <div id="visits" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>حركة المندوب</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        @click="
          cols = 12;
          $print($refs.print);
        "
        color="success"
        dark
      >
        <v-icon>la-print</v-icon>
        طباعة
      </v-btn>
    </v-app-bar>

    <v-card ref="print" class="pa-10">
      <center class="printHeader"><h2>حركة المندوب</h2></center>

      <v-row>
        <v-col>
          <v-autocomplete
            v-model="selectedDelegate"
            :items="delegates"
            item-text="username"
            item-value="idUser"
            outlined
            label="اختيار مندوب"
            dense
          >
          </v-autocomplete>
        </v-col>
        <v-col>
          <v-text-field dense v-model="from" outlined label="من" type="date">
          </v-text-field>
        </v-col>
        <v-col>
          <v-text-field dense v-model="to" outlined label="الى" type="date">
          </v-text-field>
        </v-col>
        <v-col cols="2">
          <v-btn block @click="selectDelegate()" color="primary"> بحث </v-btn>
        </v-col>
        <v-col cols="12">
          <v-btn-toggle v-model="selectedDay">
            <v-btn @click="filterData('all')">الكل</v-btn>
            <v-btn @click="filterData('sunday')">
              الاحد
              <v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(0) }}
              </v-chip>
            </v-btn>
            <v-btn @click="filterData('monday')"
              >الاثنين<v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(1) }}
              </v-chip></v-btn
            >
            <v-btn @click="filterData('tuesday')"
              >الثلاثاء<v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(2) }}
              </v-chip></v-btn
            >
            <v-btn @click="filterData('wednesday')"
              >الاربعاء<v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(3) }}
              </v-chip></v-btn
            >
            <v-btn @click="filterData('thursday')"
              >الخميس<v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(4) }}
              </v-chip></v-btn
            >
            <v-btn @click="filterData('friday')"
              >الجمعة<v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(5) }}
              </v-chip></v-btn
            >
            <v-btn @click="filterData('saturday')"
              >السبت<v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(6) }}
              </v-chip></v-btn
            >
          </v-btn-toggle>
        </v-col>
        <v-col>
          <h3>
            المبلغ الاجمالي :
            {{
              customers.reduce((a, b) => a + b.totalSell, 0).toLocaleString()
            }}
          </h3>
        </v-col>
        <v-col>
          <h3>
            الزبائن :
            {{ realCustomers.length }}
          </h3>
        </v-col>
        <v-col>
          <h3>
            زبائن لديهم فواتير :
            {{ customers.filter((x) => x.totalInvoiceCount > 0).length }}
          </h3>
        </v-col>
        <v-col>
          <h3>
            زبائن ليس لديهم فواتير :
            {{
              realCustomers.length -
              customers.filter((x) => x.totalInvoiceCount > 0).length
            }}
          </h3>
        </v-col>
      </v-row>
      <br />
      <v-divider></v-divider>

      <v-row>
        <v-col :cols="cols">
          <v-data-table
            :items-per-page="300"
            :items="customers"
            :headers="tableHeaders"
            hide-default-footer
            :height="cols == 12 ? 'auto' : 300"
            multi-sort
          >
            <template v-slot:[`item.visitDay`]="{ item }">
              {{ getDayName(item.visitDay) }}
            </template>
            <template v-slot:[`item.lastInvoice`]="{ item }">
              {{
                item.lastInvoice == null
                  ? "لا يوجد"
                  : parseDate(item.lastInvoice)
              }}
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                :to="'/customerRail/' + item.idCustomer"
                target="_BLANK"
                icon
              >
                <v-icon>la-eye</v-icon>
              </v-btn>
              <v-btn :to="'/customer/' + item.idCustomer" target="_BLANK" icon>
                <v-icon>la-user</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-card>

    <v-dialog v-model="mapDialog" width="500">
      <v-card>
        <l-map
          ref="myMap"
          style="height: 500px"
          :zoom="map.zoom"
          :center="map.center"
        >
          <l-tile-layer
            :url="map.url"
            :attribution="map.attribution"
          ></l-tile-layer>
          <l-marker
            :key="marker.idVisit"
            :lat-lng="[marker.latitude, marker.longitude]"
          >
          </l-marker>
        </l-map>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import * as moment from "moment";
export default {
  name: "Visits",
  components: {},
  data: () => ({
    permissions: [],
    mapDialog: false,
    delegates: [],
    cols: 12,
    selectedDelegate: 0,
    from: "",
    to: "",
    customers: [],
    realCustomers: [],
    filteredRealCustomers: [],
    allCustomers: [],
    selectedDay: 0,
    tableHeaders: [
      { text: "كود الزبون", value: "idCustomer" },
      { text: "اسم المحل", value: "storeName" },
      { text: "اسم الزبون", value: "customerName" },
      { text: "نوع الزبون", value: "customerClassName" },
      { text: "تاريخ اضافة الزبون", value: "customerCreatedAt" },
      { text: "رقم اسيا", value: "phone" },
      { text: "رقم زين", value: "secondPhone" },
      { text: "المبلغ", value: "totalSell" },
      { text: "اخر فاتورة", value: "lastInvoice" },
      { text: "عدد الفواتير", value: "totalInvoiceCount" },
      { text: "عدد الزيارات", value: "visitCount" },
      { text: "يوم الزيارة الرسمي", value: "visitDay" },
      { text: "الاجراءات", value: "actions" },
    ],
    map: {
      url: "https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      attribution: "veto",
      zoom: 12,
      center: [33.4, 44.3],
      markerLatLng: [33.4, 44.3],
    },
    marker: {
      idVisit: 0,
      latitude: 0,
      longitude: 0,
    },
  }),
  watch: {
    sheetMap: function (val) {
      if (val == true) {
        this.$nextTick(() => {
          this.$refs.myMap.forceRerender();
          console.log(this.$refs);
        });
      }
    },
  },
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("delegate_rail")) {
        this.$toast.open({
          type: "error",
          message: "غير مصرح لك بمشاهدة هذه الصفحة",
          duration: 3000,
        });
        this.$router.go(-1);
      }
    });
    // LOAD PERMS END
    this.getCurrentDate().then((value) => {
      this.from = value;
      this.to = value;
    });
    this.getCurrentDate().then((value) => {
      this.selectedDate = value;
    });
    this.fetch();
  },
  methods: {
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
    fetch: function () {
      this.$http.get(this.$baseUrl + "users/role/4").then((res) => {
        this.delegates = res.data;
      });
    },
    setMarker(marker) {
      this.marker = marker;
      this.mapDialog = true;
      this.map.center = [marker.latitude, marker.longitude];
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.myMap.mapObject.invalidateSize();
        }, 500);
      });
    },
    selectDelegate() {
      if (this.selectedDelegate < 1) {
        this.$toast.open({
          type: "warning",
          message: "يرجى اختيار مندوب",
          duration: 3000,
        });
        return;
      }
      if (this.selectedDate == "") {
        this.$toast.open({
          type: "warning",
          message: "يرجى اختيار تاريخ",
          duration: 3000,
        });
        return;
      }
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "customer/user/" + this.selectedDelegate)
        .then((res) => {
          this.filteredRealCustomers = res.data;
          this.realCustomers = res.data;
        });
      this.$http
        .get(
          this.$baseUrl +
            "reports/delegateRail/" +
            this.selectedDelegate +
            "?date1=" +
            this.from +
            "&date2=" +
            this.to
        )
        .then((res) => {
          this.customers = res.data;
          this.allCustomers = res.data;
        })
        .finally(() => loading.hide());
    },
    filterData(day) {
      let customerDay = day;
      day = this.capitalizeFirstLetter(day);
      if (day == "All") {
        this.customers = this.allCustomers;
        this.realCustomers = this.filteredRealCustomers;
      } else {
        this.customers = this.allCustomers.filter(
          (x) => x.visitDay == customerDay || x.secondVisitDay == customerDay
        );
        this.realCustomers = this.filteredRealCustomers.filter(
          (x) => x.visitDay == customerDay || x.secondVisitDay == customerDay
        );
      }
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    getNumberOfWeekDays(dayNum) {
      let start = new Date(this.from);
      let end = new Date(this.to);
      // Sunday's num is 0 with Date.prototype.getDay.
      dayNum = dayNum || 0;
      // Calculate the number of days between start and end.
      var daysInInterval = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
      );
      // Calculate the nb of days before the next target day (e.g. next Sunday after start).
      var toNextTargetDay = (7 + dayNum - start.getDay()) % 7;
      // Calculate the number of days from the first target day to the end.
      var daysFromFirstTargetDay = Math.max(
        daysInInterval - toNextTargetDay,
        0
      );
      // Calculate the number of weeks (even partial) from the first target day to the end.
      return Math.ceil(daysFromFirstTargetDay / 7);
    },
    getDayName(value) {
      switch (value) {
        case "sunday": {
          return "الاحد";
        }
        case "monday": {
          return "الاثنين";
        }
        case "tuesday": {
          return "الثلاثاء";
        }
        case "wednesday": {
          return "الاربعاء";
        }
        case "thursday": {
          return "الخميس";
        }
        case "friday": {
          return "الجمعة";
        }
        case "saturday": {
          return "السبت";
        }
        default: {
          return "لا يوجد";
        }
      }
    },
    parseDate(date) {
      moment.locale("ar-kw");
      return moment(date).fromNow();
    },
  },
};
</script>

<style scoped>
.printHeader {
  display: none !important;
}
@media print {
  .printHeader {
    display: block !important;
    padding: 10px;
  }
  @page {
    size: A4 landscape;
  }
  * {
    direction: rtl !important;
    color-adjust: exact !important;
    zoom: 0.9;
  }
  .v-btn {
    display: none !important;
  }
  .v-card {
    box-shadow: none !important;
  }
}
</style>