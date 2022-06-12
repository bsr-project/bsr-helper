<style lang="scss" scoped>
.control-button {
  padding: 10px 20px 0 20px;

  span {
    padding: 3px 5px;
  }
}

.container {
  margin-top: 30px;
  padding: 0 10px;

  .vehicle,
  .departure {
    .van-field {
      margin: 0 20px;
      padding: 0 5px;

      flex: 1;

      border-bottom: 1px #999 solid;
    }
  }
}

.information-return {
  position: relative;

  display: flex;
  flex-direction: row;

  ::v-deep {
    .van-cell__title {
      flex: none;
      width: 100px;
    }

    .van-cell {
      padding: 0;
    }
  }

  .copy {
    position: absolute;
    bottom: 0;
    right: 0;
  }
}
</style>

<template>
  <van-popup v-model="showPicker" round position="bottom" style="height: 400px" :close-on-click-overlay="false"
    @closed="$emit('update:visible', false)">

    <div class="control-button flex-BC">
      <span class="cl-9" @click="showPicker = false">关闭</span>
      <span class="cl-primary" @click="Submit">
        {{ SignText }}并复制
      </span>
    </div>

    <van-cell-group class="container">
      <van-cell>
        <template #title>
          <div class="flex-BC">
            <span>{{ SignText }}时间：{{ currentTime }}</span>
            <van-button type="info" size="small" @click="showTimePicker = true">选择时间</van-button>
          </div>
        </template>
      </van-cell>

      <van-cell class="vehicle">
        <template #title>
          <div class="flex-BC">
            <span>交通工具：{{ GetVehicle() }} {{
                submitData.vehicle === VEHICLE.DRIVE && carNumber !== ''
                  ? `(${carNumber})`
                  : ''
            }}</span>
            <van-field v-show="submitData.vehicle === VEHICLE.CUSTOM" v-model="submitData.custom_vehicle"
              placeholder="例：骑马" />
            <van-field v-show="submitData.vehicle === VEHICLE.TAXI" v-model="taxiCarNumber" placeholder="车牌号" />
            <van-popover v-model="showPopover" trigger="click" placement="top" :actions="vehicleActions"
              @select="OnSelectVehicle">
              <template #reference>
                <van-button type="info" size="small">选择交通工具</van-button>
              </template>
            </van-popover>
          </div>
        </template>
      </van-cell>

      <van-cell v-if="type === JoinMissionPickerType.SIGN_IN" title="出发地：" class="departure">
        <template #title>
          <div class="flex-BC">
            <span>出发地：</span>
            <van-field v-model="departure" />
          </div>
        </template>
      </van-cell>

      <van-cell title="信息回传：" class="information-return">
        <div>
          <van-field v-model="copyText" rows="3" autosize readonly type="textarea" />
        </div>
        <van-button class="copy" type="info" size="mini" @click="copy">复制</van-button>
      </van-cell>
    </van-cell-group>

    <van-popup v-model="showTimePicker" round position="bottom" style="height: 320px">
      <van-datetime-picker v-model="currentTime" type="time" title="选择时间" cancel-button-text=" "
        confirm-button-text="关闭" @confirm="showTimePicker = false" @cancel="showTimePicker = false" />
    </van-popup>
  </van-popup>
</template>

<script lang="ts">
import _ from 'lodash'
import moment from 'moment'
import clipboardCopy from 'clipboard-copy'

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import {
  Cell,
  Popup,
  Field,
  Picker,
  Button,
  Popover,
  CellGroup,
  DatetimePicker,
  Notify,
} from 'vant'

import { MissionCopyData, JoinMissionPickerData } from '@/views/Mission/index'
import { JoinMissionPickerType, VEHICLE } from '@/enums/JoinMission'
import Storage from '@/utils/Storage'
import { StorageItemType } from '@/enums/Storage'
import { IUserInfo } from '@/store/modules/User'

@Component({
  name: 'JoinMissionPicker',
  components: [
    Cell,
    Popup,
    Field,
    Picker,
    Button,
    Popover,
    CellGroup,
    DatetimePicker,
  ].reduce((components, component) => {
    components[component.name] = component
    return components
  }, {} as { [key: string]: any })
})
export default class JoinMissionPicker extends Vue {
  @Prop({
    required: true,
    type: Boolean
  })
  visible!: boolean

  @Prop({
    required: true,
    type: Object
  })
  data!: JoinMissionPickerData

  @Prop({
    required: true,
    type: Number
  })
  type!: JoinMissionPickerType

  @Prop({
    required: true,
    type: Object
  })
  copyData!: MissionCopyData

  userInfo: IUserInfo = {
    realname: null,
    mobile: null,
    bsr_code: null,
    car_number: null,
    id: 0,
    name: ''
  }

  submitData: JoinMissionPickerData = {
    mission_id: 0,
    checked: [],
    datetime: '',
    vehicle: VEHICLE.CUSTOM
  }

  showPicker = this.visible
  showTimePicker = false
  showPopover = false

  JoinMissionPickerType = JoinMissionPickerType
  VEHICLE = VEHICLE

  currentTime = moment().format('HH:mm')

