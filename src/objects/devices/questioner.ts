import { getKitQuestions } from "../../net/gimkitApi.js";
import { KitQuestion } from "../../types.js";
import { shuffled } from "../../utils.js";
import Player from "../player.js";
import BaseDevice from "./base.js";

export default class QuestionerDevice extends BaseDevice {
    globalState = {
        enabled: true,
        correctText: "",
        incorrectText: "",
        questions: "[]"
    }
    questions: KitQuestion[] = [];
    playerQuestionQueue = new Map<string, string[]>();

    async init() {
        this.questions = await getKitQuestions(this.options.kitId);
        this.updateGlobalState("questions", JSON.stringify(this.questions));
    }

    restore() {
        this.updateGlobalState("enabled", true);
        this.updateGlobalState("correctText", this.options.textShownWhenAnsweringCorrectly);
        this.updateGlobalState("incorrectText", this.options.textShownWhenAnsweringIncorrectly);

        this.playerQuestionQueue.clear();
        for(let player of this.room.players.values()) {
            this.onJoin(player);
        }
    }

    getQuestion(player: string) {
        let queue = this.playerQuestionQueue.get(player)
        if(!this.playerQuestionQueue.has(player) || queue.length === 0) {
            queue = shuffled(this.questions).map(q => q._id);
            this.playerQuestionQueue.set(player, queue);
        }

        return queue.shift();
    }

    onJoin(player: Player) {
        this.updatePlayerState(player.id, "currentQuestionId", this.getQuestion(player.id));
        this.updatePlayerState(player.id, "nextQuestionId", this.getQuestion(player.id));
    }
    
    onMessage(player: Player, key: string, data: any) {
        if(key !== "answered") return;
        
        this.updatePlayerState(player.id, "currentQuestionId", this.playerStates[player.id].nextQuestionId);
        this.updatePlayerState(player.id, "nextQuestionId", this.getQuestion(player.id));
        
        // TODO: Check that the player was, indeed, correct
        this.triggerBlock("whenQuestionAnsweredCorrectly", player);
    }

    onChannel(channel: string) {
        if(channel === this.options.disableWhenReceivingOn) {
            this.updateGlobalState("enabled", false);
        } else if(channel === this.options.enableWhenReceivingOn) {
            this.updateGlobalState("enabled", true);
        }
    }
}