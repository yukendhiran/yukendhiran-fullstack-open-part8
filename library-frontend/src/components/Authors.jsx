import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_BORN } from '../query/gql'
const Authors = (props) => {
  const [born, setBorn] = useState('')
  const [author, setAuthor] = useState('')

  if (!props.show) {
    return null
  }
  console.log('Props data', props)
  const authors = props.authors

  const [updateAuthor] = useMutation(EDIT_BORN, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  const onSubmit = async (event) => {
    event.preventDefault()
    updateAuthor({
      variables: { name: author, born: Number(born) },
    })
    setBorn('')
    setAuthor('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />

      <form onSubmit={onSubmit}>
        <h1>Set birthyear</h1>
        <div>
          Author:
          <select
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          >
            {authors.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          Year:
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default Authors
