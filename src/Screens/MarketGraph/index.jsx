// // // import React, { useEffect, useState } from "react";
// // // import { Line } from "react-chartjs-2";
// // // import MarketCalculations from "../MarketCalculations";
// // // import {
// // //   Chart as ChartJS,
// // //   LineElement,
// // //   PointElement,
// // //   LinearScale,
// // //   CategoryScale,
// // //   Title,
// // //   Tooltip,
// // //   Legend,
// // // } from "chart.js";

// // // // Register the necessary components
// // // ChartJS.register(
// // //   LineElement,
// // //   PointElement,
// // //   LinearScale,
// // //   CategoryScale,
// // //   Title,
// // //   Tooltip,
// // //   Legend
// // // );

// // // const MarketGraph = () => {
// // //   const [marketData, setMarketData] = useState(null);
// // //   const [chartData, setChartData] = useState({ labels: [], prices: [] });
// // //   const [alert, setAlert] = useState("");

// // //   const WEBSOCKET_URL =
// // //     "wss://coffeequotes.coffeewebapi.com/api/GetICEMartketTerminalData";

// // //   useEffect(() => {
// // //     const socket = new WebSocket(WEBSOCKET_URL);

// // //     socket.onopen = () => {
// // //       console.log("WebSocket connection established");
// // //     };

// // //     socket.onmessage = (event) => {
// // //       const data = JSON.parse(event.data);
// // //       const coffeeQuotesICEData = data.ReturnLst.CoffeeQuotesICEData;
// // //       setMarketData(coffeeQuotesICEData);
// // //       updateChart(coffeeQuotesICEData);
// // //       generateSignal(coffeeQuotesICEData);
// // //     };

// // //     socket.onerror = (error) => {
// // //       console.error("WebSocket error:", error);
// // //     };

// // //     socket.onclose = () => {
// // //       console.log("WebSocket connection closed");
// // //     };

// // //     return () => {
// // //       socket.close(); // Clean up the WebSocket connection on component unmount
// // //     };
// // //   }, []);

// // //   const updateChart = (coffeeQuotesICEData) => {
// // //     setChartData((prev) => ({
// // //     //   labels: [...prev.labels, coffeeQuotesICEData[0]._52weeksHighDateFormat], // Use the new date variable
// // //       prices: [...prev.prices, parseFloat(coffeeQuotesICEData[0].lastChng)], // Use the new last price variable
// // //     }));
// // //   };

// // //   const generateSignal = (coffeeQuotesICEData) => {
// // //     const lastPrice = parseFloat(coffeeQuotesICEData[0].lastChng); // Updated variable name
// // //     const preClose = parseFloat(coffeeQuotesICEData[0].prevRate); // Updated variable name
// // //     const volume = parseFloat(coffeeQuotesICEData[0].volume); // Updated variable name
// // //     const bidSize = parseFloat(coffeeQuotesICEData[0].bid); // Updated variable name
// // //     const askSize = parseFloat(coffeeQuotesICEData[0].ask); // Updated variable name
// // //     // Error handling for missing data

// // //     if (
// // //       isNaN(lastPrice) ||
// // //       isNaN(preClose) ||
// // //       isNaN(volume) ||
// // //       isNaN(bidSize) ||
// // //       isNaN(askSize)
// // //     ) {
// // //       return;
// // //     }

// // //     const priceChangePercentage = ((lastPrice - preClose) / preClose) * 100;
// // //     // Generating signals
// // //     if (priceChangePercentage > 1 && bidSize > askSize && volume > 1000) {
// // //       setAlert("🚨 Strong Buy Signal! 🚨");
// // //     } else if (
// // //       priceChangePercentage < -1 &&
// // //       askSize > bidSize &&
// // //       volume > 1000
// // //     ) {
// // //       setAlert("🚨 Strong Sell Signal! 🚨");
// // //     } else {
// // //       setAlert("");
// // //     }
// // //   };

