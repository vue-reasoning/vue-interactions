import {
  computed,
  defineComponent,
  h as createElement,
  isVue3,
  ref
} from 'vue-demi'
import { convertLegacyProps, extend, pick } from '@visoning/vue-utility'

import { InteractorCore } from '../interactor-core/InteractorCore'
import {
  InteractorExtendsCoreProps,
  InteractorCoreLostenersForwarder,
  InteractorProps
} from './Interactor.types'
import type { InteractorCoreExposed } from '../interactor-core/InteractorCore.types'
import { useCoreInteractors } from '../../composables/useCoreInteractors'

const coreExtendsPropKeys = Object.keys(InteractorExtendsCoreProps)

export const Interactor = defineComponent({
  name: 'Interactor',

  props: InteractorProps,

  setup(props, { expose, slots }) {
    const coreRef = ref<InteractorCoreExposed>()
    const coreExposedProxy = {
      getInteractor: () => coreRef.value?.getInteractor(),
      getTargets: () => coreRef.value?.getTargets(),
      getInteractionsContext: () => coreRef.value?.getInteractionsContext(),
      getElementProps: () => coreRef.value?.getElementProps()
    }

    //
    // Merged interactions ====================================
    //

    const getCoreInteractors = useCoreInteractors(props)
    const coreInteractorsRef = computed(() =>
      getCoreInteractors(coreExposedProxy.getInteractionsContext())
    )

    const mergedInteractionsRef = computed(() => [
      ...coreInteractorsRef.value,
      ...(props.customInteractions || [])
    ])

    //
    // Exposed ====================================
    //

    expose(coreExposedProxy)

    //
    // Render ====================================
    //

    return () => {
      const scopedSlots = {
        default: () => slots.default?.()
      }

      return createElement(
        InteractorCore,
        convertLegacyProps(
          extend(
            {
              ref: coreRef,
              props: {
                ...pick(props, coreExtendsPropKeys),
                interactions: mergedInteractionsRef.value
              },
              on: InteractorCoreLostenersForwarder.forwards()
            },
            !isVue3 && { scopedSlots }
          )
        ),
        isVue3 && scopedSlots
      )
    }
  }
})
