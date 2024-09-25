// import React, { useEffect, useState } from 'react';

// const MarketCalculations = ({ marketData }) => {
//   const [calculations, setCalculations] = useState({});

//   useEffect(() => {
//     if (marketData) {
//       calculateMetrics(marketData);
//     }
//   }, [marketData]);

//   const calculateRSI = (prices, period = 14) => {
//     const gains = [];
//     const losses = [];

//     for (let i = 1; i < prices.length; i++) {
//       const change = prices[i] - prices[i - 1];
//       if (change > 0) {
//         gains.push(change);
//         losses.push(0);
//       } else {
//         losses.push(-change);
//         gains.push(0);
//       }
//     }

//     const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
//     const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

//     const rs = avgLoss === 0 ? 0 : avgGain / avgLoss; // Avoid division by zero
//     return 100 - (100 / (1 + rs));
//   };

//   const calculateSMA = (data, period) => {
//     let sma = [];
//     for (let i = period - 1; i < data.length; i++) {
//       const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
//       sma.push(sum / period);
//     }
//     return sma;
//   };

//   const calculateMetrics = (data) => {
//     const {
//       Last = 0,
//       Pre_Close = 1,
//       Volume = 0,
//       Bid = 0,
//       Ask = 0,
//       Bid_Size = 0,
//       Ask_Size = 0,
//       High = 0,
//       Low = 0,
//       Net_High = 0,
//       Net_Low = 0,
//       Open = 0,
//       Open_Int = 0,
//     } = data;

//     const lastPrice = parseFloat(Last);
//     const preClose = parseFloat(Pre_Close);
//     const volume = parseFloat(Volume);
//     const bidPrice = parseFloat(Bid);
//     const askPrice = parseFloat(Ask);
//     const bidSize = parseFloat(Bid_Size);
//     const askSize = parseFloat(Ask_Size);
//     const highPrice = parseFloat(High);
//     const lowPrice = parseFloat(Low);
//     const netHigh = parseFloat(Net_High);
//     const netLow = parseFloat(Net_Low);
//     const openInterest = parseFloat(Open_Int);

//     if (isNaN(lastPrice) || isNaN(preClose)) {
//       return;
//     }

//     const priceChangePercentage = ((marketData.lastChng - marketData.prevRate) / marketData.prevRate) * 100;
//     const spread = marketData.asize - marketData.bSize;
//     const liquidity = marketData.bSize - marketData.asize;
//     const volumeAnalysis = marketData.volume > 1000 ? 'High Volume' : 'Low Volume';
//     const priceMomentum = marketData.lastChng > marketData.highRate * 0.99 ? 'Bullish Momentum' : 'Bearish Momentum';
//     const supportLevel = marketData.lowRate;
//     const resistanceLevel = marketData.highRate;
//     const openInterestTrend = marketData.openInterest > 0 ? 'Increasing' : 'Decreasing';
//     const netHighTrend = marketData.netHigh > 0 ? 'Positive Momentum' : 'Negative Momentum';
//     const netLowTrend = marketData.netLow < 0 ? 'Selling Pressure' : 'Buying Pressure';

//     let overallSignal = '';
//     if (priceChangePercentage > 1 && liquidity > 0 && volume > 1000) {
//       overallSignal = 'Strong Buy';
//     } else if (priceChangePercentage < -1 && liquidity < 0 && volume > 1000) {
//       overallSignal = 'Strong Sell';
//     } else {
//       overallSignal = 'Hold';
//     }

//     // Calculate additional metrics
//     const prices = []; // Populate this with price data for RSI/SMA calculation
//     const rsiValue = calculateRSI(prices);
//     const sma20 = calculateSMA(prices, 20);

//     setCalculations({
//       lastPrice,
//       priceChangePercentage,
//       spread,
//       liquidity,
//       volumeAnalysis,
//       priceMomentum,
//       supportLevel,
//       resistanceLevel,
//       openInterestTrend,
//       netHighTrend,
//       netLowTrend,
//       overallSignal,
//       rsiValue,
//       sma20: sma20.length > 0 ? sma20[sma20.length - 1] : null, // Get the latest SMA value
//     });
//   };

