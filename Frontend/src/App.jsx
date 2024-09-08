import { useQuery, useApolloClient } from "@apollo/client"
import { useState } from "react"
import { ALL_AUTHORS, ALL_BOOKS } from "./query/gql"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import LoginForm from "./components/LoginForm"
export default function App() {
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [filterGenre, setFilterGenre] = useState("")

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS, {
    variables: {
      genre: filterGenre,
    },
  })
  const client = useApolloClient()

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  console.log(authors)
  console.log(books)
  if (authors.loading || books.loading) {
    return <div>Loading...</div>
  }

  if (!token) {
    return (
      <div>
        <Notify errorMessage={errorMessage} />
        <h2>Login</h2>
        <LoginForm setToken={setToken} setError={notify} />
      </div>
    )
  }

  if (authors.error) {
    return <div> Author Error: {authors.error.message}</div>
  }

  if (books.error) {
    return <div>Book Error: {books.error.message}</div>
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Author</Link>
            </li>
            <li>
              <Link to="/book">Book</Link>
            </li>
            <li>
              <Link to="/add-book">Add Book</Link>
            </li>
            <li>
              <Link to="/">
                <button onClick={logout}>Logout</button>
              </Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route
            path="/book"
            element={
              <Books
                books={books}
                filterGenre={filterGenre}
                setFilterGenre={setFilterGenre}
              />
            }
          />
          <Route path="/add-book" element={<NewBook />} />
          <Route
            path="/"
            element={<Authors authors={authors.data.allAuthors} />}
          />
        </Routes>
      </div>
    </Router>
  )
}

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null
  }
  return <div style={{ color: "red" }}> {errorMessage} </div>
}
