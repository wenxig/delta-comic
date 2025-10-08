<script setup lang='ts'>
import { uni } from 'delta-comic-core'
import { entries } from 'lodash-es';


</script>

<template>
  <div class="size-full bg-(--van-background-2)">
    <VanNavBar title="全部分类" left-arrow @click-left="$router.back()" />
    <div v-for="[plugin, categories] in uni.content.ContentPage.categories.entries()">
      <NH1 prefix="bar" align-text type="success">
        <NText type="primary">
          {{ plugin }}
        </NText>
      </NH1>
      <div v-for="[namespace, category] in entries(Object.groupBy(categories, v => v.namespace))" class="-mt-2">
        <div class="pt-4 !pl-5 text-xl mb-2" v-if="namespace">{{ namespace }}</div>
        <div v-if="category" class="flex flex-wrap gap-3 px-2">
          <NButton ghost v-for="cate in category" @click="$router.force.push({
            name: 'search',
            params: {
              input: cate.search.input
            },
            query: {
              sort: cate.search.sort,
              source: `${plugin}:${cate.search.methodId}`
            }
          })">
            {{ cate.title }}
          </NButton>
        </div>
      </div>
    </div>
  </div>
</template>