<template>
  <div id="ItemsStoreReportPage">
    <v-row>
      <v-col>
        <v-autocomplete
          :items="customers"
          item-text="storeName"
          item-value="idCustomer"
          outlined
          hide-details
          dense
          v-model="searchFields.customerId"
          label="اسم الزبون"
        ></v-autocomplete>
      </v-col>
      <v-col>
        <v-text-field
          outlined
          dense
          hide-details
          type="date"
          label="من تاريخ"
          v-model="searchFields.startDate"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          outlined
          dense
          hide-details
          type="date"
          label="الى تاريخ"
          v-model="searchFields.endDate"
        >
        </v-text-field>
      </v-col>
      <v-col cols="1">
        <v-btn @click="search()" :color="$background" dark>بحث</v-btn>
      </v-col>
    </v-row>
    <br />
    <v-data-table
      :headers="invoices.header"
      :items="invoices.data"
      class="elevation-0"
    >
      <template v-slot:[`item.totalPrice`]="{ item }">
        <div
          :class="item.invoiceFunction == 'minus' ? 'green--text' : 'red--text'"
        >
          <b> {{ item.totalPrice.toLocaleString() }}</b>
        </div>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn icon :to="'/invoice/' + item.idInvoice" target="_BLANK">
          <v-icon :title="item.idInvoice">mdi-magnify</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: "ItemsStoreReportPage",
  components: {},
  data: () => ({
    items: {
      header: [
        { text: "رمز المادة", value: "invoiceTypeName" },
        { text: "اسم المادة", value: "idInvoice" },
        { text: "الادخال", value: "customerName" },
        { text: "الاخراج", value: "creationFixedDate" },
        { text: "الصافي", value: "creationFixedTime" },
      ],
      data: [],
    },
  }),
  created: function () {},
  methods: {},
  computed: {},
};
</script>

<style>
</style>