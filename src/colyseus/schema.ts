import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";
import { CharacterOptions, CodeGrid, Cosmetics, GadgetOptions, MapInfo, SessionOptions, StateOptions } from "../types.js";

export class Hooks extends Schema {
    @type("string") hookJSON: string = '{"hooks":[]}';
}

export class Matchmaker extends Schema {
    @type("string") gameCode: string;

    constructor(options: { gameCode: string }) {
        super();
        this.gameCode = options.gameCode;
    }
}

export class Physics extends Schema {
    @type("boolean") isGrounded: boolean = true;
}

export class ZoneAbilitiesOverrides extends Schema {
    @type("boolean") allowWeaponFire: boolean = true;
    @type("boolean") allowWeaponDrop: boolean = true;
    @type("boolean") allowItemDrop: boolean = true;
    @type("boolean") allowResourceDrop: boolean = true;
}

export class Projectiles extends Schema {
    @type("number") aimAngle: number = 0;
    @type("number") damageMultiplier: number = 1;
}

export class Health extends Schema {
    @type("number") fragility: number = 0;
    @type("number") health: number = 100;
    @type("number") shield: number = 100;
    @type("number") maxHealth: number = 100;
    @type("number") maxShield: number = 100;
    @type("boolean") spawnImmunityActive: boolean = false;
    @type("boolean") classImmunityActive: boolean = false;
    @type("boolean") showHealthBar: boolean = true;
}

export class Assignment extends Schema {
    @type("number") percentageComplete: number = 0;
    @type("string") objective: string = "";
    @type("boolean") hasSavedProgress: boolean = false;
}

export class Xp extends Schema {
    @type("number") unredeemedXP: number = 0;
}

export class InteractiveSlotsItem extends Schema {
    @type("string") itemId: string = "";
    @type("boolean") waiting: boolean = false;
    @type("number") waitingStartTime: number = 0;
    @type("number") waitingEndTime: number = 0;
    @type("number") currentClip: number = 0;
    @type("number") clipSize: number = 0;
    @type("number") durability: number = -1;
    @type("number") count: number = 0;

    constructor(id = "", options?: GadgetOptions) {
        super();

        this.itemId = id;
        if(options) {
            this.currentClip = options.clipSize;
            this.clipSize = options.clipSize;
        }
    }
}

export class SlotsItem extends Schema {
    @type("number") amount: number;

    constructor(options: { amount: number }) {
        super();
        this.amount = options.amount;
    }
}

export class Inventory extends Schema {
    @type({ map: SlotsItem }) slots = new MapSchema<SlotsItem>();
    @type("number") maxSlots: number = 999;
    @type("number") activeInteractiveSlot: number = 0;
    @type({ map: InteractiveSlotsItem }) interactiveSlots: MapSchema<InteractiveSlotsItem>;
    @type([ "number" ]) interactiveSlotsOrder = new ArraySchema<number>(1, 2, 3, 4, 5);
    @type("boolean") infiniteAmmo: boolean;

    constructor(options: { infiniteAmmo: boolean }) {
        super();

        let interactiveSlots: Record<string, InteractiveSlotsItem> = {};
        for(let i = 1; i <= 5; i++) {
            interactiveSlots[i.toString()] = new InteractiveSlotsItem();
        }

        this.interactiveSlots = new MapSchema<InteractiveSlotsItem>(interactiveSlots);
        this.infiniteAmmo = options.infiniteAmmo;
    }
}

export class Permissions extends Schema {
    @type("boolean") adding: boolean = false;
    @type("boolean") removing: boolean = false;
    @type("boolean") editing: boolean = false;
    @type("boolean") manageCodeGrids: boolean = false;
}

export class Appearance extends Schema {
    @type("string") skin: string = '{"id":"character_default_gray"}';
    @type("string") trailId: string = "";
    @type("string") transparencyModifierId: string = "";
    @type("string") tintModifierId: string = "";

    constructor(options: { cosmetics: Cosmetics }) {
        super();

        if(options.cosmetics.character) this.skin = JSON.stringify(options.cosmetics.character);
        this.trailId = options.cosmetics.trail ?? "";
    }
}

export class ClassDesigner extends Schema {
    @type("string") lastActivatedClassDeviceId: string = "";
    @type("number") lastClassDeviceActivationId: number = 1;
}

export class CharactersItem extends Schema {
    @type("string") id: string;
    @type("string") teamId: string = "__NO_TEAM_ID";
    @type("string") name: string;
    @type("string") type: string = "player";
    @type("boolean") isActive: boolean = true;
    @type("number") roleLevel: number = 50;
    @type("number") x: number;
    @type("number") y: number;
    @type("number") scale: number = 1;
    @type("number") teleportCount: number = 0;
    @type("number") movementSpeed: number = 310;
    @type("boolean") phase: boolean = false;
    @type("string") openDeviceUI: string = "";
    @type("number") openDeviceUIChangeCounter: number = 0;
    @type("boolean") completedInitialPlacement: boolean = false;
    @type("boolean") isRespawning: boolean = false;
    @type("number") score: number = 0;
    @type(ClassDesigner) classDesigner: ClassDesigner = new ClassDesigner();
    @type(Appearance) appearance: Appearance;
    @type(Permissions) permissions: Permissions = new Permissions();
    @type(Inventory) inventory: Inventory;
    @type(Xp) xp: Xp = new Xp();
    @type(Assignment) assignment: Assignment = new Assignment();
    @type(Health) health: Health = new Health();
    @type(Projectiles) projectiles: Projectiles = new Projectiles();
    @type(ZoneAbilitiesOverrides) zoneAbilitiesOverrides: ZoneAbilitiesOverrides = new ZoneAbilitiesOverrides();
    @type(Physics) physics: Physics = new Physics();

