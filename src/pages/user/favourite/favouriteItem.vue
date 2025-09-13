<script setup lang='ts'>
import { FavouriteValue } from '@/db/favourite';
import { UserOutlined } from '@vicons/antd'
defineProps<{
  item: FavouriteValue
  height: number
}>()
</script>

<template>
  <button @click="$router.force.push(`/${item.type}/${item.id}`)" :style="`height: ${height}px`"
    class="overflow-hidden w-full van-hairline--top-bottom flex bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative active:bg-gray p-0 items-center van-haptics-feedback">
    <Image :src="item.cover" class="!rounded-lg z-2"
      :class="[item.type == 'video' ? 'ml-[1%] aspect-video w-[34%]' : 'ml-[5%] aspect-3/4 h-[90%]']"
      fit="contain" ref="cover" />
    <div class="w-[62%] min-h-[98%] flex absolute right-[2%] flex-col *:text-justify">
      <span class="mt-[3%] van-multi-ellipsis--l3">{{ item.title }}</span>
      <slot />
      <div class="absolute bottom-2 text-(--van-text-color-2) text-sm">
        <div class="flex flex-nowrap items-center *:text-nowrap van-ellipsis">
          <NIcon color="var(--van-text-color-2)" size="14px">
            <UserOutlined />
          </NIcon>
          <span v-for="author of item.author" class="mr-2 van-haptics-feedback">{{ author }}</span>
        </div>
      </div>
    </div>
  </button>
</template>