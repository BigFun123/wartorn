let gscene = null;
let gshadowgen = null;
let gplayer = null;
let playAudio = false;

function setScene(scene) {
    gscene = scene;
}

function setShadowGen(sg) {
    gshadowgen = sg;
}

function setPlayer(player) {
    gplayer = player;
}

export { gscene, setScene, gshadowgen, setShadowGen , gplayer, setPlayer, playAudio};