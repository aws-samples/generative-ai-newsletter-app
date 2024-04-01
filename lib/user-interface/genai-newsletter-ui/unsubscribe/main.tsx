import React from 'react'
import ReactDOM from 'react-dom/client'
import { UnsubscribeApp } from './unsubscribe-app'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import './index.css'


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)



root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/:newsletterId/:userId" element={<UnsubscribeApp />} />
      </Routes>
    </BrowserRouter>

  </React.StrictMode>
)
