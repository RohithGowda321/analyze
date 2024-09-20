// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './App.css';

// function App() {
//   const [coffeeData, setCoffeeData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const API_KEY = '29D5N2XXAN485L6O'; // Replace with your actual API key
//   const COFFEE_SYMBOL = 'KC=F'; // Replace with appropriate coffee symbol if needed
//   const API_URL = `https://www.alphavantage.co/query?function=COFFEE&interval=monthly&apikey=${API_KEY}`;

//   useEffect(() => {
//     // Fetch data from the API
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(API_URL);
        
//         // Log the full response to the console for inspection
//         console.log('Full API Response:', response.data);
  
//         const timeSeries = response.data['Time Series (1min)'];
  
//         if (timeSeries) {
//           const data = Object.entries(timeSeries).map(([time, priceData]) => ({
//             time,
//             open: priceData['1. open'],
//             high: priceData['2. high'],
//             low: priceData['3. low'],
//             close: priceData['4. close'],
//             // Log all fields from priceData to the console
//             ...priceData
//           }));
//           setCoffeeData(data);
//         } else {
//           throw new Error('No data available');
//         }
  
//         setLoading(false);
//       } catch (error) {
//         setError(error.message);
//         setLoading(false);
//       }
//     };
  
//     fetchData();
//   }, [API_URL]);
  

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>Coffee Price Data</h1>

//         {loading && <p>Loading...</p>}
//         {error && <p>Error: {error}</p>}

//         {!loading && !error && (
//           <table>
//             <thead>
//               <tr>
//                 <th>Time</th>
//                 <th>Open</th>
//                 <th>High</th>
//                 <th>Low</th>
//                 <th>Close</th>
//               </tr>
//             </thead>
//             <tbody>
//               {coffeeData.map((data, index) => (
//                 <tr key={index}>
//                   <td>{data.time}</td>
//                   <td>{data.open}</td>
//                   <td>{data.high}</td>
//                   <td>{data.low}</td>
//                   <td>{data.close}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </header>
//     </div>
//   );
// }

// export default App;


import React from 'react'
import MarketGraph from './Screens/MarketGraph'

const App = () => {
  return (
    <div>
      <MarketGraph/>
    </div>
  )
}

export default App
