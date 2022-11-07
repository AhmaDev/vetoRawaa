<template>
  <div id="visitCalsses">
    <v-row>
      <v-col>
        <v-text-field
          label="اسم سبب الزيارة"
          placeholder="اضافة فئة جديدة"
          outlined
          dense
          v-model="visitCauseFields.title"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="addNewVisitCause()" icon>
          <v-icon> mdi-plus </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-data-table
      :headers="visitCauses.header"
      :items="visitCauses.data"
      class="elevation-0"
    >
      <template v-slot:[`item.visitCauseName`]="{ item }">
        <v-text-field outlined dense @change="editGroup(item.idVisitCause, $event)" :value="item.visitCauseName" hide-details></v-text-field>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-menu offset-y>
          <template v-bind="item" v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon>
              <v-icon color="red" title="حذف سبب الزيارة"
                >mdi-delete-outline</v-icon
              >
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="deleteVisitCause(item.idVisitCause)">
              <v-list-item-title
                >اضغط هنا لتأكيد حذف سبب الزيارة</v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: "VisitCausesPage",
  data: () => ({
    visitCauses: {
      header: [
        { text: " سبب الزيارة", value: "visitCauseName" },
        { text: "الاجراءات", value: "actions", align: "left" },
      ],
      data: [],
    },
    visitCauseFields: {
      title: "",
    },
  }),
  created: function () {
    this.fetch();
  },
  methods: {
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "visitCauses")
        .then((res) => {
          this.visitCauses.data = res.data;
        })
        .finally(() => loading.hide());
    },
    addNewVisitCause() {
      if (this.visitCauseFields.title != "") {
        let loading = this.$loading.show();
        this.$http
          .post(this.$baseUrl + "visitCauses", {
            visitCauseName: this.visitCauseFields.title,
          })
          .then(() => {
            this.fetch();
            this.$toast.open({
              type: "success",
              message: " تمت العملية بنجاح",
              duration: 3000,
            });
          })
          .finally(() => loading.hide());
      }
    },
    deleteVisitCause(itemId) {
        let loading = this.$loading.show();
        this.$http
          .delete(this.$baseUrl + "visitCauses/" + itemId)
          .then(() => {
            this.fetch();
            this.$toast.open({
              type: "warning",
              message: " تم حذف سبب الزيارة",
              duration: 3000,
            });
          })
          .finally(() => loading.hide());
    },
    editGroup(itemId, e) {
        let loading = this.$loading.show();
        this.$http
          .put(this.$baseUrl + "visitCauses/" + itemId , {
              visitCauseName: e,
          })
          .then(() => {
            this.fetch();
            this.$toast.open({
              type: "success",
              message: " تم تعديل سبب الزيارة",
              duration: 3000,
            });
          })
          .finally(() => loading.hide());
    }
  },
};
</script>

<style>
</style>