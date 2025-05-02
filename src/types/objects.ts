import { InteractiveSlotsItem } from "../colyseus/schema";

export interface WaitOptions {
    slot: InteractiveSlotsItem;
    duration: number;
    onComplete?: () => void;
    moveCancels?: boolean;
}