//   return (
//     <div className="market-calculations">
//       <h3>Market Calculations</h3>
//       <p><strong>Last Price:</strong> {calculations.lastPrice}</p>
//       <p><strong>Price Change Percentage:</strong> {calculations.priceChangePercentage?.toFixed(2)}%</p>
//       <p><strong>Bid-Ask Spread:</strong> {calculations.spread?.toFixed(2)}</p>
//       <p><strong>Liquidity Indicator:</strong> {calculations.liquidity > 0 ? 'Demand > Supply' : 'Supply > Demand'}</p>
//       <p><strong>Volume Analysis:</strong> {calculations.volumeAnalysis}</p>
//       <p><strong>Price Momentum:</strong> {calculations.priceMomentum}</p>
//       <p><strong>Support Level:</strong> {calculations.supportLevel}</p>
//       <p><strong>Resistance Level:</strong> {calculations.resistanceLevel}</p>
//       <p><strong>Open Interest Trend:</strong> {calculations.openInterestTrend}</p>
//       <p><strong>Net High Trend:</strong> {calculations.netHighTrend}</p>
//       <p><strong>Net Low Trend:</strong> {calculations.netLowTrend}</p>
//       <p style={{ color: calculations.overallSignal === 'Strong Buy' ? 'green' : calculations.overallSignal === 'Strong Sell' ? 'red' : 'orange' }}>
//         <strong>Overall Market Signal:</strong> {calculations.overallSignal}
//       </p>
//       <p><strong>RSI:</strong> {calculations.rsiValue?.toFixed(2)}</p>
//       <p><strong>20-period SMA:</strong> {calculations.sma20 ? calculations.sma20.toFixed(2) : 'N/A'}</p>
//     </div>
//   );
// };

// export default MarketCalculations;

// import React, { useState, useEffect, useRef } from 'react';

// const WEBSOCKET_URL = "wss://coffeequotes.coffeewebapi.com/api/GetICEMartketTerminalData";

// const MarketDataComponent = () => {
//   const [marketData, setMarketData] = useState(null);
//   const [signal, setSignal] = useState('');
//   const socketRef = useRef(null); // Create a ref for the WebSocket

//   const connectWebSocket = () => {
//     socketRef.current = new WebSocket(WEBSOCKET_URL);

//     socketRef.current.onopen = () => {
//       console.log("WebSocket connection established");
//     };

//     socketRef.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       const coffeeQuotesICEData = data.ReturnLst.CoffeeQuotesICEData;

//       if (Array.isArray(coffeeQuotesICEData)) {
//         const filteredData = coffeeQuotesICEData.filter(item => item.idMarket === 2 && item.marketName === "KCZ-24 (DEC 24)");

//         if (filteredData.length > 0) {
//           setMarketData(filteredData[0]);
//           generateSignal(filteredData[0]); // Pass the first item for calculations
//         }
//       }
//     };

//     socketRef.current.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     socketRef.current.onclose = () => {
//       console.log("WebSocket connection closed. Attempting to reconnect...");
//       setTimeout(connectWebSocket, 5000);
//     };
//   };

//   useEffect(() => {
//     connectWebSocket();
//     // Cleanup on component unmount
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.close(); // Close the socket connection
//       }
//     };
//   }, []);

//   const generateSignal = (data) => {
//     const priceChangePercentage = ((data.lastChng - data.prevRate) / data.prevRate) * 100;
//     const spread = data.asize - data.bsize; // Note: Changed bSize to bsize to match your response
//     const liquidity = data.bsize - data.asize;
//     const volumeAnalysis = data.volume > 1000 ? 'High Volume' : 'Low Volume';
//     const priceMomentum = data.lastChng > data.highRate * 0.99 ? 'Bullish Momentum' : 'Bearish Momentum';
//     const supportLevel = data.lowRate;
//     const resistanceLevel = data.highRate;
//     const openInterestTrend = data.openInterest > 0 ? 'Increasing' : 'Decreasing';
//     const netHighTrend = data.netHigh > 0 ? 'Positive Momentum' : 'Negative Momentum';
//     const netLowTrend = data.netLow < 0 ? 'Selling Pressure' : 'Buying Pressure';

//     let overallSignal = '';
//     if (priceChangePercentage > 1 && liquidity > 0 && data.volume > 1000) {
//       overallSignal = 'Strong Buy';
//     } else if (priceChangePercentage < -1 && liquidity < 0 && data.volume > 1000) {
//       overallSignal = 'Strong Sell';
//     } else {
//       overallSignal = 'Hold';
//     }

//     // Update the signal state
//     setSignal(overallSignal);
//     console.log("Generated Signal:", overallSignal); // Optional: Log the signal to the console
//   };

//   return (
//     <div>
//       <h1>Market Data for KCZ-24 (DEC 24)</h1>
//       {marketData && (
//         <div>
//           <p>Last Change: {marketData.lastChng}</p>
//           <p>Previous Rate: {marketData.prevRate}</p>
//           <p>Volume: {marketData.volume}</p>
//           <p>Signal: {signal}</p>
//           {/* Display other relevant market data as needed */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MarketDataComponent;
// import React, { useState, useEffect, useRef } from 'react';

// const WEBSOCKET_URL = "wss://coffeequotes.coffeewebapi.com/api/GetICEMartketTerminalData";

