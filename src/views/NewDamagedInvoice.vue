<template>
  <div id="newInvoicePage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title
        >فاتورة رقم #{{ invoice.idDamagedItemsInvoice }}</v-toolbar-title
      >

      <v-spacer></v-spacer>

      <v-btn :disabled="!checkPermission('damaged_edit')" @click="save()" icon>
        <v-icon>mdi-check</v-icon>
      </v-btn>
      <template v-if="invoice.idDamagedItemsInvoice != 0">
        <v-menu offset-y>
          <template v-bind:item="item" v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              icon
              :disabled="!checkPermission('damaged_delete')"
            >
              <v-icon color="red" title="حذف المادة">mdi-delete-outline</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="deleteInvoice()">
              <v-list-item-title
                >اضغط هنا لتأكيد حذف الفاتورة</v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn :to="'/print/damagedInvoice/' + invoice.idDamagedItemsInvoice" icon>
          <v-icon>mdi-printer</v-icon>
        </v-btn>
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="3">
        <v-card class="pa-5" no-elevation>
          <v-alert dense outlined type="error"> فاتورة مواد تالفة </v-alert>
          <v-text-field
            disabled
            v-model="invoice.idDamagedItemsInvoice"
            outlined
            dense
            label="رقم الفاتورة"
            prepend-icon="mdi-pound"
          />
          <v-text-field
            type="date"
            v-model="invoice.creationFixedDate"
            outlined
            dense
            label="تاريخ الفاتورة"
            disabled
          />
          <v-text-field
            type="time"
            v-model="invoice.creationFixedTime"
            outlined
            dense
            label="وقت الفاتورة"
            disabled
          />
          <v-autocomplete
            v-model="invoice.customerId"
            :items="customers"
            outlined
            dense
            label="الزبون"
            item-text="storeName"
            item-value="idCustomer"
            :disabled="!checkPermission('damaged_edit')"
          ></v-autocomplete>
          <v-autocomplete
            v-model="invoice.createdBy"
            :items="users"
            outlined
            dense
            label="الجهة"
            item-text="username"
            item-value="idUser"
            :disabled="!checkPermission('damaged_edit')"
          ></v-autocomplete>
          <v-textarea
            v-model="invoice.notice"
            outlined
            dense
            label="الملاحظات"
            :disabled="!checkPermission('damaged_edit')"
          ></v-textarea>
        </v-card>
      </v-col>
      <v-col cols="9" :key="forceRerender">
        <v-card class="pa-5" no-elevation>
          <v-row>
            <v-col cols="4">
              <v-autocomplete
                :items="items"
                outlined
                dense
                label="المادة"
                item-text="itemName"
                item-value="idItem"
                v-model="inputFields.itemId"
                :disabled="!checkPermission('damaged_edit')"
              >
                <template v-slot:item="data">
                  <v-list-item-avatar>
                    <img :src="$baseUrl + 'files/' + data.item.imagePath" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title
                      v-html="data.item.fullItemName"
                    ></v-list-item-title>
                    <v-list-item-subtitle
                      v-html="data.item.itemGroupName"
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col>
              <v-text-field
                v-model="inputFields.count"
                type="number"
                outlined
                dense
                label="الكمية"
                :disabled="!checkPermission('damaged_edit')"
              />
            </v-col>

            <v-col cols="1">
              <v-btn
                :disabled="!checkPermission('damaged_edit')"
                @click="addItemToInvoice()"
                icon
                dark
                :color="$background"
              >
                <v-icon> mdi-plus </v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-data-table
            :headers="invoiceContents.headers"
            :items="invoiceContents.contents"
            :items-per-page="50"
            v-model="selectedItems"
            show-select
            item-key="idDamagedItemsInvoiceContent"
            class="elevation-0"
            height="500"
            fixed-header
          >

            <template v-slot:[`item.options`]="{ item }">
              <v-menu offset-y>
                <template v-bind:item="item" v-slot:activator="{ on, attrs }">
                  <v-btn
                    :disabled="!checkPermission('damaged_edit')"
                    v-bind="attrs"
                    v-on="on"
                    icon
                  >
                    <v-icon color="red" title="حذف المادة"
                      >mdi-delete-outline</v-icon
                    >
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    @click="
                      deleteItemFromInvoice(
                        invoiceContents.contents.indexOf(item)
                      )
                    "
                  >
                    <v-list-item-title
                      >اضغط هنا لتأكيد حذف المادة</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-data-table>
          <div>
            المجموع :
            <b class="green--text">
              {{
                invoiceContents.contents
                  .reduce((a, b) => a + b.totalPrice, 0)
                  .toLocaleString()
              }}
            </b>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "NewInvoice",
  data: () => ({
    permissions: [],
    customers: [],
    sellPrices: [],
    invoiceTypes: [],
    sellTypes: [],
    users: [],
    items: [],
    selectedItems: [],
    discounts: [],
    forceRerender: 0,
    invoice: {
      idDamagedItemsInvoice: 0,
      customerId: null,
      createdAt: null,
      createdBy: null,
      notice: null,
      items: [],
    },
    invoiceContents: {
      headers: [
        { text: "اسم المادة", value: "itemName" },
        { text: "الكمية", value: "count" },
        { text: "المبلغ", value: "price" },
        { text: "الاجمالي", value: "totalPrice" },
        { text: "الاجراءات", value: "options" },
      ],
      contents: [],
    },
    inputFields: {
      itemId: null,
      count: 0,
    },
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("damaged")) {
        this.$toast.open({
          type: "error",
          message: "غير مصرح لك بمشاهدة هذه الصفحة",
          duration: 3000,
        });
        this.$router.go(-1);
      }
    });
    // LOAD PERMS END

    this.$http.get(this.$baseUrl + "customer").then((res) => {
      this.customers = res.data;
    });
    this.$http.get(this.$baseUrl + "sellprice").then((res) => {
      this.sellPrices = res.data;
    });
    this.$http.get(this.$baseUrl + "invoice/type").then((res) => {
      this.invoiceTypes = res.data;
    });
    this.$http.get(this.$baseUrl + "selltype").then((res) => {
      this.sellTypes = res.data;
    });
    this.$http.get(this.$baseUrl + "users").then((res) => {
      this.users = res.data;
    });
    this.$http.get(this.$baseUrl + "item").then((res) => {
      this.items = res.data;
      if (this.$route.params.id != undefined) {
        this.invoice.idDamagedItemsInvoice = this.$route.params.id;
        let loading = this.$loading.show();

        this.$http
          .get(
            this.$baseUrl +
              "damagedInvoice/id/" +
              this.invoice.idDamagedItemsInvoice
          )
          .then((res) => {
            this.invoice = res.data;
            for (let i = 0; i < this.invoice.items.length; i++) {
              this.invoiceContents.contents.push({
                idDamagedItemsInvoiceContent:
                  this.invoice.items[i].idDamagedItemsInvoiceContent,
                itemId: this.invoice.items[i].itemId,
                itemName: this.invoice.items[i].itemName,
                count: this.invoice.items[i].count,
                price: this.invoice.items[i].price,
                totalPrice: this.invoice.items[i].totalPrice,
              });
            }
          })
          .finally(() => {
            loading.hide();
          });
      }
    });
    this.$http.get(this.$baseUrl + "discount").then((res) => {
      this.discounts = res.data;
    });
  },
  methods: {
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },

    addItemToInvoice() {
      this.invoiceContents.contents.push({
        itemId: this.inputFields.itemId,
        itemName: this.items.filter(
          (item) => item.idItem == this.inputFields.itemId
        )[0].itemName,
        count: this.inputFields.count,
      });
      if (this.invoice.idDamagedItemsInvoice != 0) {
        let loading = this.$loading.show();
        this.$http
          .post(this.$baseUrl + "damagedInvoice/addItemToInvoice", {
            damagedItemsInvoiceId: this.invoice.idDamagedItemsInvoice,
            count: this.inputFields.count,
            itemId: this.inputFields.itemId,
          })
          .then((res) => {
            console.log(res);
            this.$toast.open({
              type: "success",
              message: "تم اضافة المادة بنجاح",
              duration: 3000,
            });
            loading.hide();
          });
      }
    },
    save() {
      this.invoice.idDamagedItemsInvoice == 0 ? this.create() : this.update();
    },
    create() {
      if (!this.isFieldsValid()) {
        this.$toast.open({
          type: "error",
          message: "يرجى ملئ جميع الحقول",
          duration: 3000,
        });
        return false;
      }
      let items = [];
      for (let i = 0; i < this.invoiceContents.contents.length; i++) {
        items.push({
          idDamagedItemsInvoiceContent:
            this.invoiceContents.contents[i].idDamagedItemsInvoiceContent,
          itemId: this.invoiceContents.contents[i].itemId,
          count: this.invoiceContents.contents[i].count,
        });
      }
      let loading = this.$loading.show();
      this.$http
        .post(this.$baseUrl + "damagedInvoice/new", {
          invoice: {
            customerId: this.invoice.customerId,
            createdBy: this.invoice.createdBy,
            notice: this.invoice.notice,
          },
          invoiceContents: items,
        })
        .then((res) => {
          this.invoice.idDamagedItemsInvoice = res.data.insertId;
          this.$toast.open({
            type: "success",
            message: "تم اضافة الفاتورة بنجاح",
            duration: 3000,
          });
          this.$router.push(
            "/damagedItems/" + this.invoice.idDamagedItemsInvoice
          );
        })
        .finally(() => {
          loading.hide();
        });
    },
    update() {
      if (!this.isFieldsValid()) {
        this.$toast.open({
          type: "error",
          message: "يرجى ملئ جميع الحقول",
          duration: 3000,
        });
        return false;
      }
      let loading = this.$loading.show();
      this.$http
        .put(
          this.$baseUrl +
            "damagedInvoice/edit/" +
            this.invoice.idDamagedItemsInvoice,
          {
            invoice: {
              customerId: this.invoice.customerId,
              createdBy: this.invoice.createdBy,
              notice: this.invoice.notice,
            },
          }
        )
        .then((res) => {
          console.log(res.data.insertId);
          this.$toast.open({
            type: "success",
            message: "تم تعديل الفاتورة بنجاح",
            duration: 3000,
          });
        })
        .finally(() => {
          loading.hide();
        });
    },
    deleteInvoice() {
      let loading = this.$loading.show();
      this.$http
        .delete(
          this.$baseUrl +
            "damagedInvoice/delete/" +
            this.invoice.idDamagedItemsInvoice
        )
        .then((res) => {
          loading.hide(res);
          this.$toast.open({
            type: "success",
            message: "تم مسح الفاتورة بنجاح",
            duration: 3000,
          });
          this.$router.go(-1);
        });
    },
    isFieldsValid() {
      if (this.invoice.customerId == null || this.invoice.createdBy == null) {
        console.log(this.invoice);
        return false;
      } else {
        return true;
      }
    },
    deleteItemFromInvoice(index) {
      if (this.invoice.idDamagedItemsInvoice != 0) {
        console.log(this.invoice.items);
        let item = this.invoice.items[index];
        let loading = this.$loading.show();
        this.$http
          .delete(
            this.$baseUrl +
              "damagedInvoice/item/" +
              item.idDamagedItemsInvoiceContents
          )
          .then((res) => {
            this.$toast.open({
              type: "warning",
              message: "تم حذف المادة من الفاتورة",
              duration: 3000,
            });
            console.log(res);
          })
          .finally(() => {
            loading.hide();
          });
      }
      this.invoiceContents.contents.splice(index, 1);
    },
  },
};
</script>

<style>
</style>