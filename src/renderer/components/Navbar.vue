<template>
    <div>
        <el-menu class="navbar" mode="horizontal">
            <hamburger :toggle-click="toggleSideBar" :is-active="opened" class="hamburger-container"/>
            <h1 style="margin: 0">EhentaiViewer</h1>
            <el-button type="primary" size="mini" @click="handleClick"><i class="el-icon-back"></i></el-button>
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
      },
      handleClick () {
        this.$router.push('/home')
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    .navbar {
        height: 50px;
        line-height: 50px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        border-radius: 0px !important;
        .hamburger-container {
            line-height: 58px;
            height: 50px;
            padding: 0 10px;
        }
        .screenfull {
            position: absolute;
            right: 90px;
            top: 16px;
            color: red;
        }
        h1 {
            flex-grow: 1;
            text-align: center;
        }
    }
</style>