// const CoffeeTradingComponent = () => {
//   const [marketData, setMarketData] = useState(null);
//   const [signal, setSignal] = useState('');
//   const socketRef = useRef(null);

//   const connectWebSocket = () => {
//     socketRef.current = new WebSocket(WEBSOCKET_URL);

//     socketRef.current.onopen = () => {
//       console.log("WebSocket connection established");
//     };

//     socketRef.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       const coffeeQuotesICEData = data.ReturnLst.CoffeeQuotesICEData;

//       if (Array.isArray(coffeeQuotesICEData)) {
//         const filteredData = coffeeQuotesICEData.filter(item => item.idMarket === 2 && item.marketName === "KCZ-24 (DEC 24)");

//         if (filteredData.length > 0) {
//           setMarketData(filteredData[0]);
//           generateTradingSignal(filteredData[0]);
//         }
//       }
//     };

//     socketRef.current.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     socketRef.current.onclose = () => {
//       console.log("WebSocket connection closed. Attempting to reconnect...");
//       setTimeout(connectWebSocket, 5000);
//     };
//   };

//   useEffect(() => {
//     connectWebSocket();
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.close();
//       }
//     };
//   }, []);

//   const generateTradingSignal = (data) => {
//     // Calculate trading indicators
//     const priceChangePercentage = ((data.lastChng - data.prevRate) / data.prevRate) * 100;
//     const spread = data.asize - data.bsize; // Difference between ask and bid sizes
//     const liquidity = data.bsize - data.asize; // Indicates market liquidity
//     const volumeAnalysis = data.volume > 1000 ? 'High Volume' : 'Low Volume';
//     const priceMomentum = data.lastChng > data.highRate * 0.99 ? 'Bullish Momentum' : 'Bearish Momentum';

//     // Support and resistance levels
//     const supportLevel = data.lowRate;
//     const resistanceLevel = data.highRate;

//     // Open interest trend
//     const openInterestTrend = data.openInterest > 0 ? 'Increasing' : 'Decreasing';
//     const netHighTrend = data.netHigh > 0 ? 'Positive Momentum' : 'Negative Momentum';
//     const netLowTrend = data.netLow < 0 ? 'Selling Pressure' : 'Buying Pressure';

//     // Overall trading signal logic
//     let overallSignal = '';
//     if (priceChangePercentage > 1 && liquidity > 0 && data.volume > 1000) {
//       overallSignal = 'Strong Buy';
//     } else if (priceChangePercentage < -1 && liquidity < 0 && data.volume > 1000) {
//       overallSignal = 'Strong Sell';
//     } else {
//       overallSignal = 'Hold';
//     }

//     // Update the signal state
//     setSignal(overallSignal);
//     console.log("Trading Signal:", overallSignal); // Optional: Log the signal
//     notifyTrader(overallSignal); // Notify trader if a strong signal is generated

//     // Log the calculated values for traders to analyze
//     // console.log("Market Data Analysis:");
//     // console.log(`Price Change Percentage: ${priceChangePercentage.toFixed(2)}%`);
//     // console.log(`Spread: ${spread}`);
//     // console.log(`Liquidity: ${liquidity}`);
//     // console.log(`Volume Analysis: ${volumeAnalysis}`);
//     // console.log(`Price Momentum: ${priceMomentum}`);
//     // console.log(`Support Level: ${supportLevel}`);
//     // console.log(`Resistance Level: ${resistanceLevel}`);
//     // console.log(`Open Interest Trend: ${openInterestTrend}`);
//     // console.log(`Net High Trend: ${netHighTrend}`);
//     // console.log(`Net Low Trend: ${netLowTrend}`);
//   };

//   const notifyTrader = (signal) => {
//     // if (signal === 'Strong Buy') {
//     //   alert("🚀 Strong Buy Signal: Consider purchasing coffee futures!");
//     // } else if (signal === 'Strong Sell') {
//     //   alert("⚠️ Strong Sell Signal: Consider selling coffee futures!");
//     // } else {
//     //   console.log("No strong action needed.");
//     // }
//   };

//   return (
//     <div>
//       <h1>Coffee Commodity Trading Dashboard</h1>
//       {marketData && (
//         <div>
//           <h2>Market Data for KCZ-24 (DEC 24)</h2>
//           <p>Last Change: {marketData.lastChng}</p>
//           <p>Previous Rate: {marketData.prevRate}</p>
//           <p>Volume: {marketData.volume}</p>
//           <p>Trading Signal: {signal}</p>
//           <p>Support Level: {marketData.lowRate}</p>
//           <p>Resistance Level: {marketData.highRate}</p>
//           {/* Additional market data can be displayed here */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CoffeeTradingComponent;

// import React, { useState, useEffect, useRef } from 'react';

// const WEBSOCKET_URL = "wss://coffeequotes.coffeewebapi.com/api/GetICEMartketTerminalData";

