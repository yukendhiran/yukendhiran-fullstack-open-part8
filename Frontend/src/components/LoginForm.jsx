import { useState, useEffect } from "react"
import { useMutation } from "@apollo/client"
import { LOGIN, ME } from "../query/gql"
import { useApolloClient } from "@apollo/client"
const LoginForm = ({ setError, setToken }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
    },
  })

  const client = useApolloClient()

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      console.log("TOKEN", token)
      localStorage.setItem("user-token", token)

      client
        .query({
          query: ME,
        })
        .then((response) => {
          console.log("Login User", response)
          const user = response.data.me
          localStorage.setItem("user", JSON.stringify(user))
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }, [result.data])

  const submit = async (event) => {
    event.preventDefault()

    login({ variables: { username, password } })
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username{" "}
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password{" "}
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm
