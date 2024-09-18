import React, { useEffect, useState } from 'react';
import Mine from './components/home/mine';

function App() {

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready(); 
    tg.MainButton.setText('Start Mining').show();
  }, []);



  return (
    <div className="App">
      <Mine/>
    </div>
    
  );
}

export default App;
