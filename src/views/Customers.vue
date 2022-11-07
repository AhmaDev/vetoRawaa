<template>
  <div class="pa-5" id="customersPage">
    <v-row>
      <v-col cols="4">
        <v-card
          style="overflow-y: scroll"
          height="85vh"
          class="pa-0"
          no-elevation
        >
          <v-app-bar absolute style="position: sticky">
            <v-text-field
              @keyup.enter="filterCustomers($event)"
              solo
              dense
              hide-details
              label="ابحث"
            ></v-text-field>

            <template v-slot:extension>
              <v-tabs v-model="selectedTab" centered>
                <v-tabs-slider></v-tabs-slider>
                <v-tab>الزبائن</v-tab>
                <v-tab>الموردين</v-tab>
              </v-tabs>
            </template>
          </v-app-bar>
          <v-list nav dense>
            <v-list-item
              v-if="selectedTab == 1"
              style="background-color: green"
              dark
              @click="addNewManufactureDialog = true"
            >
              <v-list-item-icon>
                <v-icon>mdi-plus</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title> اضافة مورد جديد </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              active-class="selectedCustomer"
              @click="selectCustomer(customer.idCustomer)"
              v-for="(customer, i) in getData()"
              :key="i"
            >
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  {{ customer.storeName }} - {{ customer.idCustomer }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="8">
        <v-card
          style="overflow-y: scroll"
          height="85vh"
          class="pa-5"
          no-elevation
        >
          <Customer v-if="selectedTab == 0" :customerId="customerId" />
          <Manufacture v-if="selectedTab == 1" :customerId="customerId" />
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="addNewManufactureDialog" persistent width="500">
      <v-card>
        <v-card-title> اضافة مورد جديد </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="newManufacture.name"
            outlined
            label="اسم المورد"
          ></v-text-field>
          <v-text-field
            v-model="newManufacture.manufactureName"
            outlined
            label="اسم المصنع"
          ></v-text-field>
          <v-text-field
            v-model="newManufacture.phone"
            outlined
            label="رقم الهاتف"
          ></v-text-field>
          <v-text-field
            v-model="newManufacture.address"
            outlined
            label="العنوان"
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="primary" text @click="addNewManufacture()">
            اضافة
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="addNewManufactureDialog = false">
            الغاء
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Customer from "@/components/Customer.vue";
import Manufacture from "@/components/Manufacture.vue";
export default {
  name: "CustomersPage",
  components: {
    Customer,
    Manufacture,
  },
  data: () => ({
    customers: [],
    manufactures: [],
    allCustomers: [],
    selectedTab: 0,
    customerId: null,
    selectedCustomer: null,
    addNewManufactureDialog: false,
    newManufacture: {
      name: "",
      manufactureName: "",
      phone: "",
      address: "",
    },
  }),
  created: function () {
    this.fetch();
  },
  methods: {
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "customer/searchByName/customer")
        .then((res) => {
          this.customers = res.data;
          this.allCustomers = res.data;
        })
        .finally(() => loading.hide());
      this.$http
        .get(this.$baseUrl + "customer/searchByName/manufacture")
        .then((res) => {
          this.manufactures = res.data;
        });
    },
    selectCustomer(id) {
      this.customerId = id;
    },
    filterCustomers(e) {
      let loading = this.$loading.show();
      var name = e.target.value;
      this.$http
        .get(this.$baseUrl + "customer/searchByName/customer?q=" + name)
        .then((res) => {
          this.customers = res.data;
          this.allCustomers = res.data;
        }).finally(() => loading.hide());
      this.$http
        .get(this.$baseUrl + "customer/searchByName/manufacture?q=" + name)
        .then((res) => {
          this.manufactures = res.data;
        });
    },
    getData() {
      if (this.selectedTab == 0) {
        return this.customers;
      } else {
        return this.manufactures;
      }
    },
    addNewManufacture() {
      if (this.newManufacture.name.length == 0) {
        this.$toast.open({
          type: "warning",
          message: "يرجى كتابة اسم المورد",
          duration: 3000,
        });
        return;
      }
      if (this.newManufacture.manufactureName.length == 0) {
        this.$toast.open({
          type: "warning",
          message: "يرجى كتابة اسم المصنع",
          duration: 3000,
        });
        return;
      }
      if (this.newManufacture.phone.length == 0) {
        this.$toast.open({
          type: "warning",
          message: "يرجى كتابة رقم هاتف",
          duration: 3000,
        });
        return;
      }
      if (this.newManufacture.address.length == 0) {
        this.$toast.open({
          type: "warning",
          message: "يرجى كتابة العنوان",
          duration: 3000,
        });
        return;
      }
      let loading = this.$loading.show();
      this.$http
        .post(this.$baseUrl + "manufacture/new", {
          customerName: this.newManufacture.name,
          storeName: this.newManufacture.manufactureName,
          createdBy: 1,
          phone: this.newManufacture.phone,
          secondPhone: this.newManufacture.phone,
          email: "test",
          sellPriceId: 1,
          location: "33.4,44.3",
          provinceId: 1,
          nearby: this.newManufacture.address,
          visitDay: "sunday",
          secondVisitDay: "sunday",
          visitTimeFrom: "00:00",
          visitTimeTo: "00:00",
          customerClassId: 1,
          isManufacture: 1,
        })
        .then(() => {
          this.$toast.open({
            type: "success",
            message: "تم اضافة المورد بنجاح",
            duration: 3000,
          });
          this.fetch();
        })
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>