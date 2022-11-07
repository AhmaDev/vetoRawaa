<template>
  <div id="Store" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>المواد</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="$print($refs.print)" color="success" dark>
        <v-icon>la-print</v-icon>
        طباعة
      </v-btn>
    </v-app-bar>

    <v-card ref="print" class="pa-10">
      <center class="printHeader"><h2>اعداد المخزن</h2></center>

      <v-row>
        <v-col v-if="this.checkPermission('store_search_supervisor')">
          <v-autocomplete
            :items="supervisors"
            item-text="username"
            item-value="idUser"
            outlined
            dense
            hide-details
            label="المشرف"
            v-model="selectedSuperVisor"
            @change="setDelegates()"
          ></v-autocomplete>
        </v-col>
        <v-col v-if="this.checkPermission('store_search_delegate')">
          <v-autocomplete
            :items="delegates"
            item-text="username"
            item-value="idUser"
            outlined
            dense
            hide-details
            multiple
            label="المندوب"
            v-model="selectedDelegate"
          ></v-autocomplete>
        </v-col>
        <v-col>
          <v-text-field
            outlined
            dense
            hide-details
            label="من تاريخ"
            v-model="search.from"
            type="date"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            outlined
            dense
            hide-details
            label="الى تاريخ"
            v-model="search.to"
            type="date"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-btn @click="fetchSearch()" color="primary"> بحث </v-btn>
        </v-col>
      </v-row>
      <br />
      <v-data-table
        :items-per-page="500"
        :items="store"
        :headers="
          checkPermission('store_view_incomes') && selectedDelegate.length == 0
            ? tableHeader
            : tableHeader2
        "
        multi-sort
      >
        <template v-slot:[`item.imagePath`]="{ item }">
          <v-avatar size="36">
            <img
              v-if="item.imagePath != null"
              :src="$baseUrl + 'files/' + item.imagePath"
            />
            <img
              v-if="item.imagePath == null"
              src="@/assets/no_image_placeholder.png"
            />
          </v-avatar>
        </template>
        <template v-slot:[`item.lastRemaining`]="{ item }">
          {{
            lastStore.filter((s) => s.idItem == item.idItem)[0].totalBuy +
            lastStore.filter((s) => s.idItem == item.idItem)[0].totalRestores +
            lastStore.filter((s) => s.idItem == item.idItem)[0].totalTempBuy -
            (lastStore.filter((s) => s.idItem == item.idItem)[0].totalSell +
              lastStore.filter((s) => s.idItem == item.idItem)[0]
                .totalBuyRestores)
          }}
        </template>
        <template v-slot:[`item.storex`]="{ item }">
          <v-chip :color="item.storex < 0.25 ? 'error' : 'success'">
            {{ item.storex }}</v-chip
          >
        </template>
        <template v-slot:[`item.totalDamaged`]="{ item }">
          {{ item.totalDamaged.toLocaleString() }}
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            v-if="checkPermission('item_rail')"
            target="_BLANK"
            :to="
              '/itemRail/' +
              item.idItem +
              '?name=' +
              item.fullItemName +
              '&from=' +
              search.from +
              '&to=' +
              search.to
            "
            icon
          >
            <v-icon>la-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "Store",
  data: () => ({
    store: [],
    lastStore: [],
    delegates: [],
    permissions: [],
    supervisors: [],
    selectedSuperVisor: null,
    selectedDelegate: [],
    users: [
      {
        idUser: 0,
        username: "لا يوجد",
      },
    ],
    search: {
      from: "",
      to: "",
    },
    tableHeader: [
      { text: "", value: "imagePath" },
      { text: "اسم المادة", value: "fullItemName" },
      { text: "المورد", value: "manufactureName" },
      { text: "المجموعة", value: "itemGroupName" },
      { text: "رصيد اول المدة", value: "lastRemaining" },
      { text: "المبيعات", value: "totalSell" },
      { text: "المشتريات", value: "totalBuy" },
      { text: "الراجع", value: "totalRestores" },
      { text: "التالف", value: "totalDamaged" },
      { text: "راجع المشتريات", value: "totalBuyRestores" },
      { text: "شراء مؤقت", value: "totalTempBuy" },
      { text: "المتبقي", value: "storex" },
      { text: "الاجراءات", value: "actions" },
    ],
    tableHeader2: [
      { text: "", value: "imagePath" },
      { text: "اسم المادة", value: "fullItemName" },
      { text: "المورد", value: "manufactureName" },
      { text: "المجموعة", value: "itemGroupName" },
      { text: "المبيعات", value: "totalSell" },
      { text: "المبلغ الاجمالي", value: "totalSellPrice" },
      { text: "التالف", value: "totalDamaged" },
      { text: "المبلغ للتالف", value: "totalDamagedPrice" },
    ],
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("store")) {
        this.$toast.open({
          type: "error",
          message: "غير مصرح لك بمشاهدة هذه الصفحة",
          duration: 3000,
        });
        this.$router.go(-1);
      }
    });
    // LOAD PERMS END
    // this.fetch();
    this.getCurrentDate().then((value) => {
      this.search.from = value;
      this.search.to = value;
    });

    this.$http.get(this.$baseUrl + "users/role/3").then((res) => {
      this.supervisors = res.data;
    });
    this.$http.get(this.$baseUrl + "users").then((res) => {
      this.delegates = res.data;

      setTimeout(() => {
        if (this.$route.query.delegate) {
          this.selectedDelegate.push(parseInt(this.$route.query.delegate));
          this.search.from = this.$route.query.dateFrom;
          this.search.to = this.$route.query.dateTo;
          setTimeout(() => {
            this.fetchSearch();
          }, 1000);
        }
      }, 1000);
    });
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
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "item/detailedStore")
        .then((res) => {
          this.store = res.data;
        })
        .finally(() => loading.hide());
    },
    setDelegates() {
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
            "supervisorDelegates/userid/" +
            this.selectedSuperVisor
        )
        .then((res) => {
          this.selectedDelegate = res.data.map((e) => e.delegateId);
          this.selectedDelegate.push(this.selectedSuperVisor);
        })
        .finally(() => loading.hide());
    },
    fetchSearch() {
      let loading = this.$loading.show();
      if (this.selectedDelegate.length == 0) {
        this.$http
          .get(
            this.$baseUrl +
              `item/detailedStore?from=${this.search.from}&to=${this.search.to}`
          )
          .then((res) => {
            var secondDate = new Date(this.search.from);
            var x = 1;
            secondDate.setDate(secondDate.getDate() - x);
            var secondDateString =
              secondDate.getFullYear() +
              "-" +
              (secondDate.getMonth() + 1) +
              "-" +
              secondDate.getDate();
            console.log(secondDateString);
            this.store = res.data;
            this.$http
              .get(
                this.$baseUrl +
                  `item/detailedStore?from=2020-01-01&to=${secondDateString}`
              )
              .then((res) => {
                this.lastStore = res.data;

                this.store = this.store.map(
                  (row) => ((row.storex = this.getTotal(row)), row)
                );
              })
              .finally(() => loading.hide());
          });
      } else {
        this.$http
          .get(
            this.$baseUrl +
              `item/detailedStoreByUser/${JSON.stringify(
                this.selectedDelegate
              ).slice(1, -1)}?from=${this.search.from}&to=${this.search.to}`
          )
          .then((res) => {
            this.store = res.data;
            console.log(this.store);
          })
          .finally(() => loading.hide());
      }
    },
    getTotal(item) {
      return (
        this.lastStore.filter((s) => s.idItem == item.idItem)[0].totalBuy +
        this.lastStore.filter((s) => s.idItem == item.idItem)[0].totalRestores +
        this.lastStore.filter((s) => s.idItem == item.idItem)[0].totalTempBuy -
        (this.lastStore.filter((s) => s.idItem == item.idItem)[0].totalSell +
          this.lastStore.filter((s) => s.idItem == item.idItem)[0]
            .totalBuyRestores) -
        item.totalSell -
        item.totalBuyRestores +
        item.totalBuy +
        item.totalRestores +
        item.totalTempBuy
      );
    },
    sort() {
      this.store = this.store.sort((a, b) =>
        a.totalSell.localeCompare(b.totalSell)
      );
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
  .v-chip {
    color: black !important;
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