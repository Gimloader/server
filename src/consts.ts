import { join } from "path";
import type { PhysicsState } from '$types/physics';
import type { Cosmetics } from '$types/schema';

export const basePath = join(__dirname, "..");
export const dataPath = join(basePath, "data");
export const mapsPath = join(basePath, "maps");
export const publicPath = join(basePath, "public");

export const defaultSkins = [
    "default_yellow",
    "default_orange",
    "default_lime",
    "default_red",
    "default_pink",
    "default_maroon",
    "default_lightyellow",
    "default_lightpurple",
    "default_lightpink",
    "default_lightgreen",
    "default_lightbrown",
    "default_hotpink",
    "default_grayblue",
    "default_gray",
    "default_darkpurple",
    "default_darkgreen",
    "default_darkblue",
    "default_cyan",
    "default_graybrown"
];

export const defaultPhysicsState: PhysicsState = {
    gravity: 0.001,
    velocity: { x: 0, y: 0, desiredX: 0, desiredY: 0.001 }, 
    movement: { direction: "none", xVelocity: 0, accelerationTicks: 0 },
    jump: { isJumping: false, jumpsLeft: 1, jumpCounter: 0, jumpTicks: 1, xVelocityAtJumpStart: 0 },
    forces: [],
    grounded: false,
    groundedTicks: 1,
    lastGroundedAngle: 0
}
export const defaultCosmetics: Cosmetics = {
    character: { id: "default_gray" },
    trail: null
}
export const physicsScale = 100;
export const tileSize = 64;
export const physicsConsts = {
    capsule: {
        topDown: { radius: 0.2, height: 0.1, angle: 90 },
        platformer: { radius: 0.27, height: 0.06, angle: 0 }
    },
    topDownBaseSpeed: 0.25833333333333336,
    platformerGroundSpeed: 0.325,
    feetSensorPosition: {
        topDown: { x: 0.2, y: 0 },
        platformer: { x: 0, y: 0.3 }
    },
    aroundSensorPosition: {
        topDown: { x: -0.18, y: 0 },
        platformer: { x: 0, y: 0 }
    },
    controllerOffset: 0.01,
    climbAngle: 45,
    slideAngle: 45,
    groundSnapHeight: 0.3,
    autoStep: { maxHeight: 0.15, minWidth: 0.3 },
    groundedGravity: 0.001,
    maxGravityPerSecond: 10,
    timeToMaxGravityMS: 625,
    yTravelUntilMaxGravity: 3.5,
    movement: {
        baseSpeed: 0.325,
        ground: {
            accelerationSpeed: 0.0203125,
            decelerationSpeed: 0.1625,
            maxAccelerationSpeed: 0.14130434782608697
        },
        air: {
            accelerationSpeed: 0.08125,
            decelerationSpeed: 0.08125,
            maxAccelerationSpeed: 0.14130434782608697
        }
    },
    jump: {
        height: 1.92,
        durationMS: 400,
        hangTimeMS: 50,
        subsequentJumpMultiplier: 0.66,
        maxJumps: 2,
        coyoteJumpLimitMS: 200,
        cooldownMS: 200,
        cancelJumpIfHitHeadCausesYMovementLessThan: 0.05999999999999999,
        airSpeedMinimum: {
            multiplier: 0.75,
            maxSpeed: 0.325
        }
    },
    normals: {
        maxGroundCollision: -0.7071067811865475,
        minHeadCollision: 0.6
    },
    size: 3,
    inputsStorageLimit: 60
}