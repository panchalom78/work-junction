import React from 'react'
import Routers from './routes/route.jsx'
import { Toaster } from 'react-hot-toast';
export default function App() {
  return (
    <>
    <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: "14px",
            borderRadius: "10px",
            padding: "10px 16px",
          },
          success: {
            style: {
              background: "#4ade80", // green
              color: "white",
            },
          },
          error: {
            style: {
              background: "#f87171", // red
              color: "white",
            },
          },
        }}
      />
     <Routers />

    </>
  )
}
