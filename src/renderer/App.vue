<template>
    <el-container>
        <el-header>
            <Navbar/>
        </el-header>
        <el-main>
            <div id="app">
                <router-view></router-view>
            </div>
        </el-main>
    </el-container>
</template>

<script>
  import Navbar from '@/components/Navbar'
  export default {
    name: 'ehentai-viewer',
    components: {
      Navbar
    }
  }
</script>

<style>
  /* CSS */
</style>
