<template>
  <div id="deletedCustomers" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>سلة الحذف</v-toolbar-title>
    </v-app-bar>
    <v-card>
      <v-simple-table>
        <thead>
          <tr>
            <th>كود الزبون</th>
            <th>اسم الزبون</th>
            <th>اسم المحل</th>
            <th>رقم اسيا</th>
            <th>رقم زين</th>
            <th>المندوب</th>
            <th>العنوان</th>
            <th>الاجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.idCustomer">
            <td>{{ customer.idCustomer }}</td>
            <td>{{ customer.customerName }}</td>
            <td>{{ customer.storeName }}</td>
            <td>{{ customer.phone }}</td>
            <td>{{ customer.secondPhone }}</td>
            <td>{{ customer.username }}</td>
            <td>{{ customer.nearby }}</td>
            <td>
              <v-btn color="error" @click="editCustomer(customer.idCustomer)">
                <span>استرجاع</span>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    customers: [],
  }),
  created: function () {
    this.fetch();
  },
  methods: {
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "customer/filterWithJoin/query?isManufacture=2")
        .then((res) => {
          this.customers = res.data;
        })
        .finally(() => loading.hide());
    },
    editCustomer(id) {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "customer/edit/" + id, {
          isManufacture: 0,
        })
        .then(() => {
          this.$toast.open({
            type: "success",
            message: "تم استرجاع الزبون",
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