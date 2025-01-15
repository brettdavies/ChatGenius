import { useState, useEffect } from 'react';
import './App.css';

interface CountResponse {
  count: number;
}

function App(): JSX.Element {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    void fetchCount();
  }, []);

  const fetchCount = async (): Promise<void> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/counter`);
      const data: CountResponse = await response.json();
      setCount(data.count);
    } catch (error) {
      console.error('Error fetching count:', error);
    }
  };

  const incrementCount = async (): Promise<void> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/counter/increment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data: CountResponse = await response.json();
      setCount(data.count);
    } catch (error) {
      console.error('Error incrementing count:', error);
    }
  };

  return (
    <main>
      <h1>Welcome to PERN Starter Kit</h1>
      <p>A modern full-stack starter template for building web applications</p>
      <div className="counter-section">
        <p>Current count: {count}</p>
        <button onClick={incrementCount}>Increment Count</button>
      </div>
    </main>
  );
}

export default App; 