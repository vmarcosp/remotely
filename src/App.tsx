import { createOutboundChannel, useRemoteTree } from "./lib/channel"
import { RenderRemoteTree } from "./lib/remote"

const channel = createOutboundChannel({
  origin: "./remote/index.html"
})

function App() {
  const remoteTree = useRemoteTree({ channel })

  return (
    <div>
      <div>[Host App]: Hey :)</div>
      <hr />
      {remoteTree.status === 'ready' && <RenderRemoteTree tree={remoteTree.tree} channel={channel} />}
    </div>
  )
}

export default App
