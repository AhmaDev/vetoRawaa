<template>
  <div id="CustomersCalsses">
    <v-row>
      <v-col>
        <v-text-field
          label="اسم الفئة"
          placeholder="اضافة فئة جديدة"
          outlined
          dense
          v-model="customerClassFields.title"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="addNewCustomerClass()" icon>
          <v-icon> mdi-plus </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-data-table
      :headers="customerClasses.header"
      :items="customerClasses.data"
      class="elevation-0"
    >
      <template v-slot:[`item.customerClassName`]="{ item }">
        <v-text-field outlined dense @change="editGroup(item.idCustomerClass, $event)" :value="item.customerClassName" hide-details></v-text-field>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-menu offset-y>
          <template v-bind="item" v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon>
              <v-icon color="red" title="حذف الفئة"
                >mdi-delete-outline</v-icon
              >
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="deleteCustomerClass(item.idCustomerClass)">
              <v-list-item-title
                >اضغط هنا لتأكيد حذف الفئة</v-list-item-title
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
  name: "CustomersCalsses",
  data: () => ({
    customerClasses: {
      header: [
        { text: "اسم الفئة", value: "customerClassName" },
        { text: "الاجراءات", value: "actions", align: "left" },
      ],
      data: [],
    },
    customerClassFields: {
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
        .get(this.$baseUrl + "customerClass")
        .then((res) => {
          this.customerClasses.data = res.data;
        })
        .finally(() => loading.hide());
    },
    addNewCustomerClass() {
      if (this.customerClassFields.title != "") {
        let loading = this.$loading.show();
        this.$http
          .post(this.$baseUrl + "customerClass", {
            customerClassName: this.customerClassFields.title,
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
    deleteCustomerClass(itemId) {
        let loading = this.$loading.show();
        this.$http
          .delete(this.$baseUrl + "customerClass/" + itemId)
          .then(() => {
            this.fetch();
            this.$toast.open({
              type: "warning",
              message: " تم حذف الفئة",
              duration: 3000,
            });
          })
          .finally(() => loading.hide());
    },
    editGroup(itemId, e) {
        let loading = this.$loading.show();
        this.$http
          .put(this.$baseUrl + "customerClass/" + itemId , {
              customerClassName: e,
          })
          .then(() => {
            this.fetch();
            this.$toast.open({
              type: "success",
              message: " تم تعديل الفئة",
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