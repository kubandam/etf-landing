<script setup lang="ts">
const variant = useVariant()
const track = useTrack()
onMounted(() => track('page_view', { variant }))
</script>

<template>
  <main>
    <Calculator />
    <LeadForm placement="top" />
  </main>
</template>
