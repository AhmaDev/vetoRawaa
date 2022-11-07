<template>
  <div id="DiscountSettingsPage">
    <v-row>
      <v-col>
        <v-text-field
          label="اسم الخصم"
          placeholder="اضافة مجموعة جديدة"
          outlined
          dense
          v-model="DiscountFields.title"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="addNewDiscount()" icon>
          <v-icon> mdi-plus </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-data-table
      :headers="discounts.header"
      :items="discounts.data"
      class="elevation-0"
    >
      <template v-slot:[`item.discountName`]="{ item }">
        <v-text-field
          outlined
          dense
          disabled
          @change="editDiscount(item.idDiscount, $event)"
          :value="item.discountName"
          hide-details
        ></v-text-field>
      </template>

      <!-- <template v-slot:[`item.actions`]="{ item }">
        <v-menu offset-y>
          <template v-bind="item" v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon>
              <v-icon color="red" title="حذف"
                >mdi-delete-outline</v-icon
              >
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="deleteDiscount(item.idDiscount)">
              <v-list-item-title
                >اضغط هنا لتأكيد حذف الخصم</v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </template> -->
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: "DiscountSettings",
  data: () => ({
    discounts: {
      header: [
        { text: "#", value: "idDiscount" },
        { text: "اسم الخصم", value: "discountName" },
        { text: "الاجراءات", value: "actions", align: "left" },
      ],
      data: [],
    },
    DiscountFields: {
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
        .get(this.$baseUrl + "discount")
        .then((res) => {
          this.discounts.data = res.data;
        })
        .finally(() => loading.hide());
    },
    addNewDiscount() {
      if (this.DiscountFields.title != "") {
        let loading = this.$loading.show();
        this.$http
          .post(this.$baseUrl + "discount/new", {
            discountName: this.DiscountFields.title,
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
    deleteDiscount(itemId) {
      let loading = this.$loading.show();
      this.$http
        .delete(this.$baseUrl + "discount/delete/" + itemId)
        .then(() => {
          this.fetch();
          this.$toast.open({
            type: "warning",
            message: " تم حذف الخصم",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    editDiscount(itemId, e) {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "discount/edit/" + itemId, {
          discountName: e,
        })
        .then(() => {
          this.fetch();
          this.$toast.open({
            type: "success",
            message: " تم تعديل اسم الخصم",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>