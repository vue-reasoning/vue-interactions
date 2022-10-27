import {
  computed,
  defineComponent,
  toRef,
  watch,
  h as createElement,
  ref,
  isVue3
} from 'vue-demi'
import {
  useElementProps,
  useInteractionsContext
} from '@visoning/vue-interactions'
import type {
  BaseInteractionInfo,
  UseInteractionsContextOptions
} from '@visoning/vue-interactions'
import {
  convertLegacyProps,
  extend,
  getVNodeType,
  isComment,
  isFragment,
  isObject,
  isString,
  isText,
  useControlledState,
  useListeners
} from '@visoning/vue-utility'
import type { VNodeChildAtom } from '@visoning/vue-utility'

import {
  useElementPropsBind,
  useElementsPropsBind
} from '../../composables/useElementPropsBind'
import {
  InteractorCoreProps,
  InteractorCoreInteractionInfoType
} from './InteractorCore.types'
import type { InteractorCoreExposed } from './InteractorCore.types'
import { FirstChild } from './FirstChild'

export const InteractorCore = defineComponent({
  name: 'InteractorCore',

  props: InteractorCoreProps,

  setup(props, { expose, slots }) {
    //
    // DOM ====================================
    //

    const childRef = ref<{ $el: any }>()

    const interactorRef = computed<HTMLElement | null | undefined>(
      () => props.customInteractor || childRef.value?.$el
    )
    const targetsRef = computed(() => props.targets || [])

    //
    // Controlled state ====================================
    //

    const [mergedOpenRef] = useControlledState(
      computed(() => props.open),
      computed(() => props.defaultOpen)
    )

    const listeners = useListeners()

    const setOpen = (open: boolean, info: BaseInteractionInfo) => {
      if (open !== mergedOpenRef.value) {
        mergedOpenRef.value = open

        listeners.emit('onUpdate:open', open, info)
        if (open) {
          listeners.emit('open', info)
        } else {
          listeners.emit('close', info)
        }
      }
    }

    //
    // Interactions context ====================================
    //

    // avoid dependency track
    const defaultOpen = mergedOpenRef.value

    const interactonsContextOptionsRef =
      computed<UseInteractionsContextOptions>(() => ({
        defaultValue: defaultOpen,
        allowOverrideInteractionInfo: props.allowOverrideInteractionInfo,
        handleChange: props.handleChange
      }))

    const interactionsContext = useInteractionsContext(
      interactorRef,
      targetsRef,
      interactonsContextOptionsRef
    )

    //
    // Two-way binding with context ====================================
    //

    watch(interactionsContext.open, (open) => {
      setOpen(open, interactionsContext.interactionInfos.value.current!)
    })

    watch(mergedOpenRef, (open) => {
      interactionsContext.setOpen(open, {
        type: InteractorCoreInteractionInfoType
      })
    })

    //
    // Element props ====================================
    //

    const elementPropsRef = useElementProps(
      computed(() =>
        (props.interactions || []).map((interaction) =>
          interaction(interactionsContext)
        )
      )
    )

    useElementPropsBind(
      interactorRef,
      computed(() => elementPropsRef.value.interactor)
    )

    useElementsPropsBind(
      targetsRef,
      computed(() => elementPropsRef.value.target)
    )

    //
    // Exposed ====================================
    //

    const exposed: InteractorCoreExposed = {
      getInteractor: () => interactorRef.value,
      getTargets: () => targetsRef.value,
      getInteractionsContext: () => interactionsContext,
      getElementProps: () => elementPropsRef.value
    }

    expose(exposed)

    //
    // Render ====================================
    //

    const isInteractorLegalChild = (child?: VNodeChildAtom) => {
      return (
        isString(child) ||
        (isObject(child) && !isComment(child) && !isFragment(child))
      )
    }

    const wrapTextNodeIfNeed = (child: VNodeChildAtom) => {
      if (
        isString(child) ||
        (isObject(child) && (isText(child) || getVNodeType(child) === 'svg'))
      ) {
        return createElement('span', null, child)
      }
      return child
    }

    return () => {
      const scopedSlots = {
        default: () => slots.default?.()
      }

      return createElement(
        FirstChild as any,
        convertLegacyProps(
          extend(
            {
              ref: childRef,
              props: {
                qualifier: isInteractorLegalChild,
                wrapper: wrapTextNodeIfNeed
              }
            },
            !isVue3 && { scopedSlots }
          )
        ),
        isVue3 && scopedSlots
      )
    }
  }
})
