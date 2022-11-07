<template>
  <div id="invoicesSettings">
    <v-data-table
      :headers="invoiceTypes.header"
      :items="invoiceTypes.data"
      class="elevation-0"
    >
      <template v-slot:[`item.invoiceFunction`]="{ item }">
        <v-chip color="green" dark v-if="item.invoiceFunction == 'plus'">اضافة الى المخزن</v-chip>
        <v-chip color="red" dark v-if="item.invoiceFunction == 'minus'">اخراج من المخزن</v-chip>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: "InvoicesSettings",
  data: () => ({
    invoiceTypes: {
      header: [
        { text: "نوع الفاتورة", value: "invoiceTypeName" },
        { text: "المعادلة", value: "invoiceFunction" },
      ],
      data: [],
    },
  }),
  created: function () {
    this.fetch();
  },
  methods: {
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "invoice/type")
        .then((res) => {
          this.invoiceTypes.data = res.data;
        })
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>