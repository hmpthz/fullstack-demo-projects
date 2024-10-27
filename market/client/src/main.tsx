import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import './index.css'
import { debounce } from '@shared/debounce'

(debounce(() => console.log('Debounce test'), 500))();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
