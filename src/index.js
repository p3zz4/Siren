import {Siren} from "./siren";

const siren = new Siren();
siren.initPlayer();
siren.addSrcToQueue("../data/music/1.mp3");
siren.addSrcToQueue("../data/music/2.mp3");

siren.log();
