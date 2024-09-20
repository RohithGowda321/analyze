import React, { useEffect } from 'react';

const CoffeeQuotes = () => {
  useEffect(() => {
    const socket = new WebSocket('wss://coffeequotes.coffeewebapi.com/api/GetICEMartketTerminalData');

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      console.log('Message received:', event.data);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Cleanup on component unmount
    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      <h1>Coffee Quotes WebSocket</h1>
      <p>Check the console for updates!</p>
    </div>
  );
};

export default CoffeeQuotes;
