<script setup lang='ts'>
import "vidstack/bundle"
</script>

<template>
  <media-player title="123" class="w-full aspect-video" src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8">
    <media-provider playsinline webkit-playsinline></media-provider>

    <!-- 默认布局（可选） -->
    <media-video-layout></media-video-layout>
    <media-audio-layout></media-audio-layout>

    <!-- 时间条（TimeSlider 的 web-components 形式）-->
    <div class="controls">
      <media-time type="current"></media-time>

      <media-time-slider>
        <!-- preview slot / pointer value -->
        <media-slider-value type="pointer" format="time" slot="preview"></media-slider-value>
        <!-- 也可以加入 thumbnail/chapters 等子节点 -->
      </media-time-slider>

      <media-time type="duration" remainder></media-time>
    </div>
  </media-player>
</template>