    constructor(options: CharacterOptions) {
        super();
        this.id = options.id;
        this.name = options.name;
        this.x = options.x;
        this.y = options.y;
        this.inventory = options.inventory;
        this.appearance = new Appearance({ cosmetics: options.cosmetics });
    }
}

export class CodeGridsGrid extends Schema {
    @type("string") triggerType: string;
    @type("string") triggerValue: string;
    @type("string") json: string;
    @type("string") owner: string;
    @type([ "string" ]) visitors = new ArraySchema<string>();
    @type("number") createdAt: number;
    @type("number") updatedAt: number;

    constructor(grid: CodeGrid) {
        super();
        this.triggerType = grid.triggerType;
        this.triggerValue = grid.triggerValue;
        this.json = JSON.stringify(grid.json);
        this.createdAt = grid.createdAt;
        this.updatedAt = grid.updatedAt;
    }
}

export class CodeGridsDevice extends Schema {
    @type({ map: CodeGridsGrid }) items: MapSchema<CodeGridsGrid>;

    constructor(grids: Record<string, CodeGrid>) {
        super();

        let items: Record<string, CodeGridsGrid> = {};
        for(let gridId in grids) {
            items[gridId] = new CodeGridsGrid(grids[gridId]);
        }
        this.items = new MapSchema(items);
    }
}

export class Devices extends Schema {
    @type({ map: CodeGridsDevice }) codeGrids: MapSchema<CodeGridsDevice>;

    constructor(options: { map: MapInfo }) {
        super();

        let devices: Record<string, CodeGridsDevice> = {};
        for(let deviceId in options.map.codeGrids) {
            devices[deviceId] = new CodeGridsDevice(options.map.codeGrids[deviceId]);
        }
        this.codeGrids = new MapSchema(devices);
    }
}

export class World extends Schema {
    @type("number") width: number = 1000;
    @type("number") height: number = 1000;
    @type(Devices) devices: Devices;

    constructor(options: { map: MapInfo }) {
        super();
        this.devices = new Devices(options);
    }
}

export class TeamsItem extends Schema {
    @type("string") id: string;
    @type("string") name: string;
    @type("number") score: number;
    @type([ "string" ]) characters = new ArraySchema<string>();
}

export class GlobalPermissions extends Schema {
    @type("boolean") adding: boolean;
    @type("boolean") removing: boolean;
    @type("boolean") editing: boolean;
    @type("boolean") manageCodeGrids: boolean;
}

export class CategoriesItem extends Schema {
    @type("string") id: string;
    @type("string") name: string;
    @type("string") plural: string;
}

export class CallToActionItem extends Schema {
    @type("string") id: string;
    @type("string") category: string;
    @type("string") name: string;
    @type("string") url: string;
}

export class CallToAction extends Schema {
   @type([ CategoriesItem ]) categories = new ArraySchema<CategoriesItem>();
   @type([ CallToActionItem ]) items = new ArraySchema<CallToActionItem>();
}

export class GameSession extends Schema {
    @type("string") phase: string;
    @type("number") countdownEnd: number;
    @type("number") resultsEnd: number;
    @type(CallToAction) callToAction: CallToAction = new CallToAction();
}

export class Session extends Schema {
    @type("string") version: string = "published";
    @type("string") modeType: string = "liveGame";
    @type("string") gameOwnerId: string;
    @type("number") gameTime: number = 0;
    @type("string") phase: string = "preGame";
    @type("boolean") loadingPhase: boolean = false;
    @type(GameSession) gameSession: GameSession = new GameSession();
    @type(GlobalPermissions) globalPermissions: GlobalPermissions = new GlobalPermissions();
    @type("number") mapCreatorRoleLevel: number = 90;
    @type("boolean") cosmosBlocked: boolean = false;
    @type("boolean") allowGoogleTranslate: boolean = true;
    @type("string") mapStyle: string;

    constructor(options: SessionOptions) {
        super();
        this.gameOwnerId = options.gameOwnerId;
        this.mapStyle = options.mapStyle;
    }
}

export class GimkitState extends Schema {
    @type(Session) session: Session;
    @type([ TeamsItem ]) teams = new ArraySchema<TeamsItem>();
    @type(World) world: World;
    @type({ map: CharactersItem }) characters = new MapSchema<CharactersItem>();
    @type("string") mapSettings: string;
    @type(Matchmaker) matchmaker: Matchmaker;
    @type(Hooks) hooks: Hooks = new Hooks();

    constructor(options: StateOptions) {
        super();

        this.mapSettings = JSON.stringify(options.mapSettings);
        this.session = new Session({
            gameOwnerId: options.ownerId,
            mapStyle: options.map.mapStyle
        });
        this.world = new World({ map: options.map });
        this.matchmaker = new Matchmaker({ gameCode: options.gameCode });
    }
}