<style lang="scss" scoped>
.van-collapse-item {
  ::v-deep {
    .van-collapse-item__title {
      background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
    }

    .personnel-name {
      display: flex;
      flex-direction: row;

      .van-field {
        margin-left: 10px;
        border-bottom: 1px #666 solid;
      }

      .van-checkbox {
        width: 30px;
      }
    }

    .personnel-right {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .flip-list-move {
      transition: transform 0.5s;
    }
    .no-move {
      transition: transform 0s;
    }

    .drag-handle {
      padding: 10px;
      font-size: 20px;
    }
  }
}

.output-textarea {
  padding: 10px 0;
  background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);

  .output-text-type {
    .van-cell__value {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      .output-text-type-item {
        display: flex;
        flex-direction: row;

        & > div {
          margin: 0 5px;
          padding: 5px 10px;
          border-radius: 5px;

          border: 1px #ccc solid;
          background-color: #f6f6f6;
          color: #ccc;

          &.active {
            border: 1px #ccc solid;
            background-color: #fff;
            color: #000;
          }
        }
      }
    }
  }
}

.current-time {
  margin-right: 10px;
  color: #666;
}

.icon-fangxiangpan {
  font-size: 26px;
}

.ghost {
  opacity: 0;
}

.sortable-drag {
  ::v-deep {
    .icon-fangxiangpan {
      display: none;
    }
  }
}

.add-personnel {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #3cba92;

  span {
    margin-left: 5px;
  }
}

