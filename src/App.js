import logo from './logo.svg';
import './App.css';
import GamePage from './pages/GamePage';
import gstate from './game/State';
import { useState } from 'react';

function App() {

  const [page, setPage] = useState(gstate.page);

  return (
    <div className="App">
      <GamePage page={page} setPage={setPage}></GamePage>
    </div>
  );
}

export default App;
