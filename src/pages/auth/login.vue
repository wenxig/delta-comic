<script setup lang='ts'>
import { shallowReactive, shallowRef } from 'vue'
import loginImage from '@/assets/images/login-bg.webp'
import { createLoadingMessage } from '@/utils/message'
import { isAxiosError } from 'axios'
import type { RPromiseContent } from '@/utils/data'
import { useBikaStore } from '@/stores'
import { useMessage } from 'naive-ui'
import { bika } from '@/api/bika'
const bikaStore = useBikaStore()
const formValue = shallowReactive<bika.api.auth.LoginData>({
  email: '',
  password: ''
})
const $message = useMessage()
const loginIns = shallowRef<undefined | RPromiseContent<bika.api.pica.Response<{ token: string }>>>()
const submit = async () => {
  if (loginIns.value?.isLoading) return
  loginIns.value = bika.api.auth.login(bikaStore.loginData = formValue)
  try {
    const { data: { token } } = await createLoadingMessage('登陆中').bind(loginIns.value)
    bikaStore.loginToken = token
    location.pathname = '/'
  } catch (err: any) {
    if (isAxiosError(err) && err.response) {
      if (err.response.data.message) {
        $message.error(err.response.data.message)
      }
      if (err.response.data.detail) {
        $message.error(err.response.data.detail)
      }
    }
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col items-center overflow-y-auto">
    <Image :src="loginImage" fit="contain" />
    <VanForm @submit="submit" class="mt-5 w-full">
      <VanCellGroup inset>
        <VanField :disabled="loginIns?.isLoading.value" v-model="formValue.email" name="用户名" label="用户名"
          placeholder="用户名" :rules="[{ required: true, message: '请填写用户名' }]" />
        <VanField :disabled="loginIns?.isLoading.value" v-model="formValue.password" type="password" name="密码"
          label="密码" placeholder="密码" :rules="[{ required: true, message: '请填写密码' }]" />
      </VanCellGroup>
      <div class="w-[calc(100%-40px)] flex justify-between mx-auto mt-1 items-center">
        <NButton text type="primary" @click="$router.push('/auth/signup')"> 注册</NButton>
        <NButton text type="primary" @click="$message.error('请自求多福')">忘记密码</NButton>
      </div>
      <div class="m-4">
        <NButton round class="!w-full" size="large" type="primary" attr-type="submit"
          :loading="loginIns?.isLoading.value" :disabled="loginIns?.isLoading.value">
          提交
        </NButton>
      </div>
    </VanForm>
  </div>
</template>
