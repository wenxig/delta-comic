<script setup lang='ts'>
import { shallowReactive } from 'vue'
import loginImage from '@/assets/images/login-bg.webp'
import { createLoadingMessage } from '@/utils/message'
import { isAxiosError } from 'axios'
import { PromiseContent } from '@/utils/data'
import { useBikaStore, useJmStore } from '@/stores'
import { useMessage } from 'naive-ui'
import { bika } from '@/api/bika'
import { jm } from '@/api/jm'
const bikaStore = useBikaStore()
const jmStore = useJmStore()
const formValue = shallowReactive({
  bkEmail: '',
  bkPassword: '',
  jmUsername: '',
  jmPassword: ''
})
const $message = useMessage()
const loginIns = PromiseContent.withResolvers<void>(false)
const submit = async () => {
  console.log('submit', formValue, loginIns.content.isLoading.value)
  if (loginIns.content.isLoading.value) return
  Promise.all([
    bika.api.auth.login(bikaStore.loginData = {
      email: formValue.bkEmail,
      password: formValue.bkPassword
    }).then(token => bikaStore.loginToken = token.data.token),
    jm.api.auth.login(jmStore.loginData = {
      username: formValue.jmUsername,
      password: formValue.jmPassword
    }).then(v => {
      console.log('jm login', v, v.jwttoken, v.s)
      jmStore.loginToken = v.jwttoken
      jmStore.loginAVS = v.s
      jmStore.$loadProfile(v)
    })
  ]).then(() => loginIns.resolve()).catch(err => {
    loginIns.reject(err)
  })
  try {
    await createLoadingMessage('登陆中').bind(loginIns.content)
    location.pathname = '/'
  } catch (err: any) {
    console.error(err)
    loginIns.reset(false)
    $message.error(JSON.stringify(err))
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col items-center overflow-y-auto pt-safe">
    <Image :src="loginImage" fit="contain" />
    <VanForm @submit="submit" class="mt-5 w-full">
      <VanCellGroup inset>
        <VanField :disabled="loginIns.content.isLoading.value" v-model="formValue.bkEmail" name="哔咔用户名" label="哔咔用户名"
          placeholder="哔咔用户名" :rules="[{ required: true, message: '请填写用户名' }]" />
        <VanField :disabled="loginIns.content.isLoading.value" v-model="formValue.bkPassword" type="password"
          name="哔咔密码" label="哔咔密码" placeholder="哔咔密码" :rules="[{ required: true, message: '请填写密码' }]" />
      </VanCellGroup>

      <VanCellGroup inset class="!my-2">
        <VanField :disabled="loginIns.content.isLoading.value" v-model="formValue.jmUsername" name="天堂用户名" label="天堂用户名"
          placeholder="天堂用户名" :rules="[{ required: true, message: '请填写用户名' }]" />
        <VanField :disabled="loginIns.content.isLoading.value" v-model="formValue.jmPassword" type="password"
          name="天堂密码" label="天堂密码" placeholder="天堂密码" :rules="[{ required: true, message: '请填写密码' }]" />
      </VanCellGroup>
      <div class="w-[calc(100%-40px)] flex justify-between mx-auto mt-1 items-center">
        <NButton text type="primary" @click="$router.push('/auth/signup')"> 注册</NButton>
        <NButton text type="primary" @click="$message.error('请自求多福')">忘记密码</NButton>
      </div>
      <div class="m-4">
        <NButton round class="!w-full" size="large" type="primary" attr-type="submit"
          :loading="loginIns.content.isLoading.value" :disabled="loginIns.content.isLoading.value">
          提交
        </NButton>
      </div>
    </VanForm>
  </div>
</template>