import React, { useState, useEffect, useRef, useCallback } from "react";
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
import AIAnalysisComponent from "../Components/AiAnalysis";

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

  const connectWebSocket = useCallback(() => {
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
  }, []);

  const storeMarketData = (data) => {
    dataBufferRef.current.push(data);
    if (dataBufferRef.current.length > 600) {
      dataBufferRef.current.shift();
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
            <p>{timeRemaining}</p>
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
        <div>
          <AIAnalysisComponent
            connectWebSocket={connectWebSocket}
            dataBufferRef={dataBufferRef}
            signal={signal}
            setSignal={setSignal}
            setExplanation={setExplanation}
            setMarketData={setMarketData}
            analysisIntervalRef={analysisIntervalRef}
            socketRef={socketRef}
            setLoadingAI={setLoadingAI}
            setMessages={setMessages}
            messageEnd={messageEndRef}
            messages={messages}
            lastChng={marketData[marketData.length - 1]?.lastChng}
          />
        </div>
      </div>
    </div>
  );
};

export default CoffeeTradingComponent;
