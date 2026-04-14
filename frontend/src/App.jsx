import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Store from './pages/Store.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NewListing from './pages/NewListing.jsx'
import CardDetail from './pages/CardDetail.jsx'
import Checkout from './pages/Checkout.jsx'
import CreateStore from './pages/CreateStore.jsx'

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/card/:id" element={<CardDetail />} />
        <Route path="/store/create" element={<CreateStore />} />
        <Route path="/store/:userId" element={<Store />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-listing" element={<NewListing />} />
        <Route path="/checkout/:listingId" element={<Checkout />} />
      </Routes>
    </MainLayout>
  )
}

export default App