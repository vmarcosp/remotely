import { createInboundChannel } from "./channel"

export type Root = {
  mount: (tree: Node) => void,
  createComponent: (type: string, props: any) => ComponentElement,
  createText: (text: string) => TextElement,
}

export type Node = TextElement | ComponentElement

export type TextElement = {
  _id: string,
  kind: "text",
  value: string,
}

type Prop =
  {
    kind: 'event',
    name: 'onClick',
    uniqueId: string,
  }

export type ComponentElement = {
  _id: string,
  kind: "component",
  type: string,
  props: Prop[],
  children: Node[]
}

const generateId = () => crypto.randomUUID() as string

let functions: Record<string, any> = {}

const parseProps = (props: Array<Prop>) => {
  const parsedProps = []
  for (const [key, value] of Object.entries(props)) {
    const uniqueId = window.crypto.randomUUID()
    if (key === 'onClick') {
      functions[uniqueId] = () => (value as any)()
      parsedProps.push({
        kind: 'event',
        name: 'onClick',
        uniqueId,
      })
    }
  }

  return parsedProps
}

export const updateText = (node: TextElement, text: string) => {
  node.value = text
  channel.emit({
    type: 'UPDATE_TEXT',
    data: node,
  })
}

export const updateNode = (node: ComponentElement, props: any) => {
  node.props = parseProps(props)
  channel.emit({
    type: 'UPDATE_NODE',
    data: node,
  })
}


const channel = createInboundChannel()

export const subscribeToEvents = () => {
  channel.on((event) => {
    if (event.type === 'TRIGGER_FUNCTION') {
      const fn = functions[event.data.fnId]
      fn && fn()
    }
  })
}

const root: Root = {
  mount: (tree: Node) => {
    channel.emit({
      type: 'RENDER',
      data: tree
    })
  },
  createComponent: (type, { children, ...props }) => {
    const parsedProps = parseProps(props)
    return { _id: generateId(), kind: "component", type, props: parsedProps, children: [] }
  },
  createText: (text) => ({ kind: "text", _id: generateId(), value: text }),
}

export function createRoot(): Root {
  return root
}
