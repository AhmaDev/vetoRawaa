<template>
  <v-app
    :class="!checkPermission('disable_selection') ? 'disableSelection' : ''"
    :style="this.$vuetify.theme.dark ? '' : 'background-color: #EEE'"
  >
    <component :is="`style`">
      <!-- .selectedNavBarItem { border-right: 6px {{$background}} solid; transition: 0.3s; } -->
      .selectedNavBarItem .las { background-color: {{ this.$background }};
      border-radius: 50px; padding:5px; transition: 0.3s; margin-right: 15px;
      color: #FFFFFF; } .v-application--is-rtl
      .v-list-group--no-action>.v-list-group__items>.v-list-item {
      padding-right: 47px !important;}
      .v-list-group__items>.v-list-item>.v-list-item__content {border-right: 2px
      {{ this.$background }} solid !important;}
    </component>

    <v-navigation-drawer
      class="elevation-10"
      permanent
      app
      right
      fixed
      v-if="isLoggedIn"
    >
      <v-list dense>
        <center>
          <br />
          <Logo
            :background="
              $baseUrl.includes('sultan')
                ? $vuetify.theme.primary
                : $vuetify.theme.primary
            "
            width="150px"
          />

          <div v-if="appData.length > 0">
            {{ appData.filter((e) => e.variable == "title")[0].value }}
          </div>

          <v-chip class="ma-2" small :color="$background" outlined>
            {{ userInfo.username }}
          </v-chip>
        </center>
        <template v-for="item in items">
          <v-list-item
            :key="item.title"
            v-if="item.child == null"
            link
            :to="item.route"
            active-class="selectedNavBarItem"
          >
            <v-list-item-content>
              <v-list-item-title>
                <i :class="item.icon + ' homePageNavBarIcons'"></i>
                {{ item.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-group
            v-if="item.child != null"
            :key="item.title"
            :prepend-icon="item.action"
            no-action
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>
                  <i :class="item.icon + ' homePageNavBarIcons'"></i>
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item-content>
            </template>

            <template v-for="child in item.child">
              <v-list-item
                :key="child.title"
                link
                :to="child.route"
                active-class="selectedNavBarItem"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    <i :class="child.icon + ' homePageNavBarIcons'"></i>
                    {{ child.title }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list-group>
        </template>
      </v-list>

      <template v-slot:append>
        <v-list dense>
          <v-list-item v-if="userInfo.roleId == 1" to="/deletedCustomers">
            <v-list-item-content>
              <v-list-item-title>
                <i class="la la-trash homePageNavBarIcons"></i>
                <span>سلة الحذف</span>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="darkMode()">
            <v-list-item-content>
              <v-list-item-title>
                <i
                  :class="
                    $vuetify.theme.dark
                      ? 'las la-sun homePageNavBarIcons'
                      : 'las la-moon homePageNavBarIcons'
                  "
                ></i>
                {{ $vuetify.theme.dark ? "Light mode" : "Dark mode" }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="logout()">
            <v-list-item-content>
              <v-list-item-title>
                <i class="las la-power-off homePageNavBarIcons"></i>
                تسجيل الخروج
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <br /><br />
      </template>
    </v-navigation-drawer>

    <div class="mainContent">
      <v-main>
        <v-container class="pa-0 mainContent" fluid>
          <vue-page-transition name="fade">
            <Login v-if="!isLoggedIn" />
            <router-view v-else />
          </vue-page-transition>
        </v-container>
      </v-main>
    </div>
  </v-app>
</template>

<script>
import Login from "./components/Login.vue";
import Logo from "./components/Logo.vue";
export default {
  name: "App",
  components: {
    Login,
    Logo,
  },
  sockets: {
    auth: {
      connect: function () {
        console.log("socket connected");
      },
      logoutEmit: function (data) {
        console.log(data);
        alert("تم تغيير كلمة المرور");
        this.logout();
      },
    },
  },
  data: () => ({
    permissions: [],
    appData: [],
    items: [
      { title: "الرئيسية", icon: "las la-home", route: "/home", child: null },
      {
        title: "المخزن",
        icon: "las la-file-invoice",
        route: null,
        child: [
          {
            title: "الفواتير",
            icon: "las la-file-invoice",
            route: "/invoices",
            child: null,
          },
          {
            title: "كشف المسار",
            icon: "las la-map-marked-alt",
            route: "/visits",
            child: null,
          },
          {
            title: "حركة مندوب",
            icon: "las la-directions",
            route: "/delegateRail",
            child: null,
          },
          { title: "المواد", icon: "las la-box", route: "/items" },
          { title: "مبيعات المواد", icon: "las la-box", route: "/itemSales" },
          {
            title: " التوزيع والمالية",
            icon: "las la-route",
            route: "/delivery",
          },
          {
            title: "توزيع التالف",
            icon: "las la-route",
            route: "/damagedDelivery",
          },
          {
            title: "اعداد المخزن",
            icon: "las la-truck-loading",
            route: "/store",
            child: null,
          },
        ],
      },
      {
        title: "المواد التالفة",
        icon: "las la-exclamation-circle",
        route: "/damagedItems",
        child: null,
      },
      {
        title: "كشف الهدايا",
        icon: "las la-gift",
        route: "/discounts",
        child: null,
      },
      {
        title: "الزبائن الموردين",
        icon: "las la-user-friends",
        route: "/customers",
        child: null,
      },
      { title: "الخريطة", icon: "las la-map", route: "/map", child: null },
      {
        title: "الحسابات",
        icon: "las la-user-circle",
        route: "/accounts",
        child: null,
      },
      {
        title: "التقرير العام",
        icon: "las la-file-invoice-dollar",
        route: "/reportsOverview",
        child: null,
      },
      {
        title: "كشف حساب زبون",
        icon: "las la-chart-bar",
        route: "/reports",
        child: null,
      },
      {
        title: "الاعدادات",
        icon: "las la-cog",
        route: "/settings",
        child: null,
      },
    ],
    forceRerender: 0,
  }),

  methods: {
    logout() {
      localStorage.clear();
      location.reload();
    },
    darkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem("darkMode", this.$vuetify.theme.dark);
    },
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
  created: function () {
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
    });

    this.$http.get(this.$baseUrl + "settings").then((res) => {
      this.appData = res.data;
    });
    let isDarkMode = false;
    if (localStorage.getItem("darkMode") == "true") {
      isDarkMode = true;
    }
    this.$vuetify.theme.dark = isDarkMode;
    setTimeout(() => {
      if (this.$baseUrl.includes("sultan")) {
        this.$background = "#4CAF50";
        this.$vuetify.theme.primary = "#4CAF50";
      } else {
        this.$background = "#2046D1";
        this.$vuetify.theme.primary = "#2046D1";
      }
      this.forceRerender++;
    }, 100);
  },
};
</script>

<style src="./style.css"></style>