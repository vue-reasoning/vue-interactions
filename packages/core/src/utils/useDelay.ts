import { isUndef, resolveComputed, useTimeout } from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'

import type {
  ActionInteractionInfo,
  InteractionsContext
} from '../useInteractionsContext'

export type DelayTime = number
export type DelayType = 'open' | 'close'

export type Delay = DelayTime | Partial<Record<DelayType, DelayTime>>

export function useDelay(
  context: InteractionsContext,
  delay: MaybeRef<Delay | null | undefined>
) {
  const delayRef = resolveComputed(delay)
  const delayControl = useTimeout()

  const getDelay = (type: DelayType | boolean) => {
    const { value: delay } = delayRef
    if (isUndef(delay) || typeof delay === 'number') {
      return delay
    }
    return type === true || type === 'open' ? delay.open : delay.close
  }

  const setOpen = (
    open: boolean,
    info: ActionInteractionInfo,
    force?: boolean
  ) => {
    if (open === context.open.value && !force) {
      return
    }
    delayControl.reset(() => context.setOpen(open, info), getDelay(open) ?? 0)
  }

  return {
    getDelay,
    setOpen,
    open: (info: ActionInteractionInfo, force?: boolean) =>
      setOpen(true, info, force),
    close: (info: ActionInteractionInfo, force?: boolean) =>
      setOpen(false, info, force),
    clear: delayControl.clear
  }
}
