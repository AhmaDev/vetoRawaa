<template>
  <div class="pa-5" id="CustomerCheckReportPage">
    <v-row>
      <v-col>
        <v-autocomplete
          :items="customers"
          item-text="storeName"
          item-value="idCustomer"
          outlined
          v-if="!$route.params.id"
          hide-details
          :key="forceRerender"
          dense
          v-model="searchFields.customerId"
          label="اسم الزبون"
        ></v-autocomplete>
        <v-alert color="primary" dark dense v-if="$route.params.id && customers.length > 0">
          {{customers.filter(x => x.idCustomer == $route.params.id)[0].storeName}}
        </v-alert>
      </v-col>
      <v-col>
        <v-text-field
          outlined
          dense
          hide-details
          type="date"
          label="من تاريخ"
          v-model="searchFields.startDate"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          outlined
          dense
          hide-details
          type="date"
          label="الى تاريخ"
          v-model="searchFields.endDate"
        >
        </v-text-field>
      </v-col>
      <v-col cols="1">
        <v-btn @click="search()" :color="$background" dark>بحث</v-btn>
      </v-col>
    </v-row>
    <br />
    <v-data-table
      :headers="invoices.header"
      :items="invoices.data"
      class="elevation-0"
    >
      <template v-slot:[`item.totalPrice`]="{ item }">
        <div
          :class="item.invoiceFunction == 'minus' ? 'green--text' : 'red--text'"
        >
          <b> {{ item.totalPrice.toLocaleString() }}</b>
        </div>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn icon :to="'/invoice/' + item.idInvoice" target="_BLANK">
          <v-icon :title="item.idInvoice">mdi-magnify</v-icon>
        </v-btn>
      </template>
    </v-data-table>


    <v-footer fixed padless>
      <v-col class="text-left" cols="12">
        المجموع : <b class="green--text">{{ sum }}</b>
      </v-col>
    </v-footer>
  </div>
</template>

<script>

export default {
  name: "CustomerCheckReportPage",
  components: {

  },
  data: () => ({
    customers: [],
    forceRerender:0,
    permissions: [],
    searchFields: {
      customerId: 0,
      startDate: null,
      endDate: null,
    },
    invoices: {
      header: [
        { text: "رقم الفاتورة", value: "idInvoice" },
        { text: "نوع الفاتورة", value: "invoiceTypeName" },
        { text: "الزبون", value: "customerName" },
        { text: "تاريخ الفاتورة", value: "creationFixedDate" },
        { text: "وقت الفاتورة", value: "creationFixedTime" },
        { text: "المبلغ", value: "totalPrice" },
        { text: "الجهة", value: "createdByName" },
        { text: "الاجراءات", value: "actions" },
      ],
      data: [],
    },
  }),
  created: function () {
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("customer_rail")) {
        this.$toast.open({
          type: "error",
          message: "غير مصرح لك بمشاهدة هذه الصفحة",
          duration: 3000,
        });
        this.$router.push('/');
      }
    });
    this.getCurrentDate().then((value) => {
      this.searchFields.startDate = value;
      this.searchFields.endDate = value;
    });
    let loading = this.$loading.show();
    this.$http
      .get(this.$baseUrl + "customer")
      .then((res) => {
        this.customers = res.data;
        if (this.$route.params.id != undefined && this.$route.params.id != null) {
          this.searchFields.customerId = this.$route.params.id;
          this.searchFields.startDate = "2022-01-01"
          this.search();
        }
      })
      .finally(() => loading.hide());
  },
  methods: {
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
    search() {
      let query = "performSearch&";
      if (this.searchFields.customerId != 0) {
        query = query + `customer=${this.searchFields.customerId}&`;
      }
      if (
        this.searchFields.startDate != null &&
        this.searchFields.endDate != null
      ) {
        query = query + `dateRangeFrom=${this.searchFields.startDate}&`;
        query = query + `dateRangeTo=${this.searchFields.endDate}&`;
      }
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "invoice/filter?" + query)
        .then((res) => {
          this.invoices.data = res.data;
        })
        .finally(() => loading.hide());
    },
    openInvoice() {
      this.$refs.myBottomSheet.open();
    }
  },
  computed: {
    sum() {
      let plus = 0;
      let minus = 0;
      let plusInvoices = this.invoices.data.filter(
        (invoice) => invoice.invoiceFunction == "plus"
      );
      let minusInvoices = this.invoices.data.filter(
        (invoice) => invoice.invoiceFunction == "minus"
      );
      for (let i = 0; i < plusInvoices.length; i++) {
        plus = plus + plusInvoices[i].totalPrice;
      }
      for (let i = 0; i < minusInvoices.length; i++) {
        minus = minus + minusInvoices[i].totalPrice;
      }
      return (plus - minus).toLocaleString();
    },
  },
};
</script>

<style>
</style>