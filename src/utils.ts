import { ServerConfig } from "./types";

export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateGameCode() {
    let number = random(10000, 999999);
    return number.toString();
}

export function randomItem<T>(array: T[]): T {
    return array[random(0, array.length - 1)];
}

export function shuffled<T>(array: T[]): T[] {
    let arr = [...array];

    let currentIndex = arr.length;
    while(currentIndex !== 0) {
        let index = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        let temp = arr[index];
        arr[index] = arr[currentIndex];
        arr[currentIndex] = temp;
    }

    return arr;
}

export function degToRad(deg: number) {
    return deg * Math.PI / 180;
}

export function createValuesArray<T>(): [T[], (value: T) => number] {
    let arr: T[] = [];
    let indexes = new Map<T, number>();

    const add = (value: T) => {
        if(indexes.has(value)) {
            return indexes.get(value);
        }

        arr.push(value);
        indexes.set(value, arr.length - 1);
        return arr.length - 1;
    }

    return [arr, add];
}

export enum CollisionGroups {
    everything,
    characterMainBody,
    characterAround,
    characterFeet,
    staticWorldSensor,
    staticWorldCollider,
    dynamicWorldSensor,
    dynamicWorldCollider,
    inactiveStaticWorldCollider,
    ball,
    ballZone
}

export function createCollisionGroup(options: { belongs: number[], collidesWith?: number[], notCollidesWith?: number[] }) {
    let high = 0;
    let low = options.collidesWith ? 0 : 65535;
    options.belongs.forEach((n) => {
        high |= 1 << n
    });
    options.collidesWith?.forEach((n) => {
        low |= 1 << n;
    });
    options.notCollidesWith?.forEach((n) => {
        low &= ~(1 << n);
    });
    return high << 16 | low;
}

export function isPrime(num: number) {
    for(let i = 2, s = Math.sqrt(num); i <= s; i++) {
        if(num % i === 0) return false;
    }
    return num > 1;
}

export function config(config: ServerConfig) {
    return config;
}