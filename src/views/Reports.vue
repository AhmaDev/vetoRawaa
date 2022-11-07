<template>
  <div id="ReportsPage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>التقارير</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-card no-elevation class="pa-10">
      <v-tabs :color="$background" vertical>
        <v-tab v-for="(page, index) in components" :key="index">
          <!-- <v-icon right>
            {{ page.icon }}
          </v-icon> -->
          {{ page.name }}
        </v-tab>

        <v-tab-item v-for="(page, index) in components" :key="'Page_' + index">
          <component v-bind:is="page.component"></component>
        </v-tab-item>
      </v-tabs>
    </v-card>
  </div>
</template>

<script>
import CustomerCheckReportPage from "./reports/customers/check.vue";
import DamagedInvoiceReport from "./reports/invoices/damagedInvoices.vue";

export default {
  components: {
    CustomerCheckReportPage,
    DamagedInvoiceReport,
  },
  data: () => ({
    permissions: [],
    components: [
      {
        name: "كشف حساب زبون",
        icon: "mdi-cog-outline",
        component: "CustomerCheckReportPage",
      },
      {
        name: "كشف بالمواد التالفة",
        icon: "mdi-cog-outline",
        component: "DamagedInvoiceReport",
      },
    ],
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("reports")) {
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
  },
};
</script>

<style>
.v-tab {
  justify-content: start !important;
  width: 250px !important;
}
</style>