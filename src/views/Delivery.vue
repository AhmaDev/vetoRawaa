<template>
  <div ref="print" id="deliveyPage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>كشف التوزيع</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="showDialog = true">
        اضافة فاتورة واحدة لكشف التوزيع
      </v-btn>
      &nbsp; &nbsp;
      <v-btn color="primary" @click="showDialog2 = true">
        اضافة فواتير مندوب لكشف التوزيع
      </v-btn>
    </v-app-bar>
    <v-card
      v-if="checkPermission('delivery_add')"
      class="pa-10 deliveryStatusTable"
    >
      <v-row>
        <v-col>
          <v-autocomplete
            :items="deliveries"
            item-text="username"
            item-value="idUser"
            outlined
            hide-details
            dense
            label="الموزعين"
            multiple
            v-model="selectedDeliveries"
          ></v-autocomplete>
        </v-col>
        <v-col>
          <v-text-field
            v-model="selectedDate"
            label="التاريخ"
            type="date"
            outlined
            hide-details
            dense
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-btn @click="startMethod(0)" dark :color="$background">
            اضافة كشف توزيع جديد
          </v-btn>
        </v-col>
        <v-col cols="2">
          <v-btn @click="startMethod(1)" dark :color="$background">
            اضافة كشف مالية جديد
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <br />
    <v-row>
      <v-col cols="12" md="7">
        <v-card class="pa-5 deliveryStatusTable">
          <h3>كشف التوزيع</h3>
          <v-data-table :items="deliveriesStatus" :headers="tableHeader">
            <template v-slot:[`item.total`]="{ item }">
              {{ sum(item) }}
            </template>
            <template v-slot:[`item.invoices`]="{ item }">
              {{ item.invoices.length }}
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                color="primary"
                elevation="0"
                block
                small
                :to="'/delivery/' + item.idDeliveryStatus"
              >
                مشاهدة كشف التوزيع
              </v-btn>
              <v-btn
                color="success"
                elevation="0"
                block
                small
                :to="'/delivery/' + item.idDeliveryStatus + '?print=true'"
              >
                طباعة كشف التوزيع
              </v-btn>
              <v-btn
                color="secondary"
                block
                elevation="0"
                small
                :to="
                  '/print/invoice/' + JSON.stringify(item.invoices).slice(1, -1)
                "
              >
                طباعة الفواتير
              </v-btn>
              <v-btn
                color="error"
                block
                elevation="0"
                small
                :to="
                  '/print/delegate/' +
                  JSON.stringify(item.delegates).slice(1, -1) +
                  '/' +
                  item.creationFixedDate +
                  '?print=1'
                "
              >
                طباعة كشف مبيعات
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card class="pa-5 deliveryStatusTable">
          <h3>كشف المالية</h3>
          <v-data-table
            :items="deliveriesStatusMoney"
            :headers="tableHeaderMoney"
          >
            <template v-slot:[`item.total`]="{ item }">
              {{ sum(item) }}
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                color="error"
                elevation="0"
                small
                block
                :to="'/money/' + item.idDeliveryStatus"
              >
                مشاهدة كشف المالية
              </v-btn>
              <v-btn
                color="warning"
                elevation="0"
                small
                block
                :to="'/money/' + item.idDeliveryStatus + '?print=true'"
              >
                طباعة كشف المالية
              </v-btn>
              <v-btn
                color="secondary"
                elevation="0"
                small
                block
                :to="
                  '/print/invoice/' + JSON.stringify(item.invoices).slice(1, -1)
                "
              >
                طباعة الفواتير
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="showDialog" width="500">
      <v-card class="pa-10">
        <v-text-field
          outlined
          v-model="dialogForm.invoiceId"
          dense
          label="رقم الفاتورة"
          type="number"
        ></v-text-field>
        <v-autocomplete
          :items="deliveries"
          item-text="username"
          item-value="idUser"
          outlined
          hide-details
          dense
          label="قم باختيار الموزع"
          v-model="dialogForm.selectedDelivery"
        ></v-autocomplete
        ><br />
        <v-btn color="primary" @click="addInvoiceToReport()" block
          >متابعة</v-btn
        >
      </v-card>
    </v-dialog>
    <v-dialog v-model="showDialog2" width="500">
      <v-card class="pa-10">
        <v-autocomplete
          :items="delegates"
          item-text="username"
          item-value="idUser"
          outlined
          hide-details
          dense
          label="قم باختيار المندوب"
          v-model="dialogForm.selectedDelegate"
        ></v-autocomplete
        ><br />
        <v-text-field
          v-model="dialogForm.selectedDate"
          label="التاريخ"
          type="date"
          outlined
          hide-details
          dense
        ></v-text-field>
        <br />
        <v-autocomplete
          :items="deliveries"
          item-text="username"
          item-value="idUser"
          outlined
          hide-details
          dense
          label="قم باختيار الموزع"
          v-model="dialogForm.selectedDelivery"
        ></v-autocomplete
        ><br />
        <v-btn color="primary" @click="addDelegateToReport()" block
          >متابعة</v-btn
        >
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "Delivery",
  data: () => ({
    permissions: [],
    dialogForm: {
      invoiceId: null,
      selectedDelivery: null,
      selectedDelegate: null,
      selectedDate: null,
    },
    deliveriesStatus: [],
    deliveries: [],
    delegates: [],
    showDialog: false,
    showDialog2: false,
    selectedDeliveries: [],
    deliveriesStatusMoney: [],
    selectedDate: null,
    tableHeader: [
      { text: "رقم التوزيع", value: "counter" },
      { text: "اسم الموزع", value: "deliveryName" },
      { text: "التاريخ", value: "creationFixedDate" },
      { text: "المبلغ", value: "total" },
      { text: "الفواتير", value: "invoices" },
      { text: "الاجراءات", value: "actions" },
    ],
    tableHeaderMoney: [
      { text: "رقم الكشف", value: "counter" },
      { text: "التاريخ", value: "creationFixedDate" },
      { text: "المبلغ", value: "total" },
      { text: "الاجراءات", value: "actions" },
    ],
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("delivery")) {
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
      this.selectedDate = value;
    });
    this.fetch();
    this.getData();
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
      this.$http.get(this.$baseUrl + "users/role/5").then((res) => {
        this.deliveries = res.data;
      });
      this.$http.get(this.$baseUrl + "users/role/4").then((res) => {
        this.delegates = res.data;
      });
    },
    getData() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "deliveryStatus")
        .then((res) => {
          this.deliveriesStatus = res.data.filter(
            (e) => e.deliveryStatusType == 0
          );
          this.deliveriesStatusMoney = res.data.filter(
            (e) => e.deliveryStatusType == 1
          );
        })
        .finally(() => loading.hide());
    },
    startMethod(type) {
      if (this.selectedDeliveries.length == 0 || this.selectedDate == null) {
        this.$toast.open({
          type: "error",
          message: "يرجى اختيار الموزعين وتاريخ التوزيع",
          duration: 3000,
        });
        return;
      }
      let loading = this.$loading.show();
      this.$http
        .post(this.$baseUrl + "deliveryStatus/multipleInsert", {
          deliveries: this.selectedDeliveries,
          date: this.selectedDate,
          deliveryStatusType: type,
        })
        .then(() => {
          setTimeout(() => {
            this.getData();
            loading.hide();
          }, 5000);
        });
    },
    addDelegateToReport() {
      if (
        this.dialogForm.selectedDelivery == null ||
        this.dialogForm.selectedDelegate == null ||
        this.dialogForm.selectedDate == null
      ) {
        this.$toast.open({
          type: "error",
          message: "يرجى ملئ الحقول",
          duration: 3000,
        });
        return;
      }
      let loading = this.$loading.show();
      this.$http
        .post(
          this.$baseUrl +
            "deliveryStatus/multipleInvoices/" +
            this.dialogForm.selectedDelegate,
          {
            delivery: this.dialogForm.selectedDelivery,
            date: this.dialogForm.selectedDate,
            deliveryStatusType: 0,
          }
        )
        .then(() => {
          setTimeout(() => {
            this.showDialog2 = false;
            this.getData();
            loading.hide();
          }, 5000);
        });
    },
    addInvoiceToReport() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "invoice/id/" + this.dialogForm.invoiceId)
        .then((res) => {
          let invoice = res.data;
          this.$http
            .get(this.$baseUrl + "deliveryStatus/counter")
            .then((res) => {
              let counter = res.data.counter;
              let invoicesData = [];
              for (let i = 0; i < invoice.items.length; i++) {
                const item = invoice.items[i];
                invoicesData.push({
                  itemId: item.itemId,
                  count: item.count,
                  total: item.total,
                  discountTypeId: item.discountTypeId,
                  createdBy: invoice.createdBy,
                  sellPriceId: invoice.sellPriceId,
                  invoiceTypeId: invoice.invoiceTypeId,
                  itemName: item.itemName,
                });
              }
              console.log(invoicesData);
              this.$http
                .post(this.$baseUrl + "deliveryStatus", {
                  deliveryId: this.dialogForm.selectedDelivery,
                  delegates: JSON.stringify([invoice.createdBy]),
                  invoices: JSON.stringify([
                    parseInt(this.dialogForm.invoiceId),
                  ]),
                  deliveryStatusType: 0,
                  counter: parseInt(counter) + 1,
                  createdAt: this.selectedDate,
                  notice: "oneInvoice",
                  invoicesData: JSON.stringify(invoicesData),
                })
                .then(() => {
                  setTimeout(() => {
                    this.getData();
                    loading.hide();
                    this.showDialog = false;
                    this.$toast.open({
                      type: "success",
                      message: "تم اضافة فاتورة لكشف توزيع",
                      duration: 3000,
                    });
                  }, 5000);
                });
            });
        });
    },
    sum(item) {
      let total = 0;
      for (let i = 0; i < item.invoicesData.length; i++) {
        total = total + item.invoicesData[i].total;
      }
      return total.toLocaleString();
    },
  },
};
</script>

<style>
.deliveryStatusTable .v-btn {
  margin: 5px !important;
}
</style>