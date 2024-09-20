import React, { useEffect, useState } from 'react';

const MarketCalculations = ({ marketData }) => {
  const [calculations, setCalculations] = useState({});
  
  useEffect(() => {
    if (marketData) {
      calculateMetrics(marketData);
    }
  }, [marketData]);

  const calculateRSI = (prices, period = 14) => {
    const gains = [];
    const losses = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains.push(change);
        losses.push(0);
      } else {
        losses.push(-change);
        gains.push(0);
      }
    }

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    const rs = avgLoss === 0 ? 0 : avgGain / avgLoss; // Avoid division by zero
    return 100 - (100 / (1 + rs));
  };

  const calculateSMA = (data, period) => {
    let sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  };

  const calculateMetrics = (data) => {
    const {
      Last = 0,
      Pre_Close = 1,
      Volume = 0,
      Bid = 0,
      Ask = 0,
      Bid_Size = 0,
      Ask_Size = 0,
      High = 0,
      Low = 0,
      Net_High = 0,
      Net_Low = 0,
      Open = 0,
      Open_Int = 0,
    } = data;

    const lastPrice = parseFloat(Last);
    const preClose = parseFloat(Pre_Close);
    const volume = parseFloat(Volume);
    const bidPrice = parseFloat(Bid);
    const askPrice = parseFloat(Ask);
    const bidSize = parseFloat(Bid_Size);
    const askSize = parseFloat(Ask_Size);
    const highPrice = parseFloat(High);
    const lowPrice = parseFloat(Low);
    const netHigh = parseFloat(Net_High);
    const netLow = parseFloat(Net_Low);
    const openInterest = parseFloat(Open_Int);

    if (isNaN(lastPrice) || isNaN(preClose)) {
      return;
    }

    const priceChangePercentage = ((marketData.lastChng - marketData.prevRate) / marketData.prevRate) * 100;
    const spread = marketData.asize - marketData.bSize;
    const liquidity = marketData.bSize - marketData.asize;
    const volumeAnalysis = marketData.volume > 1000 ? 'High Volume' : 'Low Volume';
    const priceMomentum = marketData.lastChng > marketData.highRate * 0.99 ? 'Bullish Momentum' : 'Bearish Momentum';
    const supportLevel = marketData.lowRate;
    const resistanceLevel = marketData.highRate;
    const openInterestTrend = marketData.openInterest > 0 ? 'Increasing' : 'Decreasing';
    const netHighTrend = marketData.netHigh > 0 ? 'Positive Momentum' : 'Negative Momentum';
    const netLowTrend = marketData.netLow < 0 ? 'Selling Pressure' : 'Buying Pressure';

    let overallSignal = '';
    if (priceChangePercentage > 1 && liquidity > 0 && volume > 1000) {
      overallSignal = 'Strong Buy';
    } else if (priceChangePercentage < -1 && liquidity < 0 && volume > 1000) {
      overallSignal = 'Strong Sell';
    } else {
      overallSignal = 'Hold';
    }

    // Calculate additional metrics
    const prices = []; // Populate this with price data for RSI/SMA calculation
    const rsiValue = calculateRSI(prices);
    const sma20 = calculateSMA(prices, 20);

    setCalculations({
      lastPrice,
      priceChangePercentage,
      spread,
      liquidity,
      volumeAnalysis,
      priceMomentum,
      supportLevel,
      resistanceLevel,
      openInterestTrend,
      netHighTrend,
      netLowTrend,
      overallSignal,
      rsiValue,
      sma20: sma20.length > 0 ? sma20[sma20.length - 1] : null, // Get the latest SMA value
    });
  };

  return (
    <div className="market-calculations">
      <h3>Market Calculations</h3>
      <p><strong>Last Price:</strong> {calculations.lastPrice}</p>
      <p><strong>Price Change Percentage:</strong> {calculations.priceChangePercentage?.toFixed(2)}%</p>
      <p><strong>Bid-Ask Spread:</strong> {calculations.spread?.toFixed(2)}</p>
      <p><strong>Liquidity Indicator:</strong> {calculations.liquidity > 0 ? 'Demand > Supply' : 'Supply > Demand'}</p>
      <p><strong>Volume Analysis:</strong> {calculations.volumeAnalysis}</p>
      <p><strong>Price Momentum:</strong> {calculations.priceMomentum}</p>
      <p><strong>Support Level:</strong> {calculations.supportLevel}</p>
      <p><strong>Resistance Level:</strong> {calculations.resistanceLevel}</p>
      <p><strong>Open Interest Trend:</strong> {calculations.openInterestTrend}</p>
      <p><strong>Net High Trend:</strong> {calculations.netHighTrend}</p>
      <p><strong>Net Low Trend:</strong> {calculations.netLowTrend}</p>
      <p style={{ color: calculations.overallSignal === 'Strong Buy' ? 'green' : calculations.overallSignal === 'Strong Sell' ? 'red' : 'orange' }}>
        <strong>Overall Market Signal:</strong> {calculations.overallSignal}
      </p>
      <p><strong>RSI:</strong> {calculations.rsiValue?.toFixed(2)}</p>
      <p><strong>20-period SMA:</strong> {calculations.sma20 ? calculations.sma20.toFixed(2) : 'N/A'}</p>
    </div>
  );
};

export default MarketCalculations;

  