<template>
  <div class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>الحسابات</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-card no-elevation class="pa-10">
      <v-tabs v-model="selectedRoleId" centered>
        <v-tabs-slider :color="$background"></v-tabs-slider>

        <v-tab
          style="justify-content: center !important"
          v-for="(role, index) in roles"
          :key="role.idRole"
        >
          {{ role.roleName }}
          &nbsp;&nbsp;&nbsp;&nbsp;
          <v-chip dark color="red" x-small>
            {{
              accounts.filter((user) => user.roleId == roles[index].idRole)
                .length
            }}
          </v-chip>
        </v-tab>
      </v-tabs>
      <br />
      <v-data-table
        :items="
          accounts.filter((user) => user.roleId == roles[selectedRoleId].idRole)
        "
        :headers="tableHeaders"
      >
        <template v-slot:[`item.username`]="{ item }">
          <v-text-field
            outlined
            dense
            hide-details
            :value="item.username"
            @change="changeUserName(item.idUser, $event)"
          ></v-text-field>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon @click="changePassword(item.idUser)">
            <v-icon :title="item.idInvoice">mdi-key</v-icon>
          </v-btn>
          <v-btn
            v-if="checkPermission('account_edit')"
            icon
            :to="'/user/' + item.idUser"
          >
            <v-icon :title="item.idInvoice">mdi-account-edit-outline</v-icon>
          </v-btn>
          <v-btn
            v-if="checkPermission('account_edit')"
            plain
            small
            @click="unblock(item.idUser)"
          >
            فتح الحظر
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="passwordDialog" width="500">
      <v-card>
        <v-card-title> تغيير كلمة المرور </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="newPasswordField"
            outlined
            hide-details
            type="password"
            label="كلمة المرور الجديدة"
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="changePasswordConfirm()">
            تغيير
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "AccountsPage",
  data: () => ({
    permissions: [],
    accounts: [],
    roles: [],
    selectedUserId: 0,
    selectedRoleId: 0,
    passwordDialog: false,
    newPasswordField: "",
    tableHeaders: [
      { text: "اسم الحساب", value: "username" },
      { text: "كلمة المرور", value: "password" },
      { text: "الاجراءات", value: "actions" },
    ],
  }),
  methods: {
    logout(id) {
      this.$socket.auth.emit("logout", {
        userId: id,
      });
    },
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
        if (!this.checkPermission("accounts")) {
          this.$toast.open({
            type: "error",
            message: "غير مصرح لك بمشاهدة هذه الصفحة",
            duration: 3000,
          });
          this.$router.go(-1);
        }
      });
      // LOAD PERMS END
      let loading = this.$loading.show();
      let q = "users";
      if (this.userInfo.roleId == 1) {
        q = "users/unsecure/all";
      }
      this.$http
        .get(this.$baseUrl + q)
        .then((res) => {
          this.accounts = res.data;
        })
        .finally(() => loading.hide());
      this.$http.get(this.$baseUrl + "users/roles/all").then((res) => {
        this.roles = res.data;
        if (this.userInfo.roleId != 1) {
          this.roles = this.roles.filter((x) => x.idRole == 4);
        }
      });
    },
    changePassword(id) {
      this.selectedUserId = id;
      this.passwordDialog = true;
    },
    changePasswordConfirm() {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "users/edit/" + this.selectedUserId, {
          password: this.newPasswordField,
          logout: 1,
        })
        .then(() => {
          this.$toast.open({
            type: "success",
            message: "تم تغيير كلمة المرور",
            duration: 3000,
          });
          this.logout(this.selectedUserId);
          this.passwordDialog = false;
          this.selectedUserId = 0;
          this.newPasswordField = "";
        })
        .finally(() => loading.hide());
    },
    unblock(id) {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "users/edit/" + id, {
          email: "0",
        })
        .then(() => {
          this.$toast.open({
            type: "success",
            message: "تم فتح الحظر",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    changeUserName(userId, e) {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "users/edit/" + userId, {
          username: e,
        })
        .then(() => {
          this.$toast.open({
            type: "success",
            message: "تم تغيير اسم المستخدم",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
  },
  created: function () {
    this.fetch();
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
</style>