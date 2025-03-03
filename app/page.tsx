import React from 'react'
import FontConverter from './components/FontConverter'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <FontConverter />
    </main>
  )
}
