let gscene = null;
let gshadowgen = null;
let gplayer = null;
let playAudio = false;
let gcursor = null;
let ginput = null;

export const DebugMode = true;

export const PrimaryLayer    = 0x00000001; // 00000000000000000000000000000001
export const SecondaryLayer =  0x00000002; // 00000000000000000000000000000010
export const TertiaryLayer =  0x00000004;  // 00000000000000000000000000000100
export const AllLayers = 0x0000000f;       // 00000000000000000000000000001111

export const CanvasWidth = 1920;
export const CanvasHeight = 900;
export const tilesize = 1000; // size of each terrain tile

export let GameScoreA = 0;
export let GameScoreB = 0;

export function setGameScoreA(score) {
    GameScoreA = score;
}

export function setGameScoreB(score) {
    GameScoreB = score;
}

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

function setInput(input) {
    ginput = input;
}

export { gscene, setScene, gshadowgen, setShadowGen , gplayer, setPlayer, getPlayer, playAudio, gcursor, setCursor, ginput, setInput };