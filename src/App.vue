<template>
  <HeaderBar />
  <!-- <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </div> -->
  <router-view />
</template>

<script setup lang="ts">
import HeaderBar from "@/components/standard/HeaderBar.vue";
import { onSessionRestore } from "@inrupt/solid-client-authn-browser";
import { useSolidSession } from "@/composables/useSolidSession";
import router from "./router";

// bring user back to the current location
onSessionRestore((url) => router.push(`/${url.split("://")[1].split("/")[1]}`));
// re-use Solid session
useSolidSession().restoreSession();
</script>

<style lang="scss">
html {
  width: 100vw;
  height: 100vh;
}
body {
  margin: 0px;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--surface-b);
  font-family: var(--font-family);
  font-weight: 400;
  color: var(--text-color);
}
#app {
  height: 100%;
  width: 100%;
}
/* width */
::-webkit-scrollbar {
  // display: none; // but when I do, it looks sweet.
  background: var(--surface-d);
  height: 200px;
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  border: none;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: var(--primary-color);
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: cadetblue;
}
</style>
