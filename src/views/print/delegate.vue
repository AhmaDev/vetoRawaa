<template>
  <div v-if="delegates.length > 0" ref="print" id="homePage" class="pa-10">
    <v-sheet
      v-for="delegate in delegateIds"
      :key="delegate"
      style="margin-bottom: 20px"
      color="white"
      class="pa-10 sheet"
      elevation="4"
    >
      <center>
        كشف مبيعات المندوب :
        <b>{{ delegates.filter((d) => d.idUser == delegate)[0].username }}</b>
      </center>
      <br />
      <center>
        بتاريخ : <b>{{ $route.params.date }}</b>
      </center>
      <br />
      <table border="1" cellspacing="0" class="table" width="100%">
        <thead>
          <tr>
            <th width="50px">
              <center>ت</center>
            </th>
            <th width="50px">
              <center>#</center>
            </th>
            <th>اسم الزبون</th>
            <th width="100px">الوقت</th>
            <th width="100px">رقم اسيا</th>
            <th width="100px">رقم زين</th>
            <th>العنوان</th>
            <th width="100px">الاجمالي</th>
            <th width="150px">ملاحظة 1</th>
            <th width="150px">ملاحظة 2</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invoice in invoices
              .filter((invoice) => invoice.createdBy == delegate)
              .sort((a, b) => b.totalPrice - a.totalPrice)"
            :key="'INVOICE_' + invoice.idInvoice"
          >
            <td>
              <center>
                {{
                  i.filter((x) => x.invoiceId == invoice.idInvoice)[0].index + 1
                }}
              </center>
            </td>
            <td>
              <center>{{ invoice.idInvoice }}</center>
            </td>
            <td>{{ invoice.storeName }} - {{ invoice.customerId }}</td>
            <td>{{ invoice.creationFixedTime }}</td>
            <td>{{ invoice.customerPhone }}</td>
            <td>{{ invoice.secondCustomerPhone }}</td>
            <td>{{ invoice.customerAddress }}</td>
            <td
              style="
                text-align: center;
                font-size: 15px !important;
                font-weight: bold;
              "
            >
              {{ invoice.totalPrice.toLocaleString() }}
            </td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6" style="text-align: left">المجموع</td>
            <td
              style="
                text-align: right;
                font-size: 15px !important;
                font-weight: bold;
              "
              colspan="3"
            >
              {{
                invoices
                  .filter((invoice) => invoice.createdBy == delegate)
                  .reduce((a, b) => a + b.totalPrice, 0)
                  .toLocaleString()
              }}
            </td>
          </tr>
        </tfoot>
      </table>
    </v-sheet>
  </div>
</template>

<script>
export default {
  name: "DelegateSales",
  data: () => ({
    i: [],
    delegateIds: [],
    delegates: [],
    invoices: [],
  }),
  created: function () {
    this.delegateIds = this.$route.params.id.split(",");
    let loading = this.$loading.show();
    this.$http
      .get(
        this.$baseUrl +
          "invoice/filter?user=" +
          this.$route.params.id +
          "&date=" +
          this.$route.params.date +
          "&type=1&order=idInvoice&sort=ASC"
      )
      .then((res) => {
        this.invoices = res.data;
        let index = 0;
        for (let i = 0; i < this.delegateIds.length; i++) {
          for (
            let j = 0;
            j <
            this.invoices.filter(
              (invoice) => invoice.createdBy == this.delegateIds[i]
            ).length;
            j++
          ) {
            this.i.push({
              index: index++,
              invoiceId: this.invoices.filter(
                (invoice) => invoice.createdBy == this.delegateIds[i]
              )[j].idInvoice,
            });
          }
        }
        console.log(this.i);
        if (this.$route.query.print == 1) {
          setTimeout(() => {
            this.$print(this.$refs.print);
            setTimeout(() => {
              this.$router.go(-1);
            }, 2000);
          }, 1000);
        }
      })
      .finally(() => loading.hide());
    this.$http.get(this.$baseUrl + "users").then((res) => {
      this.delegates = res.data;
      console.log(this.delegates);
    });
  },
  methods: {
    incrementIndex(key) {
      return key + 1;
    },
  },
};
</script>

<style scoped>
.table td {
  padding: 10px !important;
}
.sheet {
  page-break-after: always;
  direction: rtl !important;
}
@media print {
  @page {
    size: A4 landscape;
  }
  * {
    font-size: 12px !important;
  }
}
</style>