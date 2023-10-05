<template>
  <div class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>الفواتير</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn v-if="checkPermission('invoices_add')" icon to="/new/invoice">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-app-bar>

    <v-card no-elevation class="pa-5">
      <v-row>
        <v-col cols="3">
          <v-autocomplete hide-details outlined dense clearable :disabled="userInfo.roleId == 2"
            v-model="search.invoiceType" label="نوع الفاتورة" :items="invoiceTypes" item-text="invoiceTypeName"
            item-value="idInvoiceType"></v-autocomplete>
        </v-col>
        <v-col cols="3">
          <v-autocomplete hide-details outlined dense clearable v-model="search.customerId" label="الزبون"
            :items="customers" item-text="storeName" item-value="idCustomer"></v-autocomplete>
        </v-col>
        <v-col cols="3">
          <v-autocomplete outlined hide-details dense clearable v-model="search.delegateId" label="المندوب"
            :items="users.delegates" item-text="username" item-value="idUser"></v-autocomplete>
        </v-col>
        <v-col cols="3">
          <v-autocomplete outlined hide-details dense clearable v-model="search.deliveryId" label="الموزع"
            :items="users.deliveries" item-text="username" item-value="idUser"></v-autocomplete>
        </v-col>
        <v-col cols="3">
          <v-text-field label="رقم الفاتورة" dense clearable v-model="search.invoiceId" hide-details outlined
            type="number"></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field label="من تاريخ" dense clearable v-model="search.dateFrom" hide-details outlined
            type="date"></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field label="الى تاريخ" dense clearable v-model="search.dateTo" hide-details outlined
            type="date"></v-text-field>
        </v-col>
        <v-col>
          <v-btn @click="performSearch()" dark :color="$background" block>
            بحث
          </v-btn>
        </v-col>
        <v-col>
          <v-btn @click="performSearch(1)" dark color="error" block>
            بحث عن المكرر
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <br />
    <v-card no-elevation>
      <v-data-table v-model="selectedInvoices" :headers="headers" :items="invoices" item-key="idInvoice"
        :items-per-page="20" show-select class="elevation-0">
        <template v-slot:[`item.invoiceTypeName`]="{ item }">
          <v-chip :color="item.invoiceFunction == 'minus' ? 'green' : 'red'" dark small>
            {{ item.invoiceTypeName }}
          </v-chip>
        </template>
        <template v-slot:[`item.totalPrice`]="{ item }">
          <div :class="item.invoiceFunction == 'minus' ? 'green--text' : 'red--text'
            ">
            <b v-if="item.totalPrice != null">{{
              item.totalPrice.toLocaleString()
            }}</b>
          </div>
        </template>

        <template v-slot:[`item.customerName`]="{ item }">
          {{ item.customerName }} -
          <b class="grey--text">{{ item.customerId }}</b>
        </template>
        <template v-slot:[`item.duplicate`]="{ item }">
          <v-chip small v-if="invoices.filter(
            (e) =>
              e.customerId == item.customerId &&
              e.totalPrice == item.totalPrice &&
              e.creationFixedDate == item.creationFixedDate &&
              e.invoiceTypeId == item.invoiceTypeId
          ).length > 1
            " color="error">مكرر</v-chip>
        </template>

        <template v-slot:[`item.creationFixedDate`]="{ item }">
          {{ item.creationFixedDate }}
          <br />
          {{ item.creationFixedTime }}
        </template>

        <template v-slot:[`item.deliveryStatus`]="{ item }">
          <v-stepper width="350" style="background-color: transparent !important" elevation="0" alt-labels>
            <v-stepper-header>
              <v-stepper-step color="green" complete-icon="mdi-check" :title="item.deliveryName"
                step="1">استلام</v-stepper-step>

              <v-divider></v-divider>

              <v-stepper-step color="green" complete-icon="mdi-check" step="2">في الطريق</v-stepper-step>

              <v-divider></v-divider>

              <v-stepper-step color="green" complete-icon="mdi-check" step="3">تم التوصيل</v-stepper-step>
            </v-stepper-header>
          </v-stepper>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn target="_BLANK" icon :to="'/invoice/' + item.idInvoice">
            <v-icon :title="item.idInvoice">mdi-magnify</v-icon>
          </v-btn>
          <v-btn icon :to="'/print/invoice/' + item.idInvoice">
            <v-icon title="طباعة الفاتورة">mdi-printer</v-icon>
          </v-btn>
          <v-menu v-if="checkPermission('invoice_delete')" offset-y>
            <template v-bind="item" v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" icon>
                <v-icon color="red" title="حذف الفاتورة">mdi-delete-outline</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="deleteInvoice(item.idInvoice)">
                <v-list-item-title>اضغط هنا لتأكيد حذف الفاتورة</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <v-bottom-navigation v-if="selectedInvoices.length > 0 && checkPermission('invoices_edit')" fixed>
      <v-btn @click="dialogs.setDelivery = true">
        <span>تحديد موزع</span>
        <v-icon>mdi-van-utility</v-icon>
      </v-btn>

      <v-btn @click="dialogs.setDelegate = true">
        <span>تحويل الجهة</span>
        <v-icon>mdi-account-outline</v-icon>
      </v-btn>

      <v-btn @click="printAll()">
        <span>طباعة الكل</span>
        <v-icon>mdi-printer</v-icon>
      </v-btn>

      <v-menu v-if="checkPermission('invoice_delete')" offset-y>
        <template v-bind="item" v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on">
            <span class="red--text">حذف</span>
            <v-icon color="red">mdi-delete-outline</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="deleteSelectedInvoice()">
            <v-list-item-title>اضغط هنا لتأكيد حذف الفواتير</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-bottom-navigation>

    <v-dialog v-model="dialogs.setDelivery" persistent max-width="500">
      <v-card>
        <v-card-title class="text-h5"> قم بأختيار الموزع </v-card-title>
        <v-card-text>
          <v-autocomplete v-model="selectedDeliveryId" :items="users.deliveries" item-text="username" item-value="idUser">
          </v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="red" @click="dialogs.setDelivery = false">
            الغاء
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn :color="$background" dark @click="setDelivery()">
            تحويل
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogs.setDelegate" persistent max-width="500">
      <v-card>
        <v-card-title class="text-h5"> قم بأختيار الجهة </v-card-title>
        <v-card-text>
          <v-autocomplete v-model="selectedDelegateId" :items="users.delegates" item-text="username" item-value="idUser">
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
export default {
  name: "Invoices",
  data: () => ({
    permissions: [],
    invoices: [],
    selectedInvoices: [],
    customers: [],
    sellPrices: [],
    invoiceTypes: [],
    sellTypes: [],
    users: {
      delegates: [],
      deliveries: [],
    },
    dialogs: {
      setDelivery: false,
      setDelegate: false,
    },
    selectedDeliveryId: null,
    selectedDelegateId: null,
    headers: [
      {
        text: "#",
        align: "start",
        value: "idInvoice",
      },
      { text: "اسم الزبون", value: "customerName" },
      { text: "اسم المحل", value: "storeName" },
      { text: "نوع الفاتورة", value: "invoiceTypeName", align: "center" },
      { text: "", value: "duplicate", align: "center" },
      { text: "مبلغ الفاتورة", value: "totalPrice" },
      { text: "التاريخ", value: "creationFixedDate" },
      { text: "بواسطة", value: "createdByName" },
      { text: "الموزع", value: "deliveryName" },
      // {
      //   text: "حالة التوزيع",
      //   value: "deliveryStatus",
      //   width: "350px",
      //   align: "center",
      //   class: "steppersContainer",
      // },
      { text: "الاجراءات", value: "actions" },
    ],
    search: {
      invoiceType: null,
      customerId: null,
      delegateId: null,
      deliveryId: null,
      invoiceId: null,
      dateFrom: null,
      dateTo: null,
    },
  }),
  created: function () {
    // this.getCurrentDate().then((value) => {
    //   this.search.dateFrom = value;
    //   this.search.dateTo = value;
    // });
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
      // LOAD PERMS START
      this.auth().then((res) => {
        this.permissions = res.permissions;
        // CHECK IF CAN SEE THIS PAGE
        if (!this.checkPermission("invoices")) {
          this.$toast.open({
            type: "error",
            message: "غير مصرح لك بمشاهدة هذه الصفحة",
            duration: 3000,
          });
          this.$router.go(-1);
        }
      });
      // LOAD PERMS END

      // let loading = this.$loading.show();
      // if (
      //   localStorage.getItem("searchInvoicesHistory") == undefined ||
      //   localStorage.getItem("searchInvoicesHistory") == null
      // ) {
      //   this.$http
      //     .get(this.$baseUrl + "invoice/filter?order=idInvoice&sort=DESC")
      //     .then((res) => {
      //       this.invoices = res.data;
      //     })
      //     .finally(() => {
      //       loading.hide();
      //       console.log(1111);
      //     });
      // } else {
      //   this.invoices = JSON.parse(
      //     localStorage.getItem("searchInvoicesHistory")
      //   );
      //   this.search = JSON.parse(localStorage.getItem("searchFormHistory"));
      //   this.performSearch();
      //   loading.hide();
      // }

      this.$http.get(this.$baseUrl + "users/role/5").then((res) => {
        this.users.deliveries = res.data;
      });
      this.$http.get(this.$baseUrl + "users").then((res) => {
        this.users.delegates = res.data;
      });
      this.$http.get(this.$baseUrl + "customer").then((res) => {
        this.customers = res.data;
      });
      this.$http.get(this.$baseUrl + "sellprice").then((res) => {
        this.sellPrices = res.data;
      });
      this.$http.get(this.$baseUrl + "invoice/type").then((res) => {
        this.invoiceTypes = res.data;
        if (this.userInfo.roleId == 2) {
          this.invoiceTypes = res.data.filter((e) => e.idInvoiceType == 3);
          this.search.invoiceType = 3;
        }
      });
      this.$http.get(this.$baseUrl + "selltype").then((res) => {
        this.sellTypes = res.data;
      });
    },
    deleteInvoice(id) {
      let loading = this.$loading.show();
      this.$http
        .delete(this.$baseUrl + "invoice/delete/" + id)
        .then(() => {
          this.$toast.open({
            type: "warning",
            message: " تم حذف الفاتورة بنجاح",
            duration: 3000,
          });
          this.performSearch();
        })
        .finally(() => {
          loading.hide();
        });
    },
    setDelivery() {
      if (this.selectedDeliveryId == null) {
        this.$toast.open({
          type: "error",
          message: "يرجى اختيار موزع",
          duration: 3000,
        });
        return false;
      }
      let invoices = this.selectedInvoices;
      let invoicesIds = invoices.map((invoice) => invoice.idInvoice);
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "invoice/setDelivery", {
          deliveryId: {
            deliveryId: this.selectedDeliveryId,
          },
          invoices: invoicesIds,
        })
        .finally(() => loading.hide())
        .then(() => {
          this.$toast.open({
            type: "success",
            message: " تمت العملية بنجاح",
            duration: 3000,
          });
          this.selectedDeliveryId = null;
          this.dialogs.setDelivery = false;
          this.performSearch();
        });
    },
    setDelegate() {
      if (this.selectedDelegateId == null) {
        this.$toast.open({
          type: "error",
          message: "يرجى اختيار جهة",
          duration: 3000,
        });
        return false;
      }
      let invoices = this.selectedInvoices;
      let invoicesIds = invoices.map((invoice) => invoice.idInvoice);
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "invoice/setDelegate", {
          deliveryId: {
            createdBy: this.selectedDelegateId,
          },
          invoices: invoicesIds,
        })
        .finally(() => loading.hide())
        .then(() => {
          this.$toast.open({
            type: "success",
            message: " تمت العملية بنجاح",
            duration: 3000,
          });
          this.selectedDelegateId = null;
          this.dialogs.setDelegate = false;
          this.performSearch();
        });
    },
    deleteSelectedInvoice() {
      let loading = this.$loading.show();
      let invoices = this.selectedInvoices;
      let invoicesIds = invoices.map((invoice) => invoice.idInvoice);
      this.$http
        .delete(this.$baseUrl + "invoice/deleteMultiple/", {
          data: {
            invoices: invoicesIds,
          },
        })
        .then(() => {
          this.$toast.open({
            type: "warning",
            message: " تم حذف بنجاح",
            duration: 3000,
          });
          this.performSearch();
        })
        .finally(() => {
          loading.hide();
        });
    },
    printAll() {
      let invoices = this.selectedInvoices;
      let ids = "";
      for (let i = 0; i < invoices.length; i++) {
        ids = ids + invoices[i].idInvoice + ",";
      }
      this.$router.push("/print/invoice/" + ids);
    },
    performSearch(checkDuplicated = 0) {
      let loading = this.$loading.show();
      let query = "";
      if (this.search.invoiceType != null && this.search.invoiceType != "") {
        query = query + `&type=${this.search.invoiceType}`;
      }
      if (this.search.customerId != null && this.search.customerId != "") {
        query = query + `&customer=${this.search.customerId}`;
      }
      if (this.search.delegateId != null && this.search.delegateId != "") {
        query = query + `&user=${this.search.delegateId}`;
      }
      if (this.search.deliveryId != null && this.search.deliveryId != "") {
        query = query + `&delivery=${this.search.deliveryId}`;
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
      console.log(query);
      this.$http
        .get(this.$baseUrl + "invoice/filter?search=true" + query)
        .then((res) => {
          if (checkDuplicated == 0) {
            this.invoices = res.data;
          } else {
            this.invoices = [];
            for (let i = 0; i < res.data.length; i++) {
              const invoice = res.data[i];
              let duplicate = res.data.filter(
                (e) =>
                  e.customerId == invoice.customerId &&
                  e.creationFixedDate == invoice.creationFixedDate &&
                  e.totalPrice == invoice.totalPrice &&
                  e.invoiceTypeId == invoice.invoiceTypeId
              ).length;
              console.log(duplicate);
              if (duplicate > 1) {
                this.invoices.push(invoice);
              }
            }
          }
          localStorage.setItem(
            "searchInvoicesHistory",
            JSON.stringify(this.invoices)
          );
          localStorage.setItem(
            "searchFormHistory",
            JSON.stringify(this.search)
          );
        })
        .finally(() => loading.hide());
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

<style></style>