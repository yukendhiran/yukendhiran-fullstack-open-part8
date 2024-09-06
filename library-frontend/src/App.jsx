import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { useQuery } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS } from './query/gql'
const App = () => {
  const [page, setPage] = useState('authors')
  const {
    data: dataAuthors,
    loading: loadingAuthors,
    error: errorAuthors,
  } = useQuery(ALL_AUTHORS)

  const {
    data: dataBooks,
    loading: loadingBooks,
    error: errorBooks,
  } = useQuery(ALL_BOOKS)

  if (loadingAuthors || loadingBooks) return <div>Loading...</div>
  if (errorAuthors || errorBooks) return <div>Error</div>
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors show={page === 'authors'} authors={dataAuthors.allAuthors} />

      <Books show={page === 'books'} books={dataBooks.allBooks} />

      <NewBook show={page === 'add'} />
    </div>
  )
}

export default App
