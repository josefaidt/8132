import { useState, useEffect, createRef, useRef, useReducer } from 'react'
import { API, Auth } from 'aws-amplify'
import { listTodos as query } from '../graphql/queries'
import { createTodo } from '../graphql/mutations'

export default function HomePage(props) {
  const [data, setData] = useState()
  const [createResponse, setCreateResponse] = useState()
  const [isLoading, toggleIsLoading] = useReducer(
    (state, action) => (action !== undefined ? action : !state),
    false
  )
  const [displayAllTodos, toggleDisplayAllTodos] = useReducer(
    state => !state,
    true
  )
  const inputNameRef = createRef()
  const inputDescriptionRef = createRef()
  const formRef = useRef()

  async function getData() {
    if (!isLoading) toggleIsLoading(true)
    const { username } = await Auth.currentAuthenticatedUser()
    const variables = {}
    console.log({ displayAllTodos })
    if (!displayAllTodos) {
      variables.filter = {
        owner: {
          eq: username,
        },
      }
    }
    setData(await API.graphql({ query, variables }))
    toggleIsLoading(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const variables = {
      input: {
        name: inputNameRef.current.value,
        description: inputDescriptionRef.current.value,
      },
    }
    const createResponse = await API.graphql({
      query: createTodo,
      variables,
    })
    setCreateResponse(createResponse)
    formRef.current.reset()
    getData()
  }

  useEffect(() => {
    getData()
    if (inputNameRef?.current) inputNameRef.current.focus()
  }, [displayAllTodos])

  return (
    <div>
      <button onClick={toggleDisplayAllTodos}>
        {displayAllTodos ? 'Show my Todos' : 'Show all todos'}
      </button>
      <form onSubmit={handleSubmit} ref={formRef}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          ref={inputNameRef}
          value={inputNameRef?.current?.value}
        />
        <label htmlFor="description">Description:</label>
        <input
          type="text"
          id="description"
          ref={inputDescriptionRef}
          value={inputDescriptionRef?.current?.value}
        />
        <button type="submit">Submit</button>
        <br />
        {createResponse?.data && <span>Success!</span>}
        {createResponse?.errors && (
          <pre>
            <code>{JSON.stringify(createResponse, null, 2)}</code>
          </pre>
        )}
      </form>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <pre>
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      )}
    </div>
  )
}
