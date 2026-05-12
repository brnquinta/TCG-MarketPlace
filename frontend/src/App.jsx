import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './context/StoreContext.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Store from './pages/Store.jsx'
import StoreEdit from './pages/StoreEdit.jsx'
import NewListing from './pages/NewListing.jsx'
import CardDetail from './pages/CardDetail.jsx'
import Checkout from './pages/Checkout.jsx'
import CreateStore from './pages/CreateStore.jsx'
import StoreDashboard from './pages/StoreDashboard.jsx'
import AdsList from './pages/AdsList.jsx'
import ListingDetails from "./pages/ListingDetails"
import Cart from "./pages/Cart.jsx"

function ProtectedDashboard() {
  const { store, loading } = useStore()

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Carregando...
      </div>
    )
  }

  if (!store) {
    return <Navigate to="/store/create" replace />
  }

  return <StoreDashboard />
}

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/anuncios" element={<AdsList />} />
        <Route path="/card/:id" element={<CardDetail />} />
        <Route path="/store/create" element={<CreateStore />} />
        <Route path="/store/edit" element={<StoreEdit />} />
        <Route path="/store/:userId" element={<Store />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="/new-listing" element={<NewListing />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/checkout/:listingId" element={<Checkout />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </MainLayout>
  )
}

export default App