<template>
  <div id="itemRail" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>حركة المادة</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn-toggle v-model="selectedType">
        <v-btn @click="sort('all')">الكل</v-btn>
        <v-btn @click="sort(2)">المشتريات</v-btn>
        <v-btn @click="sort(1)">المبيعات</v-btn>
        <v-btn @click="sort(3)">راجع المبيعات</v-btn>
      </v-btn-toggle>
      <v-spacer></v-spacer>
      <v-btn
        @click="emptyItemModal = true"
        color="error"
        v-if="this.checkPermission('store_empty')"
      >
        تصفير المادة ليوم معين
      </v-btn>
    </v-app-bar>
    <v-alert
      style="position: sticky !important; top: 64px; z-index: 100"
      color="primary"
      dark
    >
      {{ $route.query.name }}
    </v-alert>
    <v-card>
      <v-data-table :items-per-page="500" :headers="header" :items="tableData">
        <template v-slot:[`item.type`]="{ item }">
          <v-chip v-if="item.invoiceTypeId == 1" outlined small color="success">
            بيع
          </v-chip>
          <v-chip v-if="item.invoiceTypeId == 2" outlined small color="error">
            شراء
          </v-chip>
          <v-chip v-if="item.invoiceTypeId == 3" outlined small color="warning">
            راجع مبيعات
          </v-chip>
          <v-chip v-if="item.invoiceTypeId == 4" outlined small color="indigo">
            راجع مشتريات
          </v-chip>
          <v-chip v-if="item.invoiceTypeId == 5" outlined small color="pink">
            شراء مؤقت
          </v-chip>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon target="_BLANK" :to="'/invoice/' + item.idInvoice">
            <v-icon> la-eye </v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="emptyItemModal" width="100%" max-width="500">
      <v-card>
        <v-card-text>
          <br /><br />
          <v-text-field
            type="date"
            outlined
            label="التاريخ"
            v-model="selectedDate"
          ></v-text-field>
          <br />
          <v-btn
            @click="emptyItem()"
            :disabled="selectedDate == null"
            block
            color="error"
            >تأكيد التصفير</v-btn
          >
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data: () => ({
    emptyItemModal: false,
    tableData: [],
    allTableData: [],
    selectedType: "all",
    permissions: [],
    selectedDate: null,
    header: [
      { text: "نوع الحركة", value: "type" },
      { text: "كود الزبون", value: "idCustomer" },
      { text: "اسم الزبون", value: "customerName" },
      { text: "اسم المحل", value: "storeName" },
      { text: "المندوب", value: "delegateName" },
      { text: "الكمية", value: "count" },
      { text: "سعر المادة في الفاتورة", value: "price" },
      { text: "بتاريخ", value: "creationFixedDate" },
      { text: "الاجراءات", value: "actions" },
    ],
  }),
  created: function () {
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
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
            "reports/itemRail/" +
            this.$route.params.id +
            "?date1=" +
            this.$route.query.from +
            "&date2=" +
            this.$route.query.to
        )
        .then((res) => {
          this.tableData = res.data;
          this.allTableData = res.data;
          console.log(this.tableData);
        })
        .finally(() => loading.hide());
    },
    emptyItem() {
      let c = confirm("هل انت متأكد من تصفير المادة");
      if (c) {
        let loading = this.$loading.show();
        this.$http
          .put(
            this.$baseUrl +
              "emptyQuntityOfItemByDate/" +
              this.$route.params.id +
              "?date=" +
              this.selectedDate
          )
          .then(() => {
            this.$toast.open({
              type: "warning",
              message: "تم تصفير المادة",
              duration: 3000,
            });
            this.emptyItemModal = false;
            this.fetch();
          })
          .finally(() => loading.hide());
      }
    },
    sort(type) {
      if (type == "all") {
        this.tableData = this.allTableData;
      } else {
        this.tableData = this.allTableData.filter(
          (x) => x.invoiceTypeId == type
        );
      }
      this.selectedType = type;
    },
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    userInfo() {
      return this.$store.getters.getLoginInfo;
    },
  },
};
</script>

<style>
</style>