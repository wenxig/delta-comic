<script setup lang='ts'>
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
import { createLoadingMessage } from '@/utils/message'
import { until, useFileDialog } from '@vueuse/core'
import { noop } from 'lodash-es'
import { reactive, shallowRef } from 'vue'
import userIcon from '@/assets/images/userIcon.webp?url'
import { showImagePreview } from '@/utils/image'
import { useBikaStore } from '@/stores'
import { bika } from '@/api/bika'

const bikaStore = useBikaStore()
if (!bikaStore.user.profile) var loadingSuccess: Function = createLoadingMessage().success
else var loadingSuccess: Function = noop
await until(() => bikaStore.user.profile).toBeTruthy()
loadingSuccess()
const slogan = shallowRef(bikaStore.user.profile.data.value?.slogan || '')
class AvatarEditor {
  public static show = shallowRef(false)
  public static option = reactive({
    boxStyle: {},
    base: {
      viewMode: 1,
      dragMode: 'move',
      aspectRatio: 1,
    },
    img: '',
    isReady: false
  })
  public static changeScale(num: number = 1) { cropper?.zoom(num) }
  public static rotate(reg = 90) { cropper?.rotate(reg) }
  public static isUpdating = shallowRef(false)
  public static async updateImg() {
    AvatarEditor.isUpdating.value = true
    const loading = createLoadingMessage('上传中')
    try {
      if (!cropper) throw new Error()
      await bika.api.user.editAvatar(cropper.getDataURL())
      AvatarEditor.show.value = false
      await bikaStore.user.$reloadProfile()
      loading.success()
    } catch {
      loading.fail()
    }
    AvatarEditor.isUpdating.value = false
  }
  public static down() {
    const aLink = document.createElement('a')
    aLink.download = 'avatar-img'
    cropper?.getFile().then((data) => {
      aLink.href = window.URL.createObjectURL(data!)
      aLink.click()
    })
  }
}
const uploadToAvatarEditor = async () => {
  const image = await new Promise<File>(r => {
    const filer = useFileDialog({
      accept: 'image/*',
      reset: true
    })
    filer.open()
    filer.onChange(fl => {
      if (fl) r(fl[0])
      filer.reset()
    })
  })
  const translate = await new Promise<string>(r => {
    const fr = new FileReader()
    fr.onloadend = ({ target }) => r(target!.result!.toString())
    fr.readAsDataURL(image)
  })
  AvatarEditor.option.img = translate
  AvatarEditor.show.value = true
}
const isEditingSlogan = shallowRef(false)
const _editSlogan = async () => {
  isEditingSlogan.value = true
  const loading = createLoadingMessage('提交中')
  try {
    await bika.api.user.editSlogan(slogan.value)
    await bikaStore.user.$reloadProfile()
    loading.success()
  } catch {
    loading.fail()
  }
  isEditingSlogan.value = false
}
</script>

<template>
  <VanNavBar left-arrow @click-left="$router.back()" title="编辑" />
  <div>
    <van-popover :actions="[{ text: '修改' }, { text: '查看' }]"
      @select="({ text }) => text == '修改' ? uploadToAvatarEditor() : bikaStore.user.profile.data.value && showImagePreview([bikaStore.user.profile.data.value?.$avatar.toString()])">
      <template #reference>
        <VanCell title="头像" clickable>
          <template #right-icon>
            <Image :src="bikaStore.user.profile.data.value?.$avatar" round class="h-[60px] w-[60px]" />
          </template>
        </VanCell>
      </template>
    </van-popover>
    <van-field class="my-2" v-model="slogan" type="textarea" rows="1" autosize label="简介" placeholder="null"
      label-align="top" />
    <VanButton block class="w-[98%] mx-auto" size="normal" type="primary" @click="_editSlogan()"
      :loading="isEditingSlogan">
      提交简介更新</VanButton>
  </div>
  <Popup v-model:show="AvatarEditor.show.value" closeable class="flex flex-col w-[90vw] py-5 h-[115vw]">
    <NSpin :show="!AvatarEditor.option.isReady" class="w-[90%] m-auto">
      <VuePictureCropper :box-style="AvatarEditor.option.boxStyle" :img="AvatarEditor.option.img || userIcon"
        :options="AvatarEditor.option.base" @ready="AvatarEditor.option.isReady = true" />
    </NSpin>
    <div class="text-center w-full flex justify-evenly *:*:-mx-[2px]">
      <VanButton icon="plus" round plain type="primary" @click="AvatarEditor.changeScale()"
        :loading="AvatarEditor.isUpdating.value" />
      <VanButton icon="minus" round plain type="primary" @click="AvatarEditor.changeScale(-1)"
        :loading="AvatarEditor.isUpdating.value" />
      <VanButton icon="replay" round plain type="primary" @click="AvatarEditor.rotate(-90)"
        :loading="AvatarEditor.isUpdating.value" />
      <VanButton round plain type="primary" @click="AvatarEditor.down()" :loading="AvatarEditor.isUpdating.value">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" class="w-5 -mx-[1px]">
            <path fill="currentColor"
              d="M160 832h704a32 32 0 1 1 0 64H160a32 32 0 1 1 0-64m384-253.696 236.288-236.352 45.248 45.248L508.8 704 192 387.2l45.248-45.248L480 584.704V128h64z">
            </path>
          </svg>
        </template>
      </VanButton>
      <VanButton :loading="AvatarEditor.isUpdating.value" icon="success" round plain type="success"
        @click="AvatarEditor.updateImg()" />
    </div>
  </Popup>
</template>
<style scoped lang='scss'>
:deep(.van-popover__wrapper) {
  width: 100% !important;
}
</style>