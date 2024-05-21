import { useEffect, useState } from 'react'
import type { Node, TextElement } from './root'

type OutboundChannelProps = {
  origin: string,
}

type OutboundEvents =
  | { type: 'RENDER', data: Node }
  | { type: 'UPDATE_TEXT', data: TextElement }
  | { type: 'UPDATE_NODE', data: Node }

type InboundEvents =
  | { type: 'TRIGGER_FUNCTION', data: { fnId: string } }

export type OutboundChannel = {
  on: (cb: (event: OutboundEvents) => void) => void,
  emit: (event: InboundEvents) => void
}

export type InboundChannel = {
  on: (cb: (event: InboundEvents) => void) => void,
  emit: (event: OutboundEvents) => void
}

export const createOutboundChannel = ({ origin }: OutboundChannelProps): OutboundChannel => {
  const iframe = document.createElement("iframe")
  iframe.setAttribute("src", origin)
  iframe.setAttribute("style", "visiblity: hidden; position:absolute; display: none;")
  document.body.appendChild(iframe)

  return {
    on(cb) {
      window.addEventListener("message", (event) => {
        cb(event.data)
      })
    },
    emit(event) {
      iframe.contentWindow.postMessage(event, '*')
    }
  } satisfies OutboundChannel
}

export const createInboundChannel = (): InboundChannel => {
  return {
    on(cb) {
      window.addEventListener("message", (event) => {
        cb(event.data)
      })
    },
    emit(event) {
      const location = window.parent.location
      window.parent.postMessage(event, `${location.protocol}//${location.host}`)
    }
  } satisfies InboundChannel
}

export const useRemoteTree = ({ channel }: { channel: OutboundChannel }) => {
  const [tree, setTree] = useState<Node | undefined>()

  useEffect(() => {
    channel.on(event => {
      if (event.type === 'RENDER') {
        setTree(event.data)
      }
    })
  }, [])

  if (tree) return { status: 'ready', tree } as const

  return { status: 'idle' } as const
}
