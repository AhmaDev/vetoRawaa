<template>
  <div id="DamagedInvoicesReport">

      <v-row>
      <v-col>
        <v-autocomplete
          :items="items"
          item-text="itemName"
          item-value="idItem"
          outlined
          hide-details
          dense
          v-model="searchFields.itemId"
          label="المادة"
        ></v-autocomplete>
      </v-col>
      <v-col>
        <v-text-field
          outlined
          dense
          hide-details
          type="date"
          label="بتاريخ"
          v-model="searchFields.startDate"
        ></v-text-field>
      </v-col>
      <v-col cols="1">
        <v-btn @click="search()" :color="$background" dark>بحث</v-btn>
      </v-col>
    </v-row>

    <v-data-table :items="invoices.data" :headers="invoices.header">
      <template v-slot:[`item.imagePath`]="{ item }">
        <v-avatar size="40">
          <img :src="$baseUrl + 'files/' + item.imagePath" />
        </v-avatar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn :to="'/damagedItems/' + item.damagedItemsInvoiceId" target="_BLANK" icon>
            <v-icon>
                mdi-magnify
            </v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-footer fixed padless>
      <v-col class="text-left" cols="12">
        المجموع : <b class="green--text">{{ sum }}</b>
      </v-col>
    </v-footer>

  </div>
</template>

<script>
export default {
  name: "DamagedInvoiceReport",
  data: () => ({
    invoices: {
      header: [
        { text: "", value: "imagePath" },
        { text: "اسم المادة", value: "itemName" },
        { text: "الزبون", value: "customerName" },
        { text: "الكمية", value: "count" },
        { text: "بتاريخ", value: "creationFixedDate" },
        { text: "بواسطة", value: "createdByName" },
        { text: "الاجراءات", value: "actions" },
      ],
      data: [],
    },
    items: [],
    searchFields: {
        itemId: 0,
        startDate: null,
        endDate: null,
    }
  }),
  created: function () {
    this.getCurrentDate().then((value) => {
      this.searchFields.startDate = value;
      this.searchFields.endDate = value;
    });
    this.fetch();
  },
  methods: {
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "damagedInvoice/contents")
        .then((res) => {
          this.invoices.data = res.data;
        })
        .finally(() => loading.hide());
        this.$http.get(this.$baseUrl + 'item').then((res) => {this.items = res.data})
    },
    search() {
        let loading = this.$loading.show();
        this.$http
        .get(this.$baseUrl + `damagedInvoice/contents?item=${this.searchFields.itemId}&date=${this.searchFields.startDate}`)
        .then((res) => {
          this.invoices.data = res.data;
        })
        .finally(() => loading.hide());
    }
  },
  computed: {
    sum() {
      let total = 0;
      let invoices = this.invoices.data;
      for (let i = 0; i < invoices.length; i++) {
        total = total + invoices[i].count;
      }

      return (total).toLocaleString();
    },
  },
};
</script>

<style>
</style>