import React, { useEffect, useState } from 'react';

function App() {
  const [taps, setTaps] = useState(0);

  useEffect(() => {
    // Initialize Telegram WebApp SDK
    const tg = window.Telegram.WebApp;
    tg.ready();  // Make Telegram app interface ready

    // Optional: Set a custom background color
    tg.MainButton.setText('Start Mining').show();
  }, []);

  const handleTap = () => {
    setTaps(taps + 1);
  };

  return (
    <div className="App">
      <h1>Tap to Mine</h1>
      <p>Your current taps: {taps}</p>
      <button onClick={handleTap}>Tap to Mine!</button>
    </div>
  );
}

export default App;
