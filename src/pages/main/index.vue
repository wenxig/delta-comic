<script setup lang='ts'>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const name = computed(() => route.path.match(/(?<=\/main\/)\w+(?=\/)?/g)?.[0])
</script>

<template>
  <div class="w-full overflow-hidden h-[calc(100%-50px)]">
    <Suspense>
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </Suspense>
  </div>
  <VanTabbar class="fixed bottom-0 transition-[opacity] opacity-100 w-full" :model-value="name">
    <VanTabbarItem name="home" to="/main/home" icon="home-o">主页</VanTabbarItem>
    <VanTabbarItem name="user" to="/main/user" icon="user-o">我的</VanTabbarItem>
  </VanTabbar>
</template>