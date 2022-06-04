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

  .vehicle {
    .van-field {
      margin: 0 20px;
      padding: 0 5px;

      flex: 1;

      border-bottom: 1px #999 solid;
    }
  }
}
</style>

<template>
  <van-popup v-model="showPicker" round position="bottom" style="height: 300px" :close-on-click-overlay="false"
    @closed="$emit('update:visible', false)">

    <div class="control-button flex-BC">
      <span></span>
      <span class="cl-primary" @click="Submit">
        确认{{ SignText }}
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
            <van-popover v-model="showPopover" trigger="click" placement="top" :actions="vehicleActions"
              @select="OnSelectVehicle">
              <template #reference>
                <van-button type="info" size="small">选择交通工具</van-button>
              </template>
            </van-popover>
          </div>
        </template>
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
} from 'vant'

import { JoinMissionPickerData } from '@/views/Mission/index'
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

  submitData: JoinMissionPickerData = _.cloneDeep(this.data)

  showPicker = this.visible
  showTimePicker = false
  showPopover = false

  JoinMissionPickerType = JoinMissionPickerType
  VEHICLE = VEHICLE

  currentTime = moment().format('HH:mm')

  carNumber = ''

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

  created() {
    console.log(this.vehicleActions)
    const userInfo = Storage.Instance().get<IUserInfo>(StorageItemType.UserInfo)

    if (userInfo) {
      this.carNumber = userInfo.car_number || ''
    }
  }

  @Watch('visible')
  visibleChanged() {
    this.showPicker = this.visible
  }

  get SignText() {
    return this.type === JoinMissionPickerType.SIGN_IN ? '签到' : '签退'
  }

  GetVehicle() {
    return _.get(this.vehicleOptions, this.submitData.vehicle, '鬼知道我怎么来的')
  }

  OnSelectVehicle({ value }: {
    value: string
    text: string
  }) {
    this.submitData.vehicle = _.parseInt(value)
  }

  Submit() {
    this.$emit('submit', {
      ...this.submitData,
      datetime: `${moment().format('YYYY-MM-DD')} ${this.currentTime}:00`,
    } as JoinMissionPickerData)
    this.showPicker = false
  }
}
</script>
