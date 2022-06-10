<style lang="scss" scoped>
.empty-data {
  height: 200px;

  color: #ccc;
  font-size: 20px;
  letter-spacing: 1px;
}

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
  <div v-if="missionList.length === 0" class="empty-data flex-CC">
    <div>暂无任务</div>
  </div>
  <van-collapse v-else v-model="activeCollapse" class="mission">
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
                @click="!IsActived(mission.mission_id) && !IsComplete(mission.mission_id) ? SubmissionClick(mission, children) : null">
                <template #right-icon>
                  <van-checkbox :name="children.mission_id"
                    :disabled="IsActived(mission.mission_id) || IsComplete(mission.mission_id)" @click.stop />
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
              :color="mission.diff !== 0 || IsComplete(mission.mission_id) ? '#ccc' : ''" size="small"
              :disabled="mission.diff !== 0 || IsComplete(mission.mission_id)"
              @click="IsActived(mission.mission_id) ? SignOut(mission) : Sign(mission)" round block>
              {{ IsComplete(mission.mission_id) ? '已完成' : IsActived(mission.mission_id) ? '签退' : '签到' }}
            </van-button>
          </div>
        </div>
      </template>
    </van-collapse-item>

    <JoinMissionPicker :visible.sync="joinMissionPicker.visible" :data.sync="joinMissionPicker.data"
      :copy-data="joinMissionPicker.copyData" :type="joinMissionPicker.type" @submit="JoinMissionSubmit">
    </JoinMissionPicker>
  </van-collapse>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Cell, CellGroup, Collapse, CollapseItem, Button, Checkbox, CheckboxGroup, Notify } from 'vant'
import JoinMissionPicker from './components/JoinMissionPicker.vue'

import MissionApi from '@/api/Mission/Mission'
import _ from 'lodash'
import moment from 'moment'
import { MissionCopyData, JoinMissionPickerData } from '@/views/Mission/index'
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

  completeMission: number[] = []

  checked: number[] = []
  checkboxRefs: number[] = []

  /**
   * 当前类型
   */
  currentJoinMissionType = JoinMissionPickerType.SIGN_IN

  joinMissionPicker: {
    visible: boolean
    type: JoinMissionPickerType
    data: JoinMissionPickerData,
    copyData: MissionCopyData
  } = {
      visible: false,
      type: JoinMissionPickerType.SIGN_IN,
      data: {
        mission_id: 0,
        checked: [],
        datetime: '',
        vehicle: VEHICLE.CUSTOM,
        custom_vehicle: ''
      },
      copyData: {
        title: '',
        location: ''
      }
    }

  /**
   * 是否已加入该任务
   * @param mission_id
   */
  IsActived(mission_id: number) {
    return this.activedMission && this.activedMission.mission_id === mission_id
  }

  IsComplete(mission_id: number) {
    return this.completeMission.indexOf(mission_id) !== -1
  }

  created() {
    this.GetActiveMissionList()
  }

  /**
   * 获取可执行的任务
   */
  async GetActiveMissionList() {
    const response = await MissionApi.Instance().GetActiveList()

    this.activedMission = response.actived
    this.completeMission = _.map(response.complete, item => item.mission_id)

    // 自动展开 今天、明天 的面板
    _.forEach(response.lists, item => {
      item.checked = []

      // 正在进行的任务 子任务勾选
      if (_.get(response.actived, 'mission_id', null)) {
        item.checked = _.get(response.actived, 'submission_id', [])
      }

      // 已完成的任务 子任务勾选
      const complete = _.find(response.complete, { mission_id: item.mission_id })
      if (complete) {
        item.checked = _.get(complete, 'submission_id', [])
      }

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

  /**
   * 签到
   * @param mission 
   */
  Sign(mission: Record<string, any>) {
    // 有子任务 但没选择
    if (_.get(mission.children, 'length', 0) > 0 && _.get(mission.checked, 'length', 0) === 0) {
      Notify({
        type: 'warning',
        message: '请选择子任务'
      })
      return
    }

    this.currentJoinMissionType = JoinMissionPickerType.SIGN_IN
    this.joinMissionPicker.type = JoinMissionPickerType.SIGN_IN

    this.joinMissionPicker.data.mission_id = mission.mission_id
    this.joinMissionPicker.data.checked = mission.checked

    this.joinMissionPicker.copyData.title = mission.title
    this.joinMissionPicker.copyData.location = mission.location

    this.joinMissionPicker.visible = true
  }

  /**
   * 签退
   * @param mission
   */
  SignOut(mission: Record<string, any>) {
    this.currentJoinMissionType = JoinMissionPickerType.SIGN_OUT
    this.joinMissionPicker.type = JoinMissionPickerType.SIGN_OUT

    this.joinMissionPicker.data.mission_id = mission.mission_id
    this.joinMissionPicker.data.checked = mission.checked

    this.joinMissionPicker.copyData.title = mission.title
    this.joinMissionPicker.copyData.location = mission.location

    this.joinMissionPicker.visible = true
  }

  /**
   * 签到 提交
   * @param data
   */
  async JoinMissionSubmit(data: JoinMissionPickerData) {
    if (this.currentJoinMissionType === JoinMissionPickerType.SIGN_IN) {
      await MissionApi.Instance().SignIn({
        ...data,
        create_type: 0
      })

      this.activedMission = {
        mission_id: data.mission_id,
        submission_id: data.checked
      }
    } else {
      await MissionApi.Instance().SignOut(data)

      this.activedMission = null
      this.completeMission.push(data.mission_id)
    }

    Notify({
      type: 'success',
      message: `${this.currentJoinMissionType === JoinMissionPickerType.SIGN_IN ? '签到' : '签退'}成功`
    })
  }

}
</script>