import React, { useEffect, useMemo } from "react";
import SceneComponent from "../components/SceneComponent";
import "../App.css";
import { Game } from "../game/Game";
import { setScene } from "../game/Global";
import globalstate from "../game/State";
import MenuComponent from "../components/MenuComponent";
import { Bus, EVT_RESET, EVT_SETSTATE } from "../game/Bus";

let game;

const onSceneReady = (scene) => {
  setScene(scene);
  game = new Game(scene);
  scene.game = game;  
};

function GamePage({ page, setPage }) {

  useMemo(() => {
    console.log("GamePage useMemo");
    Bus.subscribe(EVT_SETSTATE, (state) => {
      setPage(page);
    });
  }, [setPage, page]);

  function pauseGame(pause) {
    globalstate.paused = pause;
    setPage(pause? "menu" : "game");
    game.pause(pause);
  }

  function resetGame() {
    Bus.send(EVT_RESET, {});
  }

  return (
    <div>
      {console.log(page)}
      <button onClick={() => {        
        pauseGame(true);
      }}>Pause</button>
      <button onClick={() => {        
        pauseGame(false);
      }}>Resume</button>
      <button onClick={() => {        
        resetGame();
      }}>Reset</button>
      {<SceneComponent visible={true} className="canvas" antialias onSceneReady={onSceneReady} id="my-canvas" />}
      {page === "menu" && <MenuComponent />}
    </div >
  );
}

export default GamePage;