import {
  invokeCallbacks,
  isDef,
  isFunction,
  resolveComputed,
  useEffect,
  useManualEffect
} from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'
import { computed, watch } from 'vue-demi'

import type { BaseInteractionInfo, PointerType } from '../types'
import type { InteractionsContext } from '../useInteractionsContext'

export const ClickInteractionType = 'click'

const Keys = {
  Enter: 'Enter',
  Space: ' '
} as const

export type ClickInteractionInfo = BaseInteractionInfo<
  typeof ClickInteractionType,
  PointerEvent | KeyboardEvent
>

export interface UseClickProps {
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
   * Whether to close by clicking outside.
   *
   * @default false
   */
  handleClickOutside?: boolean | ((event: PointerEvent) => boolean)
}

export function useClick(
  context: InteractionsContext,
  props: MaybeRef<UseClickProps> = {}
) {
  const propsRef = resolveComputed(props)

  const toggle = (event: PointerEvent | KeyboardEvent, open?: boolean) => {
    const nextOpen = isDef(open) ? open : !context.open.value
    context.setOpen(nextOpen, {
      type: ClickInteractionType,
      event
    })
  }

  const inContainer = (target: Element) => {
    if (!target) {
      return false
    }
    const containers = [context.interactor.value, ...context.targets.value]
    return containers.some(
      (container) => container && container.contains(target)
    )
  }

  const clickOutsideControl = useManualEffect(() => {
    const interactor = context.interactor.value
    const doc = interactor ? interactor.ownerDocument ?? document : document

    doc.addEventListener('pointerdown', handleClickOutside)
    return () => doc.removeEventListener('pointerdown', handleClickOutside)
  })

  const handleClickOutside = (event: PointerEvent) => {
    if (inContainer(event.target as Element) || !context.open.value) {
      return
    }
    const { handleClickOutside } = propsRef.value
    if (
      handleClickOutside === true ||
      (isFunction(handleClickOutside) && handleClickOutside(event))
    ) {
      toggle(event, false)
    }
  }

  const isAllowPointerEvent = ({ pointerType }: PointerEvent) => {
    const { pointerTypes } = propsRef.value
    return !pointerTypes || pointerTypes.includes(pointerType as PointerType)
  }

  let openUpdateCountOnPointerHoldDown = 0
  const handlePointerDown = () => {
    openUpdateCountOnPointerHoldDown = 0
  }

  const handleClick = (event: PointerEvent) => {
    if (
      // only support left click
      event.button !== 0 ||
      (event.pointerType &&
        // If the open state changes while the pointer is held down, we do not respond to the pointer up event
        (openUpdateCountOnPointerHoldDown || !isAllowPointerEvent(event)))
    ) {
      return
    }
    toggle(event)
  }

  const isButton = () =>
    (context.interactor.value as Element)?.tagName === 'BUTTON'

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isButton()) {
      return
    }

    if (event.key === Keys.Space) {
      event.preventDefault()
    }

    if (event.key === Keys.Enter) {
      toggle(event)
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (isButton()) {
      return
    }

    if (event.key === Keys.Space) {
      toggle(event)
    }
  }

  const cleanupFns = [
    watch(context.open, () => openUpdateCountOnPointerHoldDown++),
    useEffect(
      (_, [open, enabled, handleClickOutside]) => {
        if (
          open &&
          enabled &&
          (handleClickOutside === true || isFunction(handleClickOutside))
        ) {
          clickOutsideControl.ensure()
          return () => clickOutsideControl.clear()
        }
      },
      [
        context.open,
        () => !!propsRef.value.enabled,
        () => propsRef.value.handleClickOutside
      ],
      {
        immediate: true
      }
    )
  ]

  const elementProps = {
    interactor: {
      onPointerdown: handlePointerDown,
      onClick: handleClick,
      onKeydown: handleKeyDown,
      onKeyup: handleKeyUp
    }
  }

  return {
    cleanupEffect: () => invokeCallbacks(cleanupFns),
    elementProps: computed(() => {
      const { value: props } = propsRef
      if (props.enabled === false) {
        return {}
      }

      return elementProps
    })
  }
}
