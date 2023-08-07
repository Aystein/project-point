/// <reference types="./obj-type"/>

import Column from "../../../../models/column.obj?raw";
import S from "../../../../models/particles-s.obj?raw";
import X from "../../../../models/particles-x.obj?raw";
import XX from "../../../../models/particles-xx.obj?raw";
import XXX from "../../../../models/particles-xxx.obj?raw";
import XXXX from "../../../../models/particles-xxxx.obj?raw";
import XXXXX from "../../../../models/particles-xxxxx.obj?raw";

import Capsules from "../../../../models/capsules.obj?raw";
import Cup from "../../../../models/cup.obj?raw";
import Funnel from "../../../../models/funnel.obj?raw";
import Helix from "../../../../models/helix.obj?raw";
import PiercedFloor from "../../../../models/pierced-floor.obj?raw";

const particles = {
    Column,
    S,
    X,
    XX,
    XXX,
    XXXX,
    XXXXX,
};

const obstacles = {
    Capsules,
    Cup,
    Funnel,
    Helix,
    PiercedFloor
};

export {
    particles as Particles,
    obstacles as Obstacles,
};

