import Player from "../objects/player/player";
import { GameRoom } from "./room";

export default class TeamManager {
    room: GameRoom;
    teamSizes: number[] = [];
    scores: number[] = [];

    constructor(room: GameRoom) {
        this.room = room;
    }

    start() {
        let teamType = this.room.mapSettings.teams;

        if(teamType === "Free For All") {
            let i = 1;
            for(let player of this.room.players.values()) {
                player.player.teamId = i.toString();
                this.teamSizes[i] = 1;
                i++;
            }
        } else if(teamType === "Cooperative") {
            for(let player of this.room.players.values()) {
                player.player.teamId = "1";
            }
        } else {
            let teams: number;
            if(teamType === "Split Into Size") {
                teams = Math.ceil(this.room.players.size / this.room.mapSettings.teamSize);
            } else {
                teams = this.room.mapSettings.teamsNumber;
            }

            let i = 1;
            for(let player of this.room.players.values()) {
                player.player.teamId = i.toString();
                if(!this.teamSizes[i]) this.teamSizes[i] = 0;
                this.teamSizes[i]++;
                i++;
                if(i > teams) i = 1;
            }
        }
    }

    restore() {
        this.teamSizes = [];

        for(let player of this.room.players.values()) {
            player.player.teamId = "__NO_TEAM_ID";
        }
    }

    onJoin(player: Player) {
        if(this.room.state.session.phase !== "game") return;
        let teamType = this.room.mapSettings.teams;
        let teamId: number;

        if(teamType === "Free For All") {
            let i = 1;
            while(this.teamSizes[i] && this.teamSizes[i] > 0) i++;
            teamId = i;
        } else if(teamType === "Cooperative") {
            teamId = 1;
        } else if(teamType === "Split Into Size") {
            let emptiest = Infinity;
            let emptiestTeam: number | null = null;

            for(let i = 0; i < this.teamSizes.length; i++) {
                if(
                    this.teamSizes[i] &&
                    this.teamSizes[i] > 0 &&
                    this.teamSizes[i] <= this.room.mapSettings.teamSize &&
                    this.teamSizes[i] < emptiest
                ) {
                    emptiestTeam = i;
                    emptiest = this.teamSizes[i];
                }
            }

            if(emptiestTeam) {
                teamId = emptiestTeam;
            } else {
                let i = 0;
                while(!this.teamSizes[i] || this.teamSizes[i] === 0) i++;
                teamId = i;
            }
        } else {
            let emptiest = Infinity;
            let emptiestTeam: number | null = null;      

            // fixed number of teams
            for(let i = 0; i < this.room.mapSettings.teamsNumber; i++) {
                if(this.teamSizes[i] < emptiest) {
                    emptiest = this.teamSizes[i];
                    emptiestTeam = i;
                }
            }

            teamId = emptiestTeam;
        }

        player.player.teamId = teamId.toString();
        if(!this.teamSizes[teamId]) this.teamSizes[teamId] = 1;
        else this.teamSizes[teamId]++;
    }

    onLeave(player: Player) {
        let teamId = parseInt(player.player.teamId);
        if(isNaN(teamId)) return;

        if(this.teamSizes[teamId]) this.teamSizes[teamId]--;
    }
}