<template>
  <div id="deliveryDelegates">
    <v-row>
      <v-col cols="3">
        <v-list>
          <v-list-item
            @click="setSelecteddelivery(delivery.idUser)"
            v-for="(delivery, i) in deliverys"
            :key="i"
            :class="
              selecteddelivery == delivery.idUser
                ? 'v-list-item--active'
                : ''
            "
          >
            <v-list-item-content>
              <v-list-item-title
                v-text="delivery.username"
              ></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="9" v-if="selecteddelivery > 0">
        <v-row>
          <v-col>
            <v-autocomplete
              :items="delegates"
              item-text="username"
              item-value="idUser"
              v-model="selectedDelegate"
              outlined
              dense
              label="اختيار مندوب"
            ></v-autocomplete>
          </v-col>
          <v-col
            ><v-btn color="primary" @click="addDeletedelivery()"
              >اضافة</v-btn
            ></v-col
          >
        </v-row>

        <v-data-table
          :items="deliveryDelegates"
          :headers="tableHeaders"
          class="elevation-0"
          height="500"
          fixed-header
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-menu offset-y>
              <template v-bind="item" v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" icon>
                  <v-icon color="red" title="حذف المندوب من قائمة الموزع"
                    >mdi-delete-outline</v-icon
                  >
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="deleteDelegate(item.idDeliveryDelegates)">
                  <v-list-item-title
                    >اضغط هنا لتأكيد حذف المندوب من قائمة
                    الموزع</v-list-item-title
                  >
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "DeliveryDelegates",
  data: () => ({
    delegates: [],
    deliverys: [],
    deliveryDelegates: [],
    selecteddelivery: 0,
    selectedDelegate: 0,
    tableHeaders: [
      {
        text: "اسم المندوب",
        value: "delegateName",
      },
      {
        text: "الاجراءات",
        value: "actions",
      },
    ],
  }),
  created: function () {
    let loading = this.$loading.show();
    this.$http.get(this.$baseUrl + "users/role/5").then((res) => {
      this.deliverys = res.data;
    });
    this.$http
      .get(this.$baseUrl + "users")
      .then((res) => {
        this.delegates = res.data;
      })
      .finally(() => loading.hide());
  },
  methods: {
    setSelecteddelivery(id) {
      this.selecteddelivery = id;
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "deliveryDelegates/userid/" + id)
        .then((res) => {
          this.deliveryDelegates = res.data;
        })
        .finally(() => loading.hide());
    },
    addDeletedelivery() {
      if (this.selectedDelegate < 1) {
        this.$toast.open({
          type: "error",
          message: "يرجى اختيار مندوب",
          duration: 3000,
        });
        return;
      }
      let loading = this.$loading.show();
      this.$http
        .post(this.$baseUrl + "deliveryDelegates/new", {
          deliveryId: this.selecteddelivery,
          delegateId: this.selectedDelegate,
        })
        .then(() => {
          this.setSelecteddelivery(this.selecteddelivery);
          this.selectedDelegate = 0;
        })
        .finally(() => loading.hide())
        .catch(() => {
          this.$toast.open({
            type: "error",
            message: "هذا المندوب موجود بالفعل في قائمة الموزع",
            duration: 3000,
          });
        });
    },
    deleteDelegate(id) {
      let loading = this.$loading.show();
      this.$http
        .delete(this.$baseUrl + "deliveryDelegates/delete/" + id)
        .then(() => this.setSelecteddelivery(this.selecteddelivery))
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>