<template>
  <div id="provinces">
    <v-row>
      <v-col>
        <v-text-field
          label="اسم المنطقة"
          placeholder="اضافة منطقة جديدة"
          outlined
          dense
          v-model="addProvince.title"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="addNewProvince()" icon>
          <v-icon> mdi-plus </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-data-table
      :headers="provinces.header"
      :items="provinces.data"
      class="elevation-0"
    >
      <template v-slot:[`item.visitCauseName`]="{ item }">
        <v-text-field outlined dense @change="editProvince(item.idProvince, $event)" :value="item.provinceName" hide-details></v-text-field>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-menu offset-y>
          <template v-bind="item" v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon>
              <v-icon color="red" title="حذف المنطقة"
                >mdi-delete-outline</v-icon
              >
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="deleteProvince(item.idProvince)">
              <v-list-item-title
                >اضغط هنا لتأكيد حذف المنطقة</v-list-item-title
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
  name: "ProvincesPage",
  data: () => ({
    provinces: {
      header: [
        { text: " اسم المنطقة", value: "provinceName" },
        { text: "الاجراءات", value: "actions", align: "left" },
      ],
      data: [],
    },
    addProvince: {
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
        .get(this.$baseUrl + "provinces")
        .then((res) => {
          this.provinces.data = res.data;
        })
        .finally(() => loading.hide());
    },
    addNewProvince() {
      if (this.addProvince.title != "") {
        let loading = this.$loading.show();
        this.$http
          .post(this.$baseUrl + "provinces/new", {
            provinceName: this.addProvince.title,
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
    deleteProvince(itemId) {
        let loading = this.$loading.show();
        this.$http
          .delete(this.$baseUrl + "provinces/delete/" + itemId)
          .then(() => {
            this.fetch();
            this.$toast.open({
              type: "warning",
              message: " تم حذف المنطقة",
              duration: 3000,
            });
          })
          .finally(() => loading.hide());
    },
    editProvince(itemId, e) {
        let loading = this.$loading.show();
        this.$http
          .put(this.$baseUrl + "provinces/edit/" + itemId , {
              visitCauseName: e,
          })
          .then(() => {
            this.fetch();
            this.$toast.open({
              type: "success",
              message: " تم تعديل المنطقة",
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