// const CoffeeTradingComponent = () => {
//   const [marketData, setMarketData] = useState([]);
//   const [signal, setSignal] = useState('');
//   const [explanation, setExplanation] = useState('');
//   const socketRef = useRef(null);
//   const dataBufferRef = useRef([]); // To store data for 10 minutes
//   const analysisIntervalRef = useRef(null); // To store interval ID for analysis

//   const connectWebSocket = () => {
//     socketRef.current = new WebSocket(WEBSOCKET_URL);

//     socketRef.current.onopen = () => {
//       console.log("WebSocket connection established");
//     };

//     socketRef.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       const coffeeQuotesICEData = data.ReturnLst.CoffeeQuotesICEData;

//       if (Array.isArray(coffeeQuotesICEData)) {
//         const filteredData = coffeeQuotesICEData.filter(item => item.idMarket === 2 && item.marketName === "KCZ-24 (DEC 24)");

//         if (filteredData.length > 0) {
//           const newMarketData = filteredData[0];
//           storeMarketData(newMarketData);
//         }
//       }
//     };

//     socketRef.current.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     socketRef.current.onclose = () => {
//       console.log("WebSocket connection closed. Attempting to reconnect...");
//       setTimeout(connectWebSocket, 5000);
//     };
//   };

//   useEffect(() => {
//     connectWebSocket();

//     // Set an interval for analyzing the data every 10 minutes
//     analysisIntervalRef.current = setInterval(analyzeData, 6000); // 10 minutes in milliseconds

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.close();
//       }
//       clearInterval(analysisIntervalRef.current);
//     };
//   }, []);

//   const storeMarketData = (data) => {
//     // Store the new market data in the buffer
//     dataBufferRef.current.push(data);

//     // Keep only the last 10 minutes of data (600 seconds)
//     if (dataBufferRef.current.length > 600) {
//       dataBufferRef.current.shift(); // Remove the oldest entry
//     }
//   };

//   const analyzeData = () => {
//     if (dataBufferRef.current.length === 0) return;

//     // Perform calculations based on the stored data
//     const lastDataPoint = dataBufferRef.current[dataBufferRef.current.length - 1]; // Last point for the current analysis
//     const priceChangePercentage = ((lastDataPoint.lastChng - lastDataPoint.prevRate) / lastDataPoint.prevRate) * 100;
//     const liquidity = lastDataPoint.bsize - lastDataPoint.asize;

//     let overallSignal = '';
//     let detailedExplanation = '';

//     // Determine trading signal
//     if (priceChangePercentage > 1 && liquidity > 0) {
//       overallSignal = 'Strong Buy';
//       detailedExplanation = "The market is showing strong upward momentum. It's a good time to buy.";
//     } else if (priceChangePercentage < -1 && liquidity < 0) {
//       overallSignal = 'Strong Sell';
//       detailedExplanation = "The market is under selling pressure. Consider selling your position.";
//     } else {
//       overallSignal = 'Hold';
//       detailedExplanation = "The market is stable. It's best to hold your position for now.";
//     }

//     // Update state with the analysis results
//     setSignal(overallSignal);
//     setExplanation(detailedExplanation);
//     setMarketData(dataBufferRef.current);
//   };

//   return (
//     <div>
//       <h1>Coffee Commodity Trading Dashboard</h1>
//       <h2>Market Analysis</h2>
//       <h3>Trading Signal: {signal}</h3>
//       <p>{explanation}</p>
//       {/* Display historical market data or graphs here if needed */}
//     </div>
//   );
// };

// export default CoffeeTradingComponent;




//latest base code



// import React, { useState, useEffect, useRef } from "react";
// import { PacmanLoader } from "react-spinners";

// const WEBSOCKET_URL =
//   "wss://coffeequotes.coffeewebapi.com/api/GetICEMartketTerminalData";
// const API_URL =
//   "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBKwmxvZ6CNV6LubLjo0AaKJDG4YFZ20A"; // Your actual API key

// const CoffeeTradingComponent = () => {
//   const [marketData, setMarketData] = useState([]);
//   const [signal, setSignal] = useState("");
//   const [explanation, setExplanation] = useState("");
//   const [loadingAI, setLoadingAI] = useState(false);
//   const socketRef = useRef(null);
//   const dataBufferRef = useRef([]);
//   const analysisIntervalRef = useRef(null);

//   const connectWebSocket = () => {
//     socketRef.current = new WebSocket(WEBSOCKET_URL);

//     socketRef.current.onopen = () => {
//       console.log("WebSocket connection established");
//     };

//     socketRef.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       const coffeeQuotesICEData = data.ReturnLst.CoffeeQuotesICEData;

