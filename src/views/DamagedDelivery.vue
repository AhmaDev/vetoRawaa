<template>
  <div ref="print" id="damagedDeliveyPage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title color="error">كشف توزيع التالف</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-card
      v-if="checkPermission('damaged_delivery_add')"
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
            اضافة كشف توزيع تالف جديد
          </v-btn>
        </v-col>
        <v-col cols="2">
          <v-btn @click="startMethod(1)" dark :color="$background">
            اضافة كشف مالية تالف جديد
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <br />
    <v-row>
      <v-col cols="12" md="7">
        <v-card class="pa-10 deliveryStatusTable">
          <h3>كشف التوزيع للمواد التالفة</h3>
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
                :to="'/damagedDelivery/' + item.idDeliveryStatus"
              >
                مشاهدة كشف التوزيع
              </v-btn>
              <v-btn
                color="success"
                elevation="0"
                block
                small
                :to="
                  '/damagedDelivery/' + item.idDeliveryStatus + '?print=true'
                "
              >
                طباعة كشف التوزيع
              </v-btn>
              <v-btn
                color="secondary"
                block
                elevation="0"
                small
                :to="
                  '/print/damagedInvoice/' +
                  JSON.stringify(item.invoices).slice(1, -1)
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
                  '/print/damagedDelegate/' +
                  JSON.stringify(item.delegates).slice(1, -1) +
                  '/' +
                  item.creationFixedDate +
                  '?print=1'
                "
              >
                طباعة كشف مبالغ التالف
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card class="pa-5 deliveryStatusTable">
          <h3>كشف المالية للمواد التالفة</h3>
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
                :to="'/damagedMoney/' + item.idDeliveryStatus"
              >
                مشاهدة كشف المالية
              </v-btn>
              <v-btn
                color="warning"
                elevation="0"
                small
                block
                :to="'/damagedMoney/' + item.idDeliveryStatus + '?print=true'"
              >
                طباعة كشف المالية
              </v-btn>
              <v-btn
                color="secondary"
                block
                elevation="0"
                small
                :to="
                  '/print/damagedInvoice/' +
                  JSON.stringify(item.invoices).slice(1, -1)
                "
              >
                طباعة الفواتير
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "Delivery",
  data: () => ({
    permissions: [],
    deliveriesStatus: [],
    deliveries: [],
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
      if (!this.checkPermission("damaged_delivery")) {
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
    },
    getData() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "deliveryStatus/damagedStatus")
        .then((res) => {
          this.deliveriesStatus = res.data.filter(
            (e) => e.deliveryStatusType == 2
          );
          this.deliveriesStatusMoney = res.data.filter(
            (e) => e.deliveryStatusType == 3
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
        .post(this.$baseUrl + "deliveryStatus/damagedMultipleInsert", {
          deliveries: this.selectedDeliveries,
          date: this.selectedDate,
          deliveryStatusType: type == 0 ? 2 : 3,
        })
        .then(() => {
          setTimeout(() => {
            this.getData();
            loading.hide();
          }, 5000);
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