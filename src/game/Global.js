let gscene = null;
let gshadowgen = null;
let gplayer = null;
let playAudio = false;
let gcursor = null;

function setScene(scene) {
    gscene = scene;
}

function setShadowGen(sg) {
    gshadowgen = sg;
}

function setPlayer(player) {
    gplayer = player;
}

function getPlayer() {
    return gplayer;
}

function setCursor(cursor) {
    gcursor = cursor;
}

export { gscene, setScene, gshadowgen, setShadowGen , gplayer, setPlayer, getPlayer, playAudio, gcursor, setCursor };