<template>
  <div id="newInvoicePage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>فاتورة رقم #{{ invoice.idInvoice }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn :disabled="!checkPermission('invoices_edit')" @click="save()" icon>
        <v-icon>mdi-check</v-icon>
      </v-btn>
      <template v-if="invoice.idInvoice != 0">
        <v-menu offset-y>
          <template v-bind:item="item" v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              icon
              :disabled="!checkPermission('invoice_delete')"
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

        <v-btn :to="'/print/invoice/' + invoice.idInvoice" icon>
          <v-icon>mdi-printer</v-icon>
        </v-btn>
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="3">
        <v-card class="pa-5" no-elevation>
          <v-text-field
            disabled
            v-model="invoice.idInvoice"
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
            @change="calculateDate()"
            :disabled="invoice.invoiceTypeId != 3"
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
            v-model="invoice.invoiceTypeId"
            :items="invoiceTypes"
            outlined
            dense
            label="نوع الفاتورة"
            item-text="invoiceTypeName"
            item-value="idInvoiceType"
            :disabled="!checkPermission('invoices_edit')"
          ></v-autocomplete>
          <v-autocomplete
            v-model="invoice.customerId"
            :items="
              invoice.invoiceTypeId == 2 ||
              invoice.invoiceTypeId == 4 ||
              invoice.invoiceTypeId == 5
                ? manufactures
                : customers
            "
            outlined
            @change="setDelegate()"
            dense
            :label="
              invoice.invoiceTypeId == 2 ||
              invoice.invoiceTypeId == 4 ||
              invoice.invoiceTypeId == 5
                ? 'المورد'
                : 'الزبون'
            "
            item-text="storeName"
            item-value="idCustomer"
            :suffix="
              invoice.invoiceTypeId == null ? 'يرجى اختيار نوع الفاتورة' : ''
            "
            :disabled="
              !checkPermission('invoices_edit') || invoice.invoiceTypeId == null
            "
          ></v-autocomplete>
          <v-autocomplete
            v-model="invoice.sellPriceId"
            :key="forceRerender"
            :items="sellPrices"
            outlined
            dense
            label="فئة الفاتورة"
            item-text="sellPriceName"
            item-value="idSellPrice"
            :disabled="!checkPermission('invoices_edit')"
          ></v-autocomplete>
          <v-autocomplete
            v-model="invoice.sellTypeId"
            :items="sellTypes"
            outlined
            dense
            label="حالة الفاتورة"
            item-text="sellTypeName"
            item-value="idSellType"
            :disabled="!checkPermission('invoices_edit')"
          ></v-autocomplete>
          <v-autocomplete
            v-model="invoice.createdBy"
            :items="users"
            outlined
            dense
            label="الجهة"
            item-text="username"
            item-value="idUser"
            v-if="invoice.invoiceTypeId == 1 || invoice.invoiceTypeId == 3"
            :disabled="!checkPermission('invoices_edit')"
          ></v-autocomplete>
          <v-textarea
            v-model="invoice.notice"
            outlined
            dense
            label="الملاحظات"
            :disabled="!checkPermission('invoices_edit')"
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
                item-text="fullItemName"
                item-value="idItem"
                v-on:change="
                  getPriceForItem($event);
                  getTotalPerItem();
                "
                v-model="inputFields.itemId"
                :disabled="!checkPermission('invoices_edit')"
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
                v-on:change="getTotalPerItem()"
                v-model="inputFields.price"
                type="number"
                outlined
                dense
                label="المبلغ"
                :disabled="!checkPermission('invoices_edit')"
              />
            </v-col>
            <v-col>
              <v-text-field
                v-on:change="getTotalPerItem()"
                v-model="inputFields.quantity"
                type="number"
                outlined
                dense
                label="الكمية"
                :disabled="!checkPermission('invoices_edit')"
              />
            </v-col>
            <v-col>
              <v-text-field
                v-on:change="getTotalPerItem()"
                v-model="inputFields.discount"
                type="number"
                outlined
                dense
                label="الخصم %"
                :disabled="!checkPermission('invoices_edit')"
              />
            </v-col>
            <v-col>
              <v-autocomplete
                :items="discounts"
                outlined
                dense
                label="نوع الخصم"
                item-text="discountName"
                item-value="idDiscount"
                v-model="inputFields.discountId"
                :disabled="!checkPermission('invoices_edit')"
              ></v-autocomplete>
            </v-col>
            <v-col>
              <v-text-field
                disabled
                type="number"
                outlined
                dense
                label="الاجمالي"
                v-model="inputFields.total"
              />
            </v-col>
            <v-col cols="1">
              <v-btn
                :disabled="!checkPermission('invoices_edit')"
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
            item-key="idInvoiceContent"
            class="elevation-0"
            height="500"
            fixed-header
          >
            <template v-slot:[`item.options`]="{ item }">
              <v-menu offset-y>
                <template v-bind:item="item" v-slot:activator="{ on, attrs }">
                  <v-btn
                    :disabled="!checkPermission('invoices_edit')"
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

              <v-menu offset-y>
                <template v-bind:item="item" v-slot:activator="{ on, attrs }">
                  <v-btn
                    :disabled="!checkPermission('invoices_edit')"
                    v-bind="attrs"
                    v-on="on"
                    icon
                  >
                    <v-icon :color="$background" title="تصفير المادة"
                      >mdi-numeric-0-box-multiple-outline</v-icon
                    >
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    @click="
                      emptyQuantityOfItem(
                        invoiceContents.contents.indexOf(item)
                      )
                    "
                  >
                    <v-list-item-title
                      >اضغط هنا لتصفير كمية المادة</v-list-item-title
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
                  .reduce((a, b) => a + b.total, 0)
                  .toLocaleString()
              }}
            </b>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-fab-transition
      v-if="invoice.idInvoice != 0 && invoice.invoiceTypeName == 'بيع'"
    >
      <v-btn
        v-show="selectedItems.length > 0"
        color="red"
        @click="restoreItemsToStore()"
        dark
        rounded
        large
        fixed
        bottom
        left
      >
        استرجاع المواد
      </v-btn>
    </v-fab-transition>
  </div>
