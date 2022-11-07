<template>
  <div class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>المواد</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        v-if="checkPermission('items_add')"
        @click="newItemDialog = true"
        icon
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-app-bar>
    <br />
    <v-card class="pa-10">
      <v-row>
        <v-col>
          <v-autocomplete
            v-model="selectedGroup"
            item-text="itemGroupName"
            item-value="idItemGroup"
            :items="groups"
            outlined
            label="فرز حسب المجموعات"
            clearable
          ></v-autocomplete>
        </v-col>
        <v-col>
          <v-autocomplete
            v-model="selectedBrand"
            item-text="brandName"
            item-value="idBrand"
            :items="brands"
            outlined
            label="فرز حسب المورد"
            clearable
            @change="searchBrand"
          ></v-autocomplete>
        </v-col>
        <v-col>
          <v-autocomplete
            v-model="itemNameSearch"
            item-text="fullItemName"
            item-value="idItem"
            :items="allItems"
            outlined
            label="فرز حسب اسم المادة"
            clearable
            @change="searchItemName"
          ></v-autocomplete>
        </v-col>
      </v-row>
    </v-card>
    <div
      v-for="group in selectedGroup == null
        ? groups
        : groups.filter((e) => e.idItemGroup == selectedGroup)"
      :key="group.idItemGroup"
    >
      <h3>{{ group.itemGroupName }}</h3>
      <br />
      <v-row>
        <v-col
          cols="3"
          v-for="item in items.filter(
            (item) => item.itemGroupId == group.idItemGroup
          )"
          :key="item.idItem"
        >
          <v-card elevation="6">
            <v-img
              v-if="item.imagePath != null"
              height="200"
              :src="$baseUrl + 'files/' + item.imagePath"
            ></v-img>
            <img
              v-if="item.imagePath == null"
              src="@/assets/no_image_placeholder.png"
              height="250"
              width="100%"
            />
            <div class="itemNotAvailible" v-if="item.isAvailable == 0">
              <br />
              <i style="font-size: 40px" class="las la-eye-slash"></i>
              <br />
              غير متاح
            </div>
            <div style="height: 30px" class="pa-2">
              {{ item.fullItemName }}
            </div>

            <v-card-text
              v-if="item.prices[0] != null"
              class="textOverFlow green--text headline"
            >
              {{ (item.prices[0].price || 0).toLocaleString() }} د.ع
            </v-card-text>
            <v-card-actions>
              <v-btn
                :disabled="!checkPermission('items_edit')"
                icon
                target="_BLANK"
                :to="'/item/' + item.idItem"
              >
                <v-icon :title="item.itemName">mdi-magnify</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    :disabled="!checkPermission('items_delete')"
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
                  <v-list-item @click="deleteItem(item.idItem)">
                    <v-list-item-title
                      >اضغط هنا لتأكيد حذف المادة</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <br /><br />
    </div>

    <v-dialog v-model="newItemDialog" persistent width="700">
      <v-card>
        <v-toolbar :color="$background" dark>اضافة مادة جديدة</v-toolbar>
        <br /><br /><br />
        <v-card-text>
          <v-row justify="center" align="center">
            <v-col cols="6">
              <v-text-field
                label="رمز المادة"
                v-model="newItem.itemCode"
                outlined
                hide-details
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="باركود"
                type="number"
                v-model="newItem.itemBarcode"
                outlined
                hide-details
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="نوع المنتج داخل العلبة"
                type="text"
                v-model="newItem.itemType"
                outlined
                hide-details
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="نوع شكل العلبة"
                v-model="newItem.itemName"
                outlined
                hide-details
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field
                label="وزن العلبة"
                type="number"
                outlined
                hide-details
                dense
                v-model="newItem.itemWeight"
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-autocomplete
                outlined
                hide-details
                dense
                :items="itemWeightSuffixes"
                v-model="newItem.itemWeightSuffix"
              ></v-autocomplete>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="عدد القطع في الكارتون"
                type="number"
                outlined
                hide-details
                dense
                v-model="newItem.cartonQauntity"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-select
                :items="brands"
                label="الماركة"
                v-model="newItem.brandId"
                item-text="brandName"
                item-value="idBrand"
                outlined
                hide-details
                dense
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                :items="groups"
                label="المجموعة"
                v-model="newItem.itemGroup"
                item-text="itemGroupName"
                item-value="idItemGroup"
                outlined
                hide-details
                dense
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-autocomplete
                v-model="newItem.manufactureId"
                :items="manufactures"
                outlined
                hide-details
                dense
                label="الشركة الموردة"
                item-text="customerName"
                item-value="idCustomer"
              ></v-autocomplete>
            </v-col>

            <v-col cols="4">
              <v-text-field
                label="عرض الكارتون"
                type="number"
                outlined
                hide-details
                dense
                v-model="newItem.cartonWidth"
              ></v-text-field>
            </v-col>

            <v-col cols="4">
              <v-text-field
                label="ارتفاع الكارتون"
                type="number"
                outlined
                hide-details
                dense
                v-model="newItem.cartonHeight"
              ></v-text-field>
            </v-col>

            <v-col cols="4">
              <v-text-field
                label="طول الكارتون"
                type="number"
                outlined
                hide-details
                dense
                v-model="newItem.cartonLength"
              ></v-text-field>
            </v-col>

            <v-col cols="4">
              <v-text-field
                label="عدد ايام صلاحية المادة"
                type="number"
                outlined
                hide-details
                dense
                v-model="newItem.expireAge"
              ></v-text-field>
            </v-col>

            <v-col cols="4">
              <v-text-field
                label="الحد الادنى للتنبيه"
                type="number"
                hint="العدد بالكراتين"
                outlined
                hide-details
                dense
                v-model="newItem.minimumStoreNotify"
              ></v-text-field>
            </v-col>

            <v-col cols="4">
              <v-text-field
                label="الحد الاعلى للتنبيه"
                type="number"
                hint="العدد بالكراتين"
                outlined
                hide-details
                dense
                v-model="newItem.maximumStoreNotify"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <h3>اضافة سعر</h3>
              <br />
              <v-row>
                <v-col>
                  <v-select
                    :items="sellPrices"
                    label="سعر البيع"
                    item-text="sellPriceName"
                    item-value="idSellPrice"
                    outlined
                    hide-details
                    dense
                    v-model="newItem.sellPriceId"
                  ></v-select>
                </v-col>
                <v-col>
                  <v-text-field
                    dense
                    label="المبلغ"
                    type="number"
                    hide-details
                    outlined
                    v-model="newItem.sellPriceAmount"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-btn @click="addNewSellPrice()"> اضافة سعر </v-btn>
                </v-col>
                <v-col cols="12" v-if="newItemSellPrices.length > 0">
                  <table
                    class="pricesTable"
                    width="100%"
                    border="1"
                    cellspacing="0"
                  >
                    <thead>
                      <tr>
                        <th>نوع البيع</th>
                        <th>السعر</th>
                        <th>الاجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(price, index) in newItemSellPrices"
                        :key="price.sellPriceId"
                      >
                        <td>{{ price.sellPriceName }}</td>
                        <td>{{ price.price }}</td>
                        <td>
                          <v-btn icon @click="deletePrice(index)">
                            <v-icon color="red"> mdi-delete-outline </v-icon>
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <br />
              <v-btn onclick="document.getElementById('filepicker').click()">
                <i style="font-size: 30px" class="las la-cloud-upload-alt"></i>
                &nbsp; &nbsp; اضافة صورة المادة
              </v-btn>
              <input
                id="filepicker"
                style="display: none"
                type="file"
                name="uploads"
                @change="selectFiles($event)"
                accept="image/png, image/gif, image/jpeg"
              />
              <br />
              <img
                v-if="newItem.image != null"
                class="imagePreview"
                :src="imagePreview(newItem.image)"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn dark :color="$background" @click="addNewItem()">
            اضافة المادة
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn dark outlined :color="'red'" @click="newItemDialog = false">
            اغلاق
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "Items",
  data: () => ({
    permissions: [],
    items: [],
    allItems: [],
    groups: [],
    allGroups: [],
    selectedGroup: null,
    selectedBrand: null,
    itemNameSearch: null,
    sellPrices: [],
    manufactures: [],
    brands: [],
    itemWeightSuffixes: ["غرام", "كيلو", "ملي", "لتر"],
    newItemSellPrices: [],
    newItemDialog: false,
    newItem: {
      itemName: "",
      itemCode: "",
      itemBarcode: "",
      itemGroup: null,
      itemDescription: "",
      sellPriceAmount: 0,
      sellPriceId: null,
      image: null,
      manufactureId: null,
      itemType: null,
      itemTypeId: 1,
      cartonWidth: null,
      cartonHeight: null,
      cartonLength: null,
      cartonQauntity: null,
      expireAge: null,
      maximumStoreNotify: null,
      minimumStoreNotify: null,
      itemWeight: null,
      itemWeightSuffix: null,
      brandId: null,
    },
  }),
  created: function () {
    this.fetch();
  },
  methods: {
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
    fetch() {
      // LOAD PERMS START
      this.auth().then((res) => {
        this.permissions = res.permissions;
        // CHECK IF CAN SEE THIS PAGE
        if (!this.checkPermission("items")) {
          this.$toast.open({
            type: "error",
            message: "غير مصرح لك بمشاهدة هذه الصفحة",
            duration: 3000,
          });
          this.$router.go(-1);
        }
      });
      // LOAD PERMS END
      let loading = this.$loading.show();
      this.$http.get(this.$baseUrl + "itemgroup").then((res) => {
        this.groups = res.data;
        this.allGroups = res.data;
        this.$http
          .get(this.$baseUrl + "item")
          .then((res) => {
            this.items = res.data;
            this.allItems = res.data;
            console.log(this.items);
          })
          .finally(() => {
            loading.hide();
          });
      });
      this.$http.get(this.$baseUrl + "sellprice").then((res) => {
        this.sellPrices = res.data;
      });
      this.$http
        .get(this.$baseUrl + "manufacture")
        .then((res) => {
          this.manufactures = res.data;
        })
        .finally(() => {});
      this.$http
        .get(this.$baseUrl + "brands")
        .then((res) => {
          this.brands = res.data;
        })
        .finally(() => {});
    },
    addNewSellPrice() {
      if (this.newItem.sellPriceId != null) {
        if (
          this.newItemSellPrices.filter(
            (check) => check.sellPriceId == this.newItem.sellPriceId
          ).length > 0
        ) {
          this.$toast.open({
            type: "error",
            message: "لقد قمت بتحديد نوع السعر مسبقاً",
            duration: 3000,
          });
        } else {
          this.newItemSellPrices.push({
            sellPriceId: this.newItem.sellPriceId,
            sellPriceName: this.sellPrices.filter(
              (sellPrices) => sellPrices.idSellPrice == this.newItem.sellPriceId
            )[0].sellPriceName,
            price: this.newItem.sellPriceAmount,
          });
        }
      }
    },
    deletePrice(index) {
      this.newItemSellPrices.splice(index, 1);
    },
    selectFiles(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      for (let i = 0; i < files.length; i++) {
        this.newItem.image = files[i];
      }
      console.log(this.newItem.image);
    },
    imagePreview(image) {
      return URL.createObjectURL(image);
    },
    addNewItem() {
      if (
        this.newItem.itemName.length == 0 ||
        this.newItem.itemCode.length == 0 ||
        this.newItem.itemBarcode.length == 0 ||
        this.newItem.itemGroup == null ||
        this.newItemSellPrices.length == 0
      ) {
        this.$toast.open({
          type: "error",
          message: "يرجى ملئ جميع الحقول",
          duration: 3000,
        });
      } else {
        let loading = this.$loading.show();
        let formData = new FormData();
        formData.append("itemInfo", JSON.stringify(this.newItem));
        formData.append("itemPrices", JSON.stringify(this.newItemSellPrices));
        formData.append("itemImage", this.newItem.image);
        this.$http
          .post(this.$baseUrl + "item/new", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            this.$toast.open({
              type: "success",
              message: "تم اضافة المادة بنجاح",
              duration: 3000,
            });
            this.fetch(res);
            (this.newItemSellPrices = []),
              (this.newItem = {
                itemName: "",
                itemCode: "",
                itemBarcode: "",
                itemGroup: null,
                itemDescription: "",
                sellPriceAmount: 0,
                sellPriceId: null,
                image: null,
                manufactureId: null,
                itemType: null,
                itemTypeId: 1,
                cartonWidth: null,
                cartonHeight: null,
                cartonLength: null,
                cartonQauntity: null,
                expireAge: null,
                maximumStoreNotify: null,
                minimumStoreNotify: null,
                itemWeight: null,
                itemWeightSuffix: null,
                brandId: null,
              });
          })
          .finally(() => {
            loading.hide();
          });
      }
    },
    deleteItem(id) {
      let loading = this.$loading.show();
      this.$http
        .delete(this.$baseUrl + "item/delete/" + id)
        .finally(() => {
          loading.hide();
        })
        .then(() => {
          this.$toast.open({
            type: "warning",
            message: "تم حذف المادة بنجاح",
            duration: 3000,
          });
          this.fetch();
        });
    },
    searchBrand() {
      this.selectedGroup = null;
      if (this.selectedBrand == null) {
        this.items = this.allItems;
      } else {
        this.items = this.allItems.filter(
          (e) => e.brandId == this.selectedBrand
        );
      }
    },
    searchItemName() {
      this.$router.push("/item/" + this.itemNameSearch);
    },
  },
};
</script>

<style>
.pricesTable td {
  padding: 5px;
  text-align: center;
}
.imagePreview {
  height: 150px;
  border-radius: 20px;
  box-shadow: 0px 0px 25px 0px #0000003a;
  margin: 10px;
}
.itemNotAvailible {
  height: 250px;
  width: 100%;
  position: absolute;
  background: #000000a1;
  top: 0px;
  text-align: center;
  padding: 40px;
  font-size: 20px;
  color: white;
  border-radius: 10px 10px 0px 0px;
}
</style>