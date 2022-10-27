// Built-in Interactions ---------------------------------------------------------
export * from './interactions'

// Interactions Context ----------------------------------------------------------
export { useElementProps } from './useElementProps'
export {
  UnknownInteractionType,
  useInteractionsContext
} from './useInteractionsContext'
export type {
  BuiltInInteractionType,
  InteractionInfos,
  ActionInteractionInfo,
  InteractionsContext,
  UseInteractionsContextOptions
} from './useInteractionsContext'

// Types -------------------------------------------------------------------------
export type {
  InteractorElement,
  TargetElement,
  PointerType,
  BaseInteractionInfo,
  ElementProps
} from './types'

// TODO: Maybe deley should be built in, because the user can't interrupt the hover delay
// export { DelayTime, DelayType, Delay } from './utils/useDelay'
