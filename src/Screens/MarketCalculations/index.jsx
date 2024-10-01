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
import './Styles.scss'

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
        marketName,
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
      const enhancedPrompt = `
      Provide a detailed analysis of the current coffee market conditions. 

      Data Summary:
      - Trading signal: ${signal}
      - Price Change: ${priceChangePercentage.toFixed(2)}%
      - Liquidity: ${liquidity}
      - Volatility: ${volatility}
      - Bid Price: ${bid}
      - Ask Price: ${ask}
      - Volume: ${volume}
      - Open Price: ${openRate}
      - Previous Rate: ${prevRate}

      Questions:
      1. What is the current market trend based on the latest data?
      2. Is there any potential risk or unexpected volatility in the upcoming period?
      3. What factors are most likely influencing the current buy/sell signals?
      4. How should a trader adjust their position considering this data?
    `;

      //     const enhancedPrompt = `
      //   Provide a comprehensive analysis of the current coffee commodity market, with a focus on futures contracts and real-time trading data and real world news which can influence the coffee market.

      //   Market Data Overview:
      //   - Trading Signal: ${signal}
      //   - Price Change: ${priceChangePercentage.toFixed(2)}%
      //   - Liquidity Level: ${liquidity}
      //   - Volatility Index: ${volatility}
      //   - Bid Price: ${bid}
      //   - Ask Price: ${ask}
      //   - Trade Volume: ${volume}
      //   - Open Price: ${openRate}
      //   - Previous Closing Rate: ${prevRate}

      //   Market-Specific Insights:
      //   - Coffee Futures Contract: ${marketName} (Expiration: ${optionExpiry})
      //   // - Global Supply Status: ${supplyStatus}
      //   // - Coffee Harvest Outlook: ${harvestForecast}
      //   // - Weather Impacts: ${weatherConditions}
      //   // - Economic Factors: ${economicFactors}

      //   Strategic Questions for Traders:
      //   1. Based on the current data, what is the prevailing market sentiment for coffee futures?
      //   2. Are there any short-term risks or opportunities due to changes in market conditions (e.g., sudden shifts in demand/supply)?
      //   3. What external factors (e.g., geopolitical, climate, supply chain) might be influencing the price movements and trading signals for coffee?
      //   4. Should traders consider a more aggressive or conservative position given current volatility and liquidity levels?
      //   5. How do seasonal patterns and harvest forecasts impact near-term trading decisions for coffee contracts?
      //   6. Given the global supply-demand balance, how should traders anticipate potential price shocks or corrections?

      //   Recommendation:
      //   Provide tailored advice for traders on whether to maintain, adjust, or exit their positions based on the above data and factors, considering both short-term and long-term market outlooks.
      // `;

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
console.log(messages)
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
  const formatMessageText = (text) => {
    const sections = text.split("\n\n"); // Split sections by double newlines
    return sections.map((section, index) => {
      // Match numbered headings and create <h3> elements
      const headingMatch = section.match(/^\*(.*?)\*\s*$/);
      if (headingMatch) {
        return (
          <div key={index}>
            <h3>{headingMatch[1]}</h3>
            <ul>
              {section
                .replace(/^\*\s*.*?$/gm, "") // Remove headings from the section
                .split("\n*") // Split bullet points
                .filter(point => point.trim() !== "") // Remove empty points
                .map((point, pointIndex) => (
                  <li key={pointIndex}>{point.replace(/^\s*\*\s*/, "")}</li>
                ))}
            </ul>
          </div>
        );
      }
      return null; // Ignore other sections for simplicity
    });
  };
  
  return (
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
                Last Change: <span>{marketData[marketData.length - 1]?.lastChng}</span>
              </p>
              <p className="volume">
                Volume: <span>{marketData[marketData.length - 1]?.volume}</span>
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
                        color: '#333',
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: '#333',
                      },
                      grid: {
                        color: '#e0e0e0',
                      },
                    },
                    y: {
                      ticks: {
                        color: '#333',
                      },
                      grid: {
                        color: '#e0e0e0',
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
        <h2>Additional Analysis by Gemini AI</h2>
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <div className={`sender ${msg.sender}`}>
                {msg.sender === "ai" ? "Gemini AI" : "User"}
              </div>
              <div
                className="text"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
              />
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
  );
};

export default CoffeeTradingComponent;