</template>

<script>
export default {
  name: "NewInvoice",
  data: () => ({
    permissions: [],
    customers: [],
    manufactures: [],
    sellPrices: [],
    invoiceTypes: [],
    sellTypes: [],
    users: [],
    items: [],
    selectedItems: [],
    discounts: [],
    forceRerender: 0,
    invoice: {
      idInvoice: 0,
      invoiceTypeId: null,
      customerId: null,
      createdAt: null,
      createdBy: null,
      storeId: null,
      notice: null,
      sellPriceId: null,
      deliveryId: null,
      invoiceTypeName: null,
      invoiceFunction: null,
      createdByName: null,
      totalPrice: null,
      totalItems: null,
      items: [],
    },
    invoiceContents: {
      headers: [
        { text: "اسم المادة", value: "itemName" },
        { text: "سعر الوحدة", value: "itemPrice" },
        { text: "الكمية", value: "quantity" },
        { text: "الخصم", value: "discount" },
        { text: "نوع الخصم", value: "discountTypeName" },
        { text: "الاجمالي", value: "total" },
        { text: "الاجراءات", value: "options" },
      ],
      contents: [],
    },
    settings: [],
    settingsFields: {
      daysToRestoreInvoices: "",
    },
    inputFields: {
      itemId: null,
      price: 0,
      quantity: 0,
      discount: 0,
      discountId: null,
      total: 0,
    },
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("invoices")) {
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
    this.$http.get(this.$baseUrl + "manufacture").then((res) => {
      this.manufactures = res.data;
    });
    this.$http.get(this.$baseUrl + "sellprice").then((res) => {
      this.sellPrices = res.data;
    });
    this.$http.get(this.$baseUrl + "invoice/type").then((res) => {
      this.invoiceTypes = res.data;
      if (this.userInfo.roleId == 2) {
        this.invoiceTypes = res.data.filter((e) => e.idInvoiceType == 3);
      }
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
        this.invoice.idInvoice = this.$route.params.id;
        let loading = this.$loading.show();

        this.$http
          .get(this.$baseUrl + "invoice/id/" + this.invoice.idInvoice)
          .then((res) => {
            this.invoice = res.data;
            for (let i = 0; i < this.invoice.items.length; i++) {
              this.invoiceContents.contents.push({
                idInvoiceContent: this.invoice.items[i].idInvoiceContent,
                itemId: this.invoice.items[i].itemId,
                itemName: this.invoice.items[i].itemName,
                itemPrice: this.invoice.items[i].price,
                quantity: this.invoice.items[i].count,
                discount: this.invoice.items[i].discount,
                discountId: this.invoice.items[i].discountTypeId,
                discountTypeName: this.discounts.filter(
                  (discount) =>
                    discount.idDiscount == this.invoice.items[i].discountTypeId
                )[0]?.discountName,
                total: this.invoice.items[i].total,
              });
            }
            this.$http
              .get(this.$baseUrl + "users/userinfo/" + res.data.createdBy)
              .then((result) => {
                setTimeout(() => {
                  this.invoice.sellPriceId = parseInt(result.data.sellPriceId);
                  console.log(this.invoice.sellPriceId);
                  this.forceRerender++;
                }, 200);
              });
          })
          .finally(() => {
            loading.hide();
          });
      } else {
        this.invoice.createdBy = this.userInfo.idUser;
      }
    });
    this.$http.get(this.$baseUrl + "settings").then((res) => {
      this.settings = res.data;
      this.settingsFields.daysToRestoreInvoices = this.getSettingValue(
        "daysToRestoreInvoices"
      );
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
    getSettingValue(variable) {
      return this.settings.filter((setting) => setting.variable == variable)[0]
        .value;
    },
    getTotalPerItem() {
      if (this.inputFields.discount == 0) {
        this.inputFields.total =
          this.inputFields.price * Number(this.inputFields.quantity);
      } else {
        this.inputFields.total =
          this.inputFields.price *
          Number(this.inputFields.quantity) *
          (this.inputFields.discount / 100);
      }
      this.forceRerender++;
    },
    getPriceForItem(itemId) {
      let item = this.items.filter((item) => item.idItem == itemId)[0];
      let prices = item.prices;
      let price = prices.filter(
        (price) => price.sellPriceId == this.invoice.sellPriceId
      );
      if (price[0]?.price == undefined) {
        this.$toast.open({
          type: "warning",
          message: "يرجى اختيار فئة الفاتورة",
          duration: 3000,
        });
        this.inputFields.itemId = null;
        this.forceRerender++;
      } else {
        this.inputFields.price = price[0]?.price;
      }
    },
    addItemToInvoice() {
      this.invoiceContents.contents.push({
        itemId: this.inputFields.itemId,
        itemName: this.items.filter(
          (item) => item.idItem == this.inputFields.itemId
        )[0].fullItemName,
        itemPrice: this.inputFields.price,
        quantity: this.inputFields.quantity,
        discount: this.inputFields.discount,
        discountId: this.inputFields.discountId,
        discountTypeName: this.discounts.filter(
          (discount) => discount.idDiscount == this.inputFields.discountId
        )[0]?.discountName,
        total: this.inputFields.total,
      });
      if (this.invoice.idInvoice != 0) {
        let loading = this.$loading.show();
        this.$http
          .post(this.$baseUrl + "invoice/addItemToInvoice", {
            invoiceId: this.invoice.idInvoice,
            itemId: this.inputFields.itemId,
            count: this.inputFields.quantity,
            discount: this.inputFields.discount,
            discountTypeId: this.inputFields.discountId,
            price: this.inputFields.price,
            total: this.inputFields.total,
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
      this.invoice.idInvoice == 0 ? this.create() : this.update();
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
          itemId: this.invoiceContents.contents[i].itemId,
          count: this.invoiceContents.contents[i].quantity,
          discount: this.invoiceContents.contents[i].discount,
          discountTypeId: this.invoiceContents.contents[i].discountId,
          price: this.invoiceContents.contents[i].itemPrice,
          total: this.invoiceContents.contents[i].total,
        });
      }
      let loading = this.$loading.show();

      let invoiceValues = {
        invoiceTypeId: this.invoice.invoiceTypeId,
        customerId: this.invoice.customerId,
        createdBy: this.invoice.createdBy,
        storeId: 1,
        notice: this.invoice.notice,
        sellPriceId: this.invoice.sellPriceId,
        sellTypeId: this.invoice.sellTypeId,
        deliveryId: 0,
      };
      if (this.invoice.invoiceTypeId == 3) {
        invoiceValues.createdAt = this.invoice.creationFixedDate;
      }
      this.$http
        .post(this.$baseUrl + "invoice/new", {
          invoice: invoiceValues,
          invoiceContents: items,
        })
        .then((res) => {
          this.invoice.idInvoice = res.data.insertId;
          this.$toast.open({
            type: "success",
            message: "تم اضافة الفاتورة بنجاح",
            duration: 3000,
          });
          this.$router.push("/invoice/" + this.invoice.idInvoice);
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
        .put(this.$baseUrl + "invoice/edit/" + this.invoice.idInvoice, {
          invoice: {
            invoiceTypeId: this.invoice.invoiceTypeId,
            customerId: this.invoice.customerId,
            createdBy: this.invoice.createdBy,
            storeId: 1,
            notice: this.invoice.notice,
            sellPriceId: this.invoice.sellPriceId,
            sellTypeId: this.invoice.sellTypeId,
            deliveryId: 0,
          },
        })
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
        .delete(this.$baseUrl + "invoice/delete/" + this.invoice.idInvoice)
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
      if (
        this.invoice.customerId == null ||
        this.invoice.sellPriceId == null ||
        this.invoice.sellTypeId == null ||
        this.invoice.createdBy == null ||
        this.invoice.invoiceTypeId == null
      ) {
        console.log(this.invoice);
        return false;
      } else {
        return true;
      }
    },
    deleteItemFromInvoice(index) {
      if (this.invoice.idInvoice != 0) {
        let item = this.invoice.items[index];
        let loading = this.$loading.show();
        this.$http
          .delete(this.$baseUrl + "invoice/item/" + item.idInvoiceContent)
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
    emptyQuantityOfItem(index) {
      if (this.invoice.idInvoice != 0) {
        let item = this.invoice.items[index];
        let loading = this.$loading.show();
        this.$http
          .put(
            this.$baseUrl +
              "invoice/emptyQuntityOfItem/" +
              item.idInvoiceContent,
            {
              count: 0,
              discount: 0,
              discountTypeId: 0,
              price: 0,
              total: 0,
            }
          )
          .then((res) => {
            this.$toast.open({
              type: "warning",
              message: "تم تصفير المادة",
              duration: 3000,
            });
            console.log(res);
          })
          .finally(() => {
            loading.hide();
          });
      }
      this.invoiceContents.contents[index].quantity = 0;
      this.invoiceContents.contents[index].itemPrice = 0;
      this.invoiceContents.contents[index].total = 0;
      this.invoiceContents.contents[index].discount = 0;
      this.invoiceContents.contents[index].discountId = 0;
    },
    restoreItemsToStore() {
      console.log(this.selectedItems);
      let items = [];
      for (let i = 0; i < this.selectedItems.length; i++) {
        items.push({
          itemId: this.selectedItems[i].itemId,
          count: this.selectedItems[i].quantity,
          discount: this.selectedItems[i].discount,
          discountTypeId: this.selectedItems[i].discountId,
          price: this.selectedItems[i].itemPrice,
          total: this.selectedItems[i].total,
        });
      }
      let loading = this.$loading.show();
      this.$http
        .post(this.$baseUrl + "invoice/new", {
          invoice: {
            invoiceTypeId: 3,
            customerId: this.invoice.customerId,
            createdBy: this.invoice.createdBy,
            storeId: 1,
            notice: this.invoice.notice,
            sellPriceId: this.invoice.sellPriceId,
            sellTypeId: this.invoice.sellTypeId,
            deliveryId: 0,
          },
          invoiceContents: items,
        })
        .then((res) => {
          this.invoice.idInvoice = res.data.insertId;
          this.$toast.open({
            type: "success",
            message: "تم استرجاع المواد بنجاح",
            duration: 3000,
          });
          let indexHistory = [];
          for (var i = 0; i < this.selectedItems.length; i++) {
            this.deleteItemFromInvoice(
              this.invoiceContents.contents.findIndex(
                (e) =>
                  e.idInvoiceContent == this.selectedItems[i].idInvoiceContent
              )
            );
            indexHistory.push(i);
          }
          for (i = 0; i < indexHistory.length; i++) {
            this.selectedItems.splice(indexHistory, 1);
          }
          // this.$router.push("/invoice/" + this.invoice.idInvoice);
        })
        .finally(() => {
          loading.hide();
        });
    },
    calculateDate() {
      let selectedDate = new Date(this.invoice.creationFixedDate);
      let date = new Date(
        Date.now() -
          parseInt(this.settingsFields.daysToRestoreInvoices) *
            24 *
            60 *
            60 *
            1000
      );
      console.log("CURRENT: " + selectedDate.getTime());
      console.log("DATE: " + date.getTime());
      if (selectedDate.getTime() < date.getTime()) {
        this.invoice.creationFixedDate = null;
        this.$toast.open({
          type: "error",
          message: "التاريخ لا يمكن ان يكون قبل 3 ايام",
          duration: 3000,
        });
      }
    },
    setDelegate() {
      if (this.invoice.idInvoice == 0) {
        this.invoice.createdBy = this.customers.filter(
          (e) => e.idCustomer == this.invoice.customerId
        )[0].createdBy;
      }
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