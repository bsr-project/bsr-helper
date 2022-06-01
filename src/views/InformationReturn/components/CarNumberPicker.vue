<style lang="scss" scoped>
.control-button {
  padding: 10px 20px 0 20px;

  span {
    padding: 3px 5px;
  }
}

.car-number-picker {
  padding: 20px 10px 20px 20px;
  width: calc(100% - 10px);
  box-sizing: border-box;

  .car-number-picker-inner {
    overflow-y: auto;
    height: 260px;

    /*修改滚动条样式*/
    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
      /**/
    }

    &::-webkit-scrollbar-track {
      background: rgb(239, 239, 239);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: #bfbfbf;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #333;
    }

    &::-webkit-scrollbar-corner {
      background: #179a16;
    }
  }

  .van-radio-group {
    ::v-deep {
      .van-radio {
        margin: 10px 0;

        .owner {
          color: #ccc;
        }
      }
    }
  }
}

.add-car-number {
  display: flex;

  ::v-deep .van-field {
    width: 50%;
    margin: 0 10px;
    padding: 5px 10px;
    border-bottom: 1px #ccc solid;
  }
}

.add-car-number-container {
  ::v-deep {
    .van-cell__title {
      position: relative;
    }
  }

  .van-button {
    position: absolute;
    top: 0;
    right: 0;
  }
}

.radio-item {
  ::v-deep {
    .van-radio__label {
      display: block;
      width: calc(100% - 50px);
    }
  }
}
</style>

<template>
  <van-popup v-model="showPicker" round position="bottom" style="height: 420px" @close="confirm"
    @closed="$emit('update:visible', false)">
    <!-- <van-picker
      show-toolbar
      :columns="pickerList"
      @cancel="showPicker = false"
      @confirm="onConfirm"
    /> -->

    <div class="control-button flex-BC">
      <span></span>
      <span class="cl-primary" @click="confirm">完成</span>
    </div>

    <div class="car-number-picker">
      <div class="car-number-picker-inner">
        <van-radio-group v-if="carNumberList.length > 0" v-model="selecteCarNumber" @change="selectCarNumberChanged">
          <van-radio class="radio-item" v-for="item in carNumberList" :key="item.carNumber" :name="item.carNumber">
            <div class="flex-BC">
              <div>
                <span class="carNumber">({{ item.carNumber }}) </span>
                <span class="owner">{{ item.owner }}</span>
              </div>

              <div>
                <van-button type="danger" size="mini" @click.prevent.stop="remove(item.carNumber)">删除</van-button>
              </div>
            </div>
          </van-radio>
        </van-radio-group>
        <div v-else class="flex-CC" style="height: 100%">
          <span class="cl-9">请添加车牌号</span>
        </div>
      </div>
    </div>

    <van-cell-group inset>
      <van-cell class="add-car-number-container">
        <template #title>
          <span>填写车主姓名，方便识别车辆是谁的</span>
          <van-button type="primary" size="mini" @click="addCarNumber">添加车牌</van-button>
        </template>

        <template #label>
          <div class="add-car-number">
            <van-field v-model="owner" placeholder="车主姓名" />
            <van-field v-model="carNumber" placeholder="车牌号" />
          </div>
        </template>
      </van-cell>
    </van-cell-group>
  </van-popup>
</template>

<script lang="ts">
import _ from 'lodash'

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import {
  Popup,
  Picker,
  CellGroup,
  Cell,
  Field,
  Button,
  RadioGroup,
  Radio,
  Notify
} from 'vant'

import { InformationReturnTypes } from '@/views/InformationReturn'

import { StorageItemType } from '@/enums/Storage'
import Storage from '@/utils/Storage'

@Component({
  name: 'CarNumberPicker',
  components: [
    Popup,
    Picker,
    CellGroup,
    Cell,
    Field,
    Button,
    RadioGroup,
    Radio
  ].reduce((components, component) => {
    components[component.name] = component
    return components
  }, {} as { [key: string]: any })
})
export default class CarNumberPicker extends Vue {
  @Prop({
    required: true,
    type: Boolean
  })
  visible!: boolean

  showPicker = this.visible

  storageVehicle: InformationReturnTypes.StorageVehicle | null = null

  owner = ''
  carNumber = ''

  confirmCarNumber = ''

  selecteCarNumber = ''

  carNumberList: InformationReturnTypes.CarNumberItem[] = []
  pickerList: string[] = []

  @Watch('visible')
  visibleChanged() {
    this.showPicker = this.visible

    // 读取本地存储
    const vehicle =
      Storage.Instance().get<InformationReturnTypes.StorageVehicle>(
        StorageItemType.Vehicle
      )

    if (vehicle) this.storageVehicle = vehicle

    // 设置 车牌列表
    this.carNumberList = vehicle?.carNumberList || []
    this.selecteCarNumber = vehicle?.currentCarNumber || ''
  }

  @Watch('carNumberList')
  carNumberListChanged() {
    this.pickerList = _.map(
      this.carNumberList,
      (item) => `${item.owner}: ${item.carNumber}`
    )
  }

  addCarNumber() {
    const owner = this.owner.trim()
    const carNumber = this.carNumber.trim()
    if (owner === '' || carNumber === '') {
      Notify({ type: 'warning', message: '请填写车主姓名和车牌' })
      return
    }

    if (
      ~_.findIndex(this.carNumberList, {
        carNumber
      })
    ) {
      Notify({ type: 'warning', message: '当前车牌已添加' })
      return
    }

    this.carNumberList.push({
      owner,
      carNumber
    })

    this.selecteCarNumber = `${this.carNumber}`

    this.owner = ''
    this.carNumber = ''

    this.save()
  }

  remove(carNumber: string) {
    const index = _.findIndex(this.carNumberList, {
      carNumber
    })

    if (~index) {
      this.carNumberList.splice(index, 1)
      this.save()
    }
  }

  selectCarNumberChanged() {
    this.save()
  }

  confirm() {
    this.$emit('confirm', this.selecteCarNumber)
    this.showPicker = false
  }

  save() {
    if (!this.storageVehicle) return

    this.storageVehicle.carNumberList = this.carNumberList

    Storage.Instance().set<InformationReturnTypes.StorageVehicle>(
      StorageItemType.Vehicle,
      {
        currentCarNumber: this.selecteCarNumber,
        carNumberList: this.carNumberList
      }
    )
  }
}
</script>
