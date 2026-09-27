import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import SearchBar from './SearchBar'
import Breadcrumbs from './Breadcrumbs'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">Конспекты</Link>
        <SearchBar onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} />
      </header>
      <div className="container">
        {!isHome && <Breadcrumbs />}
        <Outlet />
      </div>
    </div>
  )
}