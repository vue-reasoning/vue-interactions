import { Interactor } from '@visoning/vue-interactions-components'
import * as Vue from 'vue'
import { isVue3, Vue2, defineComponent, h, ref } from 'vue-demi'

const App = defineComponent({
  setup() {
    const openRef = ref(false)

    return () =>
      h('div', [
        h(
          Interactor,
          {
            open: openRef.value,
            actions: ['hover', 'click', 'focus'],
            pointerEnterDelay: 1000,
            pointerLeaveDelay: 2000,
            handleClickOutside: true,
            style: {
              position: 'absolute'
            },
            'onUpdate:open': (open) => (openRef.value = open)
          },
          [
            h('button', null, [
              'hover',
              h(
                'div',
                {
                  style: {
                    display: openRef.value ? 'block' : 'none',
                    position: 'absolute',
                    top: '100%'
                  }
                },
                'target'
              )
            ])
          ]
        )
      ])
  }
})

if (isVue3) {
  Vue.createApp(App).mount('#app')
} else {
  new Vue2({
    render(h) {
      return h(App)
    }
  }).$mount('#app')
}
