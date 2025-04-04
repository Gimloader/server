import type RAPIER from "@dimforge/rapier2d-compat";

export interface PhysicsState {
    gravity: number;
    velocity: { x: number; y: number; desiredX: number; desiredY: number };
    movement: { direction: string; xVelocity: number; accelerationTicks: number };
    jump: { isJumping: boolean; jumpsLeft: number; jumpCounter: number; jumpTicks: number; xVelocityAtJumpStart: number };
    forces: any[]; // TODO
    grounded: boolean;
    groundedTicks: number;
    lastGroundedAngle: number;
}

export interface PhysicsObjects {
    rb: RAPIER.RigidBody;
    controller: RAPIER.KinematicCharacterController;
    collider: RAPIER.Collider;
}

export interface ColliderInfo {
    rb: RAPIER.RigidBody;
    collider: RAPIER.Collider;
}

export interface BoxCollider {
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    type: "box";
}

export interface CircleCollider {
    x: number;
    y: number;
    r: number;
    type: "circle";
}

export interface CapsuleCollider {
    x: number;
    y: number;
    angle: number;
    r: number;
    height: number;
    type: "capsule";
}

export type ColliderOptions = BoxCollider | CircleCollider | CapsuleCollider;