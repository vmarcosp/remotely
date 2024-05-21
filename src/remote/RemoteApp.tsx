import render from "@/lib/renderer"
import { createRoot } from "@/lib/root"
import { useState } from "react"

const Button = ({ onClick }) => <button onClick={onClick}>[Remote]: Click here</button>

const MyApp = () => {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(count + 1)
    console.log(`[RemoteApp] #root is not acessible via document.querySelector("#root > div") => `, document.querySelector("#root > div"))
  }

  console.log("[RemoteApp] State =>", { count })

  return (
    <div>
      <div>Count: {count}</div>
      {count > 2 && <div>More than 10</div>}
      <Button onClick={handleClick} />
    </div>
  )
}

const root = createRoot()
render(<MyApp />, root) // render(<MyApp />, "Footer")