// // //   return (
// // //     <div>
// // //       <h2>Market Price Movement</h2>
// // //       {alert && (
// // //         <div style={{ color: "red", fontSize: "24px", fontWeight: "bold" }}>
// // //           {alert}
// // //         </div>
// // //       )}
// // //       <Line
// // //         data={{
// // //           labels: chartData.labels,
// // //           datasets: [
// // //             {
// // //               label: "Last Price",
// // //               data: chartData.prices,
// // //               fill: false,
// // //               backgroundColor: "rgba(75,192,192,0.2)",
// // //               borderColor: "rgba(75,192,192,1)",
// // //             },
// // //           ],
// // //         }}
// // //         options={{
// // //           scales: {
// // //             x: {
// // //               title: {
// // //                 display: true,
// // //                 text: "Time",
// // //               },
// // //             },
// // //             y: {
// // //               title: {
// // //                 display: true,
// // //                 text: "Price",
// // //               },
// // //             },
// // //           },
// // //         }}
// // //       />
// // //       <MarketCalculations marketData={marketData} />
// // //     </div>
// // //   );
// // // };

// // // export default MarketGraph;
// // import React, { useEffect, useState } from "react";
// // import { Bar } from "react-chartjs-2"; // Using Bar chart for visualization
// // import MarketCalculations from "../MarketCalculations";
// // import {
// //   Chart as ChartJS,
// //   BarElement,
// //   CategoryScale,
// //   LinearScale,
// //   Title,
// //   Tooltip,
// //   Legend,
// // } from "chart.js";

// // // Register the necessary components
// // ChartJS.register(
// //   BarElement,
// //   CategoryScale,
// //   LinearScale,
// //   Title,
// //   Tooltip,
// //   Legend
// // );

// // const MarketGraph = () => {
// //   const [marketData, setMarketData] = useState([]);
// //   const [chartData, setChartData] = useState({ labels: [], bidSizes: [], askSizes: [] });
// //   const [alert, setAlert] = useState("");

// //   const WEBSOCKET_URL = "wss://coffeequotes.coffeewebapi.com/api/GetICEMartketTerminalData";

// //   const connectWebSocket = () => {
// //     const socket = new WebSocket(WEBSOCKET_URL);

// //     socket.onopen = () => {
// //       console.log("WebSocket connection established");
// //     };

// //     socket.onmessage = (event) => {
// //       const data = JSON.parse(event.data);
// //       const coffeeQuotesICEData = data.ReturnLst.CoffeeQuotesICEData;
// //       console.log(coffeeQuotesICEData)

// //       // Filter to keep only the objects with id 1
// //       const filteredData = coffeeQuotesICEData.filter(item => item.idMarket === 1);
// //       if (filteredData.length > 0) {
// //         setMarketData(filteredData);
// //         updateChart(filteredData);
// //         filteredData.forEach(item => generateSignal(item));
// //       }
// //     };

// //     socket.onerror = (error) => {
// //       console.error("WebSocket error:", error);
// //       console.log("WebSocket readyState:", socket.readyState); // Logs the current state
// //     };

// //     socket.onclose = () => {
// //       console.log("WebSocket connection closed. Attempting to reconnect...");
// //       setTimeout(connectWebSocket, 5000); // Retry after 5 seconds
// //     };

// //     return socket;
// //   };

// //   useEffect(() => {
// //     const socket = connectWebSocket();

// //     return () => {
// //       socket.close(); // Clean up the WebSocket connection on component unmount
// //     };
// //   }, []);

// //   const updateChart = (filteredData) => {
// //     // Check for changes in bidSize, askSize, bid, or ask for any object
// //     const changedObjects = filteredData.filter(item => {
// //       return item.bid !== undefined && item.ask !== undefined && (
// //         item.bid !== item.prevBid || item.ask !== item.prevAsk ||
// //         item.bidSize !== item.prevBidSize || item.askSize !== item.prevAskSize
// //       );
// //     });

// //     if (changedObjects.length > 0) {
// //       const currentTime = new Date().toLocaleTimeString();
// //       changedObjects.forEach(item => {
// //         // Log changes to the console
// //         if (item.bid !== item.prevBid) {
// //           console.log(`Bid changed: ${item.prevBid} -> ${item.bid}`);
// //         }
// //         if (item.ask !== item.prevAsk) {
// //           console.log(`Ask changed: ${item.prevAsk} -> ${item.ask}`);
// //         }
// //         if (item.bidSize !== item.prevBidSize) {
// //           console.log(`Bid Size changed: ${item.prevBidSize} -> ${item.bidSize}`);
// //         }
// //         if (item.askSize !== item.prevAskSize) {
// //           console.log(`Ask Size changed: ${item.prevAskSize} -> ${item.askSize}`);
// //         }

