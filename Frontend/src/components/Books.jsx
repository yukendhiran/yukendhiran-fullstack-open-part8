const Books = (props) => {

  const user = localStorage.getItem("user")
  let favoriteGenre = ""
  if (user) {
    favoriteGenre = JSON.parse(user).favoriteGenre

    console.log("user", user)
  }

  const books = props.books.data.allBooks
  const favoriteBooks = books.filter((book) =>
    book.genres.includes(favoriteGenre)
  )
  const otherBooks = books.filter(
    (book) => !book.genres.includes(favoriteGenre)
  )

  const handleChange = (event) => {
    console.log(event.target.value)
    props.setFilterGenre(event.target.value)
    props.books.refetch()
  }

  return (
    <div>
      <h2>books</h2>
      <div>
        <select
          value={props.filterGenre}
          onChange={(event) => handleChange(event)}
        >
          <option value={"Classic"}>Classic</option>
          <option value={"Novel"}>Novel</option>
          <option value={"Fiction"}>Fiction</option>
        </select>
      </div>
      <h1>Recommended</h1>
      <BookList books={favoriteBooks} />
      <h1>Books</h1>
      <BookList books={otherBooks} />
    </div>
  )
}

const BookList = (prop) => {
  return (
    <table>
      <tbody>
        <tr>
          <th></th>
          <th>author</th>
          <th>published</th>
        </tr>
        {prop.books.map((a) => (
          <tr key={a.title}>
            <td>{a.title}</td>
            <td>{a.author.name}</td>
            <td>{a.published}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Books
