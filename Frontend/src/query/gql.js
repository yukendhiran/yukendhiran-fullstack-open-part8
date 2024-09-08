import { gql } from "@apollo/client"

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      born
      id
      name
      bookCount
    }
  }
`
export const ALL_BOOKS = gql`
  query ($genre: String) {
    allBooks(genre: $genre) {
      id
      title
      published
      author {
        name
        id
        born
      }
      genres
    }
  }
`

export const ADD_BOOK = gql`
  mutation createBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      title
      published
      author {
        name
        id
      }
      genres
      id
    }
  }
`

export const EDIT_BORN = gql`
  mutation updateAuthor($name: String!, $born: Int!) {
    editDOB(name: $name, born: $born) {
      name
      born
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

export const ME = gql`
  query {
    me {
      username
      favoriteGenre
      id
    }
  }
`
