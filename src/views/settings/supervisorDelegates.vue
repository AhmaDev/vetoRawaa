<template>
  <div id="supervisorDelegates">
    <v-row>
      <v-col cols="3">
        <v-list>
          <v-list-item
            @click="setSelectedSuperVisor(supervisor.idUser)"
            v-for="(supervisor, i) in supervisors"
            :key="i"
            :class="
              selectedSuperVisor == supervisor.idUser
                ? 'v-list-item--active'
                : ''
            "
          >
            <v-list-item-content>
              <v-list-item-title
                v-text="supervisor.username"
              ></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="9" v-if="selectedSuperVisor > 0">
        <v-row>
          <v-col>
            <v-autocomplete
              :items="delegates"
              item-text="username"
              item-value="idUser"
              v-model="selectedDelegate"
              outlined
              multiple
              dense
              label="اختيار مندوب"
            ></v-autocomplete>
          </v-col>
          <v-col
            ><v-btn color="primary" @click="addDeleteSuperVisor()"
              >اضافة</v-btn
            ></v-col
          >
        </v-row>

        <v-data-table
          :items="supervisorDelegates"
          :headers="tableHeaders"
          class="elevation-0"
          height="500"
          fixed-header
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-menu offset-y>
              <template v-bind="item" v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" icon>
                  <v-icon color="red" title="حذف المندوب من قائمة المشرف"
                    >mdi-delete-outline</v-icon
                  >
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  @click="deleteDelegate(item.idSupervisorDelegates)"
                >
                  <v-list-item-title
                    >اضغط هنا لتأكيد حذف المندوب من قائمة
                    المشرف</v-list-item-title
                  >
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "SupervisorDelegates",
  data: () => ({
    delegates: [],
    supervisors: [],
    supervisorDelegates: [],
    selectedSuperVisor: 0,
    selectedDelegate: [],
    tableHeaders: [
      {
        text: "اسم المندوب",
        value: "delegateName",
      },
      {
        text: "الاجراءات",
        value: "actions",
      },
    ],
  }),
  created: function () {
    let loading = this.$loading.show();
    this.$http.get(this.$baseUrl + "users/role/3").then((res) => {
      this.supervisors = res.data;
    });
    this.$http
      .get(this.$baseUrl + "users")
      .then((res) => {
        this.delegates = res.data;
      })
      .finally(() => loading.hide());
  },
  methods: {
    setSelectedSuperVisor(id) {
      this.selectedSuperVisor = id;
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "supervisorDelegates/userid/" + id)
        .then((res) => {
          this.supervisorDelegates = res.data;
          this.selectedDelegate = res.data.map((e) => e.delegateId);
        })
        .finally(() => loading.hide());
    },
    addDeleteSuperVisor() {
      if (this.selectedDelegate.length == 0) {
        this.$toast.open({
          type: "error",
          message: "يرجى اختيار مندوب",
          duration: 3000,
        });
        return;
      }
      let loading = this.$loading.show();
      let values = this.selectedDelegate.map((e) => [
        this.selectedSuperVisor,
        e,
      ]);

      this.$http
        .post(
          this.$baseUrl +
            "supervisorDelegates/multiple/" +
            this.selectedSuperVisor,
          values
        )
        .then(() => {
          this.setSelectedSuperVisor(this.selectedSuperVisor);
          this.selectedDelegate = 0;
        })
        .finally(() => loading.hide())
        .catch(() => {
          this.$toast.open({
            type: "error",
            message: "هذا المندوب موجود بالفعل في قائمة المشرف",
            duration: 3000,
          });
        });
    },
    deleteDelegate(id) {
      let loading = this.$loading.show();
      this.$http
        .delete(this.$baseUrl + "supervisorDelegates/delete/" + id)
        .then(() => this.setSelectedSuperVisor(this.selectedSuperVisor))
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>