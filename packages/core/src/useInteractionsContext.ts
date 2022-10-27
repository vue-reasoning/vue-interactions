import { ref } from 'vue-demi'
import type { ComputedRef } from 'vue-demi'
import { resolveComputed } from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'

import type {
  BaseInteractionInfo,
  InteractorElement,
  TargetElement
} from './types'

export const UnknownInteractionType = '__UNKNOWN_INTERACTION_TYPE__'

export type BuiltInInteractionType = typeof UnknownInteractionType

export interface InteractionInfos<T extends string, U> {
  /**
   * This information is the information of the last successful setting of the open state.
   */
  current: BaseInteractionInfo<T, U> | null

  /**
   * This information is the information of the prev successful setting of the open state.
   */
  prev: BaseInteractionInfo<T, U> | null
}

export type ActionInteractionInfo<T extends string = string, U = any> = Omit<
  BaseInteractionInfo<T, U>,
  'nextOpen'
>

export interface InteractionsContext<T extends string = string, U = unknown> {
  interactor: ComputedRef<InteractorElement | null | undefined>
  targets: ComputedRef<TargetElement[]>

  open: ComputedRef<boolean>
  setOpen: (open: boolean, info?: ActionInteractionInfo<T, U>) => void

  interactionInfos: ComputedRef<InteractionInfos<T & BuiltInInteractionType, U>>
}

export interface UseInteractionsContextOptions<
  T extends string = string,
  U = any
> {
  /**
   * @default false
   */
  defaultValue?: boolean

  /**
   * When the set open state is the same as the current state,
   * whether allowed to override the last interaction information.
   *
   * Which may occur in multi-interaction actions.
   *
   * @default true
   */
  allowOverrideInteractionInfo?: boolean

  /**
   * A callback function will be executed when before the open state change,
   * modify operation will be aborted when the return value is false.
   */
  handleChange?: (
    open: boolean,
    info?: ActionInteractionInfo<T, U>
  ) => boolean | void
}

export function useInteractionsContext<T extends string, U = any>(
  interactor?: MaybeRef<InteractorElement | undefined | null>,
  targets?: MaybeRef<TargetElement[]>,
  options?: MaybeRef<UseInteractionsContextOptions<T, U>>
): InteractionsContext<T, U> {
  type Context = InteractionsContext<T, U>

  const interactorRef = resolveComputed(interactor)
  const targetsRef = resolveComputed(targets || [])

  const optionsRef = resolveComputed(options || {})

  const openRef = ref(!!optionsRef.value.defaultValue)

  const interactionsInfoRef = ref({
    current: null,
    prev: null
  }) as Context['interactionInfos']

  const setOpen: Context['setOpen'] = (open, info) => {
    if (open === openRef.value) {
      const { value: options } = optionsRef
      if (
        !options.allowOverrideInteractionInfo ||
        options.handleChange?.(open, info) === false
      ) {
        return
      }
    }

    const { value: interactionInfos } = interactionsInfoRef

    interactionInfos.prev = interactionInfos.current
    interactionInfos.current = {
      type: UnknownInteractionType,
      ...info,
      nextOpen: open
    } as any

    openRef.value = open
  }

  return {
    interactor: interactorRef,
    targets: targetsRef,
    open: resolveComputed(openRef),
    setOpen,
    interactionInfos: resolveComputed(interactionsInfoRef)
  }
}
