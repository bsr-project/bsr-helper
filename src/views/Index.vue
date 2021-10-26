<template>
  <div>
    <van-cell-group>
      <van-cell is-link to="InformationReturn">
        <template #title>
          <span>信息回传</span>
        </template>
        <template #label>
          一些消息回传模板，可直接复制使用
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Cell, CellGroup } from 'vant'

@Component({
  components: [Cell, CellGroup].reduce((components, component) => {
    components[component.name] = component
    return components
  }, {} as { [key: string]: any })
})
export default class Index extends Vue {}
</script>
