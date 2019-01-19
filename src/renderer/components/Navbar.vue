<template>
    <div>
        <el-menu class="navbar" mode="horizontal" style="text-align: center">
            <hamburger :toggle-click="toggleSideBar" :is-active="opened" class="hamburger-container"/>
            <h1 style="margin: 0">EhentaiViewer</h1>
        </el-menu>
        <sidebar/>
    </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Hamburger from '@/components/Hamburger'
  import sidebar from '@/components/sidebar'

  export default {
    components: {
      Hamburger,
      sidebar
    },
    computed: {
      ...mapGetters([
        'opened'
      ])
    },
    methods: {
      toggleSideBar () {
        this.$store.dispatch('ToggleSideBar')
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    .navbar {
        height: 50px;
        line-height: 50px;
        border-radius: 0px !important;
        .hamburger-container {
            line-height: 58px;
            height: 50px;
            float: left;
            padding: 0 10px;
        }
        .screenfull {
            position: absolute;
            right: 90px;
            top: 16px;
            color: red;
        }
    }
</style>

