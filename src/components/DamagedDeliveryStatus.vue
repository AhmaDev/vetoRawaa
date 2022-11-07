<template>
  <div
    ref="print"
    v-if="deliveryStatus != null"
    id="deliveryStatus"
    class="pa-10"
  >
    <v-sheet class="pa-10 sheet" elevation="2">
      <div v-if="appData != null" class="pa-10">
        <center>
          <h2>
            كشف توزيع تالف
            {{ appData.filter((e) => e.variable == "title")[0].value }}
          </h2>
        </center>
      </div>
      <table border="1" cellspacing="0" width="100%" class="table" dir="rtl">
        <tr>
          <td>رقم التوزيع: {{ deliveryStatus.counter }}</td>
          <td>اسم الموزع: {{ deliveryStatus.deliveryName }}</td>
          <td>
            تاريخ التجهيز: {{ deliveryDate(deliveryStatus.creationFixedDate) }}
          </td>
          <td>تاريخ طبع الكشف: {{ currentDay() }}</td>
          <td>
            تاريخ الفواتير: {{ fixedDate(deliveryStatus.creationFixedDate) }}
          </td>
          <td>طابع الكشف:</td>
        </tr>
      </table>
      <table class="table" border="1" cellspacing="0" width="100%" dir="rtl">
        <thead>
          <td width="40">#{{ deliveryStatus.counter }}</td>
          <th>اسم المادة</th>
          <th>عدد النقص</th>
          <th>مبلغ النقص</th>
          <th>العدد</th>
          <th>السعر</th>
          <th>الاجمالي</th>
          <th>عدد الزيادة</th>
          <th>اجمالي الزيادة</th>
        </thead>
        <template v-for="(item, i) in deliveryStatus.invoicesData">
          <tr
            :style="
              item.total == 0 ? 'background-color: red; color: white' : ''
            "
            :key="i"
          >
            <td colspan="2">{{ getItemName(item.itemId) }}</td>
            <td></td>
            <td></td>
            <td>{{ item.count }}</td>
            <td v-if="item.discountTypeId > 0">
              {{ getDiscountName(item.discountTypeId) }}
            </td>
            <td v-else>
              {{ item.total / item.count }}
            </td>
            <td>{{ item.total.toLocaleString() }}</td>
            <td></td>
            <td></td>
          </tr>
          <template
            v-if="giftItems.filter((x) => x.itemId == item.itemId).length > 0"
          >
            <tr
              :style="
                giftItems.filter((x) => x.itemId == item.itemId)[0].total == 0
                  ? 'background-color: red; color: white'
                  : ''
              "
              v-for="gift in giftItems.filter((x) => x.itemId == item.itemId)"
              :key="'GIFT_' + gift.itemId"
            >
              <td colspan="2">
                {{ getItemName(gift.itemId) }}
              </td>
              <td></td>
              <td></td>
              <td>
                {{ gift.count }}
              </td>
              <td v-if="gift.discountTypeId > 0">
                {{ getDiscountName(gift.discountTypeId) }}
              </td>
              <td v-else>
                {{ gift.total / gift.count }}
              </td>
              <td>
                {{ gift.total.toLocaleString() }}
              </td>
              <td></td>
              <td></td>
            </tr>
          </template>
        </template>
      </table>
    </v-sheet>
    <br />
    <v-sheet class="pa-10 sheet" elevation="2">
      <table border="1" cellspacing="0" width="100%" class="table" dir="rtl">
        <tr>
          <td>#{{ deliveryStatus.counter }}</td>
          <td colspan="2">مجموع العدد : {{ sumQty() }}</td>
          <td>مجموع كلي : {{ sumQty() }}</td>
          <td>الاجمالي : {{ totalPrice() }}</td>
        </tr>
        <tr>
          <th colspan="2">اسم الحساب</th>
          <th colspan="3">البيان</th>
        </tr>
        <tr>
          <td colspan="2">مبلغ التوزيع الكلي</td>
          <td width="150px"></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td colspan="2">مبلغ نقص الاعداد</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td colspan="2">مبلغ الراجع</td>
          <td></td>
          <td colspan="2">
            <center>
              <b>
                يجب تسليم فواتير الى امين الصندوق لأرسالها الى مسؤول التوزيع
                لمعالجة الراجع مع المندوبين خلاف ذلك يغرم الموزع
              </b>
            </center>
          </td>
        </tr>
        <tr>
          <td colspan="2">مبلغ القائمة بعد نقص وراجع</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td colspan="2">المستلم الفعلي</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td colspan="2">المبلغ النهائي</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td colspan="2">النقص او الفرق</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <!---->

        <tr>
          <td colspan="4" style="height: 200px">ملاحظات امين الصندوق</td>
        </tr>
      </table>
      <br />
      <br />
      <span style="float: right">توقيع واسم الموزع</span>
      <span style="float: left">توقيع واسم امين الصندوق</span>
    </v-sheet>

    <v-fab-transition>
      <v-btn @click="print()" color="primary" fab large dark bottom fixed left>
        <v-icon>mdi-printer</v-icon>
      </v-btn>
    </v-fab-transition>
  </div>
