import { defineComponent } from 'vue-demi'
import type { PropType, VNode } from 'vue-demi'
import { findChild, isFunction } from '@visoning/vue-utility'
import type { VNodeChildAtom } from '@visoning/vue-utility'

export const FirstChild = defineComponent({
  name: 'FirstChild',

  props: {
    qualifier: {
      type: Function as PropType<(child: VNodeChildAtom) => boolean>,
      required: true
    },
    wrapper: Function as PropType<(child: VNodeChildAtom) => VNode>
  },

  setup(props, { slots }) {
    return () => {
      const { qualifier, wrapper } = props

      const children = slots.default?.()
      const child = findChild(children, qualifier)

      return isFunction(wrapper) ? wrapper(child) : child
    }
  }
})
