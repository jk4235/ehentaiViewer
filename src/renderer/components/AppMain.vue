<template>
    <section class="app-main">
        <transition name="fade" mode="out-in">
            <keep-alive>
                <router-view v-if="$route.meta.keepAlive"/>
            </keep-alive>
            <router-view v-if="!$route.meta.keepAlive"/>
        </transition>
    </section>
</template>

<script>
  export default {
    name: 'AppMain',
    computed: {
      // key() {
      //   return this.$route.name !== undefined ? this.$route.name + +new Date() : this.$route + +new Date()
      // }
    }
  }
</script>

<style scoped>
    .app-main {
        position: relative;
        overflow: hidden;
    }
</style>
