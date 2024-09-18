import React, { useState, useEffect } from 'react';
import './mine.css'; // Ensure this file contains the custom styles

const Mine = () => {
  const [taps, setTaps] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [isMining, setIsMining] = useState(false);
  const [counter, setCounter] = useState(10); // Start with 10 for demo purposes
  const [isRecharging, setIsRecharging] = useState(false);

    useEffect(() => {
      let rechargeInterval;
      if (counter < 10 || isRecharging ) {
        setIsRecharging(true);
        rechargeInterval = setInterval(() => {
          setCounter((prevCounter) => {
            if (prevCounter < 10 && isRecharging ) {
              return prevCounter + 1;
            } else {
              setIsRecharging(false); 
              clearInterval(rechargeInterval); 
              return prevCounter;
            }
          });
        }, 3500);
      }
      return () => clearInterval(rechargeInterval);
    }, [counter, isRecharging]);

  const startMiningGame = () => {
    setTaps(0);
    setRewards(0);
    setIsMining(true);
  };

  const handleTap = () => {
    if (isMining && counter > 0) {
      setTaps(taps + 1);
      setRewards((taps + 1) * 100); 
      setCounter(counter - 1); // Decrease the counter by 1 with each tap
    }
  };

  // const endMiningGame = () => {
  //   setIsMining(false);
  //   alert(`Mining session ended! You collected ${rewards} points from ${taps} taps.`);
  // };

  return (
    <div className="hamster-stats-container">
      <div className="top-stats">
        <div className="stat-item">
          <p>Earn per tap</p>
          <span>+10</span>
        </div>
        <div className="stat-item">
          <p>Coins to level up</p>
          <span>10M</span>
        </div>
        <div className="stat-item">
          <p>Profit per hour</p>
          <span>+39.12K</span>
        </div>
      </div>

      <div className="coin-counter">
        <span className="coin-icon">💰</span>
        <h1>{rewards}</h1>
      </div>

      <div className="hamster-display">
        <div
          className={`tap-button ${isMining ? 'active' : ''}`}
          onClick={handleTap}
        >
          {isMining ? 'Tap Here!' : 'Start Mining'}
        </div>
        <div className="level-info">
          <p>Epic</p>
          <p>Level 6/10</p>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress" style={{ width: '80%' }}></div> {/* Adjust width dynamically */}
      </div>

      <div className="energy-boost">
        <p>{counter} / {10}</p>
        <button className="boost-button">Boost 🚀</button>
      </div>

      {!isMining && <button onClick={startMiningGame} className="start-button">Start Mining</button>}
    </div>
  );
};

export default Mine;