//       if (Array.isArray(coffeeQuotesICEData)) {
//         const filteredData = coffeeQuotesICEData.filter(
//           (item) => item.idMarket === 2 && item.marketName === "KCZ-24 (DEC 24)"
//         );

//         if (filteredData.length > 0) {
//           const newMarketData = filteredData[0];
//           storeMarketData(newMarketData);
//         }
//       }
//     };

//     socketRef.current.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     socketRef.current.onclose = () => {
//       console.log("WebSocket connection closed. Attempting to reconnect...");
//       setTimeout(connectWebSocket, 5000);
//     };
//   };

//   useEffect(() => {
//     connectWebSocket();
//     const analyzeData = async () => {
//       if (dataBufferRef.current.length === 0) return;

//       const lastDataPoint =
//         dataBufferRef.current[dataBufferRef.current.length - 1];

//       // Extract relevant market metrics
//       const {
//         lastChng,
//         bid,
//         ask,
//         bsize: bidSize,
//         asize: askSize,
//         volume,
//         highRate,
//         lowRate,
//         prevRate,
//         openRate,
//         openInterest,
//         optionExpiry,
//         firstNoticeDay,
//       } = lastDataPoint;

//       const priceChangePercentage = ((lastChng - prevRate) / prevRate) * 100;
//       const liquidity = bidSize - askSize;
//       const volatility = highRate - lowRate;

//       let overallSignal = "";
//       let detailedExplanation = "";
//       let changedMetrics = [];

//       // Calculate signal based on market metrics
//       if (priceChangePercentage > 1 && liquidity > 0) {
//         overallSignal = "Strong Buy";
//         detailedExplanation =
//           "The market is showing strong upward momentum. It's a good time to buy.";
//         changedMetrics.push("lastChng");
//       } else if (priceChangePercentage < -1 && liquidity < 0) {
//         overallSignal = "Strong Sell";
//         detailedExplanation =
//           "The market is under selling pressure. Consider selling your position.";
//         changedMetrics.push("lastChng");
//       } else {
//         overallSignal = "Hold";
//         detailedExplanation =
//           "The market is stable. It's best to hold your position for now.";
//       }

//       // Analyze additional metrics and adjust signal/explanation
//       // Last Price Impact
//       if (lastChng > highRate) {
//         detailedExplanation +=
//           " The price has broken a recent high, suggesting bullish momentum.";
//         changedMetrics.push("lastChng");
//       } else if (lastChng < lowRate) {
//         detailedExplanation +=
//           " The price has dropped below a recent low, indicating bearish sentiment.";
//         changedMetrics.push("lastChng");
//       }

//       // Bid/Ask Analysis
//       if (bid > ask) {
//         detailedExplanation += " Demand is strong with bids exceeding asks.";
//         changedMetrics.push("bid");
//       } else if (ask < bid) {
//         detailedExplanation += " Supply is strong with asks exceeding bids.";
//         changedMetrics.push("ask");
//       }

//       // Volume Impact
//       if (volume > 1000) {
//         detailedExplanation += " High volume indicates strong interest.";
//         changedMetrics.push("volume");
//       }

//       // Open Price Comparison
//       if (openRate > prevRate) {
//         detailedExplanation +=
//           " The market opened higher than the previous close, indicating bullish sentiment.";
//         changedMetrics.push("openRate");
//       } else if (openRate < prevRate) {
//         detailedExplanation +=
//           " The market opened lower than the previous close, indicating bearish sentiment.";
//         changedMetrics.push("openRate");
//       }

//       // Option Expiry and First Notice Day
//       if (optionExpiry && new Date(optionExpiry) < new Date()) {
//         detailedExplanation +=
//           " The option expiry is approaching, which may increase volatility.";
//         changedMetrics.push("optionExpiry");
//       }

//       if (firstNoticeDay && new Date(firstNoticeDay) < new Date()) {
//         detailedExplanation +=
//           " The first notice day is approaching, possibly causing price swings.";
//         changedMetrics.push("firstNoticeDay");
//       }

//       // Construct dynamic text for Gemini AI
//       let dynamicText = `The current trading signal is "${overallSignal}". \n- **Price Change**: The current price change is ${priceChangePercentage.toFixed(2)}%. \n- **Liquidity**: The liquidity is ${liquidity}. \n- **Volatility**: The volatility is ${volatility}. \n- **Volume**: The trading volume is ${volume}. \n- **Open Price**: The open price is ${openRate}. \n- **Previous Rate**: The previous rate is ${prevRate}.\n`;

