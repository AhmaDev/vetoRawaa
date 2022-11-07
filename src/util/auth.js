import Vue from 'vue';

Vue.mixin({
    methods: {
        async auth() {
            var permissions = await this.$http.get(this.$baseUrl + "users/" + this.userInfo.idUser);
            return permissions.data;
        },
    },
    computed: {
        userInfo() {
            return this.$store.getters.getLoginInfo;
        },
    }
});