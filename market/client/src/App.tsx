import { useState, useEffect } from 'react';

export default function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(e => setMessage('error: ' + JSON.stringify(e)));
  }, []);

  return (
    <div>
      <h1 className='text-center text-2xl'>{message}</h1>
    </div>
  );
}