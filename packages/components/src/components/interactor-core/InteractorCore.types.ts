import { withDefaultProps } from '@visoning/vue-utility'
import type { ExtractPublicPropTypes } from '@visoning/vue-utility'
import type {
  InteractorElement,
  BaseInteractionInfo,
  ElementProps,
  InteractionsContext,
  UseInteractionsContextOptions
} from '@visoning/vue-interactions'
import type { ExtractPropTypes, PropType } from 'vue-demi'

export type InteractorCoreExposed = {
  getInteractor: () => InteractorElement | null | undefined
  getTargets: () => Element[]
  getInteractionsContext: () => InteractionsContext
  getElementProps: () => ElementProps
}

export const InteractorCoreInteractionInfoType = 'ComponentUpdate'

export const InteractorCorePropTypes = {
  /**
   * State of interaction.
   *
   * @default default
   */
  open: Boolean,

  /**
   * Default state of open, typically used in uncontrolled mode.
   *
   * @default false
   */
  defaultOpen: Boolean,

  /**
   * Whether to disable the interaction.
   *
   * @default false
   */
  disabled: Boolean,

  /**
   * Customize the interactor that needs to bind elementProps.
   * Otherwise, the interactor will bind elementProps to the first child component.
   *
   * This is helpful in nested components.
   */
  customInteractor: Object as PropType<InteractorElement | null | undefined>,

  /**
   * NOTE: Please ensure that the node can receive interaction events.
   */
  targets: Array as PropType<Element[]>,

  /**
   * interactions.
   */
  interactions: Array as PropType<
    Array<(context: InteractionsContext) => ElementProps | null | undefined>
  >,

  /**
   * When the set open state is the same as the current state,
   * whether allowed to override the last interaction information.
   *
   * Which may occur in multi-interaction actions.
   *
   * @default true
   */
  allowOverrideInteractionInfo: Boolean,

  /**
   * A callback function will be executed when before the open state change,
   * modify operation will be aborted when the return value is false.
   */
  handleChange: Function as PropType<
    UseInteractionsContextOptions['handleChange']
  >,

  /**
   * Callback on open status changes.
   */
  'onUpdate:open': Function as PropType<
    (open: boolean, info?: BaseInteractionInfo) => void
  >,

  /**
   * Callback on open.
   */
  onOpen: Function as PropType<(info?: BaseInteractionInfo) => void>,

  /**
   * Callback on close.
   */
  onClose: Function as PropType<(info?: BaseInteractionInfo) => void>
} as const

export const InteractorCoreDefaultProps = {
  open: undefined,
  allowOverrideInteractionInfo: true
} as const

export const InteractorCoreProps = withDefaultProps(
  InteractorCorePropTypes,
  InteractorCoreDefaultProps
)

export type InteractorCoreProps = ExtractPropTypes<typeof InteractorCoreProps>
export type InteractorCorePublicProps = ExtractPublicPropTypes<
  typeof InteractorCoreProps
>
