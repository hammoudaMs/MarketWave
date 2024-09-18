import React, { useEffect, useState } from 'react';
import Mine from './components/home/mine';

function App() {
  const [taps, setTaps] = useState(0);

  useEffect(() => {
    // Initialize Telegram WebApp SDK
    const tg = window.Telegram.WebApp;
    tg.ready();  // Make Telegram app interface ready

    // Optional: Set a custom background color
    tg.MainButton.setText('Start Mining').show();
  }, []);



  return (
    <div className="App">
      <Mine/>
    </div>
    
  );
}

export default App;
