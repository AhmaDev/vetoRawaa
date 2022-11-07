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
        كشف مبالغ التالف للمندوب :
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
            <th width="100px">
              <center>رقم الفاتورة</center>
            </th>
            <th width="100px">كود الزبون</th>
            <th>اسم الزبون</th>
            <th width="150px">وقت الفاتورة</th>
            <th width="150px">المبلغ الاجمالي</th>
            <th>ملاحظة 1</th>
            <th>ملاحظة 2</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invoice in invoices.filter(
              (invoice) => invoice.createdBy == delegate
            )"
            :key="'INVOICE_' + invoice.idDamagedItemsInvoice"
          >
            <td>
              <center>{{ invoice.idDamagedItemsInvoice }}</center>
            </td>
            <td>{{ invoice.customerId }}</td>
            <td>{{ invoice.customerName }}</td>
            <td>{{ invoice.creationFixedTime }}</td>
            <td>{{ invoice.total.toLocaleString() }}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align: left">المجموع</td>
            <td colspan="3">
              <b>
                {{
                  invoices
                    .filter((invoice) => invoice.createdBy == delegate)
                    .reduce((a, b) => a + b.total, 0)
                    .toLocaleString()
                }}
              </b>
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
          "damagedInvoice/user/" +
          this.$route.params.id +
          "?date=" +
          this.$route.params.date +
          "&type=1"
      )
      .then((res) => {
        this.invoices = res.data;
        console.log("INVOICES", this.invoices);
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
</style>