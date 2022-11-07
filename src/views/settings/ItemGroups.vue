<template>
  <div id="itemGroupsSettings">
    <v-row>
      <v-col>
        <v-text-field
          label="اسم المجموعة"
          placeholder="اضافة مجموعة جديدة"
          outlined
          dense
          v-model="itemGroupFields.title"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="addNewGroup()" icon>
          <v-icon> mdi-plus </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-data-table
      :headers="itemGroups.header"
      :items="itemGroups.data"
      class="elevation-0"
    >
      <template v-slot:[`item.itemGroupName`]="{ item }">
        <v-text-field outlined dense @change="editGroup(item.idItemGroup, $event)" :value="item.itemGroupName" hide-details></v-text-field>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-menu offset-y>
          <template v-bind="item" v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon>
              <v-icon color="red" title="حذف الفاتورة"
                >mdi-delete-outline</v-icon
              >
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="deleteItemGroup(item.idItemGroup)">
              <v-list-item-title
                >اضغط هنا لتأكيد حذف المجموعة</v-list-item-title
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
  name: "ItemGroupsSettings",
  data: () => ({
    itemGroups: {
      header: [
        { text: "اسم المجموعة", value: "itemGroupName" },
        { text: "الاجراءات", value: "actions", align: "left" },
      ],
      data: [],
    },
    itemGroupFields: {
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
        .get(this.$baseUrl + "itemgroup")
        .then((res) => {
          this.itemGroups.data = res.data;
        })
        .finally(() => loading.hide());
    },
    addNewGroup() {
      if (this.itemGroupFields.title != "") {
        let loading = this.$loading.show();
        this.$http
          .post(this.$baseUrl + "itemgroup/new", {
            itemGroupName: this.itemGroupFields.title,
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
    deleteItemGroup(itemId) {
        let loading = this.$loading.show();
        this.$http
          .delete(this.$baseUrl + "itemgroup/delete/" + itemId)
          .then(() => {
            this.fetch();
            this.$toast.open({
              type: "warning",
              message: " تم حذف المجموعة",
              duration: 3000,
            });
          })
          .finally(() => loading.hide());
    },
    editGroup(itemId, e) {
        let loading = this.$loading.show();
        this.$http
          .put(this.$baseUrl + "itemgroup/edit/" + itemId , {
              itemGroupName: e,
          })
          .then(() => {
            this.fetch();
            this.$toast.open({
              type: "success",
              message: " تم تعديل المجموعة",
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