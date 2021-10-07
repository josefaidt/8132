import { Amplify } from 'aws-amplify'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import config from '../aws-exports'

Amplify.configure(config)

export default withAuthenticator(function MyApp({ Component, pageProps }) {
  return (
    <main>
      <AmplifySignOut />
      <Component {...pageProps} />
    </main>
  )
})
