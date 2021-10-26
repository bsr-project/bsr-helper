<style lang="scss" scoped>
.about {
  padding-top: 50px;
  text-align: center;

  img {
    width: 100px;
    height: 100px;
  }

  .github {
    margin-top: 10px;
    width: 100%;
    height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 700;

    a {
      color: #24292f;
    }
  }
}
</style>

<template>
  <div class="about">
    <img src="~@/assets/logo.png" alt="" />
    <h1>bsr-helper</h1>
    <div>
      一个懒惰的程序员的屑作。
    </div>

    <div class="github">
      <a href="https://github.com/bsr-project/bsr-helper">Github</a>
    </div>
  </div>
</template>
