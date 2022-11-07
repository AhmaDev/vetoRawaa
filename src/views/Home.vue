<template>
  <div class="pa-10" id="homePage">
    <template v-if="checkPermission('home')">
      <v-row>
        <v-col cols="12" md="3">
          <v-card class="pa-10">
            <i class="las la-users dashboardIcon primary--text"></i>
            <h1 v-if="!statisticsLoading">
              {{ statistics.totalCustomers.toLocaleString() }}
            </h1>
            <v-progress-circular
              v-if="statisticsLoading"
              indeterminate
              color="primary"
            ></v-progress-circular>
            <p>الزبائن</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="pa-10">
            <i class="las la-file-invoice dashboardIcon error--text"></i>
            <h1 v-if="!statisticsLoading">
              {{ statistics.totalInvoices.toLocaleString() }}
            </h1>
            <v-progress-circular
              v-if="statisticsLoading"
              indeterminate
              color="error"
            ></v-progress-circular>
            <p>الفواتير</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="pa-10">
            <i class="las la-box dashboardIcon warning--text"></i>
            <h1 v-if="!statisticsLoading">
              {{ statistics.totalItems.toLocaleString() }}
            </h1>
            <v-progress-circular
              v-if="statisticsLoading"
              indeterminate
              color="warning"
            ></v-progress-circular>
            <p>المواد</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="pa-10">
            <i class="las la-user-circle dashboardIcon success--text"></i>
            <h1 v-if="!statisticsLoading">
              {{ statistics.totalUsers.toLocaleString() }}
            </h1>
            <v-progress-circular
              v-if="statisticsLoading"
              indeterminate
              color="success"
            ></v-progress-circular>
            <p>الحسابات</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="pa-10">
            <h3>اكثر المندوبين مبيعاً لهذا اليوم</h3>
            <v-data-table
              hide-default-footer
              :loading="mostSellingDelegate.data.length == 0"
              :items="mostSellingDelegate.data"
              :headers="mostSellingDelegate.header"
            ></v-data-table>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="pa-10">
            <h3>اكثر المواد مبيعاً لهذا اليوم</h3>
            <v-data-table
              hide-default-footer
              :loading="mostItemsSelling.data.length == 0"
              :items="mostItemsSelling.data"
              :headers="mostItemsSelling.header"
            ></v-data-table>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card class="pa-10">
            <h3>اخر 20 فاتورة</h3>
            <v-data-table
              :headers="headers"
              :items="invoices"
              :items-per-page="20"
              class="elevation-0"
            >
              <template v-slot:[`item.invoiceTypeName`]="{ item }">
                <v-chip
                  :color="item.invoiceFunction == 'minus' ? 'green' : 'red'"
                  dark
                  small
                >
                  {{ item.invoiceTypeName }}
                </v-chip>
              </template>
              <template v-slot:[`item.totalPrice`]="{ item }">
                <div
                  :class="
                    item.invoiceFunction == 'minus'
                      ? 'green--text'
                      : 'red--text'
                  "
                >
                  <b v-if="item.totalPrice != null">{{
                    item.totalPrice.toLocaleString()
                  }}</b>
                </div>
              </template>

              <template v-slot:[`item.customerName`]="{ item }">
                {{ item.customerName }} -
                <b class="grey--text">{{ item.customerId }}</b>
              </template>

              <template v-slot:[`item.creationFixedDate`]="{ item }">
                {{ item.creationFixedDate }}
                <br />
                {{ item.creationFixedTime }}
              </template>

              <template v-slot:[`item.deliveryStatus`]="{ item }">
                <v-stepper
                  width="350"
                  style="background-color: transparent !important"
                  elevation="0"
                  alt-labels
                >
                  <v-stepper-header>
                    <v-stepper-step
                      color="green"
                      complete-icon="mdi-check"
                      :title="item.deliveryName"
                      step="1"
                      >استلام</v-stepper-step
                    >

                    <v-divider></v-divider>

                    <v-stepper-step
                      color="green"
                      complete-icon="mdi-check"
                      step="2"
                      >في الطريق</v-stepper-step
                    >

                    <v-divider></v-divider>

                    <v-stepper-step
                      color="green"
                      complete-icon="mdi-check"
                      step="3"
                      >تم التوصيل</v-stepper-step
                    >
                  </v-stepper-header>
                </v-stepper>
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <v-btn icon :to="'/invoice/' + item.idInvoice">
                  <v-icon :title="item.idInvoice">mdi-magnify</v-icon>
                </v-btn>
                <v-btn icon :to="'/print/invoice/' + item.idInvoice">
                  <v-icon title="طباعة الفاتورة">mdi-printer</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <template v-if="!checkPermission('home')">
      <v-alert type="error">لا تملك صلاحيات لمشاهدة الصفحة الرئيسية</v-alert>
    </template>
  </div>
</template>

<script>
export default {
  name: "Home",
  components: {},
  data: () => ({
    permissions: [],
    statistics: {
      totalCustomers: 0,
      totalInvoices: 0,
      totalItems: 0,
      totalUsers: 0,
    },
    statisticsLoading: true,
    mostSellingDelegate: {
      data: [],
      header: [
        { text: "اسم المندوب", value: "username" },
        { text: "المبلغ", value: "total" },
      ],
    },
    mostItemsSelling: {
      data: [],
      header: [
        { text: "اسم المادة", value: "fullItemName" },
        { text: "المبلغ", value: "total" },
      ],
    },
    invoices: [],
    headers: [
      {
        text: "#",
        align: "start",
        value: "idInvoice",
      },
      { text: "اسم الزبون", value: "customerName" },
      { text: "نوع الفاتورة", value: "invoiceTypeName", align: "center" },
      { text: "مبلغ الفاتورة", value: "totalPrice" },
      { text: "التاريخ", value: "creationFixedDate" },
      { text: "بواسطة", value: "createdByName" },
      { text: "الموزع", value: "deliveryName" },
      {
        text: "حالة التوزيع",
        value: "deliveryStatus",
        width: "350px",
        align: "center",
        class: "steppersContainer",
      },
      { text: "الاجراءات", value: "actions" },
    ],
  }),
  created: function () {
    this.fetch();
  },
  methods: {
    fetch() {
      // LOAD PERMS START
      this.auth().then((res) => {
        this.permissions = res.permissions;
      });
      // LOAD PERMS END

      this.$http.get(this.$baseUrl + "dashboard/statistics").then((res) => {
        this.statistics = res.data;
        this.statisticsLoading = false;
      });
      this.$http
        .get(this.$baseUrl + "dashboard/mostSellingDelegates")
        .then((res) => {
          this.mostSellingDelegate.data = res.data;
        });
      this.$http
        .get(this.$baseUrl + "dashboard/mostSellingItems")
        .then((res) => {
          this.mostItemsSelling.data = res.data;
        });
      this.$http
        .get(
          this.$baseUrl + "invoice/filter?order=idInvoice&sort=DESC&limit=20"
        )
        .then((res) => {
          this.invoices = res.data;
        });
    },
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
  },
};
</script>

<style>
.dashboardIcon {
  font-size: 72px;
  position: absolute;
  left: 50px;
}
</style>
