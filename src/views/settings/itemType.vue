<template>
  <div id="itemTypesSettings">
    <v-row>
      <v-col>
        <v-text-field
          label="اسم نوع المادة"
          placeholder="اضافة نوع مادة جديد"
          outlined
          dense
          v-model="itemTypeFields.title"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="addNewGroup()" icon>
          <v-icon> mdi-plus </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-data-table
      :headers="itemTypes.header"
      :items="itemTypes.data"
      class="elevation-0"
    >
      <template v-slot:[`item.itemTypeName`]="{ item }">
        <v-text-field outlined dense @change="editGroup(item.idItemType, $event)" :value="item.itemTypeName" hide-details></v-text-field>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-menu offset-y>
          <template v-bind="item" v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon>
              <v-icon color="red" title="حذف نوع المادة"
                >mdi-delete-outline</v-icon
              >
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="deleteItemType(item.idItemType)">
              <v-list-item-title
                >اضغط هنا لتأكيد حذف نوع المادة</v-list-item-title
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
  name: "ItemTypesSettings",
  data: () => ({
    itemTypes: {
      header: [
        { text: "نوع المادة", value: "itemTypeName" },
        { text: "الاجراءات", value: "actions", align: "left" },
      ],
      data: [],
    },
    itemTypeFields: {
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
        .get(this.$baseUrl + "itemType")
        .then((res) => {
          this.itemTypes.data = res.data;
        })
        .finally(() => loading.hide());
    },
    addNewGroup() {
      if (this.itemTypeFields.title != "") {
        let loading = this.$loading.show();
        this.$http
          .post(this.$baseUrl + "itemType/new", {
            itemTypeName: this.itemTypeFields.title,
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
    deleteItemType(itemId) {
        let loading = this.$loading.show();
        this.$http
          .delete(this.$baseUrl + "itemType/delete/" + itemId)
          .then(() => {
            this.fetch();
            this.$toast.open({
              type: "warning",
              message: " تم حذف نوع المادة",
              duration: 3000,
            });
          })
          .finally(() => loading.hide());
    },
    editGroup(itemId, e) {
        let loading = this.$loading.show();
        this.$http
          .put(this.$baseUrl + "itemType/edit/" + itemId , {
              itemTypeName: e,
          })
          .then(() => {
            this.fetch();
            this.$toast.open({
              type: "success",
              message: " تم تعديل نوع المادة",
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