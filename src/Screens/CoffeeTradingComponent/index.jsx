import React, { useState, useEffect, useRef } from "react";
import { PacmanLoader } from "react-spinners";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./Styles.scss";

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

  const [marketStatus, setMarketStatus] = useState("Closed");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState("");
  const [countdown, setCountdown] = useState(0); // Countdown in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      updateMarketStatus(now);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateMarketStatus = (now) => {
    const day = now.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Check if today is Saturday (6) or Sunday (0)
    if (day === 0 || day === 6) {
      setMarketStatus("Closed");
      setTimeRemaining(`Current time: ${now.toLocaleTimeString()}`);
      setCountdown(0);
      return;
    }

    // Calculate the time in minutes since 00:00
    const currentMinutes = hours * 60 + minutes;
    const marketOpenTime = 13 * 60 + 30; // 1:30 PM
    const marketCloseTime = 22 * 60 + 30; // 10:30 PM

    if (currentMinutes >= marketOpenTime && currentMinutes < marketCloseTime) {
      setMarketStatus("Market is Open To Trade");
      const remainingMinutes = marketCloseTime - currentMinutes;
      const remainingHours = Math.floor(remainingMinutes / 60);
      const remainingMinutesDisplay = remainingMinutes % 60;
      setTimeRemaining(
        `Closing in ${remainingHours}h ${remainingMinutesDisplay}m`
      );
      // Calculate countdown in seconds
      setCountdown(remainingMinutes * 60);
    } else {
      setMarketStatus("Closed");
      const nextOpenTime = new Date(now);
      if (currentMinutes >= marketCloseTime) {
        nextOpenTime.setDate(now.getDate() + 1); // Next day
        nextOpenTime.setHours(13, 30, 0); // Set to 1:30 PM
      } else {
        nextOpenTime.setHours(13, 30, 0); // Set to 1:30 PM today
      }
      const timeUntilOpen = Math.round((nextOpenTime - now) / 1000); // in seconds
      const hoursUntilOpen = Math.floor(timeUntilOpen / 3600);
      const minutesUntilOpen = Math.floor((timeUntilOpen % 3600) / 60);
      setTimeRemaining(`Opening in ${hoursUntilOpen}h ${minutesUntilOpen}m`);
      setCountdown(0);
    }
  };

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [countdown]);

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (countdown <= 3600) {
      return "red"; // Less than 1 hour
    } else if (countdown <= 10800) {
      return "yellow"; // Between 1 and 3 hours
    } else {
      return "green"; // More than 3 hours
    }
  };

  // Format countdown time to display
  const formatCountdown = () => {
    const hours = Math.floor(countdown / 3600);
    const minutes = Math.floor((countdown % 3600) / 60);
    const seconds = countdown % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

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
        // marketName,
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
        // openInterest,
        optionExpiry,
        firstNoticeDay,
      } = lastDataPoint;

      const priceChangePercentage = ((lastChng - prevRate) / prevRate) * 100;
      const liquidity = bidSize - askSize;
      const priceFluctuation = highRate - lowRate;

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
          " The option expiry is approaching, which may increase price fluctuation.";
        changedMetrics.push("optionExpiry");
      }

      if (firstNoticeDay && new Date(firstNoticeDay) < new Date()) {
        detailedExplanation +=
          " The first notice day is approaching, possibly causing price swings.";
        changedMetrics.push("firstNoticeDay");
      }

      const enhancedPrompt = `
      Provide an in-depth analysis of the current coffee commodity market conditions, focusing on real-time data and key factors influencing the market avoid buzz words.
   
      Data Summary:
      - Trading Signal: ${signal}
      - Price Change: ${priceChangePercentage.toFixed(2)}%
      - Liquidity: ${liquidity}
      - price fluctuation: ${priceFluctuation}
      - Bid Price: ${bid}
      - Ask Price: ${ask}
      - Volume: ${volume}
      - Open Price: ${openRate}
      - Previous Rate: ${prevRate}
   
      Key Aspects:
      - Current Contract Status: Highlight ongoing futures contracts (buy/sell) and their performance.
      - Coffee Buying/Selling Trends: Are there any dominant trends in the market for purchasing or selling coffee contracts?
      - Inventory and Supply Chain Impact: Is current market movement driven by supply chain constraints, harvest outlook, or inventory fluctuations please go through the web and give us a prominent response related to coffee commodity inventory and supply chain Impact as of today news surf the web?
      - Coffee-Specific Economic Factors: How are economic indicators like weather conditions, global demand, or trade policies affecting coffee prices?
   
      Questions:
      1. Based on the provided data, what is the overall trend for coffee commodity contracts (long/short positions)?
      2. Are there any immediate risks of unexpected price fluctuations or price fluctuation based on external factors like weather or supply shortages?
      3. Which major factors (e.g., harvest forecasts, supply issues, currency exchange rates) are driving the buy/sell signals in the coffee market?
      4. Considering this data, should traders adjust their current positions (buy/sell/hold) in coffee futures, and what are the recommended strategies for maximizing profits or minimizing risks?
   
      Please provide the analysis in a clear, easy-to-understand format suitable for both seasoned traders and those new to coffee commodity trading avoid buzz words.
   `;

      setSignal(overallSignal);
      setExplanation(detailedExplanation);
      setMarketData(dataBufferRef.current);

      // Call Gemini AI API with the market analysis
      await callGeminiAI(enhancedPrompt);
    };

    analysisIntervalRef.current = setInterval(analyzeData, 60000); // Analyze every 6 seconds

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

  const callGeminiAI = async (enhancedPrompt) => {
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
                  text: enhancedPrompt,
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

      // Parse AI Response
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
        label: "Last Change",
        data: marketData.map((data) => data.lastChng),
        fill: false,
        borderColor: "#2196F3",
      },
      {
        label: "Bid Price",
        data: marketData.map((data) => data.bid),
        fill: false,
        borderColor: "#4CAF50",
      },
      {
        label: "Ask Price",
        data: marketData.map((data) => data.ask),
        fill: false,
        borderColor: "#FF5733",
      },
    ],
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div>
      <div className="market-timing-card">
        <h2>Market Timings</h2>
        <div className="status-cards">
          <div className="status-card">
            <h3>{marketStatus}</h3>
            {marketStatus === "Market is Open To Trade" && (
              <p style={{ color: getTimerColor() }}>
                Closing in {formatCountdown()}
              </p>
            )}
          </div>
          <div className="status-card">
            <h3>Current Time:</h3>
            <p>{currentTime.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
      <div className="container">
        <h1>Coffee Commodity Trading Dashboard</h1>
        <div className="grid">
          <div className="card">
            <h1>Coffee Trading Dashboard</h1>
            <div className="sub-grid">
              <div className="signal">
                <h2>Trading Signal</h2>
                <h3 style={{ color: "#f50057" }}>{signal}</h3>
                <p>{explanation}</p>
                {loadingAI && <PacmanLoader color="#36D7B7" size={25} />}
              </div>
              <div className="overview">
                <h2>Market Overview</h2>
                <p className="bid">
                  Bid: <span>{marketData[marketData.length - 1]?.bid}</span>
                </p>
                <p className="ask">
                  Ask: <span>{marketData[marketData.length - 1]?.ask}</span>
                </p>
                <p className="last-chng">
                  Last Change:{" "}
                  <span>{marketData[marketData.length - 1]?.lastChng}</span>
                </p>
                <p className="volume">
                  Volume:{" "}
                  <span>{marketData[marketData.length - 1]?.volume}</span>
                </p>
              </div>
            </div>
            <div className="historical-data">
              <h2>Historical Data</h2>
              <div className="chart-container">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        labels: {
                          color: "#333",
                        },
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          color: "#333",
                        },
                        grid: {
                          color: "#e0e0e0",
                        },
                      },
                      y: {
                        ticks: {
                          color: "#333",
                        },
                        grid: {
                          color: "#e0e0e0",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="additional-analysis">
          <h2>Advanced Analysis by AI</h2>
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className={`sender ${msg.sender}`}>
                  {msg.sender === "ai" ? "AI" : "User"}
                </div>
                <div className="text">
                  {msg.text
                    .replace(/\*\*/g, "", "###")
                    .split("\n\n")
                    .map((paragraph, i) => (
                      <p key={i} className="message-paragraph">
                        {paragraph}
                      </p>
                    ))}
                </div>
                <div className="timestamp">
                  <span>{msg.timestamp}</span>
                  <span className="learn-more">Learn More</span>
                </div>
              </div>
            ))}
            {loadingAI && (
              <div className="loader">
                <PacmanLoader color="#36D7B7" size={25} />
                <div className="loader-text">Analyzing the latest data...</div>
              </div>
            )}
            <div ref={messageEndRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeTradingComponent;
