<template>
  <div v-if="settings.length > 0" id="GlobalSettingsPage">
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="settingsFields.title"
          outlined
          :disabled="userInfo.roleId != 1"
          label="عنوان الحساب"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="settingsFields.workStartTime"
          type="time"
          outlined
          label="وقت بدء العمل"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="settingsFields.workEndTime"
          type="time"
          outlined
          label="وقت نهاية العمل"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="settingsFields.daysToRestoreInvoices"
          type="number"
          outlined
          label="عدد الايام للسماح باسترجاع الفواتير"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="settingsFields.reportsDays"
          type="number"
          outlined
          label="عدد الايام للسماح باستعراض التقارير"
        ></v-text-field>
      </v-col>
    </v-row>
    <br />
    <br />
    <v-btn @click="save()" :color="$background" dark> حفظ </v-btn>
  </div>
</template>

<script>
export default {
  name: "GlobalSettings",
  data: () => ({
    settings: [],
    settingsFields: {
      title: "",
      workStartTime: "",
      workEndTime: "",
      daysToRestoreInvoices: "",
      reportsDays: "",
    },
  }),
  created: function () {
    let loading = this.$loading.show();
    this.$http
      .get(this.$baseUrl + "settings")
      .then((res) => {
        this.settings = res.data;
        this.settingsFields.title = this.getSettingValue("title");
        this.settingsFields.workStartTime =
          this.getSettingValue("workStartTime");
        this.settingsFields.workEndTime = this.getSettingValue("workEndTime");
        this.settingsFields.reportsDays = this.getSettingValue("reportsDays");
        this.settingsFields.daysToRestoreInvoices = this.getSettingValue(
          "daysToRestoreInvoices"
        );
      })
      .finally(() => loading.hide());
  },
  methods: {
    getSettingValue(variable) {
      return this.settings.filter((setting) => setting.variable == variable)[0]
        .value;
    },
    save() {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "settings", {
          title: this.settingsFields.title,
          workStartTime: this.settingsFields.workStartTime,
          workEndTime: this.settingsFields.workEndTime,
          daysToRestoreInvoices: this.settingsFields.daysToRestoreInvoices,
          reportsDays: this.settingsFields.reportsDays,
        })
        .then(() => {
          this.$toast.open({
            type: "success",
            message: "تم التحديث بنجاح",
            duration: 3000,
          });
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

<style>
</style>