<template>
  <div id="loginPage">
      <center>
          <div class="loginCard">
              <Logo width="200px" />
          <br>
          <br>
          <br>
          <v-text-field
            label="اسم المستخدم"
            outlined
            @keypress.enter="login()"
            v-model="loginInfo.username"
          ></v-text-field>
          <v-text-field
            label="كلمة المرور"
            outlined
            @keypress.enter="login()"
            type="password"
            v-model="loginInfo.password"
          ></v-text-field>
          <v-btn @click="login()" block :color="$background" dark>
              دخول
          </v-btn>
          <br><br>
          <small>{{$appVersion}}</small>
          </div>
      </center>
  </div>
</template>

<script>
import Logo from "./Logo.vue";

export default {
    name: 'login',
    components: {
        Logo
    },
    data: () => ({
        loginInfo: {
            username: null,
            password: null,
        }
    }),
    methods: {
        login() {
            let loading = this.$loading.show();
            this.$http.post(this.$baseUrl + 'users/login', {
                username: this.loginInfo.username,
                password: this.loginInfo.password
            }).then(res => {
                localStorage.setItem('userinfo', JSON.stringify(res.data));
                this.$store.commit("setLoginInfo", res.data);
                location.reload();
            }).catch(err => {
                console.log(err);
                this.$toast.open({
                    type: 'error',
                    message: 'المعلومات التي ادخلتها غير صحيحة',
                    duration: 3000
                });
            }).finally(() => {
                loading.hide()
            })
        }
    }
}
</script>

<style>
.loginCard {
    margin-top: 20vh;
    width: 95%;
    max-width: 400px;
}
</style>