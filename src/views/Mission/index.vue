<style lang="scss" scoped>
.mission {

  .action-date {
    span+span {
      margin-left: 5px;
    }
  }

  .content {
    padding: 10px;
    white-space: pre-line;
    background-color: #f0f0f0;

    .submission {
      margin: 10px 0;
    }
  }

}
</style>

<template>
  <van-collapse v-model="activeCollapse" class="mission">
    <van-collapse-item v-for="(mission) in missionList" :key="mission.mission_id" :name="mission.mission_id">
      <template #title>
        <span>{{ mission.title }}</span>
      </template>

      <template #value>
        <div class="action-date">
          <span>{{ mission.action_date }}</span>

          <span v-if="mission.diff === 0" style="color: #ff3333; font-weight: bold;">(今儿)</span>
          <span v-else-if="mission.diff === 1" style="color: #ff3333; font-weight: bold;">(明儿)</span>
          <span v-else-if="mission.diff === 2">(后天)</span>
        </div>
      </template>

      <template>
        <div class="content">
          <!-- 子任务 -->
          <van-checkbox-group v-if="mission.children && mission.children.length > 0" v-model="checked"
            class="submission">
            <van-cell-group inset>
              <van-cell v-for="(children) in mission.children || []" clickable :key="children.mission_id"
                :title="`${children.title} ${GetTime(children.start_time)} - ${GetTime(children.end_time)}`"
                @click="SubmissionClick(children)">
                <template #right-icon>
                  <van-checkbox :name="children.mission_id" @click.stop />
                </template>
              </van-cell>
            </van-cell-group>
          </van-checkbox-group>

          <!-- 签到按钮 -->
          <div class="join-button flex-BC">
            <span></span>
            <van-button type="primary" size="mini">签到</van-button>
          </div>

          <div>
            {{ mission.content }}
          </div>
        </div>
      </template>
    </van-collapse-item>
  </van-collapse>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Cell, CellGroup, Collapse, CollapseItem, Button, Checkbox, CheckboxGroup } from 'vant'

import MissionApi from '@/api/Mission/Mission'
import _ from 'lodash'
import moment from 'moment'

@Component({
  name: 'Mission',
  components: [Cell, CellGroup, Collapse, CollapseItem, Button, Checkbox, CheckboxGroup].reduce((components, component) => {
    components[component.name] = component
    return components
  }, {} as Record<string, any>)
})
export default class Mission extends Vue {

  activeCollapse: number[] = []

  missionList: any[] = []

  checked: number[] = []
  checkboxRefs: number[] = []

  created() {
    this.GetActiveMissionList()
  }

  async GetActiveMissionList() {
    const response = await MissionApi.Instance().GetActiveList()

    // 自动展开 今天、明天 的面板
    _.forEach(response, item => {
      if (item.diff <= 1) {
        this.activeCollapse.push(item.mission_id)
      }
    })

    // 根据临近天数 排序
    this.missionList = _.orderBy(response, 'diff', 'asc')
  }

  GetTime(time: string) {
    return moment(time).format('HH:mm:ss')
  }

  SubmissionClick(item: Record<string, any>) {
    const index = _.indexOf(this.checked, item.mission_id)
    if (~index) {
      this.checked.splice(index, 1)
    } else {
      this.checked.push(item.mission_id)
    }
  }

}
</script>