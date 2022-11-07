<template>
  <div ref="print" id="homePage" class="pa-10">
    <template v-for="(invoice, index) in invoices">
      <v-sheet
        v-if="invoice.items[0] != null"
        style="margin-bottom: 20px"
        color="white"
        :key="invoice.idInvoice"
        class="pa-10 sheet"
        elevation="4"
      >
        <img src="@/assets/header.png" width="100%" alt="" />

        <small>تسلسل: {{ index + 1 }}</small>
        <table class="table" border="1" cellspacing="0" width="100%">
          <tr>
            <td>رقم الفاتورة : #{{ invoice.idInvoice }}</td>
            <td>فاتورة : {{ invoice.invoiceTypeName }}</td>
            <td>المندوب : {{ invoice.createdByName }}</td>
            <td>الموزع : {{ invoice.deliveryName }}</td>
          </tr>
          <tr>
            <td>اسم الزبون : {{ invoice.customerName }}</td>
            <td>كود الزبون : {{ invoice.customerId }}</td>
            <td>رقم الزبون : {{ invoice.customerPhone }}</td>
            <td>عنوان الزبون : {{ invoice.customerAddress }}</td>
          </tr>
          <tr>
            <td colspan="2">اسم المحل : {{ invoice.storeName }}</td>
            <td>رقم الزبون : {{ invoice.secondCustomerPhone }}</td>
            <td>
              وقت وتاريخ : {{ invoice.creationFixedDate }} -
              {{ invoice.creationFixedTime }}
            </td>
          </tr>
        </table>
        <br />
        <table class="table" border="1" cellspacing="0" width="100%">
          <thead>
            <tr>
              <th>#</th>
              <th>المادة</th>
              <th>الكمية</th>
              <th>سعر</th>
              <th>الخصم</th>
              <th>نوع الخصم</th>
              <th>الاجمالي</th>
              <th width="60px">عدد</th>
              <th width="60px">مجموع</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in invoice.items"
              :key="item.itemId + '_' + index"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ item.itemName }}</td>
              <td>{{ item.count.toLocaleString() }}</td>
              <td>{{ item.price.toLocaleString() }}</td>
              <td>{{ item.discount }}</td>
              <td>{{ item.discountName }}</td>
              <td>{{ item.total.toLocaleString() }}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <table class="table" border="1" cellspacing="0" width="100%">
          <tbody>
            <tr>
              <td width="25%" colspan="1">
                رقم الفاتورة : {{ invoice.idInvoice }}
              </td>
              <td width="25%" colspan="1">
                كود الزبون : {{ invoice.customerId }}
              </td>
              <td>مجموع الاعداد</td>
              <td style="background-color: #eee" colspan="1">
                {{ invoice.items.reduce((a, b) => a + b.count, 0) }}
              </td>
              <td colspan="2"></td>
              <td style="background-color: #eee">المجموع</td>
              <td style="background-color: #eee">
                {{ invoice.totalPrice.toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
        <br />
      </v-sheet>
    </template>
  </div>
</template>

<script>
export default {
  name: "InvoicePrint",
  data: () => ({
    invoicesIds: [],
    invoices: [],
  }),
  created: function () {
    let invoicesIds = this.$route.params.id;
    let ids = invoicesIds.split(",");
    for (let i = 0; i < ids.length; i++) {
      this.invoicesIds.push(ids[i]);
    }
    let loading = this.$loading.show();
    this.$http
      .post(this.$baseUrl + "invoice/multiple", {
        invoices: this.invoicesIds,
      })
      .then((res) => {
        this.invoices = res.data;
        this.invoices.forEach((element) => {
          console.log(element.items);
        });
        setTimeout(() => {
          this.$print(this.$refs.print);
          setTimeout(() => {
            this.$router.go(-1);
          }, 2000);
        }, 1000);
      })
      .finally(() => loading.hide());
  },
};
</script>

<style scoped>
.table td {
  padding: 10px !important;
  font-size: 14px !important;
}
.sheet {
  page-break-after: always;
  direction: rtl !important;
  display: none;
}

#pageFooter {
  display: table-footer-group;
}

#pageFooter:after {
  counter-increment: page;
  content: counter(page);
}

@media print {
  @page {
    size: A4;
    @bottom-left {
      content: counter(page) " of " counter(pages);
    }
  }
  * {
    font-size: 12px !important;
  }
  .sheet {
    display: block;
  }
}
</style>