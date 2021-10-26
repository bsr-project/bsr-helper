<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">主页</router-link>
      <router-link to="/about">关于</router-link>
    </div>
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  color: #2c3e50;
  overflow: hidden;
}

#nav {
  padding: 20px;
  text-align: center;
  background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);

  a {
    font-weight: bold;
    color: #2c3e50;
    font-size: 20px;

    & + a {
      margin-left: 20px;
    }

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
