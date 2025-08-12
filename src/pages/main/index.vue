<script setup lang='ts'>
import { PlusRound } from '@vicons/material'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const name = computed(() => route.path.match(/(?<=\/main\/)\w+(?=\/)?/g)?.[0])
</script>

<template>
  <div class="w-full overflow-hidden h-[calc(100%-50px)]">
    <Suspense>
      <RouterView />
    </Suspense>
  </div>
  <VanTabbar class="fixed bottom-0 transition-[opacity] opacity-100 w-full items-center" :model-value="name">
    <VanTabbarItem name="home" to="/main/home" icon="home-o">首页</VanTabbarItem>
    <VanTabbarItem name="favourite" to="/main/home" icon="home-o">关注</VanTabbarItem>
    <NButton class="!size-10 **:!text-2xl !rounded-2xl !mx-3" type="primary">
      <template #icon>
        <NIcon>
          <PlusRound />
        </NIcon>
      </template>
    </NButton>
    <VanTabbarItem name="buy" to="/main/home" icon="home-o">会员购</VanTabbarItem>
    <VanTabbarItem name="user" to="/main/user" icon="user-o">我的</VanTabbarItem>
  </VanTabbar>
</template>