import React, { useEffect, useState } from "react";
import "./Styles.scss";
import { PacmanLoader } from "react-spinners";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber"; // Import InputNumber for increment/decrement
import { Card } from "primereact/card";
import { Button } from "primereact/button";

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBKwmxvZ6CNV6LubLjo0AaKJyDG4YFZ20A";

const AIAnalysisComponent = ({
  connectWebSocket,
  dataBufferRef,
  signal,
  setSignal,
  setExplanation,
  setMarketData,
  analysisIntervalRef,
  socketRef,
  setLoadingAI,
  setMessages,
  messageEnd,
  messages,
  loadingAI,
  lastChng,
}) => {
  const [mode, setMode] = useState("Auto");

  const [positiveThreshold, setPositiveThreshold] = useState(0);
  const [negativeThreshold, setNegativeThreshold] = useState(0);
  const [timeframe, setTimeframe] = useState("5 min");

  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState(0); // Countdown state
  const [thresholdMet, setThresholdMet] = useState(null); // Tracks threshold status
  const [currentLastChng, setCurrentLastChng] = useState(lastChng);
  const [initialLastChng, setInitialLastChng] = useState(null);
  const [positiveTargetPrice, setPositiveTargetPrice] = useState(null);
  const [negativeTargetPrice, setNegativeTargetPrice] = useState(null);

  const modes = [
    { label: "Auto", value: "Auto" },
    { label: "Manual", value: "Manual" },
  ];

  const timeframes = [
    { label: "5 min", value: "5 min" },
    { label: "10 min", value: "10 min" },
    { label: "20 min", value: "20 min" },
  ];

  // const handleConfirm = () => {
  //   const observationTime = parseInt(timeframe) * 60 * 1000; // Convert timeframe to milliseconds
  //   setCountdown(observationTime / 1000); // Set countdown in seconds
  //   setIsLocked(true); // Lock inputs after confirm
  //   if (dataBufferRef.current.length > 0) {
  //     const firstLastChngValue =
  //       dataBufferRef.current[dataBufferRef.current.length - 1].lastChng;
  //     setInitialLastChng(firstLastChngValue); // Store first lastChng
  //   }
  // };

  const handleConfirm = () => {
    const observationTime = parseInt(timeframe) * 60 * 1000; // Convert timeframe to milliseconds
    setCountdown(observationTime / 1000); // Set countdown in seconds
    setIsLocked(true); // Lock inputs after confirm

    if (dataBufferRef.current.length > 0) {
      const firstLastChngValue =
        dataBufferRef.current[dataBufferRef.current.length - 1].lastChng;
      setInitialLastChng(firstLastChngValue); // Store first lastChng

      // Calculate the target prices
      const positiveTarget = firstLastChngValue * (1 + positiveThreshold / 100); // Positive target price
      const negativeTarget = firstLastChngValue * (1 - negativeThreshold / 100); // Negative target price

      setPositiveTargetPrice(positiveTarget); // Set the positive target price
      setNegativeTargetPrice(negativeTarget); // Set the negative target price
    }
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
      if (lastChng > highRate) {
        detailedExplanation +=
          " The price has broken a recent high, suggesting bullish momentum.";
        changedMetrics.push("lastChng");
      } else if (lastChng < lowRate) {
        detailedExplanation +=
          " The price has dropped below a recent low, indicating bearish sentiment.";
        changedMetrics.push("lastChng");
      }

      if (bid > ask) {
        detailedExplanation += " Demand is strong with bids exceeding asks.";
        changedMetrics.push("bid");
      } else if (ask < bid) {
        detailedExplanation += " Supply is strong with asks exceeding bids.";
        changedMetrics.push("ask");
      }

      if (volume > 1000) {
        detailedExplanation += " High volume indicates strong interest.";
        changedMetrics.push("volume");
      }

      if (openRate > prevRate) {
        detailedExplanation +=
          " The market opened higher than the previous close, indicating bullish sentiment.";
        changedMetrics.push("openRate");
      } else if (openRate < prevRate) {
        detailedExplanation +=
          " The market opened lower than the previous close, indicating bearish sentiment.";
        changedMetrics.push("openRate");
      }

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
          - Price Fluctuation: ${priceFluctuation}
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

    analysisIntervalRef.current = setInterval(analyzeData, 60000); // Analyze every 60 seconds

    return () => {
      const currentSocket = socketRef.current; // Copy ref to a variable
      if (currentSocket) {
        currentSocket.close(); // Close the socket connection
      }
      clearInterval(analysisIntervalRef.current); // Clear interval
    };
    
  }, [
    connectWebSocket,
    signal,
    dataBufferRef,
    analysisIntervalRef,
    socketRef,
    setSignal,
    setExplanation,
    setMarketData,
  ]);

  useEffect(() => {
    if (!isLocked || countdown <= 0 || !initialLastChng) return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1); // Decrease countdown

      if (countdown <= 1) {
        setIsLocked(false); // Unlock after timeframe ends
      }

      const positiveTarget = initialLastChng * (1 + positiveThreshold / 100); // Positive threshold
      const negativeTarget = initialLastChng * (1 - negativeThreshold / 100); // Negative threshold

      const latestDataPoint =
        dataBufferRef.current[dataBufferRef.current.length - 1];
      const currentLastChng = latestDataPoint?.lastChng ?? null;
      setCurrentLastChng(currentLastChng); // Update current lastChng

      if (currentLastChng >= positiveTarget) {
        setThresholdMet("Positive threshold met!");
      } else if (currentLastChng <= negativeTarget) {
        setThresholdMet("Negative threshold met!");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isLocked,
    countdown,
    positiveThreshold,
    negativeThreshold,
    initialLastChng,
    dataBufferRef,
  ]);

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

  useEffect(() => {
    if (messageEnd.current) {
      messageEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messageEnd]);

  return (
    <div className="additional-analysis">
      <h2>Advanced Analysis by AI</h2>
      <div className="dropdown-container">
        <label htmlFor="mode">Select Mode:</label>
        <Dropdown
          id="mode"
          value={mode}
          options={modes}
          onChange={(e) => setMode(e.value)}
          placeholder="Select Mode"
          className="mode-dropdown"
        />
      </div>

      {/* Conditional Card for Manual Mode */}
      {mode === "Manual" && (
        <Card className="manual-card">
          <h3>Manual Analysis Settings</h3>

          <div className="threshold-section">
            <span>Positive Threshold: </span>
            <InputNumber
              value={positiveThreshold}
              onChange={(e) => setPositiveThreshold(e.value)}
              disabled={isLocked}
              suffix="%"
            />
          </div>
          <div className="threshold-section">
            <span>Negative Threshold: </span>
            <InputNumber
              value={negativeThreshold}
              onChange={(e) => setNegativeThreshold(e.value)}
              disabled={isLocked}
              suffix="%"
            />
            <div className="input-group">
              <label htmlFor="timeframe">Select Timeframe:</label>
              <Dropdown
                id="timeframe"
                value={timeframe}
                options={timeframes}
                onChange={(e) => setTimeframe(e.value)}
                placeholder="Select Timeframe"
                className="timeframe-dropdown"
              />
            </div>
          </div>
          <Button
            label="Confirm"
            onClick={handleConfirm}
            className="confirm-button"
          />
        </Card>
      )}
      {isLocked && (
        <div className="countdown-section">
          <Card title="Manual Mode Active" className="manual-active-card">
            <h3>Manual Mode Active</h3>
            <p>
              Countdown: <span>{countdown}</span> seconds
            </p>
            <p>
              Initial Last Change: <span>{initialLastChng}</span>
            </p>
            <p>
              Current Last Change: <span>{currentLastChng}</span>
            </p>
            <p>
              Threshold Status: <span>{thresholdMet || "Monitoring..."}</span>
            </p>
            <p>
              Positive Target Price:{" "}
              <span>
                {positiveTargetPrice !== null
                  ? positiveTargetPrice.toFixed(2)
                  : "N/A"}
              </span>
            </p>
            <p>
              Negative Target Price:{" "}
              <span>
                {negativeTargetPrice !== null
                  ? negativeTargetPrice.toFixed(2)
                  : "N/A"}
              </span>
            </p>
            <p className="learn-more">Learn More</p>
          </Card>
        </div>
      )}

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
        <div ref={messageEnd}></div>
      </div>
    </div>
  );
};

export default AIAnalysisComponent;
