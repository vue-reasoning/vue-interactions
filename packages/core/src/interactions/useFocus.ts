import {
  getWindow,
  resolveComputed,
  useEffect,
  useManualEffect
} from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'
import { computed } from 'vue-demi'

import type { BaseInteractionInfo } from '../types'
import type { InteractionsContext } from '../useInteractionsContext'

export const FocusInteractionType = 'focus'

const createFocusInteractionInfo = (event: FocusEvent) => ({
  type: FocusInteractionType,
  event
})

export type FocusInteractionInfo = BaseInteractionInfo<
  typeof FocusInteractionType,
  FocusEvent
>

export interface UseFocusProps {
  /**
   * Conditionally enable/disable the hook.
   *
   * @default true
   */
  enabled?: boolean
}

export function useFocus(
  context: InteractionsContext,
  props: MaybeRef<UseFocusProps> = {}
) {
  const propsRef = resolveComputed(props)

  const blurControl = useManualEffect(() => {
    const interactor = context.interactor.value
    const win = interactor ? getWindow(interactor) : window

    win.addEventListener('blur', handleBlur)
    return () => win.removeEventListener('blur', handleBlur)
  })

  const inContainer = (target: Element) => {
    if (!target) {
      return false
    }
    const containers = [context.interactor.value, ...context.targets.value]
    return containers.some(
      (container) => container && container.contains(target)
    )
  }

  const handleFocus = (event: FocusEvent) => {
    if (!context.open.value) {
      context.setOpen(true, createFocusInteractionInfo(event))
    }
  }

  const handleBlur = (event: FocusEvent) => {
    if (inContainer(event.relatedTarget as Element)) {
      return
    }
    console.log(2)
    if (context.open.value) {
      context.setOpen(false, createFocusInteractionInfo(event))
    }
  }

  const cleanupEffect = useEffect(
    (_, [open, enabled]) => {
      if (open && enabled) {
        blurControl.ensure()
        return () => blurControl.clear()
      }
    },
    [context.open, () => !!propsRef.value.enabled],
    {
      immediate: true
    }
  )

  const elementProps = {
    interactor: {
      onFocus: handleFocus,
      onBlur: handleBlur
    },
    target: {
      tabIndex: -1
    }
  }

  return {
    cleanupEffect,
    elementProps: computed(() => {
      const { value: props } = propsRef
      if (props.enabled === false) {
        return {}
      }

      return elementProps
    })
  }
}
