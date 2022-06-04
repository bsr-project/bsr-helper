<style lang="scss" scoped>
.mission {
  .title {
    font-size: 16px;
    font-weight: bold;
  }

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

  .join-button {
    margin-top: 20px;
    margin-bottom: 10px;
    padding: 0 16px;
  }

}
</style>

<template>
  <van-collapse v-model="activeCollapse" class="mission">
    <van-collapse-item v-for="(mission) in missionList" :key="mission.mission_id" :name="mission.mission_id">
      <template #title>
        <span class="title">{{ mission.title }}</span>
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
          <van-checkbox-group v-if="mission.children && mission.children.length > 0" v-model="mission.checked"
            class="submission">
            <van-cell-group inset>
              <van-cell v-for="(children) in mission.children || []" clickable :key="children.mission_id"
                :title="`${children.title} ${GetTime(children.start_time)} - ${GetTime(children.end_time)}`"
                @click="IsActived(mission.mission_id) ? SubmissionClick(mission, children) : null">
                <template #right-icon>
                  <van-checkbox :name="children.mission_id" :disabled="!IsActived(mission.mission_id)" @click.stop />
                </template>
              </van-cell>
            </van-cell-group>
          </van-checkbox-group>

          <div>
            任务时间：{{ GetTime(mission.start_time) }} - {{ GetTime(mission.end_time) }}
          </div>

          <div>
            任务地点：{{ mission.location }}
          </div>

          <div>
            任务内容：<br><br>
            {{ mission.content }}
          </div>

          <!-- 签到按钮 -->
          <div class="join-button flex-BC">
            <span></span>
            <van-button :type="IsActived(mission.mission_id) ? 'warning' : 'primary'"
              :color="mission.diff !== 0 ? '#ccc' : ''" size="small"
              :disabled="mission.diff !== 0 || !IsActived(mission.mission_id)"
              @click="IsActived(mission.mission_id) ? SignOut(mission) : Sign(mission)" round block>
              {{ IsActived(mission.mission_id) ? '签退' : '签到' }}
            </van-button>
          </div>
        </div>
      </template>
    </van-collapse-item>

    <JoinMissionPicker :visible.sync="joinMissionPicker.visible" :data.sync="joinMissionPicker.data"
      :type="joinMissionPicker.type"></JoinMissionPicker>
  </van-collapse>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Cell, CellGroup, Collapse, CollapseItem, Button, Checkbox, CheckboxGroup, Notify } from 'vant'
import JoinMissionPicker from './components/JoinMissionPicker.vue'

import MissionApi from '@/api/Mission/Mission'
import _ from 'lodash'
import moment from 'moment'
import { JoinMissionPickerData } from '@/views/Mission/index'
import { JoinMissionPickerType, VEHICLE } from '@/enums/JoinMission'

@Component({
  name: 'Mission',
  components: {
    ...[Cell, CellGroup, Collapse, CollapseItem, Button, Checkbox, CheckboxGroup].reduce((components, component) => {
      components[component.name] = component
      return components
    }, {} as Record<string, any>),

    JoinMissionPicker
  }
})
export default class Mission extends Vue {

  activeCollapse: number[] = []

  missionList: any[] = []

  activedMission: {
    mission_id: number
    submission_id: number[]
  } | null = null

  checked: number[] = []
  checkboxRefs: number[] = []

  joinMissionPicker: {
    visible: boolean
    type: JoinMissionPickerType
    data: JoinMissionPickerData
  } = {
      visible: false,
      type: JoinMissionPickerType.SIGN_IN,
      data: {
        mission_id: 0,
        checked: [],
        datetime: '',
        vehicle: VEHICLE.CUSTOM,
        custom_vehicle: ''
      }
    }

  /**
   * 是否已加入该任务
   * @param mission_id 
   */
  IsActived(mission_id: number) {
    return this.activedMission && this.activedMission.mission_id === mission_id
  }

  created() {
    this.GetActiveMissionList()
  }

  async GetActiveMissionList() {
    const response = await MissionApi.Instance().GetActiveList()

    this.activedMission = response.actived

    // 自动展开 今天、明天 的面板
    _.forEach(response.lists, item => {

      item.checked =
        item.mission_id === _.get(response.actived, 'mission_id', null)
          ? _.get(response.actived, 'submission_id', [])
          : []

      if (item.diff <= 1) {
        this.activeCollapse.push(item.mission_id)
      }
    })

    // 根据临近天数 排序
    this.missionList = _.orderBy(response.lists, 'diff', 'asc')
  }

  GetTime(time: string) {
    return moment(time).format('HH:mm:ss')
  }

  SubmissionClick(mission: Record<string, any>, children: Record<string, any>) {
    const index = _.indexOf(mission.checked, children.mission_id)
    if (~index) {
      mission.checked.splice(index, 1)
    } else {
      mission.checked.push(children.mission_id)
    }
  }

  Sign(mission: Record<string, any>) {
    // 有子任务 但没选择
    if (_.get(mission.children, 'length', 0) > 0 && _.get(mission.checked, 'length', 0) === 0) {
      Notify({
        type: 'warning',
        message: '请选择子任务'
      })
      return
    }

    this.joinMissionPicker.type = JoinMissionPickerType.SIGN_IN

    this.joinMissionPicker.data.mission_id = mission.mission_id
    this.joinMissionPicker.data.checked = mission.checked

    this.joinMissionPicker.visible = true
  }

  SignOut(mission: Record<string, any>) {
    console.log('mission', mission)

    this.joinMissionPicker.type = JoinMissionPickerType.SIGN_OUT

    this.joinMissionPicker.data.mission_id = mission.mission_id
    this.joinMissionPicker.data.checked = mission.checked

    this.joinMissionPicker.visible = true
  }

  submit(data: JoinMissionPickerData) {
    // MissionApi.Instance().SignIn({
    //   mission_id: mission.mission_id,
    //   submission_id: mission.checked,
    //   create_type: 0
    // })
    console.log(data)
  }

}
</script>