<template>
  <div id="itemPage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title v-if="item != null">{{ item.itemName }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn @click="save()" icon>
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </v-app-bar>

    <v-card v-if="item != null" class="pa-10" no-elevation>
      <v-row>
        <v-col cols="6">
          <v-text-field
            label="رمز المادة"
            outlined
            hide-details
            notdense
            v-model="item.itemCode"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            label="باركود"
            outlined
            hide-details
            notdense
            v-model="item.itemBarcode"
            type="number"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-text-field
            label="نوع المنتج داخل العلبة"
            outlined
            hide-details
            notdense
            v-model="item.itemType"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-text-field
            label="نوع شكل العلبة"
            outlined
            hide-details
            notdense
            v-model="item.itemName"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-text-field
            label="وزن العلبة"
            type="number"
            outlined
            hide-details
            notdense
            v-model="item.itemWeight"
          ></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-autocomplete
            outlined
            hide-details
            notdense
            :items="itemWeightSuffixes"
            v-model="item.itemWeightSuffix"
          ></v-autocomplete>
        </v-col>
        <v-col cols="2">
          <v-text-field
            label="عدد القطع في الكارتون"
            type="number"
            outlined
            hide-details
            notdense
            v-model="item.cartonQauntity"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-autocomplete
            v-model="item.brandId"
            :items="brands"
            outlined
            hide-details
            notdense
            label="الماركة"
            item-text="brandName"
            item-value="idBrand"
          ></v-autocomplete>
        </v-col>
        <v-col cols="4">
          <v-autocomplete
            v-model="item.itemGroupId"
            :items="groups"
            outlined
            hide-details
            notdense
            label="المجموعة"
            item-text="itemGroupName"
            item-value="idItemGroup"
          ></v-autocomplete>
        </v-col>
        <v-col cols="4">
          <v-autocomplete
            v-model="item.manufactureId"
            :items="manufactures"
            outlined
            hide-details
            notdense
            label="الشركة الموردة"
            item-text="customerName"
            item-value="idCustomer"
          ></v-autocomplete>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="عرض الكارتون"
            type="number"
            outlined
            hide-details
            notdense
            v-model="item.cartonWidth"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="ارتفاع الكارتون"
            type="number"
            outlined
            hide-details
            notdense
            v-model="item.cartonHeight"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="طول الكارتون"
            type="number"
            outlined
            hide-details
            notdense
            v-model="item.cartonLength"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="عدد ايام صلاحية المادة"
            type="number"
            outlined
            hide-details
            notdense
            v-model="item.expireAge"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="الحد الادنى للتنبيه"
            type="number"
            hint="العدد بالكراتين"
            outlined
            notdense
            v-model="item.minimumStoreNotify"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="الحد الاعلى للتنبيه"
            type="number"
            hint="العدد بالكراتين"
            outlined
            notdense
            v-model="item.maximumStoreNotify"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-switch
            v-model="item.isAvailable"
            label="متاح للبيع"
            inset
          ></v-switch>
        </v-col>
        <v-col cols="2">
          <v-btn onclick="document.getElementById('filepicker').click()" block>
            <v-icon> mdi-cloud-outline </v-icon>
            &nbsp;&nbsp; تعديل صورة المادة
          </v-btn>
          <input
            id="filepicker"
            style="display: none"
            type="file"
            name="uploads"
            @change="selectFiles($event)"
            accept="image/png, image/gif, image/jpeg"
          />
          <img
            v-if="item.imagePath != null"
            :src="$baseUrl + 'files/' + item.imagePath"
            width="100%"
            id="imagePath"
          />
          <img
            v-if="item.imagePath == null"
            src="@/assets/no_image_placeholder.png"
            width="100%"
            id="imagePath"
          />
        </v-col>
        <v-col cols="12">
          <template v-if="this.checkPermission('item_add_offer')">
            <v-btn
              v-if="offer == null"
              color="primary"
              @click="addNewOfferDialog = true"
            >
              <v-dialog v-model="addNewOfferDialog" width="400">
                <v-card>
                  <v-card-text>
                    <br /><br />
                    <v-text-field
                      type="number"
                      outlined
                      label="كمية العرض"
                      v-model="offerQty"
                    ></v-text-field>
                    <v-text-field
                      type="number"
                      outlined
                      label="كمية البيع"
                      v-model="offerCondition"
                    ></v-text-field>
                    <v-text-field
                      type="number"
                      outlined
                      label="الحد الادنى"
                      v-model="offerMinimum"
                    ></v-text-field>
                    <v-btn block color="primary" @click="addOffer()">
                      اضافة
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-dialog>
              اضافة عرض تلقائي
            </v-btn>
          </template>
          <v-card v-if="offer != null">
            <v-card-text>
              <span>
                سيتم اضافة
                <v-chip small outlined color="error">{{ offer.count }}</v-chip>
                كارتون عرض تلقائي لكل
                <v-chip small outlined color="primary">{{
                  offer.conditionCount
                }}</v-chip>
                كارتون بيع
              </span>
              <br />
              <span
                >الحد الادنى لتفعيل العرض
                <v-chip small outlined color="success">{{
                  offer.minimumCount
                }}</v-chip>
                كارتون</span
              >
              <br />
              <br />
              <v-btn
                v-if="this.checkPermission('item_add_offer')"
                color="error"
                @click="deleteOffer()"
                >حذف العرض التلقائي</v-btn
              >
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card class="pa-5">
            <v-data-table
              :headers="pricesHeader"
              :items="item.prices"
              :items-per-page="100"
            >
              <template v-slot:top>
                <v-menu offset-y>
                  <template v-slot:activator="{ attrs, on }">
                    <v-btn color="primary" v-bind="attrs" v-on="on">
                      اضافة سعر جديد
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-item
                      v-for="sellPrice in sellPrices"
                      :key="sellPrice.idSellPrice"
                      link
                      @click="addNewSellPrice(sellPrice.idSellPrice)"
                    >
                      <v-list-item-title
                        v-text="sellPrice.sellPriceName"
                      ></v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <template v-slot:[`item.price`]="{ item }">
                <v-text-field
                  @change="updatePrice(item.idItemPrice, $event)"
                  :value="item.price"
                  type="number"
                  outlined
                  dense
                  hide-details
                ></v-text-field>
              </template>

              <template v-slot:[`item.delegateTarget`]="{ item }">
                <v-text-field
                  @change="updateDelegateTarget(item.idItemPrice, $event)"
                  :value="item.delegateTarget"
                  type="number"
                  outlined
                  dense
                  hide-details
                ></v-text-field>
              </template>

              <template v-slot:[`item.damagedItemPrice`]="{ item }">
                <v-text-field
                  @change="updateDamagedItemPrice(item.idItemPrice, $event)"
                  :value="item.damagedItemPrice"
                  type="number"
                  outlined
                  dense
                  hide-details
                ></v-text-field>
              </template>

              <template v-slot:[`item.itemDescription`]="{ item }">
                <v-text-field
                  outlined
                  @change="updateItemDescription(item.idItemPrice, $event)"
                  :value="item.itemDescription"
                  dense
                  hide-details
                ></v-text-field>
              </template>

              <template v-slot:[`item.actions`]="{ item }">
                <v-menu offset-y>
                  <template v-bind="item" v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" icon>
                      <v-icon color="red" title="حذف السعر"
                        >mdi-delete-outline</v-icon
                      >
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="deletePrice(item.idItemPrice)">
                      <v-list-item-title
                        >اضغط هنا لتأكيد حذف السعر</v-list-item-title
                      >
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card class="pa-5">
            <v-card class="pa-2" color="warning">
              اخفاء المادة عن مندوب
            </v-card>
            <br />
            <v-row>
              <v-col>
                <v-autocomplete
                  :items="users.filter((e) => e.roleId == 3 || e.roleId == 4)"
                  item-text="username"
                  item-value="idUser"
                  outlined
                  v-model="hideForm.userId"
                  label="اختيار مندوب او مشرف"
                  dense
                ></v-autocomplete>
              </v-col>
              <v-col cols="3">
                <v-btn @click="hideItem()" color="success">اخفاء</v-btn>
              </v-col>
            </v-row>
            <v-simple-table>
              <thead>
                <tr>
                  <th>اسم المندوب</th>
                  <th>الاجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="hide in hidden" :key="hide.idItemHide">
                  <td>
                    {{
                      users.filter((e) => e.idUser == hide.userId)[0].username
                    }}
                  </td>
                  <td>
                    <v-btn
                      @click="showItem(hide.idItemHide)"
                      plain
                      color="success"
                      ><v-icon>mdi-eye</v-icon>اظهار المادة</v-btn
                    >
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "Item",
  data: () => ({
    groups: [],
    brands: [],
    users: [],
    hidden: [],
    hideForm: {
      userId: null,
    },
    permissions: [],
    sellPrices: [],
    itemTypes: [],
    offer: null,
    offerQty: null,
    offerCondition: null,
    offerMinimum: null,
    manufactures: [],
    itemId: 0,
    item: null,
    image: null,
    addNewOfferDialog: false,
    pricesHeader: [
      { text: "السعر", value: "sellPriceName" },
      { text: "المبلغ", value: "price" },
      { text: "الهدف اليومي للمندوب", value: "delegateTarget" },
      { text: "سعر القطعة التالفة", value: "damagedItemPrice" },
      { text: "وصف المادة", value: "itemDescription", width: "50%" },
      { text: "الاجراءات", value: "actions" },
    ],
    itemWeightSuffixes: ["غرام", "كيلو", "ملي", "لتر"],
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("items_edit")) {
        this.$toast.open({
          type: "error",
          message: "غير مصرح لك بمشاهدة هذه الصفحة",
          duration: 3000,
        });
        this.$router.go(-1);
      }
    });
    // LOAD PERMS END
    this.fetch();
  },
  methods: {
    getHidden() {
      this.$http
        .get(this.$baseUrl + "item/hide/" + this.itemId)
        .then((res) => {
          this.hidden = res.data;
        })
        .finally(() => {});
    },
    hideItem() {
      if (this.hideForm.userId == null) {
        return;
      }
      let loading = this.$loading.show();
      this.$http
        .post(this.$baseUrl + "item/hide", {
          userId: this.hideForm.userId,
          itemId: this.itemId,
        })
        .then(() => {
          this.$toast.open({
            type: "success",
            message: "تم اخفاء المادة عن المندوب",
            duration: 3000,
          });
          this.getHidden();
        })
        .catch(() => {
          this.$toast.open({
            type: "error",
            message: "هذا المندوب تم اختياره من قبل",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    fetch() {
      this.itemId = this.$route.params.id;
      this.getHidden();
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "itemgroup")
        .then((res) => {
          this.groups = res.data;
          this.$http
            .get(this.$baseUrl + "item/" + this.itemId)
            .then((res) => {
              this.item = res.data;
            })
            .finally(() => {
              loading.hide();
            });
        })
        .finally(() => {});
      this.$http
        .get(this.$baseUrl + "sellprice")
        .then((res) => {
          this.sellPrices = res.data;
        })
        .finally(() => {});
      this.$http
        .get(this.$baseUrl + "users")
        .then((res) => {
          this.users = res.data;
        })
        .finally(() => {});
      this.$http
        .get(this.$baseUrl + "brands")
        .then((res) => {
          this.brands = res.data;
        })
        .finally(() => {});
      this.$http
        .get(this.$baseUrl + "itemType")
        .then((res) => {
          this.itemTypes = res.data;
        })
        .finally(() => {});
      this.$http
        .get(this.$baseUrl + "manufacture")
        .then((res) => {
          this.manufactures = res.data;
        })
        .finally(() => {});
      this.$http
        .get(this.$baseUrl + "item/offer/" + this.itemId)
        .then((res) => {
          this.offer = res.data;
        })
        .finally(() => {});
    },
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
    updatePrice(id, value) {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "item/updatePrice/" + id, { price: value })
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "success",
            message: "تم تعديل السعر بنجاح",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    updateDelegateTarget(id, value) {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "item/updatePrice/" + id, {
          delegateTarget: value,
        })
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "success",
            message: "تم تعديل هدف المندوب",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    updateItemDescription(id, value) {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "item/updatePrice/" + id, {
          itemDescription: value,
        })
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "success",
            message: "تم تعديل وصف المادة لهذا السعر",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    updateDamagedItemPrice(id, value) {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "item/updatePrice/" + id, {
          damagedItemPrice: value,
        })
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "success",
            message: "تم تعديل سعر القطعة التالفة ",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    deletePrice(id) {
      let loading = this.$loading.show();
      this.$http
        .delete(this.$baseUrl + "item/itemPrice/delete/" + id)
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "warning",
            message: "تم حذف السعر ",
            duration: 3000,
          });
          this.fetch();
        })
        .finally(() => loading.hide());
    },
    selectFiles(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      for (let i = 0; i < files.length; i++) {
        this.image = files[i];
      }
      let loading = this.$loading.show();
      let formData = new FormData();
      formData.append("itemImage", this.image);
      this.$http
        .put(this.$baseUrl + "item/updateImage/" + this.itemId, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "success",
            message: " تم تغيير الصورة",
            duration: 3000,
          });
          document
            .getElementById("imagePath")
            .setAttribute("src", URL.createObjectURL(this.image));
        })
        .finally(() => loading.hide());
    },
    save() {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "item/edit/" + this.itemId, {
          itemName: this.item.itemName,
          itemCode: this.item.itemCode,
          itemBarcode: this.item.itemBarcode,
          itemGroupId: this.item.itemGroupId,
          itemDescription: this.item.itemDescription,
          isAvailable: this.item.isAvailable,
          manufactureId: this.item.manufactureId,
          itemTypeId: 1,
          itemType: this.item.itemType,
          cartonWidth: this.item.cartonWidth,
          cartonHeight: this.item.cartonHeight,
          cartonLength: this.item.cartonLength,
          cartonQauntity: this.item.cartonQauntity,
          expireAge: this.item.expireAge,
          maximumStoreNotify: this.item.maximumStoreNotify,
          minimumStoreNotify: this.item.minimumStoreNotify,
          itemWeight: this.item.itemWeight,
          itemWeightSuffix: this.item.itemWeightSuffix,
          brandId: this.item.brandId,
        })
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "success",
            message: " تم تحديث معلومات المادة بنجاح",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    addNewSellPrice(id) {
      let loading = this.$loading.show();
      this.$http
        .post(this.$baseUrl + "item/itemPrice/new", {
          itemId: this.itemId,
          sellPriceId: id,
          price: 0,
          delegateTarget: 0,
        })
        .then(() => {
          this.fetch();
        })
        .catch(() => {
          this.$toast.open({
            type: "error",
            message: " سعر المادة موجود مسبقاً",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    addOffer() {
      if (
        this.offerQty == null ||
        this.offerCondition == null ||
        this.offerMinimum == null
      ) {
        this.$toast.open({
          type: "error",
          message: " يرجى ملئ الحقول",
          duration: 3000,
        });
        return;
      }
      let loading = this.$loading.show();
      this.$http
        .post(this.$baseUrl + "item/offer", {
          itemId: this.itemId,
          count: this.offerQty,
          conditionCount: this.offerCondition,
          minimumCount: this.offerMinimum,
        })
        .finally(() => {
          loading.hide();
          this.offerQty = null;
          this.addNewOfferDialog = false;
          this.fetch();
        });
    },
    deleteOffer() {
      let loading = this.$loading.show();
      this.$http
        .delete(this.$baseUrl + "item/offer/" + this.itemId)
        .then(() => {
          loading.hide();
          this.offer = null;
        });
    },
    showItem(id) {
      let loading = this.$loading.show();
      this.$http.delete(this.$baseUrl + "item/hide/delete/" + id).then(() => {
        loading.hide();
        this.getHidden();
      });
    },
  },
};
</script>

<style>
</style>