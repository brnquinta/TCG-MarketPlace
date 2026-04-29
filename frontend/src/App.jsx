import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Store from './pages/Store.jsx'
import NewListing from './pages/NewListing.jsx'
import CardDetail from './pages/CardDetail.jsx'
import Checkout from './pages/Checkout.jsx'
import CreateStore from './pages/CreateStore.jsx'
import StoreDashboard from './pages/StoreDashboard.jsx'
import AdsList from './pages/AdsList.jsx'
import ListingDetails from "./pages/ListingDetails"



function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/anuncios" element={<AdsList />} />
        <Route path="/card/:id" element={<CardDetail />} />
        <Route path="/store/create" element={<CreateStore />} />
        <Route path="/store/:userId" element={<Store />} />
        <Route path="/dashboard" element={<StoreDashboard />} />
        <Route path="/new-listing" element={<NewListing />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/checkout/:listingId" element={<Checkout />} />
      </Routes>
    </MainLayout>
  )
}

export default App