<template>
  <Scribe />
  <Toast position="bottom-right" />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Scribe from "@/components/Scribe.vue";

export default defineComponent({
  name: "Home",
  components: { Scribe },
});
</script>

<style lang="scss" scoped>
.p-card {
  margin: 5px;
}
</style>
