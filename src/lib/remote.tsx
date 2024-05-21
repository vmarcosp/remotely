import React, { ReactElement, useEffect, useState } from 'react'
import { ComponentElement, Node, TextElement } from './root'
import { OutboundChannel } from './channel'

type RenderRemoteTreeProps = {
  tree: Node,
  channel: OutboundChannel
}

const renderNode = ({ tree: node, channel }: RenderRemoteTreeProps): string | ReactElement => {
  switch (node.kind) {
    case 'text':
      return <RemoteText key={node._id} channel={channel} element={node} />
    case 'component':
      return <RemoteComponent key={node._id} channel={channel} element={node} />
  }
}



type RemoteTextProps = {
  channel: OutboundChannel,
  element: TextElement
}

export const RemoteText = ({ channel, element }: RemoteTextProps) => {
  const [state, setState] = useState(element)

  useEffect(() => {
    channel.on(event => {
      if (event.type === 'UPDATE_TEXT' && event.data._id === element._id) {
        setState(event.data)
      }
    })
  }, [])

  return state.value
}

type RemoteComponentProps = {
  channel: OutboundChannel,
  element: ComponentElement
}


export const RemoteComponent = ({ channel, element }: RemoteComponentProps) => {
  const [state, setState] = useState(element)

  useEffect(() => {
    channel.on(event => {
      if (event.type === 'UPDATE_NODE' && event.data.kind === 'component' && event.data._id === element._id) {
        setState(event.data)
      }
    })
  }, [])


  const parsedProps = state.props.reduce((props, prop) => {
    if (prop.kind === 'event') {
      return {
        ...props,
        [prop.name]: () => channel.emit({
          type: 'TRIGGER_FUNCTION',
          data: { fnId: prop.uniqueId }
        })
      }
    }

    return props
  }, {})

  return React.createElement(state.type, {
    ...parsedProps,
    key: state._id,
    children: state.children.map(node => renderNode({ channel, tree: node }))
  })
}


export const RenderRemoteTree = ({ tree, channel }: RenderRemoteTreeProps) => {
  return renderNode({ tree, channel })
}
