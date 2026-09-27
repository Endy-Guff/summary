import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import TopicPage from './pages/TopicPage'
import NotePage from './pages/NotePage'
import SearchPage from './pages/SearchPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path=":categoryId" element={<CategoryPage />} />
        <Route path=":categoryId/:topicId" element={<TopicPage />} />
        <Route path=":categoryId/:topicId/:noteId" element={<NotePage />} />
      </Route>
    </Routes>
  )
}