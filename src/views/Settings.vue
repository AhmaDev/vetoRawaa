<template>
  <div id="settingsPage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>الاعدادات</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-card no-elevation class="pa-10">
      <v-tabs :color="$background" vertical>
        <v-tab v-if="checkPermission('settings_appinfo')">
          <v-icon right> mdi-cog-outline </v-icon>
          الاعدادات العامة
        </v-tab>
        <template v-if="userInfo.roleId == 1">
          <v-tab>
            <v-icon right> mdi-account-outline </v-icon>
            صلاحيات المستخدمين
          </v-tab>
          <v-tab>
            <v-icon right> mdi-newspaper </v-icon>
            اعدادات الفواتير
          </v-tab>
          <v-tab>
            <v-icon right> mdi-package-variant </v-icon>
            المجموعات
          </v-tab>
          <v-tab>
            <v-icon right> mdi-package-variant </v-icon>
            الماركات
          </v-tab>
          <!-- <v-tab>
        <v-icon right>
          mdi-format-list-bulleted-type
        </v-icon>
        انواع المواد
      </v-tab> -->
          <v-tab>
            <v-icon right> mdi-sale </v-icon>
            الخصومات
          </v-tab>
          <v-tab>
            <v-icon right> mdi-crosshairs-question </v-icon>
            اسباب الزيارة
          </v-tab>
          <v-tab>
            <v-icon right> mdi-account-multiple </v-icon>
            فئات الزبائن
          </v-tab>
          <v-tab>
            <v-icon right> mdi-account-group </v-icon>
            المشرفين
          </v-tab>
          <v-tab>
            <v-icon right> mdi-crosshairs-gps </v-icon>
            المناطق
          </v-tab>
        </template>
        <v-tab v-if="checkPermission('delivery_delegates')">
          <v-icon right> mdi-account-group </v-icon>
          الموزعين
        </v-tab>

        <v-tab-item v-if="checkPermission('settings_appinfo')">
          <GlobalSettings />
        </v-tab-item>
        <template v-if="userInfo.roleId == 1">
          <v-tab-item>
            <PermissionsPage />
          </v-tab-item>
          <v-tab-item>
            <InvoicesSettings />
          </v-tab-item>
          <v-tab-item>
            <ItemGroupsSettings />
          </v-tab-item>
          <v-tab-item>
            <BrandsSettings />
          </v-tab-item>
          <!-- <v-tab-item>
        <ItemTypesSettings />
      </v-tab-item> -->
          <v-tab-item>
            <DiscountSettings />
          </v-tab-item>
          <v-tab-item>
            <VisitCauses />
          </v-tab-item>
          <v-tab-item>
            <CustomersClasses />
          </v-tab-item>
          <v-tab-item>
            <SupervisorDelegates />
          </v-tab-item>
          <v-tab-item>
            <ProvincesPage />
          </v-tab-item>
        </template>
        <v-tab-item v-if="checkPermission('delivery_delegates')">
          <DeliveryDelegates />
        </v-tab-item>
      </v-tabs>
    </v-card>
  </div>
</template>

<script>
import GlobalSettings from "./settings/global.vue";
import PermissionsPage from "./settings/rolePermissions.vue";
import InvoicesSettings from "./settings/InvoicesSettings.vue";
import ItemGroupsSettings from "./settings/ItemGroups.vue";
import DiscountSettings from "./settings/DiscountsSettings.vue";
import VisitCauses from "./settings/VisitCauses.vue";
import CustomersClasses from "./settings/CustomersClasses.vue";
import SupervisorDelegates from "./settings/supervisorDelegates.vue";
import DeliveryDelegates from "./settings/deliveryDelegates.vue";
import ProvincesPage from "./settings/provinces.vue";
// import ItemTypesSettings from './settings/itemType.vue'
import BrandsSettings from "./settings/brands.vue";
export default {
  components: {
    GlobalSettings,
    PermissionsPage,
    InvoicesSettings,
    ItemGroupsSettings,
    DiscountSettings,
    VisitCauses,
    CustomersClasses,
    SupervisorDelegates,
    DeliveryDelegates,
    ProvincesPage,
    // ItemTypesSettings,
    BrandsSettings,
  },
  data: () => ({
    permissions: [],
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("settings")) {
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

<style>
.v-tab {
  justify-content: start !important;
  width: 250px !important;
}
</style>