import type {
  PointerType,
  UseClickProps,
  UseHoverProps
} from '@visoning/vue-interactions'
import {
  createListenerPropsForwarder,
  omit,
  withDefaultProps
} from '@visoning/vue-utility'
import type { ExtractPublicPropTypes } from '@visoning/vue-utility'
import type { ExtractPropTypes, PropType } from 'vue-demi'

import {
  InteractorCoreDefaultProps,
  InteractorCorePropTypes
} from '../interactor-core/InteractorCore.types'
import type { InteractorCoreExposed } from '../interactor-core/InteractorCore.types'

export type InteractorExposed = InteractorCoreExposed

export type InteractorActions = 'hover' | 'click' | 'focus'

export const InteractorCoreLostenersForwarder = createListenerPropsForwarder(
  InteractorCorePropTypes,
  ['onClose', 'onOpen', 'onUpdate:open']
)

export const InteractorExtendsCoreProps = omit(
  InteractorCorePropTypes,
  'interactions'
)

export const InteractorPropTypes = {
  ...InteractorExtendsCoreProps,
  ...InteractorCoreLostenersForwarder.props,

  /**
   * Which interaction cause state actived, enum of 'hover','click','focus'.
   *
   * @default 'hover'
   */
  actions: [Boolean, String, Array] as PropType<
    InteractorActions | InteractorActions[] | false
  >,

  /**
   * Custom interactions.
   */
  customInteractions: InteractorCorePropTypes.interactions,

  /**
   * Pointer types that trigger to.
   *
   * @default ['mouse', 'touch', 'pen']
   */
  pointerTypes: Array as PropType<PointerType[]>,

  /**
   * Delay in ms, before open is changed by `pointerEnter`.
   */
  pointerEnterDelay: Number,

  /**
   * Delay in ms, before open is changed by `pointerLeave`.
   */
  pointerLeaveDelay: Number,

  /**
   * Whether to keep the active after the pointer leave interactor and enter target.
   *
   * @default false
   */
  allowPointerEnterTarget: Boolean,

  /**
   * Whether to close by clicking outside.
   *
   * @default false
   */
  handleClickOutside: [Boolean, Function] as PropType<
    UseClickProps['handleClickOutside']
  >,

  /**
   * Instead of closing the target element when the cursor leaves its interactor,
   * we can leave it open until a certain condition is satisfied.
   *
   * This handler runs on `pointermove`.
   */
  handlePointerLeave: [Function, Object] as PropType<
    UseHoverProps['handleClose']
  >
} as const

export const InteractorDefaultProps = {
  ...InteractorCoreDefaultProps,
  actions: 'hover',
  pointerTypes: () => ['mouse', 'touch', 'pen']
} as const

export const InteractorProps = withDefaultProps(
  InteractorPropTypes,
  InteractorDefaultProps
)

export type InteractorProps = ExtractPropTypes<typeof InteractorProps>
export type InteractorPublicProps = ExtractPublicPropTypes<
  typeof InteractorProps
>