// //         // Update the chart data
// //         setChartData(prev => ({
// //           labels: [...prev.labels, currentTime], // Adding current time to labels
// //           bidSizes: [...prev.bidSizes, parseFloat(item.bid)], // Using bidSize
// //           askSizes: [...prev.askSizes, parseFloat(item.ask)], // Using askSize
// //         }));
        
// //         // Update previous values for future comparisons
// //         item.prevBid = item.bid;
// //         item.prevAsk = item.ask;
// //         item.prevBidSize = item.bidSize;
// //         item.prevAskSize = item.askSize;
// //       });
// //     }
// //   };

// //   const generateSignal = (filteredData) => {
// //     const lastPrice = parseFloat(filteredData.lastChng);
// //     const preClose = parseFloat(filteredData.prevRate);
// //     const volume = parseFloat(filteredData.volume);
// //     const bidSize = parseFloat(filteredData.bid);
// //     const askSize = parseFloat(filteredData.ask);

// //     // Error handling for missing data
// //     if (
// //       isNaN(lastPrice) ||
// //       isNaN(preClose) ||
// //       isNaN(volume) ||
// //       isNaN(bidSize) ||
// //       isNaN(askSize)
// //     ) {
// //       return;
// //     }

// //     const priceChangePercentage = ((lastPrice - preClose) / preClose) * 100;
// //     // Generating signals
// //     if (priceChangePercentage > 1 && bidSize > askSize && volume > 1000) {
// //       setAlert("🚨 Strong Buy Signal! 🚨");
// //     } else if (
// //       priceChangePercentage < -1 &&
// //       askSize > bidSize &&
// //       volume > 1000
// //     ) {
// //       setAlert("🚨 Strong Sell Signal! 🚨");
// //     } else {
// //       setAlert("");
// //     }
// //   };

// //   return (
// //     <div>
// //       <h2>Market Price Movement</h2>
// //       {alert && (
// //         <div style={{ color: "red", fontSize: "24px", fontWeight: "bold" }}>
// //           {alert}
// //         </div>
// //       )}
// //       <Bar
// //         data={{
// //           labels: chartData.labels,
// //           datasets: [
// //             {
// //               label: "Bid Size",
// //               data: chartData.bidSizes,
// //               backgroundColor: "rgba(75,192,192,0.5)",
// //               borderColor: "rgba(75,192,192,1)",
// //               borderWidth: 1,
// //             },
// //             {
// //               label: "Ask Size",
// //               data: chartData.askSizes,
// //               backgroundColor: "rgba(255,99,132,0.5)",
// //               borderColor: "rgba(255,99,132,1)",
// //               borderWidth: 1,
// //             },
// //           ],
// //         }}
// //         options={{
// //           scales: {
// //             x: {
// //               title: {
// //                 display: true,
// //                 text: "Time",
// //               },
// //             },
// //             y: {
// //               title: {
// //                 display: true,
// //                 text: "Size",
// //               },
// //               beginAtZero: true,
// //             },
// //           },
// //         }}
// //       />
// //       <MarketCalculations marketData={marketData} />
// //     </div>
// //   );
// // };

// // export default MarketGraph;


// import React, { useEffect, useState } from "react";
// import { Bar } from "react-chartjs-2"; // Using Bar chart for visualization
// import MarketCalculations from "../MarketCalculations";
// import {
//   Chart as ChartJS,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// // Register the necessary components
// ChartJS.register(
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Title,
//   Tooltip,
//   Legend
// );

// const MarketGraph = () => {
//   const [marketData, setMarketData] = useState([]);
//   const [chartData, setChartData] = useState({ labels: [], lastChngData: [] });
//   const [previousData, setPreviousData] = useState([]); // Store the previous data for comparison
//   const [alert, setAlert] = useState("");

//   const WEBSOCKET_URL = "wss://coffeequotes.coffeewebapi.com/api/GetICEMartketTerminalData";

//   const connectWebSocket = () => {
//     const socket = new WebSocket(WEBSOCKET_URL);

//     socket.onopen = () => {
//       console.log("WebSocket connection established");
//     };

//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       const coffeeQuotesICEData = data.ReturnLst.CoffeeQuotesICEData;

//       // Ensure coffeeQuotesICEData is an array
//       if (!Array.isArray(coffeeQuotesICEData)) {
//         console.error("Expected coffeeQuotesICEData to be an array, got:", coffeeQuotesICEData);
//         return;
//       }