  carNumber = ''
  taxiCarNumber = ''

  /**
   * 出发地
   */
  departure = ''

  vehicleOptions: Record<number, string> = {
    [VEHICLE.CUSTOM]: '自定义',
    [VEHICLE.DRIVE]: '开车',
    [VEHICLE.WALK]: '步行',
    [VEHICLE.BIKE]: '骑车',
    [VEHICLE.TAXI]: '打车',
    [VEHICLE.METRO]: '乘地铁',
    [VEHICLE.BUS]: '乘公交',
  }

  vehicleActions = _.map(_.keys(this.vehicleOptions), (key: number) => ({
    value: key,
    text: this.vehicleOptions[key]
  }))

  copyText = ''

  created() {
    const userInfo = Storage.Instance().get<IUserInfo>(StorageItemType.UserInfo)

    if (userInfo) {
      this.userInfo = userInfo
      this.carNumber = userInfo.car_number || ''
    }
  }

  @Watch('visible')
  visibleChanged() {
    this.showPicker = this.visible

    if (this.visible) {
      this.submitData = _.cloneDeep(this.data)
      this.generateCopyText()
    }
  }

  @Watch('currentTime')
  currentTimeChanged() {
    this.generateCopyText()
  }

  @Watch('departure')
  departureChanged() {
    this.generateCopyText()
  }

  @Watch('submitData.custom_vehicle')
  DataCustomVehicleChanged() {
    this.generateCopyText()
  }

  @Watch('taxiCarNumber')
  taxiCarNumberChanged() {
    this.generateCopyText()
  }

  get SignText() {
    return this.type === JoinMissionPickerType.SIGN_IN ? '签到' : '签退'
  }

  /**
   * 生成复制文本
   */
  generateCopyText() {
    const departure = this.departure !== '' ? `从${this.departure}出发` : ''
    if (this.type === JoinMissionPickerType.SIGN_IN) {
      switch (this.submitData.vehicle) {
        case VEHICLE.CUSTOM: {
          this.copyText = `${this.currentTime} ${this.userInfo.realname}1人${this.submitData.custom_vehicle}${departure}前往${this.copyData.location}参加${this.copyData.title}`
          break
        }

        case VEHICLE.DRIVE: {
          this.copyText = `${this.currentTime} ${this.userInfo.realname}1人1车(${this.userInfo.car_number})${departure}前往${this.copyData.location}参加${this.copyData.title}`
          break
        }

        case VEHICLE.TAXI: {
          const carNumber = this.taxiCarNumber !== '' ? `(${this.taxiCarNumber})` : ''
          this.copyText = `${this.currentTime} ${this.userInfo.realname}1人打车${carNumber}${departure}前往${this.copyData.location}参加${this.copyData.title}`
          break
        }

        default: {
          this.copyText = `${this.currentTime} ${this.userInfo.realname}1人${departure}${this.GetVehicle()}前往${this.copyData.location}参加${this.copyData.title}`
        }
      }
    } else {
      switch (this.submitData.vehicle) {
        case VEHICLE.CUSTOM: {
          this.copyText = `${this.currentTime} ${this.userInfo.realname}1人完成${this.copyData.title}${this.submitData.custom_vehicle}从${this.copyData.location}出发并安全到家`
          break
        }

        case VEHICLE.DRIVE: {
          this.copyText = `${this.currentTime} ${this.userInfo.realname}1人1车(${this.userInfo.car_number})完成${this.copyData.title}从${this.copyData.location}出发并安全到家`
          break
        }

        case VEHICLE.TAXI: {
          const carNumber = this.taxiCarNumber !== '' ? `(${this.taxiCarNumber})` : ''
          this.copyText = `${this.currentTime} ${this.userInfo.realname}1人完成${this.copyData.title}打车${carNumber}从${this.copyData.location}出发并安全到家`
          break
        }

        default: {
          this.copyText = `${this.currentTime} ${this.userInfo.realname}1人完成${this.copyData.title}${this.GetVehicle()}从${this.copyData.location}出发并安全到家`
        }
      }
    }
  }

  GetVehicle() {
    return _.get(this.vehicleOptions, this.submitData.vehicle, '鬼知道我怎么来的')
  }

  OnSelectVehicle({ value }: {
    value: string
    text: string
  }) {
    this.submitData.vehicle = _.parseInt(value)
    this.generateCopyText()
  }

  copy() {
    clipboardCopy(this.copyText)
      .then(() => {
        Notify({ type: 'success', message: '复制成功' })
      })
      .catch(() => {
        Notify({ type: 'danger', message: '复制失败' })
      })
  }

  Submit() {
    if (this.submitData.vehicle === VEHICLE.CUSTOM && _.trim(this.submitData.custom_vehicle) === '') {
      this.$notify({
        type: 'danger',
        message: '请填写交通工具'
      })
      return
    }

    this.$emit('submit', {
      ...this.submitData,
      submission_id: this.submitData.checked,
      datetime: `${moment().format('YYYY-MM-DD')} ${this.currentTime}:00`,
    } as JoinMissionPickerData)

    this.copy()
    this.showPicker = false
  }
}
</script>
