import {
  hyphenate,
  invokeCallbacks,
  isHandlerKey,
  toArray,
  useEffect
} from '@visoning/vue-utility'
import type { MaybeRef } from '@visoning/vue-utility'

export function useElementPropsBind(
  element: MaybeRef<Element | null | undefined>,
  props: MaybeRef<Record<string, any> | undefined | null>
) {
  return useEffect(
    (_, [element, props]) => {
      if (!element || !props) {
        return
      }

      const keys = Object.keys(props)
      if (!keys.length) {
        return
      }

      const cleanupFns = keys.map((key) => {
        const value = props[key]
        if (isHandlerKey(key)) {
          return bindEvent(element, key, value)
        } else {
          return bindAttribute(element, key, value)
        }
      })

      return () => invokeCallbacks(cleanupFns)
    },
    [element, props],
    {
      immediate: true
    }
  )
}

export function useElementsPropsBind(
  elements: MaybeRef<Array<Element | null | undefined>>,
  props: MaybeRef<Record<string, any> | undefined | null>
) {
  return useEffect(
    (_, [elements]) => {
      const cleanupFns = elements.map((element) =>
        useElementPropsBind(element, props)
      )
      return () => invokeCallbacks(cleanupFns)
    },
    [elements],
    {
      immediate: true
    }
  )
}

// Copied from Vue
const optionsModifierRE = /(?:Once|Passive|Capture)$/

function parseName(name: string): [string, EventListenerOptions | undefined] {
  let options: EventListenerOptions | undefined
  if (optionsModifierRE.test(name)) {
    options = {}
    let m
    while ((m = name.match(optionsModifierRE))) {
      name = name.slice(0, name.length - m[0].length)
      ;(options as any)[m[0].toLowerCase()] = true
    }
  }
  const event = name[2] === ':' ? name.slice(3) : hyphenate(name.slice(2))
  return [event, options]
}

function bindEvent(element: Element, key: string, listeners: any) {
  const [type, options] = parseName(key)
  const cleanupFns = toArray(listeners).map((listener) => {
    element.addEventListener(type, listener, options)
    return () => element.removeEventListener(type, listener, options)
  })
  return () => invokeCallbacks(cleanupFns)
}

function bindAttribute(element: Element, key: string, value: any) {
  element.setAttribute(key, value)
  return () => element.removeAttribute(key)
}
