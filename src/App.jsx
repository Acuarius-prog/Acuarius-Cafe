import { useState } from 'react'
import { CartProvider, useCart } from './store/cart'
import { RouterProvider, useRouter } from './router'
import { formatMoney } from './lib/format'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Landing from './pages/Landing'
import Animal from './pages/Animal'
import Otros from './pages/Otros'
import Admin from './pages/Admin'

function Layout() {
  const { path } = useRouter()
  const cart = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const isAdmin = path.startsWith('/admin')

  let page = <Landing />
  if (path.startsWith('/res')) page = <Animal animalKey="res" />
  else if (path.startsWith('/pollo')) page = <Animal animalKey="pollo" />
  else if (path.startsWith('/cerdo')) page = <Animal animalKey="cerdo" />
  else if (path.startsWith('/tienda')) page = <Otros />
  else if (isAdmin) page = <Admin />

  return (
    <>
      <Header onOpenCart={() => setCartOpen(true)} hideCart={isAdmin} />
      <main>{page}</main>
      <Footer />
      {!isAdmin && cart.count > 0 && !cartOpen && (
        <button className="fab-cart" onClick={() => setCartOpen(true)}>
          <span>{cart.count} {cart.count === 1 ? 'producto' : 'productos'}</span>
          <span className="fab-total">{formatMoney(cart.subtotal)} · Ver pedido</span>
        </button>
      )}
      {!isAdmin && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />}
    </>
  )
}

export default function App() {
  return (
    <CartProvider>
      <RouterProvider><Layout /></RouterProvider>
    </CartProvider>
  )
}