//       // Check for all changed metrics and construct dynamic text accordingly
//       changedMetrics.forEach((metric) => {
//         switch (metric) {
//           case "bid":
//             dynamicText += `- **Bid Price**: The current bid price is ${bid}. \n- **Bid Size**: There are currently ${bidSize} bids in the market.\n`;
//             break;
//           case "ask":
//             dynamicText += `- **Ask Price**: The current ask price is ${ask}. \n- **Ask Size**: There are currently ${askSize} asks in the market.\n`;
//             break;
//           case "lastChng":
//             dynamicText += `- **Last Change**: The last change in price is ${lastChng}.\n`;
//             break;
//           case "volume":
//             dynamicText += `- **Volume**: The current trading volume is ${volume}.\n`;
//             break;
//           case "highRate":
//             dynamicText += `- **High Rate**: The highest rate recorded is ${highRate}.\n`;
//             break;
//           case "lowRate":
//             dynamicText += `- **Low Rate**: The lowest rate recorded is ${lowRate}.\n`;
//             break;
//           case "openRate":
//             dynamicText += `- **Open Rate**: The market opened at ${openRate}.\n`;
//             break;
//           default:
//             break;
//         }
//       });

//       setSignal(overallSignal);
//       setExplanation(detailedExplanation);
//       setMarketData(dataBufferRef.current);

//       // Call Gemini AI API with the market analysis
//       await callGeminiAI(dynamicText);
//     };

//     analysisIntervalRef.current = setInterval(analyzeData, 6000); // Analyze every 6 seconds

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.close();
//       }
//       clearInterval(analysisIntervalRef.current);
//     };
//   }, []);

//   const storeMarketData = (data) => {
//     dataBufferRef.current.push(data);
//     if (dataBufferRef.current.length > 600) {
//       dataBufferRef.current.shift();
//     }
//   };

//   const callGeminiAI = async (dynamicText) => {
//     setLoadingAI(true);
//     try {
//       const response = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: dynamicText,
//                 },
//               ],
//             },
//           ],
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch the API");
//       }

//       const data = await response.json();
//       console.log("AI Response:", data);
//     } catch (error) {
//       console.error("Error calling Gemini AI:", error);
//     } finally {
//       setLoadingAI(false);
//     }
//   };

//   return (
//     <div>
//       <h1>Coffee Commodity Trading Dashboard</h1>
//       <h2>Market Analysis</h2>
//       <h3>Trading Signal: {signal}</h3>
//       <p>{explanation}</p>
//       {loadingAI && <PacmanLoader color="#36D7B7" size={25} />}
//       {/* Display historical market data or graphs here if needed */}
//     </div>
//   );
// };

// export default CoffeeTradingComponent;









import React, { useState, useEffect, useRef } from "react";
import { PacmanLoader } from "react-spinners";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register necessary components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WEBSOCKET_URL =
  "wss://coffeequotes.coffeewebapi.com/api/GetICEMartketTerminalData";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBKwmxvZ6CNV6LubLjo0AaKJyDG4YFZ20A"; // Your actual API key