</template>

<script>
import moment from "moment";
export default {
  name: "DeliveryStatus",
  data: () => ({
    deliveryStatusId: 0,
    deliveryStatus: null,
    giftItems: [],
    discounts: [],
    items: [],
    appData: null,
  }),
  created: function () {
    this.deliveryStatusId = this.$route.params.id;
    this.fetch();

    this.$http.get(this.$baseUrl + "discount").then((res) => {
      this.discounts = res.data;
    });
    this.$http.get(this.$baseUrl + "settings").then((res) => {
      this.appData = res.data;
    });
    this.$http.get(this.$baseUrl + "item").then((res) => {
      this.items = res.data;
    });

    if (
      this.$route.query.print != undefined ||
      this.$route.query.print != null
    ) {
      setTimeout(() => {
        this.$print(this.$refs.print);
        setTimeout(() => {
          this.$router.go(-1);
        }, 2000);
      }, 1000);
    }
  },
  methods: {
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
            "deliveryStatus/damagedStatus/" +
            this.deliveryStatusId
        )
        .then((res) => {
          this.deliveryStatus = res.data;
          this.deliveryStatus.invoicesData =
            this.deliveryStatus.invoicesData.sort((a, b) =>
              a.count < b.count ? 1 : b.count < a.count ? -1 : 0
            );
          this.giftItems = this.deliveryStatus.invoicesData.filter(
            (x) => x.discountTypeId > 0
          );
        })
        .finally(() => loading.hide());
    },
    getDiscountName(id) {
      if (this.discounts.length > 0) {
        return this.discounts.filter((d) => d.idDiscount == id)[0].discountName;
      } else {
        return "";
      }
    },
    sumQty() {
      let qty = 0;
      let items = this.deliveryStatus.invoicesData;
      for (let i = 0; i < items.length; i++) {
        qty = qty + items[i].count;
      }
      return qty;
    },
    getItemName(itemId) {
      return this.items.filter((i) => i.idItem == itemId)[0].fullItemName;
    },
    sumQty2() {
      let qty = 0;
      let items = this.deliveryStatus.invoicesData;
      for (let i = 0; i < items.length; i++) {
        qty = qty + items[i].count;
      }
      return qty;
    },
    totalPrice() {
      let total = 0;
      let items = this.deliveryStatus.invoicesData;
      for (let i = 0; i < items.length; i++) {
        total = total + items[i].total;
      }
      return total.toLocaleString();
    },
    fixedDate(date) {
      return (
        moment(date).format("YYYY-MM-DD") +
        " - " +
        moment(date).locale("ar").format("dddd")
      );
    },
    deliveryDate(date) {
      if (moment(date).locale("en").format("dddd") == "Thursday") {
        return (
          moment(date).add(2, "days").format("YYYY-MM-DD") +
          " - " +
          moment(date).locale("ar").add(2, "days").format("dddd")
        );
      } else {
        return (
          moment(date).add(1, "days").format("YYYY-MM-DD") +
          " - " +
          moment(date).locale("ar").add(1, "days").format("dddd")
        );
      }
    },
    currentDay() {
      return (
        moment().format("YYYY-MM-DD") +
        " - " +
        moment().locale("ar").format("dddd")
      );
    },
    print() {
      this.$print(this.$refs.print);
    },
  },
};
</script>

<style scoped>
td,
th {
  padding: 10px;
}
th {
  background-color: #ddd;
}
.sheet {
  page-break-after: always;
  direction: rtl !important;
}
div.divFooter {
  position: fixed;
  top: 0;
  left: 0;
}

@media print {
  @page {
    size: A4 portrait;
  }
  * {
    font-size: 12px !important;
    -webkit-print-color-adjust: exact;
  }
  .v-btn {
    display: none !important;
  }
  div.divFooter {
    position: fixed;
    bottom: 0;
  }
}
</style>