<style lang="scss" scoped></style>

<template>
  <van-popup
    v-model="showPicker"
    round
    position="bottom"
    style="height: 320px"
    @closed="$emit('update:visible', false)"
  >
    <van-picker
      show-toolbar
      :columns="addressList"
      @cancel="showPicker = false"
      @confirm="onConfirm"
    />
  </van-popup>
</template>

<script lang="ts">
import _ from 'lodash'

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Popup, Picker, Notify } from 'vant'

import { InformationReturnTypes } from '@/views/InformationReturn'

import { StorageItemType } from '@/enums/Storage'
import Storage from '@/utils/Storage'

@Component({
  name: 'AddressPicker',
  components: [Popup, Picker, Notify].reduce((components, component) => {
    components[component.name] = component
    return components
  }, {} as { [key: string]: any })
})
export default class AddressPicker extends Vue {
  @Prop({
    required: true,
    type: Boolean
  })
  visible!: boolean

  showPicker = this.visible

  addressList: string[] = ['家', '家2']

  @Watch('visible')
  visibleChanged() {
    const address = Storage.Instance().get<InformationReturnTypes.Address>(
      StorageItemType.Address
    )

    if (_.isNull(address) || _.isEmpty(address.history)) {
      Notify({ type: 'primary', message: '历史地址为空' })
      this.showPicker = false
      return
    }

    this.addressList = address.history

    this.showPicker = this.visible
  }

  onConfirm(value: string) {
    this.$emit('setAddress', value)
    this.showPicker = false
  }
}
</script>
