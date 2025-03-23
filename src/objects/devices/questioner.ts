import { getKitQuestions } from "../../net/gimkitApi.js";
import { CustomBlock, KitQuestion } from "../../types.js";
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
    playerStreak: Record<string, number> = {};

    customBlocks: Record<string, CustomBlock> = {
        "message_correct_answer": ({ run }) => {
            let text = run("set_message_shown_when_player_answers_correctly");
            this.updateGlobalState("correctText", text);
        },
        "message_incorrect_answer": ({ run }) => {
            let text = run("set_message_shown_when_player_answers_incorrectly");
            this.updateGlobalState("incorrectText", text);
        },
        "question_answering_streak": ({ player }) => {
            return this.playerStreak[player.id] ?? 0;
        }
    }

    async init() {
        this.questions = await getKitQuestions(this.options.kitId);

        this.updateGlobalState("questions", JSON.stringify(this.questions));
    }

    restore() {
        this.updateGlobalState("enabled", true);

        let correctText = this.options.textShownWhenAnsweringCorrectly || "Correct!";
        let incorrectText = this.options.textShownWhenAnsweringIncorrectly || "Incorrect!";
        this.updateForAll(this.options.textShownWhenAnsweringScope, "correctText", correctText);
        this.updateForAll(this.options.textShownWhenAnsweringScope, "incorrectText", incorrectText);

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
        if(!this.globalState.enabled) return;
        
        let correct = this.isCorrect(this.playerStates[player.id].nextQuestionId, data.answer);

        this.updatePlayerState(player.id, "currentQuestionId", this.playerStates[player.id].nextQuestionId);
        this.updatePlayerState(player.id, "nextQuestionId", this.getQuestion(player.id));
        
        if(correct) {
            if(!this.playerStreak[player.id]) this.playerStreak[player.id] = 0;
            this.playerStreak[player.id]++;

            this.triggerBlock("whenQuestionAnsweredCorrectly", player);
            this.triggerWire("questionCorrect", player);
            this.deviceManager.triggerChannel(this.options.whenAnsweredCorrectlyTransmitOn, player);
        } else {
            this.playerStreak[player.id] = 0;

            this.triggerBlock("whenQuestionAnsweredIncorrectly", player);
            this.triggerWire("questionIncorrect", player);
            this.deviceManager.triggerChannel(this.options.whenAnsweredIncorrectlyTransmitOn, player);
        }
    }

    onChannel(channel: string, player: Player) {
        if(channel === this.options.disableWhenReceivingOn) {
            this.updateGlobalState("enabled", false);
        } else if(channel === this.options.enableWhenReceivingOn) {
            this.updateGlobalState("enabled", true);
        } else if(channel === this.options.openWhenReceivingOn) {
            this.open(player);
        } else if(channel === this.options.closeWhenReceivingOn) {
            this.close(player);
        }
    }

    open(player: Player) {
        player.player.openDeviceUI = this.id;
        player.player.openDeviceUIChangeCounter++;
    }

    close(player: Player) {
        player.player.openDeviceUI = "";
        player.player.openDeviceUIChangeCounter++;
    }

    onWire(connection: string, player: Player) {
        if(connection === "open") this.open(player);
        else if(connection === "close") this.close(player);
        else if(connection === "enable") this.updateGlobalState("enabled", true);
        else if(connection === "disable") this.updateGlobalState("enabled", false);
        else if(connection === "codeGrid") this.triggerBlock("wire", player);
    }

    isCorrect(id: string, answered: string) {
        let question = this.questions.find((q) => q._id === id);
        if(!question) return false;

        if(question.type === "mc") {
            let answer = question.answers.find(q => q._id === answered);
            if(!answer) return false;
            return answer.correct;
        } else {
            for(let answer of question.answers) {
                if(answer.textType === 2) {
                    if(answered.includes(answer.text)) return true;
                } else {
                    if(answered === answer.text) return true;
                }
            }
        }

        return false;
    }

    onOpen(player: Player) {
        if(!this.globalState.enabled) return;
        this.deviceManager.triggerChannel(this.options.whenOpenedChannel, player);
        this.triggerWire("opened", player);
    }
    
    onClose(player: Player) {
        if(!this.globalState.enabled) return;
        this.deviceManager.triggerChannel(this.options.whenClosedChannel, player);
        this.triggerWire("closed", player);
    }
}