//       // Filter to keep only the objects with id 1
//       const filteredData = coffeeQuotesICEData.filter(item => item.idMarket === 1);
//       if (filteredData.length > 0) {
//         setMarketData(filteredData);
//         updateChart(filteredData);
//         generateSignal(filteredData); // Pass filteredData to generateSignal
//       }
//     };

//     socket.onerror = (error) => {
//       console.error("WebSocket error:", error);
//       console.log("WebSocket readyState:", socket.readyState); // Logs the current state
//     };

//     socket.onclose = () => {
//       console.log("WebSocket connection closed. Attempting to reconnect...");
//       setTimeout(connectWebSocket, 5000); // Retry after 5 seconds
//     };

//     return socket;
//   };

//   useEffect(() => {
//     const socket = connectWebSocket();

//     return () => {
//       socket.close(); // Clean up the WebSocket connection on component unmount
//     };
//   }, []);

//   const updateChart = (filteredData) => {
//     const currentTime = new Date().toLocaleTimeString();
//     filteredData.forEach(item => {
//       // Check if item has necessary properties
//       if (!item.id || !item.bid || !item.ask || !item.bsize || !item.asize || !item.lastChng) {
//         console.warn("Item is missing required properties:", item);
//         return; // Skip this item if it's incomplete
//       }

//       const previousItem = previousData.find(prevItem => prevItem.id === item.id);

//       if (previousItem) {
//         const hasChanged =
//           item.bid !== previousItem.bid ||
//           item.ask !== previousItem.ask ||
//           item.bidSize !== previousItem.bidSize ||
//           item.askSize !== previousItem.askSize;

//         if (hasChanged) {
//           // Log the entire object that changed
//           console.log("Changed Object:", item);
//           // Plot only the lastChng for the changed object
//           setChartData(prev => ({
//             labels: [...prev.labels, currentTime], // Adding current time to labels
//             lastChngData: [...prev.lastChngData, parseFloat(item.lastChng)], // Plotting lastChng
//           }));
//         }
//       }
//     });

//     // Update the previous data for the next comparison
//     setPreviousData(filteredData);
//   };

//   const generateSignal = (filteredData) => {
//     // Check if filteredData is an array
//     if (!Array.isArray(filteredData)) {
//       console.error("generateSignal expected an array but got:", filteredData);
//       return;
//     }

//     filteredData.forEach(item => {
//       const lastPrice = parseFloat(item.lastChng);
//       const preClose = parseFloat(item.prevRate);
//       const volume = parseFloat(item.volume);
//       const bidSize = parseFloat(item.bid);
//       const askSize = parseFloat(item.ask);

//       // Error handling for missing data
//       if (
//         isNaN(lastPrice) ||
//         isNaN(preClose) ||
//         isNaN(volume) ||
//         isNaN(bidSize) ||
//         isNaN(askSize)
//       ) {
//         return;
//       }

//       const priceChangePercentage = ((lastPrice - preClose) / preClose) * 100;
//       // Generating signals
//       if (priceChangePercentage > 1 && bidSize > askSize && volume > 1000) {
//         setAlert("🚨 Strong Buy Signal! 🚨");
//       } else if (
//         priceChangePercentage < -1 &&
//         askSize > bidSize &&
//         volume > 1000
//       ) {
//         setAlert("🚨 Strong Sell Signal! 🚨");
//       } else {
//         setAlert("");
//       }
//     });
//   };

//   return (
//     <div>
//       <h2>Market Price Movement</h2>
//       {alert && (
//         <div style={{ color: "red", fontSize: "24px", fontWeight: "bold" }}>
//           {alert}
//         </div>
//       )}
//       <Bar
//         data={{
//           labels: chartData.labels,
//           datasets: [
//             {
//               label: "Last Change",
//               data: chartData.lastChngData,
//               backgroundColor: "rgba(75,192,192,0.5)",
//               borderColor: "rgba(75,192,192,1)",
//               borderWidth: 1,
//             },
//           ],
//         }}
//         options={{
//           scales: {
//             x: {
//               title: {
//                 display: true,
//                 text: "Time",
//               },
//             },
//             y: {
//               title: {
//                 display: true,
//                 text: "Last Change",
//               },
//               beginAtZero: true,
//             },
//           },
//         }}
//       />
//       <MarketCalculations marketData={marketData} />
//     </div>
//   );
// };

// export default MarketGraph;




