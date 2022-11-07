<template>
  <div id="discountsPage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>كشف بهدايا المندوبين</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="$print($refs.print)" color="success" dark>
        <v-icon>la-print</v-icon>
        طباعة
      </v-btn>
    </v-app-bar>
    <v-card ref="print" class="pa-10">
      <center class="printHeader"><h2>كشف الهدايا</h2></center>
      <v-row>
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
      <v-data-table
        items-per-page="1000"
        hide-default-footer
        :items="discounts"
        :headers="discountsHeader"
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
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon target="_BLANK" :to="'/invoice/' + item.invoiceId">
            <v-icon :title="item.invoiceId">mdi-magnify</v-icon>
          </v-btn>
        </template>
        <template v-slot:[`item.totalInvoicesPrice`]="{ item }">
          <b class="green--text">{{
            item.totalInvoicesPrice.toLocaleString()
          }}</b>
        </template>
        <template v-slot:[`item.totalPrice`]="{ item }">
          {{ item.totalPrice.toLocaleString() }}
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    permissions: [],
    users: [],
    search: {
      from: "",
      to: "",
      userId: 0,
    },
    discounts: [],
    discountsHeader: [
      { text: "", value: "imagePath" },
      { text: "اسم المادة", value: "fullItemName" },
      { text: "المندوب", value: "username" },
      { text: "الزبون", value: "storeName" },
      { text: "كود الزبون", value: "idCustomer" },
      { text: "الفاتورة", value: "invoiceId" },
      { text: "مبلغ الفاتورة", value: "totalPrice" },
      { text: "مبلغ اجمالي", value: "totalInvoicesPrice" },
      { text: "الكمية", value: "count" },
      { text: "نوع الخصم", value: "discountName" },
      { text: "الكمية المباعة", value: "notFreeCount" },
      { text: "بتاريخ", value: "creationFixedDate" },
      { text: "الوقت", value: "creationFixedTime" },
      { text: "الاجراءات", value: "actions" },
    ],
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("gifts")) {
        this.$toast.open({
          type: "error",
          message: "غير مصرح لك بمشاهدة هذه الصفحة",
          duration: 3000,
        });
        this.$router.go(-1);
      }
    });
    setTimeout(() => {
      if (this.$route.query.delegate) {
        this.search.from = this.$route.query.date;
        this.search.to = this.$route.query.date;
        this.fetchSearch();
      } else {
        this.getCurrentDate().then((value) => {
          this.search.from = value;
          this.search.to = value;
          this.fetchSearch();
        });
      }
    }, 1000);
    // LOAD PERMS END
  },
  methods: {
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
    fetchSearch() {
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
            "discount/items" +
            "?from=" +
            this.search.from +
            "&to=" +
            this.search.to
        )
        .then((res) => {
          if (this.$route.query.delegate) {
            this.discounts = res.data.filter(
              (e) => e.idUser == parseInt(this.$route.query.delegate)
            );
          } else {
            this.discounts = res.data;
          }
        })
        .finally(() => loading.hide());
    },
  },
};
</script>

<style scoped>
.printHeader {
  display: none !important;
}
@media print {
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
  .printHeader {
    display: block !important;
    padding: 10px;
  }
}
</style>