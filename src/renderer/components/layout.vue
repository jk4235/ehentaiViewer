<template>
  <div class="app-wrapper">
    <sidebar class="sidebar-container" />
    <div class="main-container">
      <navbar />
      <app-main />
    </div>
  </div>
</template>

<script>
import Navbar from './Navbar'
import sidebar from './sidebar'
import AppMain from './AppMain'

export default {
  name: 'Layout',
  components: {
    Navbar,
    sidebar,
    AppMain
  }
}
</script>
