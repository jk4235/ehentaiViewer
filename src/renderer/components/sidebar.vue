<template>
  <div class="home">
    <transition name="fade">
      <div class="menu-mask" v-show="isRealyShow" @click="hideSide"></div>
    </transition>
    <transition name="slide-fade">
      <div class="side-content" v-show="isRealyShow">
        <el-button
          style="width: 100%"
          @click="toFavourite">我的收藏</el-button>
      </div>
    </transition>
  </div>
</template>

<script>
  export default {
    name: 'sidebar',
    methods: {
      hideSide () {
        this.$store.dispatch('CloseSideBar')
      },
      toFavourite () {
        this.$router.push('/favourite')
        this.$store.dispatch('CloseSideBar')
      }
    },
    computed: {
      isRealyShow () {
        return this.$store.getters.opened
      }
    }
  }
</script>

<style scoped>
  .menu-mask {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    opacity: 1;
    z-index: 10;
    background: rgba(0, 0, 0, 0.5);
  }

  .side-content {
    z-index: 11;
    position: fixed;
    width: 286px;
    height: 100%;
    background: #fff;
    top: 0;
    left: 0;
    bottom: 0;
    -webkit-overflow-scrolling: touch;
  }

  .fade-enter-to, .fade-leave-to {
    transition: opacity 0.3s
  }

  .fade-enter, .fade-leave-to {
    opacity: 0
  }

  .slide-fade-enter-to, .slide-fade-leave-to {
    transition: transform 0.3s;
    transform: translate(0px, 0px);
  }

  .slide-fade-enter, .slide-fade-leave-to {
    opacity: 0;
    -webkit-transform: translate(-286px, 0px);
    transform: translate(-286px, 0px);
    -webkit-transition: opacity 0.3s ease-in-out 0.3s, -webkit-transform 0.3s ease-in-out;
    transition: opacity 0.3s ease-in-out 0.3s, transform 0.3s ease-in-out;
  }
</style>
