export type InteractorElement = HTMLElement
export type TargetElement = Element

export type PointerType = 'mouse' | 'touch' | 'pen'

export interface BaseInteractionInfo<T extends string = string, U = any> {
  type: T
  nextOpen: boolean
  event?: U
}

export interface ElementProps {
  interactor?: Record<string, any>
  target?: Record<string, any>
}
