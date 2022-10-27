import {
  invoke,
  resolveComputed,
  useEffect,
  useManualEffect
} from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'
import { computed } from 'vue-demi'

import type { BaseInteractionInfo, PointerType } from '../types'
import type { InteractionsContext } from '../useInteractionsContext'
import { useDelay } from '../utils/useDelay'

export const HoverInteractionType = 'hover'

const createHoverInteractionInfo = (event: PointerEvent) => ({
  type: HoverInteractionType,
  event
})

export type HoverInteractionInfo = BaseInteractionInfo<
  typeof HoverInteractionType,
  PointerEvent
>

export interface UseHoverProps {
  /**
   * Conditionally enable/disable the hook.
   *
   * @default true
   */
  enabled?: boolean

  /**
   * Pointer types that trigger to.
   *
   * @default ['mouse', 'touch', 'pen']
   */
  pointerTypes?: PointerType[]

  /**
   * Delay in ms.
   */
  delay?:
    | number
    | Partial<{
        open: number
        close: number
      }>

  /**
   * Whether to keep the active after the pointer leave interactor and enter target.
   *
   * @default false
   */
  allowPointerEnterTarget?: boolean

  /**
   * Instead of closing the target element when the cursor leaves its interactor,
   * we can leave it open until a certain condition is satisfied.
   *
   * This handler runs on `pointermove`.
   */
  handleClose?:
    | null
    | ((context: InteractionsContext, event: PointerEvent) => boolean | void)
}

export function useHover(
  context: InteractionsContext,
  props: MaybeRef<UseHoverProps> = {}
) {
  const propsRef = resolveComputed(props)

  const delayAction = useDelay(
    context,
    computed(() => propsRef.value.delay)
  )

  const handleCloseControl = useManualEffect(() => {
    const doc = context.interactor.value?.ownerDocument ?? document
    doc.addEventListener('pointermove', handleMoveOutside)
    return () => doc.removeEventListener('pointermove', handleMoveOutside)
  })

  const handleMoveOutside = (event: PointerEvent) => {
    const { handleClose } = propsRef.value

    if (!handleClose || !context.open.value) {
      handleCloseControl.clear()
      return
    }

    if (handleClose(context, event) === false) {
      delayAction.close(createHoverInteractionInfo(event))
    }
  }

  const isAllowPointerEvent = ({ pointerType }: PointerEvent) => {
    const { pointerTypes } = propsRef.value
    return !pointerTypes || pointerTypes.includes(pointerType as PointerType)
  }

  const inContainer = (target: Element) => {
    if (!target) {
      return false
    }

    const containers: Array<Element | null | undefined> = [
      context.interactor.value
    ]
    if (propsRef.value.allowPointerEnterTarget) {
      containers.push(...context.targets.value)
    }
    return containers.some(
      (container) => container && container.contains(target)
    )
  }

  const handlePointerEnter = (event: PointerEvent) => {
    if (!isAllowPointerEvent(event)) {
      return
    }

    if (!context.open.value) {
      handleCloseControl.clear()
      delayAction.open(createHoverInteractionInfo(event))
    }
  }

  const handlePointerLeave = (event: PointerEvent) => {
    if (inContainer(event.relatedTarget as Element)) {
      return
    }

    if (context.open.value) {
      if (propsRef.value.handleClose) {
        handleMoveOutside(event)
        handleCloseControl.ensure()
      } else {
        delayAction.close(createHoverInteractionInfo(event))
      }
    }
  }

  const cleanups = [
    delayAction.clear,
    handleCloseControl.clear,
    // we should clear delay action and handle close control when `open` or `enabled` state changes
    useEffect(() => {
      delayAction.clear()
      handleCloseControl.clear()
    }, [context.open, () => !!propsRef.value.enabled])
  ]

  const cleanupEffect = () => {
    cleanups.forEach(invoke)
    cleanups.length = 0
  }

  const elementProps = {
    interactor: {
      onPointerenter: handlePointerEnter,
      onPointerleave: handlePointerLeave
    },
    target: {
      onPointerenter: handlePointerEnter,
      onPointerleave: handlePointerLeave
    }
  }

  return {
    cleanupEffect,
    elementProps: computed(() => {
      const { value: props } = propsRef
      if (props.enabled === false) {
        return {}
      }

      if (!props.allowPointerEnterTarget) {
        return {
          interactor: elementProps.interactor
        }
      }

      return elementProps
    })
  }
}
