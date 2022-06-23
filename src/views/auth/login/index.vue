<template>
  <div class="login-frame">
    <h1 style="text-align: center;">会员管理系统</h1>

    <n-tabs default-value="signin" size="large" justify-content="space-evenly">
      <n-tab-pane name="signin" tab="登录">
        <LoginForm />
      </n-tab-pane>
      <n-tab-pane name="signup" tab="注册">
        <RegisterForm />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script lang="ts" setup>
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';
</script>

<style lang="scss" scoped>
.login-frame {
  padding: 20px;
  margin: 10vh auto 0 auto;
}
@media screen and (min-width: 450px) {
  .login-frame {
    width: 50vw;
  }
}
</style>
