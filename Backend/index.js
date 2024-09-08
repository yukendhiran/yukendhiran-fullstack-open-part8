const { ApolloServer } = require('@apollo/server')
const { GraphQLError } = require('graphql')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const Book = require('./model/Book')
const Author = require('./model/Author')
const User = require('./model/User')
const { authors, books } = require('./data/data')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

mongoose.set('strictQuery', false)

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

// Clean DB
async function cleanDB() {
  // Delete all authors and books before inserting new data
  try {
    await Author.deleteMany({})
    console.log('Authors deleted')
  } catch (err) {
    console.error(err)
  }

  try {
    await Book.deleteMany({})
    console.log('Books deleted')
  } catch (err) {
    console.error(err)
  }
}

// Insert DB

async function insertDB() {
  // Delete all authors and books before inserting new data
  try {
    await Author.insertMany(authors)
    console.log('Authors Insert')
  } catch (err) {
    console.error(err)
  }

  // try {
  //   await Book.insertMany(books)
  //   console.log('Books Insert')
  // } catch (err) {
  //   console.error(err)
  // }
}

//;(async () => {
//  try {
//    await cleanDB()
//    insertDB()
//  } catch (err) {
//    console.error(err)
//  }
//})()

const typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
   }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!

    ): Book
      
    editDOB (    
      name: String!    
      born: Int!  
    ): Author

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }
   
  enum YesNo {  
    YES  
    NO
  }
  
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors(bookCount: YesNo): [Author!]!
    me: User
  }


`

const resolvers = {
  Query: {
    allBooks: async (root, args) => {
      let book = []
      if (args.author) {
        const result = await Book.find({ author: args.author })
        if (!result) {
          return new GraphQLError('Author not found')
        } else {
          book = await result.map((book) => Book.populate(book, 'author'))
        }

        return book
      }

      if (args.genre) {
        const result = await Book.find({ genres: args.genre })
        if (!result) {
          return new GraphQLError('Genre not found')
        } else {
          book = await result.map((book) => Book.populate(book, 'author'))
        }

        return book
      }

      const result = await Book.find()
      book = await result.map((book) => Book.populate(book, 'author'))
      console.log(book)
      return book
    },
    allAuthors: async (root, args) => {
      if (args.bookCount === 'YES') {
        const authors = await Author.find()
        const authorsWithBookCount = await Promise.all(
          authors.map(async (author) => {
            const bookCount = await Book.countDocuments({ author: author.name })
            return { ...author, bookCount }
          })
        )
        return authorsWithBookCount
      } else {
        return Author.find()
      }
    },
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),

    me: (root, args, context) => {
      return context.currentUser
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      console.log('addBook args:', args)

      if (!currentUser) {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const author = await Author.findOne({ name: args.author })
      if (!author) {
        throw new GraphQLError('Author not found', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.author },
        })
      }

      const book = { ...args, author: author._id }
      const newBook = new Book(book)
      console.log('newBook:', newBook)
      try {
        const savedBook = await newBook.save()
        const populatedBook = await Book.populate(savedBook, { path: 'author' })
        console.log('populatedBook:', populatedBook)
        console.log('populatedBook:', populatedBook)
        return populatedBook
      } catch (error) {
        console.error('Error saving book:', error)
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            error: error.message, // Pass the actual error message
          },
        })
      }
    },

    editDOB: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        throw new GraphQLError('Author not found', {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args.name },
        })
      }
      author.born = args.born
      console.log('author:', author)
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Saving author failed', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            error: error.message, // Pass the actual error message
          },
        })
      }
      return author
    },

    createUser: async (root, args) => {
      console.log('createUser args:', args)
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })

      return user.save().catch((error) => {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error,
          },
        })
      })
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },

  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
