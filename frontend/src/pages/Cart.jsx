import { useUser } from "@clerk/clerk-react"

function Cart() {
  const { user } = useUser()

  return (
    <div className="Cart">
      <h1>Carrinho</h1>
      <p>User ID: {user?.id}</p>
    </div>
  )
}

export default Cart