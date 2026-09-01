import { useState } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from '../components/layout/ErrorBoundary'
import { createQueryClient } from '../lib/queryClient'
import { getLoggedUserId } from '../utils/getLoggedUserId'
import '../styles/globals.css'

// Default way to get a logged user
export const loggedUserId = getLoggedUserId()

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Messages - leboncoin</title>
        <meta
          name="description"
          content="Consultez et répondez à vos messages leboncoin."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f4661b" />
      </Head>
      <ErrorBoundary onReset={() => queryClient.clear()}>
        <Component {...pageProps} />
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