.van-swipe-cell {
  ::v-deep .van-swipe-cell__right {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.vehicle {
  .van-cell {
    .van-cell__title {
      display: flex;
      justify-content: left;
      align-items: center;

      & > div {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;

        span {
          margin-left: 20px;
        }
      }
    }
  }

  .vehicle-input {
    .van-field {
      padding: 0 10px;
      border-bottom: 1px #000 solid;
    }
  }
}

.professionalToolsList {
  .van-tag {
    margin: 5px;
  }
}
</style>

<template>
  <div>
    <!-- 输出内容 -->
    <div class="output-textarea">
      <van-cell-group inset>
        <van-cell class="output-text-type">
          <div class="output-text-type-item">
            <div
              v-for="(name, key) in OutputTextType"
              :key="key"
              @click="outputTextTypeValue = name"
              :class="{ active: outputTextTypeValue === name }"
            >
              {{ name }}
            </div>
          </div>
          <div>
            <span @click="copy">复制</span>
          </div>
        </van-cell>
        <van-cell>
          <van-field v-model="outputText" rows="3" autosize type="textarea" />
        </van-cell>
      </van-cell-group>
    </div>

    <van-collapse v-model="activeNames">
      <!-- 任务简介 -->
      <van-collapse-item name="mission">
        <template #title>
          <span class="collapse-item-title">任务简介</span>
        </template>
        <van-cell-group inset>
          <van-cell>
            <van-field
              v-model="missionContent"
              rows="2"
              autosize
              type="textarea"
              placeholder="如：马拉松安保训练"
            />
          </van-cell>
        </van-cell-group>
      </van-collapse-item>

      <!-- 时间 -->
      <van-collapse-item name="time">
        <template #title>
          <span class="collapse-item-title">时间</span>
        </template>

        <van-cell center>
          <template #title>
            <span :style="{ color: isCurrentTime ? '' : '#ccc' }">
              使用当前时间
            </span>
          </template>
          <template #right-icon>
            <span v-if="isCurrentTime" class="current-time">
              {{ currentTime }}
            </span>
            <van-switch
              v-model="isCurrentTime"
              active-color="#13ce66"
              size="24"
            />
          </template>
        </van-cell>

        <van-cell v-if="!isCurrentTime" center title="自定义时间">
          <template #label>
            <van-field
              v-model="startTimeText"
              center
              clearable
              label="起始时间"
              placeholder="请输入或选择一个时间"
            >
              <template #button>
                <van-button
                  size="small"
                  type="primary"
                  class="select-time"
                  @click="selectTime(selectTimeType.START)"
                  >选择</van-button
                >
              </template>
            </van-field>

            <van-field
              v-model="endTimeText"
              center
              clearable
              label="结束时间"
              placeholder="可选"
            >
              <template #button>
                <van-button
                  size="small"
                  type="primary"
                  class="select-time"
                  @click="selectTime(selectTimeType.END)"
                  >选择</van-button
                >
              </template>
            </van-field>
          </template>
        </van-cell>
      </van-collapse-item>

      <!-- 人员 -->
      <van-collapse-item class="personnel" name="personnel">
        <template #title>
          <span class="collapse-item-title">人员</span>
        </template>

        <draggable
          class="draggable"
          :list="personnelList"
          v-bind="dragOptions"
          handle=".dragHandle"
          @start="drag = true"
          @end=";(drag = false), savePersonnel()"
        >
          <transition-group
            type="transition"
            :name="!drag ? 'flip-list' : null"
            class="list-group"
          >
            <div
              v-for="(personnel, index) in getPersonnelList"
              :key="index"
              :class="{
                checked: personnel.checked
              }"
            >
              <!-- 滑动单元格 -->
              <van-swipe-cell
                :disabled="drag"
                @open="personnel.draggable = false"
                @close="personnel.draggable = true"
              >
                <!-- 单元格 -->
                <van-cell>
                  <!-- 姓名输入框 -->
                  <template #title>
                    <div class="personnel-name">
                      <van-checkbox
                        v-model="personnel.checked"
                        @change="savePersonnel"
                      />
                      <van-field
                        v-model="personnel.name"
                        placeholder="请输入姓名"
                      />
                    </div>
                  </template>

                  <template>
                    <div class="personnel-right">
                      <!-- 司机标识 -->
                      <div
                        v-if="
                          !drag &&
                          vehicle === VehicleType.Drive &&
                          personnel.driver
                        "
                        class="driver"
                      >
                        <i class="iconfont icon-fangxiangpan"></i>
                      </div>
                      <div v-else />

                      <!-- 拖拽标识 -->
                      <div
                        class="drag-handle"
                        :class="{ dragHandle: personnel.draggable }"
                      >
                        <van-icon name="wap-nav" />
                      </div>
                    </div>
                  </template>
                </van-cell>

                <!-- 左滑删除按钮 -->
                <template #right>
                  <van-button
                    square
                    type="danger"
                    text="删除"
                    @click="removePersonnel(index)"
                  />
                </template>
              </van-swipe-cell>
            </div>
          </transition-group>
        </draggable>
        <div class="add-personnel" @click="addPersonnel">
          <van-icon name="plus" />
          <span>添加</span>
        </div>
      </van-collapse-item>

      <!-- 交通工具 -->
      <van-collapse-item name="vehicle" class="vehicle">
        <template #title>
          <span class="collapse-item-title">交通工具</span>
        </template>

        <van-radio-group v-model="vehicle" @change="saveVehicle">
          <van-cell
            v-for="item in vehicleList"
            :key="item.type"
            @click="vehicle = item.type"
          >
            <template #title>
              <div>
                <van-radio :name="item.type" />
                <span>{{ item.name }}</span>
              </div>
            </template>
            <!-- 输入框 -->
            <template v-if="item.type === VehicleType.Custom">
              <div class="vehicle-input">
                <van-field v-model="vehicleCustom" placeholder="如：骑马" />
              </div>
            </template>
            <template v-else-if="item.type === VehicleType.Drive">
              <div class="vehicle-input">
                <van-field v-model="carNumber" placeholder="车牌号" />
              </div>
            </template>
          </van-cell>
        </van-radio-group>
      </van-collapse-item>

      <!-- 专业工具 -->
      <van-collapse-item name="professionalTools">
        <template #title>
          <span class="collapse-item-title">专业工具</span>
        </template>

        <van-search
          v-model="professionalToolName"
          :show-action="filtratedProfessionalToolsList.length === 0"
          placeholder="请输入搜索关键词"
        >
          <template #action>
            <div @click="addProfessionalTool">添加</div>
          </template>
        </van-search>

        <van-cell>
          <div class="professionalToolsList">
            <van-tag
              type="primary"
              v-for="item in filtratedProfessionalToolsList"
              :key="item.name"
              :plain="!item.selected"
              size="large"
              :color="!item.selected ? '#ccc' : ''"
              @click="item.selected = !item.selected"
              >{{ item.name }}</van-tag
            >
          </div>
        </van-cell>
      </van-collapse-item>
    </van-collapse>

    <van-popup
      v-model="timePickerShow"
      position="bottom"
      :style="{ height: '320px' }"
    >
      <van-datetime-picker
        v-model="currentDate"
        type="datetime"
        title="选择完整时间"
        @confirm="datetimeConfirm($event)"
        @cancel="timePickerShow = false"
      />
    </van-popup>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
import _ from 'lodash'
import clipboardCopy from 'clipboard-copy'

import Storage from '@/utils/Storage'
import { InformationReturnTypes } from '@/views/InformationReturn/index'
import getProfessionalToolsList from '@/views/InformationReturn/professionalToolsList'

import { Component, Vue, Watch } from 'vue-property-decorator'
import {
  Cell,
  CellGroup,
  Collapse,
  CollapseItem,
  Field,
  Switch,
  DatetimePicker,
  Popup,
  Button,
  List,
  Icon,
  Checkbox,
  Radio,
  RadioGroup,
  SwipeCell,
  Search,
  Tag,
  Tab,
  Tabs,
  Notify
} from 'vant'
import Draggable from 'vuedraggable'

import {
  SelectTimeType,
  VehicleType,
  OutputTextType
} from '@/enums/InformationReturn'
import { StorageItemType } from '@/enums/Storage'

@Component({
  components: [
    Cell,
    CellGroup,
    Collapse,
    CollapseItem,
    Field,
    Switch,
    DatetimePicker,
    Popup,
    Button,
    List,
    Icon,
    Checkbox,
    Radio,
    RadioGroup,
    SwipeCell,
    Search,
    Tag,
    Tab,
    Tabs,
    Notify,
    Draggable
  ].reduce((components, component) => {
    components[component.name] = component
    return components
  }, {} as { [key: string]: any })
})
export default class InformationReturn extends Vue {
  private outputTextTypeValue = OutputTextType.StartOff
  private OutputTextType = OutputTextType
  private _outputText = ''

  private activeNames = [
    'mission',
    'time',
    'personnel',
    'vehicle',
    'professionalTools'
  ]

  private missionContent = '马拉松安保训练'

  private timePickerShow = false

  private selectTimeType = SelectTimeType
  private currentSelectTimeType = SelectTimeType.START
  private isCurrentTime = true
  private currentTime = ''
  private timer: number | null = null
  private currentDate = new Date()

  private timeFormat = 'YYYY/MM/DD HH:mm'
  private startTime: Date | null = new Date()
  private endTime: Date | null = null

  private startTimeText = ''
  private endTimeText = ''

  private drag = false
  private personnelList: InformationReturnTypes.PersonnelList[] = [
    {
      name: '',
      checked: true,
      driver: false,
      draggable: true
    }
  ]

  // 交通工具
  private VehicleType = VehicleType
  private vehicle = VehicleType.Custom
  private vehicleList: InformationReturnTypes.VehicleItem[] = [
    {
      type: VehicleType.Custom,
      name: '自定义'
    },
    {
      type: VehicleType.Drive,
      name: '开车'
    },
    {
      type: VehicleType.Bike,
      name: '骑车'
    },
    {
      type: VehicleType.Walk,
      name: '步行'
    },
    {
      type: VehicleType.Metro,
      name: '地铁'
    },
    {
      type: VehicleType.Bus,
      name: '公交'
    }
  ]
  private carNumber = ''
  private vehicleCustom = ''

  /**
   * 搜索用 专业工具名称
   */
  private professionalToolName = ''

  /**
   * 专业工具 列表
   */
  private professionalToolsList: InformationReturnTypes.ProfessionalToolItem[] =
    getProfessionalToolsList()

  /**
   * 自定义专业工具 列表
   */
  customProfessionalToolsList: InformationReturnTypes.ProfessionalToolItem[] =
    []

  created() {
    // 任务简介
    this.missionContent =
      Storage.Instance.get(StorageItemType.Mission) || this.missionContent

    // 时间
    const storageTime =
      Storage.Instance.get<InformationReturnTypes.StorageTime>(
        StorageItemType.Time
      )

    // 如果保存过时间
    if (storageTime) {
      // 如果存在最后复制的时间 && 使用了当前时间
      if (storageTime.lastCopy && storageTime.isCurrent) {
        // 设置关闭当前时间
        this.isCurrentTime = false
        // 设置开始时间 为 最后复制的时间
        this.startTime = new Date(parseInt(storageTime.lastCopy))
        // 设置结束时间 为 当前时间
        this.endTime = new Date()
        // 设置为回家
        this.outputTextTypeValue = OutputTextType.GoBackHome
      } else {
        this.isCurrentTime = true
        this.isCurrentTimeChanged(true)
        this.startTime = null
        this.endTime = null
      }
    } else {
      this.isCurrentTime = true
      this.isCurrentTimeChanged(true)
    }

    // 人员
    this.personnelList =
      Storage.Instance.get(StorageItemType.Personnel) || this.personnelList

    // 交通工具
    const storageVehicle =
      Storage.Instance.get<InformationReturnTypes.StorageVehicle>(
        StorageItemType.Vehicle
      )

    if (storageVehicle) {
      this.vehicle = storageVehicle.current
      this.vehicleCustom = storageVehicle.custom || ''
      this.carNumber = storageVehicle.carNumber || ''
    }

    // 专业工具
    const storageProfessionalTool =
      Storage.Instance.get<InformationReturnTypes.StorageProfessionalTool>(
        StorageItemType.ProfessionalTools
      )

    if (storageProfessionalTool) {
      this.professionalToolsList = storageProfessionalTool.list
      this.customProfessionalToolsList = storageProfessionalTool.custom
    }
  }

  get outputText() {
    // 时间
    let timeText = ''

    // 使用当前时间
    if (this.isCurrentTime) {
      timeText = this.currentTime
    } else if (this.startTime) {
      // 自定义时间 有开始时间
      const date = this.endTime || new Date()

      const timeFormat = this.getFormat(
        this.startTime.getFullYear() !== date.getFullYear(),
        this.startTime.getMonth() !== date.getMonth(),
        this.startTime.getDay() !== date.getDay()
      )

      // 有结束时间
      if (this.endTime) {
        timeText = `${moment(this.startTime).format(timeFormat)}-${moment(
          this.endTime
        ).format(timeFormat)}`
      } else {
        // 没结束时间
        timeText = moment(this.startTime).format(timeFormat)
      }
    }

    // 过滤打勾的人员
    const checkedPersonnelList = this.personnelList.filter(
      (personnel) => personnel.checked
    )

    // 交通工具
    let vehicle = ''
    const vehicleInfo = _.find(this.vehicleList, { type: this.vehicle })
    switch (this.vehicle) {
      case VehicleType.Custom:
        vehicle = this.vehicleCustom
        break
      case VehicleType.Drive:
        vehicle = `1车 (${this.carNumber})`
        break
      case VehicleType.Walk:
      case VehicleType.Bike:
        vehicle = vehicleInfo!.name
        break
      default:
        vehicle = `乘${vehicleInfo ? vehicleInfo.name : '车'}`
    }

    // 专业工具
    const professionalToolsSelectedList = _.concat(
      this.professionalToolsList.filter((item) => item.selected),
      this.customProfessionalToolsList.filter((item) => item.selected)
    )

    const outputTextArray = [
      '【信息回传】',
      // 时间
      timeText,
      // 人员
      checkedPersonnelList.map((personnel) => personnel.name).join('、'),
      // 人数
      `${checkedPersonnelList.length}人`,
      // 交通工具
      vehicle,
      // 携带工具
      professionalToolsSelectedList.length > 0
        ? `携带${professionalToolsSelectedList
            .map((item) => item.name)
            .join('、')}`
        : '',

      // 前往
      this.outputTextTypeValue === OutputTextType.StartOff ? '前往' : '',
      // 完成
      this.outputTextTypeValue === OutputTextType.GoBackHome ? '完成' : '',
      // 任务
      this.missionContent,
      // 安全到家
      this.outputTextTypeValue === OutputTextType.GoBackHome ? '安全到家' : ''
    ]

    // 过滤出空值
    this._outputText = outputTextArray.filter((item) => item !== '').join(' ')

    return this._outputText
  }

  set outputText(val) {
    this._outputText = val
  }

  get dragOptions() {
    return {
      animation: 200,
      group: 'description',
      disabled: false,
      ghostClass: 'ghost'
    }
  }

  get getPersonnelList() {
    // 是否已找到司机
    let foundDriver = false
    return _.map(this.personnelList, (item) => {
      if (item && item.checked && !foundDriver) {
        item.driver = true
        foundDriver = true
      } else {
        item.driver = false
      }

      return item
    })
  }

  /**
   * 已过滤关键词的专业工具列表
   */
  get filtratedProfessionalToolsList() {
    if (this.professionalToolName === '') {
      return _.concat(
        this.professionalToolsList,
        this.customProfessionalToolsList
      )
    }

    const list = this.professionalToolsList.filter(
      (item) => ~item.name.indexOf(this.professionalToolName)
    )
    const custom = this.customProfessionalToolsList.filter(
      (item) => ~item.name.indexOf(this.professionalToolName)
    )
    return _.concat(list, custom)
  }

  @Watch('isCurrentTime')
  isCurrentTimeChanged(val: boolean) {
    if (val) {
      this.startTimer()
    } else {
      this.stopTimer()
    }
  }

  @Watch('startTime')
  startTimeChanged(time: Date | null) {
    this.startTimeText = time ? moment(time).format(this.timeFormat) : ''
  }

  @Watch('endTime')
  endTimeChanged(time: Date | null) {
    this.endTimeText = time ? moment(time).format(this.timeFormat) : ''
  }

  getTimeString(time: Date) {
    return moment(time, this.timeFormat).toDate()
  }

  selectTime(type: SelectTimeType) {
    this.currentSelectTimeType = type

    // 时间不为空 设置时间选择器为相应的时间
    if (type === SelectTimeType.START && this.startTime instanceof Date) {
      this.currentDate = this.startTime
    } else if (type === SelectTimeType.END && this.endTime instanceof Date) {
      this.currentDate = this.endTime
    } else {
      // 否则设置为现在的时间
      this.currentDate = new Date()
    }
    this.timePickerShow = true
  }

  datetimeConfirm(time: Date) {
    if (this.currentSelectTimeType === SelectTimeType.START) {
      // 修改开始时间
      this.startTime = time
    } else if (this.currentSelectTimeType === SelectTimeType.END) {
      // 修改结束时间
      this.endTime = time
    }
    this.timePickerShow = false
  }

  /**
   * 开启获取当前时间的计时器
   */
  startTimer() {
    this.currentTime = moment().format('HH:mm')
    this.timer = setInterval(() => {
      this.currentTime = moment().format('HH:mm')
    }, 1000)
  }

  /**
   * 停止获取当前时间的计时器
   */
  stopTimer() {
    if (this.timer === null) return
    clearInterval(this.timer)
    this.timer = null
  }

  addPersonnel() {
    this.personnelList.push({
      name: '',
      checked: true,
      driver: false,
      draggable: true
    })
  }

  removePersonnel(index: number) {
    this.personnelList.splice(index, 1)
  }

  addProfessionalTool() {
    this.customProfessionalToolsList.push({
      name: this.professionalToolName,
      selected: true
    })
    // 保存
    this.saveProfessionalTool()
  }

  /**
   * 保存人员
   */
  savePersonnel() {
    Storage.Instance.set(StorageItemType.Personnel, this.personnelList)
  }

  /**
   * 保存交通工具
   */
  saveVehicle() {
    Storage.Instance.set<InformationReturnTypes.StorageVehicle>(
      StorageItemType.Vehicle,
      {
        current: this.vehicle,
        custom: this.vehicleCustom,
        carNumber: this.carNumber
      }
    )
  }

  /**
   * 保存自己添加的专业工具
   */
  saveProfessionalTool() {
    Storage.Instance.set<InformationReturnTypes.StorageProfessionalTool>(
      StorageItemType.ProfessionalTools,
      {
        list: this.professionalToolsList,
        custom: this.customProfessionalToolsList
      }
    )
  }

  /**
   * 获取时间格式
   * @param yearNeq 年不相等
   * @param monthNeq 月不相等
   * @param dayNeq 日不相等
   */
  getFormat(yearNeq: boolean, monthNeq: boolean, dayNeq: boolean) {
    if (yearNeq) {
      return 'YYYY/MM/DD HH:mm'
    } else if (monthNeq) {
      return 'MM/DD HH:mm'
    } else if (dayNeq) {
      return 'DD日 HH:mm'
    } else {
      return 'HH:mm'
    }
  }

  copy() {
    clipboardCopy(this._outputText)
      .then(() => {
        Notify({ type: 'success', message: '复制成功' })
      })
      .catch(() => {
        Notify({ type: 'danger', message: '复制失败' })
      })

    // 保存任务简介
    Storage.Instance.set(StorageItemType.Mission, this.missionContent)

    // 保存时间信息
    Storage.Instance.set<InformationReturnTypes.StorageTime>(
      StorageItemType.Time,
      {
        isCurrent: this.isCurrentTime,
        start: this.startTime?.getTime().toString() || '',
        end: this.endTime?.getTime().toString() || '',
        lastCopy: new Date().getTime().toString()
      }
    )

    // 保存人员
    this.savePersonnel()

    // 保存交通工具
    this.saveVehicle()

    // 保存专业工具
    this.saveProfessionalTool()
  }
}
</script>