import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import MarketCalculations from "../MarketCalculations";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const MarketGraph = () => {
  const [marketData, setMarketData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], lastChngData: [] });
  const [previousData, setPreviousData] = useState([]);
  const [alert, setAlert] = useState("");

  const WEBSOCKET_URL = "wss://coffeequotes.coffeewebapi.com/api/GetICEMartketTerminalData";
  const [socket, setSocket] = useState(null);

  const connectWebSocket = () => {
    const socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
      console.log("WebSocket connection established");

      // Start sending requests every 5 seconds
      const interval = setInterval(() => {
        socket.send(JSON.stringify({ action: "getUpdates" })); // Customize this action as needed
        console.log("Triggered WebSocket request for updates"); // Log to console
      }, 5000);

      // Cleanup the interval on socket close
      socket.onclose = () => clearInterval(interval);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const coffeeQuotesICEData = data.ReturnLst.CoffeeQuotesICEData;

      if (Array.isArray(coffeeQuotesICEData)) {
        const filteredData = coffeeQuotesICEData.filter(item => item.idMarket === 1);
        if (filteredData.length > 0) {
          setMarketData(filteredData);
          updateChart(filteredData);
          generateSignal(filteredData);
        }
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed. Attempting to reconnect...");
      setTimeout(connectWebSocket, 5000);
    };

    return socket;
  };

  useEffect(() => {
    const socket = connectWebSocket();
    setSocket(socket);

    return () => {
      socket.close(); // Clean up the WebSocket connection on component unmount
    };
  }, []);

  const updateChart = (filteredData) => {
    const currentTime = new Date().toLocaleTimeString();
    filteredData.forEach(item => {
      if (!item.id || !item.bid || !item.ask || !item.bsize || !item.asize || !item.lastChng) {
        console.warn("Item is missing required properties:", item);
        return;
      }

      const previousItem = previousData.find(prevItem => prevItem.id === item.id);
      if (previousItem) {
        const hasChanged =
          item.bid !== previousItem.bid ||
          item.ask !== previousItem.ask ||
          item.bidSize !== previousItem.bsize ||
          item.askSize !== previousItem.asize;

        if (hasChanged) {
          console.log("Changed Object:", item);
          setChartData(prev => ({
            labels: [...prev.labels, currentTime],
            lastChngData: [...prev.lastChngData, parseFloat(item.lastChng)],
          }));
        }
      }
    });

    setPreviousData(filteredData);
  };

  const generateSignal = (filteredData) => {
    if (!Array.isArray(filteredData)) {
      console.error("generateSignal expected an array but got:", filteredData);
      return;
    }

    filteredData.forEach(item => {
      const lastPrice = parseFloat(item.lastChng);
      const preClose = parseFloat(item.prevRate);
      const volume = parseFloat(item.volume);
      const bidSize = parseFloat(item.bid);
      const askSize = parseFloat(item.ask);

      if (
        isNaN(lastPrice) ||
        isNaN(preClose) ||
        isNaN(volume) ||
        isNaN(bidSize) ||
        isNaN(askSize)
      ) {
        return;
      }

      const priceChangePercentage = ((lastPrice - preClose) / preClose) * 100;
      if (priceChangePercentage > 1 && bidSize > askSize && volume > 1000) {
        setAlert("🚨 Strong Buy Signal! 🚨");
      } else if (
        priceChangePercentage < -1 &&
        askSize > bidSize &&
        volume > 1000
      ) {
        setAlert("🚨 Strong Sell Signal! 🚨");
      } else {
        setAlert("");
      }
    });
  };

  return (
    <div>
      <h2>Market Price Movement</h2>
      {alert && (
        <div style={{ color: "red", fontSize: "24px", fontWeight: "bold" }}>
          {alert}
        </div>
      )}
      <Bar
        data={{
          labels: chartData.labels,
          datasets: [
            {
              label: "Last Change",
              data: chartData.lastChngData,
              backgroundColor: "rgba(75,192,192,0.5)",
              borderColor: "rgba(75,192,192,1)",
              borderWidth: 1,
            },
          ],
        }}
        options={{
          scales: {
            x: {
              title: {
                display: true,
                text: "Time",
              },
            },
            y: {
              title: {
                display: true,
                text: "Last Change",
              },
              beginAtZero: true,
            },
          },
        }}
      />
      <MarketCalculations marketData={marketData} />
    </div>
  );
};

export default MarketGraph;