const CoffeeTradingComponent = () => {
  const [marketData, setMarketData] = useState([]);
  const [signal, setSignal] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const socketRef = useRef(null);
  const dataBufferRef = useRef([]);
  const analysisIntervalRef = useRef(null);
  const messageEndRef = useRef(null);
  const [messages, setMessages] = useState([]); 
  const connectWebSocket = () => {
    socketRef.current = new WebSocket(WEBSOCKET_URL);

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const coffeeQuotesICEData = data.ReturnLst.CoffeeQuotesICEData;

      if (Array.isArray(coffeeQuotesICEData)) {
        const filteredData = coffeeQuotesICEData.filter(
          (item) => item.idMarket === 2 && item.marketName === "KCZ-24 (DEC 24)"
        );

        if (filteredData.length > 0) {
          const newMarketData = filteredData[0];
          storeMarketData(newMarketData);
        }
      }
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed. Attempting to reconnect...");
      setTimeout(connectWebSocket, 5000);
    };
  };

  useEffect(() => {
    connectWebSocket();
    const analyzeData = async () => {
      if (dataBufferRef.current.length === 0) return;

      const lastDataPoint =
        dataBufferRef.current[dataBufferRef.current.length - 1];

      // Extract relevant market metrics
      const {
        lastChng,
        bid,
        ask,
        bsize: bidSize,
        asize: askSize,
        volume,
        highRate,
        lowRate,
        prevRate,
        openRate,
        openInterest,
        optionExpiry,
        firstNoticeDay,
      } = lastDataPoint;

      const priceChangePercentage = ((lastChng - prevRate) / prevRate) * 100;
      const liquidity = bidSize - askSize;
      const volatility = highRate - lowRate;

      let overallSignal = "";
      let detailedExplanation = "";
      let changedMetrics = [];

      // Calculate signal based on market metrics
      if (priceChangePercentage > 1 && liquidity > 0) {
        overallSignal = "Strong Buy";
        detailedExplanation =
          "The market is showing strong upward momentum. It's a good time to buy.";
        changedMetrics.push("lastChng");
      } else if (priceChangePercentage < -1 && liquidity < 0) {
        overallSignal = "Strong Sell";
        detailedExplanation =
          "The market is under selling pressure. Consider selling your position.";
        changedMetrics.push("lastChng");
      } else {
        overallSignal = "Hold";
        detailedExplanation =
          "The market is stable. It's best to hold your position for now.";
      }

      // Analyze additional metrics and adjust signal/explanation
      // Last Price Impact
      if (lastChng > highRate) {
        detailedExplanation +=
          " The price has broken a recent high, suggesting bullish momentum.";
        changedMetrics.push("lastChng");
      } else if (lastChng < lowRate) {
        detailedExplanation +=
          " The price has dropped below a recent low, indicating bearish sentiment.";
        changedMetrics.push("lastChng");
      }

      // Bid/Ask Analysis
      if (bid > ask) {
        detailedExplanation += " Demand is strong with bids exceeding asks.";
        changedMetrics.push("bid");
      } else if (ask < bid) {
        detailedExplanation += " Supply is strong with asks exceeding bids.";
        changedMetrics.push("ask");
      }

      // Volume Impact
      if (volume > 1000) {
        detailedExplanation += " High volume indicates strong interest.";
        changedMetrics.push("volume");
      }

      // Open Price Comparison
      if (openRate > prevRate) {
        detailedExplanation +=
          " The market opened higher than the previous close, indicating bullish sentiment.";
        changedMetrics.push("openRate");
      } else if (openRate < prevRate) {
        detailedExplanation +=
          " The market opened lower than the previous close, indicating bearish sentiment.";
        changedMetrics.push("openRate");
      }

      // Option Expiry and First Notice Day
      if (optionExpiry && new Date(optionExpiry) < new Date()) {
        detailedExplanation +=
          " The option expiry is approaching, which may increase volatility.";
        changedMetrics.push("optionExpiry");
      }

      if (firstNoticeDay && new Date(firstNoticeDay) < new Date()) {
        detailedExplanation +=
          " The first notice day is approaching, possibly causing price swings.";
        changedMetrics.push("firstNoticeDay");
      }

      // Construct dynamic text for Gemini AI
      let dynamicText = `The current trading signal is "${overallSignal}". \n- **Price Change**: The current price change is ${priceChangePercentage.toFixed(2)}%. \n- **Liquidity**: The liquidity is ${liquidity}. \n- **Volatility**: The volatility is ${volatility}. \n- **Volume**: The trading volume is ${volume}. \n- **Open Price**: The open price is ${openRate}. \n- **Previous Rate**: The previous rate is ${prevRate}.\n`;

      // Check for all changed metrics and construct dynamic text accordingly
      changedMetrics.forEach((metric) => {
        switch (metric) {
          case "bid":
            dynamicText += `- **Bid Price**: The current bid price is ${bid}. \n- **Bid Size**: There are currently ${bidSize} bids in the market.\n`;
            break;
          case "ask":
            dynamicText += `- **Ask Price**: The current ask price is ${ask}. \n- **Ask Size**: There are currently ${askSize} asks in the market.\n`;
            break;
          case "lastChng":
            dynamicText += `- **Last Change**: The last change in price is ${lastChng}.\n`;
            break;
          case "volume":
            dynamicText += `- **Volume**: The current trading volume is ${volume}.\n`;
            break;
          case "highRate":
            dynamicText += `- **High Rate**: The highest rate recorded is ${highRate}.\n`;
            break;
          case "lowRate":
            dynamicText += `- **Low Rate**: The lowest rate recorded is ${lowRate}.\n`;
            break;
          case "openRate":
            dynamicText += `- **Open Rate**: The market opened at ${openRate}.\n`;
            break;
          default:
            break;
        }
      });

      setSignal(overallSignal);
      setExplanation(detailedExplanation);
      setMarketData(dataBufferRef.current);

      // Call Gemini AI API with the market analysis
      await callGeminiAI(dynamicText);
    };

    analysisIntervalRef.current = setInterval(analyzeData, 6000); // Analyze every 6 seconds

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearInterval(analysisIntervalRef.current);
    };
  }, []);

  const storeMarketData = (data) => {
    dataBufferRef.current.push(data);
    if (dataBufferRef.current.length > 600) {
      dataBufferRef.current.shift();
    }
  };
  const callGeminiAI = async (dynamicText) => {
    setLoadingAI(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: dynamicText,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch the API");
      }

      const data = await response.json();
      const aiText = data.candidates[0].content.parts[0].text;

      const aiSegments = aiText
        .split("```")
        .filter((segment) => segment.trim() !== "");

      const aiMessageObjects = aiSegments.map((segment) => ({
        sender: "ai",
        text: segment.trim(),
        timestamp: new Date().toLocaleString(),
      }));

      setMessages((prevMessages) => [...prevMessages, ...aiMessageObjects]);
    } catch (error) {
      console.error("Error calling Gemini AI:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  const chartData = {
    labels: marketData.map((_, index) => index + 1), // Use index as labels for simplicity
    datasets: [
      {
        label: 'Last Change',
        data: marketData.map((data) => data.lastChng),
        fill: false,
        borderColor: '#2196F3',
      },
      {
        label: 'Bid Price',
        data: marketData.map((data) => data.bid),
        fill: false,
        borderColor: '#4CAF50',
      },
      {
        label: 'Ask Price',
        data: marketData.map((data) => data.ask),
        fill: false,
        borderColor: '#FF5733',
      },
    ],
  };
  const parseMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Helper function to format timestamps
  const formatTimestamp = (timestamp) => {
    const timeAgo = new Date() - new Date(timestamp);
    if (timeAgo < 60000) return "Just now";
    const minutes = Math.floor(timeAgo / 60000);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(timeAgo / 3600000);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(timeAgo / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f8f9fa" }}>
      <h1 style={{ color: "#4CAF50", textAlign: "center" }}>Coffee Commodity Trading Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "20px" }}>
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Trading Signal Section */}
      <div style={{
        padding: "20px", border: "1px solid #ccc", borderRadius: "10px",
        backgroundColor: "#ffffff", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)", transition: "0.3s"
      }}>
        <h2 style={{ marginBottom: "10px", color: "#FF5722" }}>Trading Signal</h2>
        <h3 style={{ color: "#2196F3", fontWeight: "bold" }}>{signal}</h3>
        <p style={{ fontSize: "1.1em", lineHeight: "1.6" }}>{explanation}</p>
        {loadingAI && <PacmanLoader color="#36D7B7" size={30} />}
      </div>

      {/* Market Overview Section */}
      <div style={{
        padding: "20px", border: "1px solid #ccc", borderRadius: "10px",
        backgroundColor: "#ffffff", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)", transition: "0.3s"
      }}>
        <h2 style={{ marginBottom: "10px", color: "#FF5722" }}>Market Overview</h2>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1em" }}>
          <p style={{ color: "#4CAF50" }}>Bid: {marketData[marketData.length - 1]?.bid}</p>
          <p style={{ color: "#F44336" }}>Ask: {marketData[marketData.length - 1]?.ask}</p>
        </div>
        <p style={{ color: "#FFC107" }}>Last Change: {marketData[marketData.length - 1]?.lastChng}</p>
        <p style={{ color: "#3F51B5" }}>Volume: {marketData[marketData.length - 1]?.volume}</p>
      </div>

      {/* Historical Data Section */}
      <div style={{
        padding: "20px", border: "1px solid #ccc", borderRadius: "10px",
        backgroundColor: "#ffffff", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)", transition: "0.3s"
      }}>
        <h2 style={{ marginBottom: "10px", color: "#FF5722" }}>Historical Data</h2>
        <div style={{ position: "relative", height: "300px", margin: "20px 0" }}>
          <Line data={chartData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
      </div>
  <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "#ffffff", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", marginTop: "20px" }}>
  <h2 style={{ marginBottom: "10px", fontSize: "1.5em", textAlign: "center", color: "#2196F3" }}>Additional Analysis by Gemini AI</h2>
  <div className="messages-container" style={{ maxHeight: "400px", overflowY: "auto", padding: "10px" }}>
    {messages.map((msg, index) => (
      <div key={index} style={{ marginBottom: "20px", padding: "15px", border: "2px solid #ddd", borderRadius: "8px", backgroundColor: "#f0f4f7", transition: "transform 0.3s", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <div style={{ fontWeight: "bold", color: msg.sender === "ai" ? "#4CAF50" : "#2196F3", fontSize: "1.2em" }}>
          {msg.sender === "ai" ? "Gemini AI" : "User"}
        </div>
        <div 
          dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} 
          style={{ marginTop: "10px", lineHeight: "1.8", fontSize: "1.1em", backgroundColor: "#ffffff", padding: "10px", borderRadius: "5px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "0.9em", color: "#888" }}>
          <span>{msg.timestamp}</span>
          <span style={{ color: "#2196F3", cursor: "pointer", textDecoration: "underline" }}>Learn More</span>
        </div>
      </div>
    ))}
    {loadingAI && (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "20px" }}>
        <PacmanLoader color="#36D7B7" size={25} />
        <div style={{ marginLeft: "15px", fontSize: "1.2em", color: "#4CAF50" }}>Analyzing the latest data...</div>
      </div>
    )}
    <div ref={messageEndRef}></div>
  </div>
</div>


    </div>
  );
};

export default CoffeeTradingComponent;
