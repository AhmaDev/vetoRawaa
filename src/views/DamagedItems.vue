<template>
  <div id="DamagedItems" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>المواد التالفة</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn
        :disabled="!checkPermission('damaged_add')"
        icon
        to="/new/damagedItems"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-app-bar>

    <v-card no-elevation class="pa-5">
      <v-row>
        <v-col cols="4">
          <v-autocomplete
            hide-details
            outlined
            dense
            clearable
            v-model="search.customerId"
            label="الزبون"
            :items="customers"
            item-text="storeName"
            item-value="idCustomer"
          ></v-autocomplete>
        </v-col>
        <v-col cols="4">
          <v-autocomplete
            outlined
            hide-details
            dense
            clearable
            v-model="search.delegateId"
            label="المندوب"
            :items="users.delegates"
            item-text="username"
            item-value="idUser"
          ></v-autocomplete>
        </v-col>
        <v-col cols="4">
          <v-text-field
            label="رقم الفاتورة"
            dense
            clearable
            v-model="search.invoiceId"
            hide-details
            outlined
            type="number"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field
            label="من تاريخ"
            dense
            clearable
            v-model="search.dateFrom"
            hide-details
            outlined
            type="date"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field
            label="الى تاريخ"
            dense
            clearable
            v-model="search.dateTo"
            hide-details
            outlined
            type="date"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-btn @click="fetch()" dark :color="$background" block> بحث </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <br />

    <v-card>
      <v-data-table
        :items-per-page="1000"
        :headers="invoices.header"
        :items="invoices.data"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            target="_BLANK"
            icon
            :to="'/damagedItems/' + item.idDamagedItemsInvoice"
          >
            <v-icon :title="item.idInvoice">mdi-magnify</v-icon>
          </v-btn>
          <v-menu v-if="checkPermission('damaged_delete')" offset-y>
            <template v-bind="item" v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" icon>
                <v-icon color="red" title="حذف الفاتورة"
                  >mdi-delete-outline</v-icon
                >
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="deleteInvoice(item.idInvoice)">
                <v-list-item-title
                  >اضغط هنا لتأكيد حذف الفاتورة</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <template v-slot:[`item.totalPrice`]="{ item }">
          <v-chip color="success" small>{{
            item.totalPrice.toLocaleString()
          }}</v-chip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "DamagedItems",
  data: () => ({
    permissions: [],
    invoices: {
      header: [
        { text: "كود الزبون", value: "customerId" },
        { text: "اسم الزبون", value: "customerName" },
        { text: "اسم المحل", value: "storeName" },
        { text: "الجهة", value: "createdByName" },
        { text: "المبلغ", value: "totalPrice" },
        { text: "بتاريخ", value: "creationFixedDate" },
        { text: "الوقت", value: "creationFixedTime" },
        { text: "الاجراءات", value: "actions" },
      ],
      data: [],
    },
    search: {
      invoiceType: null,
      customerId: null,
      delegateId: null,
      deliveryId: null,
      invoiceId: null,
      dateFrom: null,
      dateTo: null,
    },
    customers: [],
    users: {
      delegates: [],
    },
  }),
  created: function () {
    this.getCurrentDate().then((value) => {
      this.search.dateFrom = value;
      this.search.dateTo = value;
    });

    this.$http.get(this.$baseUrl + "users").then((res) => {
      this.users.delegates = res.data;
    });
    this.$http.get(this.$baseUrl + "customer").then((res) => {
      this.customers = res.data;
    });

    setTimeout(() => {
      if (this.$route.query.delegate) {
        this.search.delegateId = parseInt(this.$route.query.delegate);
        this.search.dateFrom = this.$route.query.date;
        this.search.dateTo = this.$route.query.date;
        this.fetch();
      }
    }, 1000);

    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("damaged")) {
        this.$toast.open({
          type: "error",
          message: "غير مصرح لك بمشاهدة هذه الصفحة",
          duration: 3000,
        });
        this.$router.go(-1);
      }
    });
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
    fetch() {
      let loading = this.$loading.show();

      let query = "";

      if (this.search.customerId != null && this.search.customerId != "") {
        query = query + `&customer=${this.search.customerId}`;
      }
      if (this.search.delegateId != null && this.search.delegateId != "") {
        query = query + `&user=${this.search.delegateId}`;
      }

      if (this.search.invoiceId != null && this.search.invoiceId != "") {
        query = query + `&id=${this.search.invoiceId}`;
      }
      if (this.search.dateFrom != null && this.search.dateFrom != "") {
        query = query + `&dateRangeFrom=${this.search.dateFrom}`;
      }
      if (this.search.dateTo != null && this.search.dateTo != "") {
        query = query + `&dateRangeTo=${this.search.dateTo}`;
      }

      this.$http
        .get(this.$baseUrl + "damagedInvoice/filter?search=true" + query)
        .then((res) => {
          this.invoices.data = res.data;
        })
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>