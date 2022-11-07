<template>
  <div id="visits" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>كشف المسار</v-toolbar-title>
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
      <center class="printHeader"><h2>رسم المسار</h2></center>

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
          <v-text-field
            dense
            v-model="from"
            outlined
            label="بتاريخ"
            type="date"
          >
          </v-text-field>
        </v-col>
        <v-col class="no-print" cols="8">
          <v-btn width="200" @click="selectDelegate()" color="primary">
            بحث
          </v-btn>
        </v-col>
        <v-col
          v-if="this.checkPermission('map_view_invoice')"
          class="no-print"
          cols="3"
        >
          <v-checkbox
            @change="checkView()"
            v-model="show.invoices"
            label="عرض المبيعات"
          ></v-checkbox>
        </v-col>
        <v-col class="no-print" cols="3">
          <v-checkbox
            @change="checkView()"
            v-model="show.visits"
            label="عرض الزيارات"
          ></v-checkbox>
        </v-col>
        <v-col class="no-print" cols="3">
          <v-checkbox
            @change="checkView()"
            v-model="show.restores"
            label="عرض الراجع"
          ></v-checkbox>
        </v-col>
        <v-col
          v-if="this.checkPermission('map_view_damaged')"
          class="no-print"
          cols="3"
        >
          <v-checkbox
            @change="checkView()"
            v-model="show.damaged"
            label="عرض التالف"
          ></v-checkbox>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-if="this.checkPermission('map_view_invoice')">
          <h5>
            المبيعات :
            {{
              invoices.reduce((a, b) => a + b.totalPrice, 0).toLocaleString()
            }}
          </h5>
        </v-col>
        <v-col>
          <h5>
            الراجع :
            {{
              restores.reduce((a, b) => a + b.totalPrice, 0).toLocaleString()
            }}
          </h5>
        </v-col>
        <v-col v-if="this.checkPermission('map_view_damaged')">
          <h5>
            التالف :
            {{ damaged.reduce((a, b) => a + b.total, 0).toLocaleString() }}
          </h5>
        </v-col>
        <v-col>
          <h5>
            الزبائن :
            {{ customers.length }}
          </h5>
        </v-col>
        <v-col>
          <h5>
            عدد الفواتير :
            {{ invoices.length }}
          </h5>
        </v-col>
        <v-col>
          <h5>
            تم زيارتهم :
            {{ visits.length }}
          </h5>
        </v-col>
        <v-col>
          <h5>
            المتبقي :
            {{ customers.length - visits.length - invoices.length }}
          </h5>
        </v-col>
        <v-col>
          <h5>
            خارج المسار :
            {{ allData.filter((e) => e.visitDay != dayName).length }}
          </h5>
        </v-col>
      </v-row>
      <br />
      <v-divider></v-divider>
      <v-simple-table>
        <thead>
          <tr>
            <th>الحركة</th>
            <th>كود الزبون</th>
            <th>اسم الزبون</th>
            <th>اسم المحل</th>
            <th>المبلغ</th>
            <th>سبب الزيارة</th>
            <th>وقت الفاتورة</th>
            <th v-if="checkPermission('see_init_date')">وقت البدء</th>
            <th>الاجراءات</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(data, i) in allData">
            <tr :key="i">
              <td>
                <v-chip
                  outlined
                  small
                  color="success"
                  v-if="data.idInvoiceType == 1"
                  >بيع</v-chip
                >
                <v-chip
                  outlined
                  small
                  color="primary"
                  v-if="data.idVisit != undefined"
                  >زيارة</v-chip
                >
                <v-chip
                  outlined
                  small
                  color="warning"
                  v-if="data.idInvoiceType == 3"
                  >راجع</v-chip
                >
                <v-chip
                  outlined
                  small
                  color="error"
                  v-if="data.idDamagedItemsInvoice != undefined"
                  >تالف</v-chip
                >
              </td>
              <td>
                <span>
                  {{ data.customerId }}
                </span>
                <v-chip
                  class="mr-5"
                  outlined
                  color="error"
                  small
                  v-if="data.visitDay != dayName"
                >
                  خارج المسار
                </v-chip>
                <span v-if="data.visitDay != dayName">
                  {{ getDayName(data.visitDay) }}
                </span>
              </td>
              <td>{{ data.customerName }}</td>
              <td>{{ data.storeName }}</td>
              <td
                class="error--text"
                v-if="data.idDamagedItemsInvoice != undefined"
              >
                {{ data.total }}
              </td>
              <td v-else>{{ data.totalPrice }}</td>
              <td>{{ data.visitCauseName }}</td>
              <td>
                <span v-if="data.idVisit != undefined">{{
                  data.creationFixedDate.substring(11)
                }}</span>
                <span v-if="data.idVisit == undefined">{{
                  data.creationFixedTime
                }}</span>
              </td>
              <td v-if="checkPermission('see_init_date')">
                <span v-if="data.idVisit != undefined">{{
                  data.creationFixedDate.substring(11)
                }}</span>
                <span v-if="data.idVisit == undefined">{{
                  data.initialDate
                }}</span>
              </td>
              <td>
                <v-btn
                  small
                  color="primary"
                  v-if="data.idVisit != undefined"
                  @click="setMarker(data)"
                  >الخريطة</v-btn
                >
                <v-btn
                  small
                  color="success"
                  :to="'/invoice/' + data.idInvoice"
                  target="_BLANK"
                  v-if="data.idInvoice != undefined"
                  >مشاهدة</v-btn
                >
                <v-btn
                  small
                  color="error"
                  :to="'/damagedItems/' + data.idDamagedItemsInvoice"
                  target="_BLANK"
                  v-if="data.idDamagedItemsInvoice != undefined"
                  >مشاهدة</v-btn
                >
              </td>
            </tr>
          </template>
        </tbody>
      </v-simple-table>
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
    dayName: "",
    visits: [],
    invoices: [],
    damaged: [],
    restores: [],
    allVisits: [],
    allInvoices: [],
    allDamaged: [],
    allRestores: [],
    customers: [],
    allCustomers: [],
    show: {
      invoices: true,
      visits: true,
      restores: true,
      damaged: true,
    },
    selectedDay: 0,
    tableHeaders: [
      { text: "الزبون", value: "storeName" },
      { text: "كود الزبون", value: "customerId" },
      { text: "اسم الزبون", value: "customerName" },
      { text: "سبب الزيارة", value: "visitCauseName" },
      { text: "وقت الزيارة", value: "creationFixedDate" },
      { text: "الاجراءات", value: "actions" },
    ],
    invoicesTableHeaders: [
      { text: "الزبون", value: "storeName" },
      { text: "كود الزبون", value: "customerId" },
      { text: "اسم الزبون", value: "customerName" },
      { text: "الوقت", value: "creationFixedTime" },
      { text: "المبلغ", value: "totalPrice" },
    ],
    restoresTableHeaders: [
      { text: "الزبون", value: "storeName" },
      { text: "كود الزبون", value: "customerId" },
      { text: "اسم الزبون", value: "customerName" },
      { text: "الوقت", value: "creationFixedTime" },
      { text: "المبلغ", value: "totalPrice" },
    ],
    damagedTableHeaders: [
      { text: "الزبون", value: "storeName" },
      { text: "كود الزبون", value: "customerId" },
      { text: "اسم الزبون", value: "customerName" },
      { text: "الوقت", value: "creationFixedTime" },
      { text: "المبلغ", value: "total" },
    ],
    allData: [],
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
      if (!this.checkPermission("visits")) {
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
      this.$http.get(this.$baseUrl + "users").then((res) => {
        this.delegates = res.data;
        setTimeout(() => {
          if (this.$route.query.delegate) {
            this.selectedDelegate = parseInt(this.$route.query.delegate);
            this.from = this.$route.query.date;
            this.selectDelegate();
          }
        }, 1000);
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
      var days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      let dayname = days[new Date(this.from).getDay()].toLowerCase();
      this.dayName = dayname;
      let loading = this.$loading.show();
      let visits = this.$http.get(
        this.$baseUrl +
          "visit/user/" +
          this.selectedDelegate +
          "?dateFrom=" +
          this.from +
          "&dateTo=" +
          this.from
      );

      let invoices = this.$http.get(
        this.$baseUrl +
          "invoice/filter?user=" +
          this.selectedDelegate +
          "&dateRangeFrom=" +
          this.from +
          "&dateRangeTo=" +
          this.from +
          "&type=1"
      );
      let restores = this.$http.get(
        this.$baseUrl +
          "invoice/filter?user=" +
          this.selectedDelegate +
          "&dateRangeFrom=" +
          this.from +
          "&dateRangeTo=" +
          this.from +
          "&type=3"
      );
      let damaged = this.$http.get(
        this.$baseUrl +
          "damagedInvoice/userDateRange/" +
          this.selectedDelegate +
          "?from=" +
          this.from +
          "&to=" +
          this.from
      );

      let customers = this.$http.get(
        this.$baseUrl + "customer/user/" + this.selectedDelegate
      );

      Promise.allSettled([invoices, restores, damaged, visits, customers])
        .then((values) => {
          this.invoices =
            values[0].status != "rejected" ? values[0].value.data : [];
          this.allInvoices =
            values[0].status != "rejected" ? values[0].value.data : [];
          this.restores =
            values[1].status != "rejected" ? values[1].value.data : [];
          this.allRestores =
            values[1].status != "rejected" ? values[1].value.data : [];
          this.damaged =
            values[2].status != "rejected" ? values[2].value.data : [];
          this.allDamaged =
            values[2].status != "rejected" ? values[2].value.data : [];
          this.visits =
            values[3].status != "rejected" ? values[3].value.data : [];
          this.allVisits =
            values[3].status != "rejected" ? values[3].value.data : [];
          this.customers =
            values[4].status != "rejected" ? values[4].value.data : [];
          this.allCustomers =
            values[4].status != "rejected" ? values[4].value.data : [];

          if (!this.checkPermission("map_view_invoice")) {
            this.invoices = [];
          }
          if (!this.checkPermission("map_view_damaged")) {
            this.damaged = [];
          }
          this.allData = [
            ...this.invoices,
            ...this.restores,
            ...this.damaged,
            ...this.visits,
          ];
          this.filterData(this.dayName);
          this.allData.sort(function (a, b) {
            return new Date(a.createdAt) - new Date(b.createdAt);
          });
        })
        .finally(() => loading.hide());
    },
    checkView() {
      this.allData = [];
      if (this.show.invoices) {
        this.allData.push(...this.invoices);
      }
      if (this.show.restores) {
        this.allData.push(...this.restores);
      }
      if (this.show.damaged) {
        this.allData.push(...this.damaged);
      }
      if (this.show.visits) {
        this.allData.push(...this.visits);
      }
      this.allData.sort(function (a, b) {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
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
    filterData(day) {
      let customerDay = day;
      day = this.capitalizeFirstLetter(day);
      if (day == "All") {
        this.invoices = this.allInvoices;
        this.restores = this.allRestores;
        this.damaged = this.allDamaged;
        this.visits = this.allVisits;
        this.customers = this.allCustomers;
      } else {
        this.invoices = this.allInvoices.filter(
          (x) => x.creationDayName == day
        );
        this.restores = this.allRestores.filter(
          (x) => x.creationDayName == day
        );
        this.damaged = this.allDamaged.filter((x) => x.creationDayName == day);
        this.visits = this.allVisits.filter((x) => x.creationDayName == day);
        this.customers = this.allCustomers.filter(
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
  },
};
</script>

<style scoped>
td {
  border-bottom: thin solid rgba(0, 0, 0, 1) !important;
}
.printHeader {
  display: none !important;
}
@media print {
  .printHeader {
    display: block !important;
    padding: 10px;
  }
  .no-print {
    display: none !important;
  }
  @page {
    size: A4 portrait;
  }
  * {
    direction: rtl !important;
    color-adjust: exact !important;
  }
  .v-btn {
    display: none !important;
  }
  .v-card {
    box-shadow: none !important;
  }
}
</style>