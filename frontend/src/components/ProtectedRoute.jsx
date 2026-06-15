import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useStore } from '../hooks/useStore'

export function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useUser()
  const location = useLocation()

  if (!isLoaded) {
    return (
      <div className="route-loading">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

export function RequireStore({ children, fallback = '/store/create' }) {
  const { hasStore, isLoading } = useStore()

  if (isLoading) {
    return (
      <div className="route-loading">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!hasStore) {
    return <Navigate to={fallback} replace />
  }

  return children
}

export function RequireListing({ children, fallback = '/new-listing' }) {
  const { hasListings, isLoading } = useStore()

  if (isLoading) {
    return (
      <div className="route-loading">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!hasListings) {
    return <Navigate to={fallback} replace />
  }

  return children
}

export function StoreOrListingRedirect({ children }) {
  const { hasStore, hasListings, isLoading } = useStore()

  if (isLoading) {
    return (
      <div className="route-loading">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!hasStore) {
    return <Navigate to="/store/create" replace />
  }

  if (!hasListings) {
    return <Navigate to="/new-listing" replace />
  }

  return children
}