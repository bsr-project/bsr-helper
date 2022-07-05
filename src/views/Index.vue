<template>
  <div>
    <van-cell-group>
      <van-cell is-link to="Mission">
        <template #title>
          <span>任务列表</span>
        </template>
        <template #label>
          可快速进行签到、签退、生成信息回传
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
  }, {} as Record<string, any>)
})
export default class Index extends Vue { }
</script>
