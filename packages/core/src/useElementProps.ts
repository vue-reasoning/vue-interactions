import { mergeProps, useTransformValue } from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'
import { unref } from 'vue-demi'

import type { ElementProps } from './types'

/**
 * Merge element props according to the logic of Vue merge props.
 */
export function useElementProps(
  propsList: MaybeRef<MaybeRef<ElementProps | null | undefined>[]>
) {
  return useTransformValue(propsList, (propsList) => {
    return propsList.reduce<ElementProps>(
      (mergedElementProps, elementPropsRef) => {
        const elementProps = unref(elementPropsRef)
        if (elementProps) {
          Object.entries(unref(elementProps)).forEach((gather) => {
            const type = gather[0] as keyof ElementProps
            const props = gather[1] as Record<string, any>
            mergedElementProps[type] = mergeProps(
              mergedElementProps[type],
              props
            )
          })
        }
        return mergedElementProps
      },
      {}
    )
  })
}
