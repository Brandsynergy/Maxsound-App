import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { registerPWA } from './pwa.js'

registerPWA()

// Clear badge when app is opened
if (navigator.clearAppBadge) {
  navigator.clearAppBadge().catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
