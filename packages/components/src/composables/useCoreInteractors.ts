import { useClick, useFocus, useHover } from '@visoning/vue-interactions'
import type { InteractionsContext } from '@visoning/vue-interactions'
import { invoke, toArray } from '@visoning/vue-utility'
import { computed, onBeforeUnmount } from 'vue-demi'
import type { Ref } from 'vue-demi'

import type {
  InteractorActions,
  InteractorProps
} from '../components/interactor/Interactor.types'
import type { InteractorCoreProps } from '../components/interactor-core/InteractorCore.types'

export interface Props
  extends Pick<
    InteractorProps,
    | 'disabled'
    | 'actions'
    | 'customInteractions'
    | 'pointerTypes'
    | 'pointerEnterDelay'
    | 'pointerLeaveDelay'
    | 'allowPointerEnterTarget'
    | 'handleClickOutside'
    | 'handlePointerLeave'
  > {}

export function useCoreInteractors(props: Props) {
  let interactorsRef: Ref<NonNullable<InteractorCoreProps['interactions']>>
  let cleanupFn: Function

  onBeforeUnmount(() => invoke(cleanupFn))

  const hasAction = (action: InteractorActions) => {
    const { actions } = props
    return actions !== false && toArray(actions).includes(action)
  }

  return (context?: InteractionsContext) => {
    if (interactorsRef) {
      return interactorsRef.value
    }

    if (!context) {
      return []
    }

    const hover = useHover(
      context,
      computed(() => ({
        enabled: !props.disabled && hasAction('hover'),
        delay: {
          open: props.pointerEnterDelay,
          close: props.pointerLeaveDelay
        },
        pointerTypes: props.pointerTypes,
        allowPointerEnterTarget: props.allowPointerEnterTarget,
        handleClose: props.handlePointerLeave
      }))
    )

    const click = useClick(
      context,
      computed(() => ({
        enabled: !props.disabled && hasAction('click'),
        pointerTypes: props.pointerTypes,
        handleClickOutside: props.handleClickOutside
      }))
    )

    const focus = useFocus(
      context,
      computed(() => ({
        enabled: !props.disabled && hasAction('focus')
      }))
    )

    cleanupFn = () => {
      hover.cleanupEffect()
      click.cleanupEffect()
      focus.cleanupEffect()
    }

    interactorsRef = computed(() => {
      return [
        () => hover.elementProps.value,
        () => click.elementProps.value,
        () => focus.elementProps.value
      ]
    })

    return interactorsRef.value
  }
}
