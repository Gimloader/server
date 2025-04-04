export interface DeviceOptions {
    assignmentCheckpoint: AssignmentCheckpointOptions;
    assignmentContext: AssignmentContextOptions;
    backgroundTilesZone: BackgroundTilesZoneOptions;
    ball: BallOptions;
    ballZone: BallCaptureZoneOptions;
    barrier: BarrierOptions;
    blockingZone: BlockingZoneOptions;
    button: ButtonOptions;
    cameraPoint: CameraPointOptions;
    cameraSize: CameraViewOptions;
    changingBooth: ChangingBoothOptions;
    character: CharacterOptions;
    checker: CheckerOptions;
    checkpoint: CheckpointOptions;
    chest: ChestOptions;
    classDesigner: ClassDesignerOptions;
    codeUI: CodeUIOptions;
    cosmosModifier: CosmosModifierOptions;
    countdown: CountdownOptions;
    counter: CounterOptions;
    craftingRecipe: CraftingRecipeOptions;
    craftingTable: CraftingTableOptions;
    damageBoost: DamageBoostOptions;
    damager: DamagerOptions;
    dialogue: DialogueOptions;
    dialogueAction: DialogueActionOptions;
    droppedItem: DroppedItemOptions;
    endGame: EndGameOptions;
    endOfGameWidget: EndofGameWidgetOptions;
    flag: FlagOptions;
    captureFlagZone: FlagCaptureZoneOptions;
    gadgetModifier: GadgetModifierOptions;
    guiDevice: GameOverlayOptions;
    healthGranter: HealthGranterOptions;
    imageBillboard: ImageOptions;
    inventoryItemManager: InventoryItemManagerOptions;
    itemGranter: ItemGranterOptions;
    itemImage: ItemImageOptions;
    itemSpawner: ItemSpawnerOptions;
    jumpGranter: JumpGranterOptions;
    knockoutManager: KnockoutManagerOptions;
    laserBeam: LaserBeamOptions;
    laserBeamManager: LaserBeamManagerOptions;
    lifecycle: LifecycleOptions;
    mapOptions: MapOptionsOptions;
    mood: MoodOptions;
    movementMeter: MovementMeterOptions;
    music: MusicOptions;
    notification: NotificationOptions;
    outline: OutlineOptions;
    passwordLock: PasswordLockOptions;
    placedSticker: PlacedStickerOptions;
    playerAppearanceModifier: PlayerAppearanceModifierOptions;
    playerPositionDetector: PlayerCoordinatesOptions;
    characterProximity: PlayerProximityOptions;
    textExplainer: PopupOptions;
    popupListItem: PopupCallToActionOptions;
    proceduralTerrainZone: ProceduralTerrainZoneOptions;
    proceduralTerrainZoneZoneInstruction: ProceduralTerrainZoneInstructionOptions;
    prop: PropOptions;
    property: PropertyOptions;
    gimkitLiveQuestion: QuestionerOptions;
    relay: RelayOptions;
    repeater: RepeaterOptions;
    respawn: RespawnOptions;
    scorebar: ScorebarOptions;
    sentry: SentryOptions;
    shadow: ShadowOptions;
    soundEffect: SoundEffectOptions;
    characterSpawnPad: SpawnPadOptions;
    speed: SpeedModifierOptions;
    startingInventory: StartingInventoryOptions;
    tagZone: TagZoneOptions;
    teamColorTilesManager: TeamColorTilesManagerOptions;
    teamSettings: TeamSettingsOptions;
    teamSwitcher: TeamSwitcherOptions;
    teleporter: TeleporterOptions;
    textBillboard: TextOptions;
    trigger: TriggerOptions;
    vendingMachine: VendingMachineOptions;
    voiceLine: VoiceLineOptions;
    waypoint: WaypointOptions;
    wireRepeater: WireRepeaterOptions;
    xp: XPGranterOptions;
    zombieDesigner: ZombieDesignerOptions;
    zombieInvasion: ZombieInvasionOptions;
    zombieSpawnZone: ZombieSpawnZoneOptions;
    zombieWaveDesigner: ZombieWaveDesignerOptions;
    zone: ZoneOptions;
}

export interface ItemListItem {
    itemId: string;
    amount: number;
    numParam: number;
}

export type ItemList = ItemListItem[];

export type Scope = "global" | "player" | "team";

export interface AssignmentCheckpointOptions {
    action: "set" | "increment" | "decrement";
    actionValue: number;
    applyActionOnChannel: string;
}

export interface AssignmentContextOptions {
    objective: string;
}

export interface BackgroundTilesZoneOptions {
    terrainId: string;
    order: number;
    scrollFactor: number;
    overrideScrollingSpeed: boolean;
    scrollingSpeedX: number;
    scrollingSpeedY: number;
    useFullMapSize: boolean;
    zoneX: number;
    zoneY: number;
    width: number;
    height: number;
    tint: string;
}

export interface BallOptions {
    appearance: "primary" | "inverted" | "blue" | "green" | "purple" | "red" | "solid" | "teal" | "yellow";
    resetCooldown: number;
    topSpeed: number;
    hitSensitivity: number;
    bounciness: number;
    damping: number;
    massMultiplier: number;
    radius: number;
    activeOnStart: boolean;
    activateChannel: string;
    deactivateChannel: string;
    identifier: string;
}

export interface BallCaptureZoneOptions {
    resetTheBall: boolean;
    visibleInGame: boolean;
    style: "None" | "Blastball";
    side: "Left" | "Right";
    color: string;
    backgroundAlpha: number;
    activeOnStart: boolean;
    ballEntersChannel: string;
    activateChannel: string;
    deactivateChannel: string;
    width: number;
    height: number;
}

export interface BarrierOptions {
    shape: "rectangle" | "circle";
    activeOnGameStart: boolean;
    color: string;
    scope: Scope;
    activateChannel: string;
    deactivateChannel: string;
    alpha: number;
    showBorder: boolean;
    visibleInGame: boolean;
    collisionEnabled: boolean;
    height: number;
    width: number;
    angle: number;
    radius: number;
}

export interface BlockingZoneOptions {
    blockBuilding: number;
    visibleInGame: boolean;
    color: string;
    activeOnStart: boolean;
    activateChannel: string;
    deactivateChannel: string;
    width: number;
    height: number;
}

export interface ButtonOptions {
    guiMessage: string;
    channel: string;
    visibleInGame: boolean;
    interactionDuration: number;
    activeOnStart: boolean;
    activateChannel: string;
    deactivateChannel: string;
    scope: Scope;
    radius: number;
    size: number;
}

export interface CameraPointOptions {
    activateChannel: string;
    deactivateChannel: string;
}

export interface CameraViewOptions {
    width: number;
    height: number;
}

export interface ChangingBoothOptions {
    activeOnGameStart: boolean;
    activateWhenReceivingFrom: string;
    deactivateWhenReceivingFrom: string;
}

export interface CharacterOptions {
    skinId: string;
    interactionEnabled: boolean;
    interactionMessage: string;
    flipX: boolean;
    useNaturalDepth: boolean;
    interactionChannel: string;
    interactionDuration: number;
    activeOnStart: boolean;
    activateChannel: string;
    deactivateChannel: string;
    scope: Scope;
    radius: number;
}

export interface CheckerOptions {
    checkWhenReceivedOnChannel: string;
    whenValidTransmitOnChannel: string;
    whenInvalidTransmitOnChannel: string;
    check1Type: "none" | "item" | "property" | "score";
    check1ScoreComparison: "less" | "equal" | "greater";
    check1ScoreValue: number;
    check1PropertyName: string;
    check1PropertyComparison: "less" | "equal" | "greater";
    check1PropertyValue: number;
    check1ItemId: string;
    check1ItemComparison: "less" | "equal" | "greater";
    check1ItemValue: number;
    check2Type: "none" | "item" | "property" | "score";
    check2ScoreComparison: "less" | "equal" | "greater";
    check2ScoreValue: number;
    check2PropertyName: string;
    check2PropertyComparison: "less" | "equal" | "greater";
    check2PropertyValue: number;
    check2ItemId: string;
    check2ItemComparison: "less" | "equal" | "greater";
    check2ItemValue: number;
    check3Type: "none" | "item" | "property" | "score";
    check3ScoreComparison: "less" | "equal" | "greater";
    check3ScoreValue: number;
    check3PropertyName: string;
    check3PropertyComparison: "less" | "equal" | "greater";
    check3PropertyValue: number;
    check3ItemId: string;
    check3ItemComparison: "less" | "equal" | "greater";
    check3ItemValue: number;
    check4Type: "none" | "item" | "property" | "score";
    check4ScoreComparison: "less" | "equal" | "greater";
    check4ScoreValue: number;
    check4PropertyName: string;
    check4PropertyComparison: "less" | "equal" | "greater";
    check4PropertyValue: number;
    check4ItemId: string;
    check4ItemComparison: "less" | "equal" | "greater";
    check4ItemValue: number;
    check5Type: "none" | "item" | "property" | "score";
    check5ScoreComparison: "less" | "equal" | "greater";
    check5ScoreValue: number;
    check5PropertyName: string;
    check5PropertyComparison: "less" | "equal" | "greater";
    check5PropertyValue: number;
    check5ItemId: string;
    check5ItemComparison: "less" | "equal" | "greater";
    check5ItemValue: number;
    checkCount: number;
    operation: "and" | "or";
}

export interface CheckpointOptions {
    enabled: boolean;
    visibleInGame: boolean;
    playAudio: boolean;
    maxActivations: number;
    setAsActiveChannel: string;
    onActiveChannel: string;
    width: number;
}

export interface ChestOptions {
    items: ItemList;
    activateChannel: string;
    deactivateChannel: string;
    closeChannel: string;
    whenOpenedChannel: string;
    activeOnGameStart: boolean;
}

export interface ClassDesignerOptions {
    activateChannel: string;
    allowedToUseGadget: number;
    immunity: number;
    overrideMaxGravityPerSecond: boolean;
    maxGravityPerSecond: number;
    overrideTimeToMaxGravityMS: boolean;
    timeToMaxGravityMS: number;
    overrideYTravelUntilMaxGravity: boolean;
    yTravelUntilMaxGravity: number;
    overrideJumpHeight: boolean;
    jumpHeight: number;
    overrideJumpDurationMS: boolean;
    jumpDurationMS: number;
    overrideJumpHangTimeMS: boolean;
    jumpHangTimeMS: number;
    overrideSubsequentJumpMultiplier: boolean;
    subsequentJumpMultiplier: number;
    overrideMaxJumps: boolean;
    maxJumps: number;
}

export interface CodeUIOptions {
    code: string;
    openWhenReceivingFrom: string;
    style: "modal" | "banner";
    defaultBackgroundColor: string;
    defaultFontFamily: "Rubik" | "Roboto" | "Staatliches" | "Galindo" | "Kalam" | "Bangers" | "Fugaz One" | "Outfit" | "PT Mono" | "Space Grotesk" | "Lobster" | "Zeyada" | "Titan One" | "Rye" | "Caprasimo";
    closableByUser: boolean;
    closeWhenReceivingFrom: string;
    whenClosedTransmitOn: string;
}

export interface CosmosModifierOptions {
    skinId: string;
    trailId: string;
    applyChannel: string;
    resetChannel: string;
}

export interface CountdownOptions {
    minutes: number;
    seconds: number;
    startWhenReceivingFrom: string;
    onEndTransmitOn: string;
}

export interface CounterOptions {
    startingValue: number;
    incrementWhenReceivingOn: string;
    decrementWhenReceivingOn: string;
    visibleInGame: boolean;
    scope: Scope;
    resetToStartingValueWhenReceivingOn: string;
    updateProperty: boolean;
    property: string;
    useTarget: boolean;
    target: number;
    whenTargetReachedTransmitOn: string;
}

export interface CraftingRecipeOptions {
    item: string;
    itemAmount: number;
    numberOfIngredients: number;
    ingredient1Item: string;
    ingredient1Amount: number;
    ingredient2Item: string;
    ingredient2Amount: number;
    ingredient3Item: string;
    ingredient3Amount: number;
    ingredient4Item: string;
    ingredient4Amount: number;
    ingredient5Item: string;
    ingredient5Amount: number;
    timeToCraftMs: number;
    itemDisposes: boolean;
    disposeItemAfterMs: number;
    group: string;
    activeOnGameStart: boolean;
    whenCraftingStartsChannel: string;
    whenCraftedChannel: string;
    activeScope: Scope;
    activateChannel: string;
    deactivateChannel: string;
}

export interface CraftingTableOptions {
    style: "craft" | "plant";
    craftingScope: Scope;
    group: string;
    useCrafterCollectionAdvantage: boolean;
    channelItemBeginsCrafting: string;
    channelItemFinishesCrafting: string;
    channelItemCollected: string;
    channelItemDisposed: string;
}

export interface DamageBoostOptions {
    multiplier: number;
    durationMS: number;
    activateChannel: string;
    deactivateChannel: string;
}

export interface DamagerOptions {
    amount: number;
    damageOnChannel: string;
    knockoutActivityFeedMessage: string;
}

export interface DialogueOptions {
    message: string;
    character: string;
    openChannel: string;
    action1Text: string;
    action1Channel: string;
    action2Text: string;
    action2Channel: string;
    action3Text: string;
    action3Channel: string;
    action4Text: string;
    action4Channel: string;
    group: string;
    font: "Rubik" | "Roboto" | "Staatliches" | "Galindo" | "Kalam" | "Bangers" | "Fugaz One" | "Outfit" | "PT Mono" | "Space Grotesk" | "Lobster" | "Zeyada" | "Titan One" | "Rye" | "Caprasimo";
    typewriter: boolean;
    darkenBackground: boolean;
    closeChannel: string;
    whenClosedChannel: string;
}

export interface DialogueActionOptions {
    text: string;
    selectChannel: string;
    group: string;
    scope: Scope;
    activeOnGameStart: boolean;
    deactivateAfterUse: boolean;
    activateChannel: string;
    deactivateChannel: string;
}

export interface DroppedItemOptions {
    itemId: string;
    amount: number;
    placedByCharacterId: string;
    useCurrentClipCount: boolean;
    currentClip: number;
    useCurrentDurability: boolean;
    currentDurability: number;
    decay: number;
    originX: number;
    originY: number;
}

export interface EndGameOptions {
    activateWhenReceivingFrom: string;
}

export interface EndofGameWidgetOptions {
    widgetType: "Statistic" | "Image" | "Game Time";
    widgetPlacement: "Featured" | "Primary" | "Secondary";
    statisticProperty: string;
    gameTimeLabel: string;
    statisticLabel: string;
    imageStyle: "Contain" | "Cover" | "fullWidth";
    imageUrl: string;
    imageHeight: number;
    imageBackgroundColor: string;
    showTo: "all" | "nonGameOwners" | "gameOwners";
    showForModeType: "all" | "liveGame" | "assignment";
    activeOnGameStart: boolean;
    scope: Scope;
    activateChannel: string;
    deactivateChannel: string;
}

export interface FlagOptions {
    flagColor: "black" | "blue" | "green" | "orange" | "purple" | "red" | "white";
    owningTeamId: string;
    useSafeZone: boolean;
    automaticBackToBaseAfterSeconds: number;
    otherTeamPickupAlerts: boolean;
    onCapturedBroadcastOnChannel: string;
    captureWhenReceiveFromChannel: string;
    onPickupBroadcastOnChannel: string;
    onPickupFromBaseBroadcastOnChannel: string;
    onDropBroadcastOnChannel: string;
    dropWhenReceiveFromChannel: string;
    onBackToBaseBroadcastOnChannel: string;
    onBackToBaseManuallyBroadcastOnChannel: string;
    backToBaseWhenReceiveFromChannel: string;
    radius: number;
}

export interface FlagCaptureZoneOptions {
    flagColor: "black" | "blue" | "green" | "orange" | "purple" | "red" | "white";
    activeOnStart: boolean;
    visibleInGame: boolean;
    color: string;
    whenCapturedTransmitOnChannel: string;
    activateChannel: string;
    deactivateChannel: string;
    width: number;
    height: number;
    rotation: number;
}

export interface GadgetModifierOptions {
    itemId: string;
    activateChannel: string;
    deactivateChannel: string;
    scope: Scope;
    modifyDurability: boolean;
    enableDurability: boolean;
    modifyDurabilityCost: boolean;
    durabilityCost: number;
    modifyClipSize: boolean;
    clipSize: number;
    modifyDamage: boolean;
    damage: number;
    modifyDistance: boolean;
    distance: number;
    modifySpeed: boolean;
    speed: number;
    disableDestructionOfDynamicBuildings: number;
}

export interface GameOverlayOptions {
    type: "Text" | "Button" | "Tracked Item";
    position: "Top Left" | "Top Right" | "Bottom Left" | "Bottom Right";
    text: string;
    trackedItemId: string;
    showTrackedItemMaximumAmount: boolean;
    whenButtonClickedTransmitOnChannel: string;
    showOnGameStart: boolean;
    color: string;
    contentScope: Scope;
    visibilityScope: Scope;
    showWhenReceivingFromChannel: string;
    hideWhenReceivingFromChannel: string;
}

export interface HealthGranterOptions {
    amount: number;
    grantType: "health" | "shield" | "healthFirst";
    grantChannel: string;
}

export interface ImageOptions {
    imageUrl: string;
    frameColor: "#212121" | "#fafafa" | "#455a64" | "#8A24E0" | "#1b5e20" | "#01579b" | "#c62828" | "Transparent";
    scope: Scope;
    alpha: number;
    visibleOnGameStart: "Yes" | "No";
    showWhenReceivingFrom: string;
    hideWhenReceivingFrom: string;
    visibleDuringPhase: "all" | "game" | "preGame";
    width: number;
    height: number;
    rotation: number;
}

export interface InventoryItemManagerOptions {
    itemId: string;
    useAsDefault: boolean;
    activateWhenReceivingFrom: string;
    useMaxAmount: boolean;
    maxAmount: number;
    overrideRespawnBehavior: boolean;
    respawnBehavior: "Keep" | "Delete";
    showAlert: boolean;
    customItemName: string;
    customItemDescription: string;
    clearItemFromInventoryOnChannel: string;
    updateProperty: boolean;
    property: string;
}

export interface ItemGranterOptions {
    itemId: string;
    itemChange: number;
    grantWhenReceivingFromChannel: string;
    fullStrategy: "overflow" | "safeAmount" | "noGrant";
    initialWeaponAmmo: number;
}

export interface ItemImageOptions {
    itemId: string;
    outline: boolean;
    outlineColor: string;
    outlineSize: "automatic" | "custom";
    customOutlineSize: number;
    visibleOnGameStart: boolean;
    scope: Scope;
    showChannel: string;
    hideChannel: string;
    size: number;
    angle: number;
}

export interface ItemSpawnerOptions {
    itemId: string;
    itemAmount: number;
    msTimeBetweenSpawns: number;
    scope: Scope;
}

export interface JumpGranterOptions {
    mode: "reset" | "grant";
    jumpsNumber: number;
    disabledTime: number;
    activeOnStart: boolean;
    activateOnChannel: string;
    deactivateOnChannel: string;
    scope: Scope;
}

export interface KnockoutManagerOptions {
    target: "player" | "sentry";
    onKnockoutChannel: string;
    grantItem: boolean;
    itemId: string;
    itemAmount: number;
    grantStrategy: "grant" | "onPlayer" | "onKnockedOutLocation";
    dropChance: boolean;
    dropPercentage: number;
    activeOnGameStart: boolean;
    scope: Scope;
    activateChannel: string;
    deactivateChannel: string;
}

export interface LaserBeamOptions {
    damageToDeal: number;
    appearance: "Standard" | "Plant";
    laserColor: string;
    activeOnGameStart: boolean;
    laserGroup: string;
    scope: Scope;
    transmitOnWhenHitPlayer: string;
    activateOnChannel: string;
    deactivateOnChannel: string;
    angle: number;
    distance: number;
    showPath: boolean;
    showOrigin: boolean;
    showEndPoint: boolean;
}

export interface LaserBeamManagerOptions {
    laserGroup: string;
    autoSwitch: boolean;
    activatedDuration: number;
    deactivatedDuration: number;
    activateOnChannel: string;
    deactivateOnChannel: string;
}

export interface LifecycleOptions {
    event: "Game Starts" | "characterStartsMoving" | "characterStopsMoving" | "characterJoinsLate" | "characterKnocksOut" | "characterKnockedOut" | "characterFiresGadget" | "characterDestroysTerrain" | "characterPlacesTerrain" | "characterCapturesTeamColorTile" | "gameEnding";
    transmitOnChannel: string;
}

export interface MapOptionsOptions {
    backgroundTerrain: string;
    platformerBackground: "sky" | "pixelStar" | "paintedSky" | "paintedSkyStripes";
    bottomTerrain: string;
    gameClockMode: "Off" | "Count Down" | "Count Up";
    countdownTimeMinutes: number;
    allowedGameClockModeType: "all" | "liveGame" | "assignment";
    musicUrl: string;
    presetMusicId: "NONE" | "the_shakedown" | "anchor_crawl" | "stay_up_high" | "whisperer" | "heroes_are_back" | "all_out" | "four_am" | "inferno" | "demogorgon" | "surfin_versailles";
    musicVolume: number;
    minPlayers: number;
    teams: "Free For All" | "Cooperative" | "Split Into Size" | "Specific Team Amount";
    teamSize: number;
    teamsNumber: number;
    splitModeForSpecificTeamAmount: "Split Evenly" | "Random" | "Custom";
    latePlayersJoinAsSpectators: boolean;
    allyIndicator: "Disabled" | "Enabled";
    enemyIndicator: "Disabled" | "Enabled";
    matchNametagToTeamColor: boolean;
    allowGameOwnerToSpectate: boolean;
    useInfiniteLives: boolean;
    numOfLives: number;
    healthMode: "healthAndShield" | "fragility";
    maxHealth: number;
    maxShield: number;
    startingHealth: number;
    startingShield: number;
    startingFragility: number;
    showHealthAndShield: boolean;
    spawnImmunity: number;
    playerVsPlayerDamageEnabled: boolean;
    interactiveItemsSlots: number;
    infiniteAmmo: boolean;
    instantReload: boolean;
    allowWeaponDrop: boolean;
    allowItemDrop: boolean;
    allowResourceDrop: boolean;
    weaponRespawnBehavior: "Keep" | "Delete";
    itemRespawnBehavior: "Keep" | "Delete";
    resourceRespawnBehavior: "Keep" | "Delete";
    infiniteDurability: boolean;
    droppedItemScope: Scope;
    useScoreboard: boolean;
    scoreType: "Knockout" | "Resource" | "Property";
    scoreResource: string;
    propertyResource: string;
    scoreName: string;
    scoreGroup: "player" | "team";
    sortMode: "Highest to lowest" | "Lowest to Highest";
    showScoreboardOnGameEnd: boolean;
    includeSpectatorsInScoreboard: boolean;
    showPlayersPlacement: boolean;
    knockoutActivityFeedDisabled: boolean;
    dynamicBuildingAllowFloatingBuilds: boolean;
    dynamicBuildingHealthMultiplier: number;
    disableDestructionOfDynamicBuildings: boolean;
    grantWhenDynamicBuildingDestroyed: boolean;
    maxGravityPerSecond: number;
    timeToMaxGravityMS: number;
    yTravelUntilMaxGravity: number;
    jumpHeight: number;
    jumpDurationMS: number;
    jumpHangTimeMS: number;
    subsequentJumpMultiplier: number;
    maxJumps: number;
    lookAroundWithMouse: boolean;
}

export interface MoodOptions {
    useVignette: boolean;
    vignetteStrength: number;
    activeOnGameStart: boolean;
    activateChannel: string;
    deactivateChannel: string;
}

export interface MovementMeterOptions {
    itemToTrack: string;
    drainAmount: number;
    drainIntervalMs: number;
    outOfItemChannel: string;
    speedWhenOutOfItem: number;
    useAsDefault: boolean;
    warningAmount: number;
    warningChannel: string;
    activateChannel: string;
    deactivateChannel: string;
}

export interface MusicOptions {
    audioUrl: string;
    volume: number;
    playWhenReceivingFrom: string;
    stopWhenReceivingFrom: string;
}

export interface NotificationOptions {
    title: string;
    description: string;
    notifyChannel: string;
    notificationType: "none" | "info" | "success" | "warning" | "error";
    notificationPlacement: "topRight" | "topLeft" | "bottomRight" | "bottomLeft";
    notificationDurationStrategy: "auto" | "manual";
    customDurationSeconds: number;
    sendTo: "characterTriggering" | "allOnTeam" | "allOnTeamExceptTriggeringPlayer" | "allCharacters";
}

export interface OutlineOptions {
    shape: "rectangle" | "circle";
    lineLength: number;
    circleRadius: number;
    circlePercentage: number;
    circleFill: boolean;
    thickness: number;
    angle: number;
    color: string;
    alpha: number;
    style: "solid" | "dashed";
    dashLength: number;
    dashSpacing: number;
    visibleOnGameStart: boolean;
    showChannel: string;
    hideChannel: string;
    scope: Scope;
}

export interface PasswordLockOptions {
    password: string;
    onSuccessChannel: string;
    openChannel: string;
    useMaxAttempts: boolean;
    maxAttempts: number;
    maxAttemptsScope: Scope;
    outOfAttemptsChannel: string;
}

export interface PlacedStickerOptions {
    stickerId: string;
    depth: number;
    scale: number;
    placedByCharacterId: string;
    placedAtTimeStamp: number;
}

export interface PlayerAppearanceModifierOptions {
    modifyTransparency: boolean;
    transparencyAmount: number;
    selfTransparency: "match" | "custom";
    selfTransparencyAmount: number;
    modifyTint: boolean;
    tint: string;
    activateChannel: string;
    deactivateChannel: string;
}

export interface PlayerCoordinatesOptions {
    whenPositionChangeDetectedTransmitOn: string;
    updateProperties: boolean;
    xProperty: string;
    yProperty: string;
}

export interface PlayerProximityOptions {
    detectionArea: "everywhere" | "zone";
    allowedMatch: "everybody" | "sameTeam" | "differentTeam";
    channelFound: string;
    channelLost: string;
    broadcastAs: "everybody" | "firstPerson";
    activeOnGameStart: boolean;
    activateWhenReceivingFrom: string;
    deactivateWhenReceivingFrom: string;
    detectionDistance: number;
    width: number;
    height: number;
    delay: number;
}

export interface PopupOptions {
    header: string;
    content: string;
    openWhenReceivingFrom: string;
    iconImage: string;
    style: "modal" | "banner";
    callToActionStyle: "standard" | "list";
    group: string;
    callToActionLabel: string;
    callToActionChannel: string;
    secondaryCallToActionLabel: string;
    secondaryCallToActionChannel: string;
    scope: Scope;
    backgroundColor: string;
    fontFamily: "Rubik" | "Roboto" | "Staatliches" | "Galindo" | "Kalam" | "Bangers" | "Fugaz One" | "Outfit" | "PT Mono" | "Space Grotesk" | "Lobster" | "Zeyada" | "Titan One" | "Rye" | "Caprasimo";
    closableByUser: boolean;
    closeWhenReceivingFrom: string;
    whenClosedTransmitOn: string;
}

export interface PopupCallToActionOptions {
    title: string;
    description: string;
    image: string;
    selectChannel: string;
    group: string;
    scope: Scope;
    activeOnGameStart: boolean;
    activateChannel: string;
    deactivateChannel: string;
}

export interface ProceduralTerrainZoneOptions {
    width: number;
    height: number;
    variability: number;
    seed: string;
    collision: boolean;
    depth: number;
}

export interface ProceduralTerrainZoneInstructionOptions {
    terrain: string;
    weight: number;
    constraint1: "none" | "above" | "below" | "left" | "right" | "betweenHorizontal" | "betweenVertical";
    constraint1Column: number;
    constraint1Row: number;
    constraint1Column1: number;
    constraint1Column2: number;
    constraint1Row1: number;
    constraint1Row2: number;
    constraint2: "none" | "above" | "below" | "left" | "right" | "betweenHorizontal" | "betweenVertical";
    constraint2Column: number;
    constraint2Row: number;
    constraint2Column1: number;
    constraint2Column2: number;
    constraint2Row1: number;
    constraint2Row2: number;
}

export interface PropOptions {
    propId: string;
    shadowsEnabled: boolean;
    shadowsPlacement: "Floor" | "Beneath Prop";
    UseColliders: boolean;
    Scale: number;
    Angle: number;
    Tint: string;
    FlipX: boolean;
    Alpha: number;
    visibleOnGameStart: boolean;
    scope: Scope;
    showWhenReceivingFrom: string;
    hideWhenReceivingFrom: string;
    canBeDamaged: boolean;
    infiniteHealth: boolean;
    health: number;
    onDestroyedChannel: string;
    useAdaptiveHealth: boolean;
    adaptiveHealthPerPlayer: number;
    grantItemWhenDamaged: boolean;
    itemToGrant: string;
    amountOfItem: number;
    healthbar: "Off" | "On" | "When Hit";
    healAmount: number;
    healWhenReceivingFrom: string;
    healWhenDestroyed: boolean;
    healAfterTime: number;
    safeTeamId: string;
}

export interface PropertyOptions {
    propertyName: string;
    valueType: "string" | "number" | "boolean";
    defaultValueText: string;
    defaultValueNumber: number;
    defaultValueBoolean: boolean;
    propertyType: Scope;
    whenValueChangesBroadcastOnChannel: string;
    broadcastValueChangesOnGameStart: boolean;
}

export interface QuestionerOptions {
    kitId: string;
    whenAnsweredCorrectlyTransmitOn: string;
    whenAnsweredIncorrectlyTransmitOn: string;
    openWhenReceivingOn: string;
    closable: boolean;
    textShownWhenAnsweringCorrectly: string;
    textShownWhenAnsweringIncorrectly: string;
    textShownWhenAnsweringScope: Scope;
    closeWhenReceivingOn: string;
    enableWhenReceivingOn: string;
    disableWhenReceivingOn: string;
    whenOpenedChannel: string;
    whenClosedChannel: string;
    sound: "none" | "default" | "gimkitLive" | "advanced";
    correctSound: "none" | "default" | "gimkitLive";
    incorrectSound: "none" | "default" | "gimkitLive";
    actionSound: "none" | "default" | "gimkitLive";
    useCustomAction: boolean;
    customActionText: string;
    channelToTriggerCustomAction: string;
    size: number;
}

export interface RelayOptions {
    relayAs: "All Players" | "All Other Players" | "All Players On My Team" | "Random Player" | "All Players On Team..." | "Random Player On Team" | "Single Player On Each Team";
    team: string;
    channelToTrigger: string;
    triggerWhenReceivingOnChannel: string;
}

export interface RepeaterOptions {
    startChannel: string;
    actionChannel: string;
    repeatInterval: number;
    stopRepeatingStrategy: "time" | "numberOfRepetitions" | "channel";
    timePeriod: number;
    numberOfRepetitions: number;
    stopChannel: string;
    maxConcurrentTasksPerPlayer: number;
    triggerTaskOnStart: boolean;
}

export interface RespawnOptions {
    respawnOnChannel: string;
}

export interface ScorebarOptions {
    numberOfTeams: number;
    useTeamSettingsDeviceForColors: boolean;
    team1: string;
    colorTeam1: string;
    team2: string;
    colorTeam2: string;
    team3: string;
    colorTeam3: string;
    team4: string;
    colorTeam4: string;
}

export interface SentryOptions {
    weapon: string;
    aimAccuracy: number;
    fireRate: number;
    isDynamic: boolean;
    damageMultiplier: number;
    scale: number;
    intention: "normal" | "destroy";
    intentionMetadata: string;
    runsFromObstacles: boolean;
    speed: number;
    baseHealth: number;
    baseShield: number;
    showHealthBar: boolean;
    useAdaptiveHealth: boolean;
    adaptiveHealth: number;
    adaptiveShield: number;
    skinId: string;
    team: string;
    doesRespawn: boolean;
    respawnDurationSeconds: number;
    characterName: string;
    rangeRadius: number;
    dropItem: boolean;
    itemId: string;
    itemAmount: number;
    onKnockoutChannel: string;
    activeOnGameStart: boolean;
    activateChannel: string;
    deactivateChannel: string;
}

export interface ShadowOptions {
    width: number;
    height: number;
}

export interface SoundEffectOptions {
    audioUrl: string;
    volume: number;
    playWhenReceivingFrom: string;
    characterType: "all" | "gameOwner";
}

export interface SpawnPadOptions {
    visibleInGame: boolean;
    phase: "All" | "Game" | "Pre-Game";
    teamId: string;
    characterType: "all" | "gameOwner" | "nonGameOwner";
}

export interface SpeedModifierOptions {
    speed: number;
    activateWhenReceivingFrom: string;
}

export interface StartingInventoryOptions {
    itemId: string;
    itemAmount: number;
    equipOnGrant: boolean;
    grantDuringPhase: "all" | "game" | "preGame";
    grantForSavedCharacters: boolean;
    enabled: boolean;
}

export interface TagZoneOptions {
    taggingTeam: string;
    whenTaggedTransmitOn: string;
    whenTagsTransmitOn: string;
    respawnWhenTagged: boolean;
    detectionArea: "everywhere" | "zone";
    detectionDistance: number;
    activeOnGameStart: boolean;
    activateWhenReceivingFrom: string;
    deactivateWhenReceivingFrom: string;
    width: number;
    height: number;
}

export interface TeamColorTilesManagerOptions {
    updateProperty: boolean;
    property: string;
}

export interface TeamSettingsOptions {
    team: string;
    teamName: string;
    whenPlayerJoinsTransmitOn: string;
    maxPlayers: number;
    placementPriorityOnGameStart: number;
    placementPriorityDuringGame: number;
    allowCustomHostPlacement: boolean;
    color: string;
}

export interface TeamSwitcherOptions {
    switchToStrategy: "randomTeam" | "specificTeam";
    specificTeam: string;
    switchChannel: string;
}

export interface TeleporterOptions {
    group: string;
    targetGroup: string;
    whenTeleportedHereChannel: string;
    teleportToOnChannel: string;
    teleportToTargetChannel: string;
    visibleInGame: boolean;
}

export interface TextOptions {
    text: string;
    fontSize: number;
    scope: Scope;
    googleFont: "Rubik" | "Roboto" | "Staatliches" | "Galindo" | "Kalam" | "Bangers" | "Fugaz One" | "Outfit" | "PT Mono" | "Space Grotesk" | "Lobster" | "Zeyada" | "Titan One" | "Rye" | "Caprasimo";
    color: string;
    alpha: number;
    strokeThickness: number;
    strokeColor: string;
    rotation: number;
    visibleOnGameStart: "Yes" | "No";
    showWhenReceivingFrom: string;
    hideWhenReceivingFrom: string;
}

export interface TriggerOptions {
    channelToTrigger: string;
    triggerWhenReceivingOnChannel: string;
    triggerDelay: number;
    visibleInGame: boolean;
    team: string;
    maxTriggers: number;
    scope: Scope;
    allowedModeType: "all" | "liveGame" | "assignment";
    activeOnGameStart: boolean;
    activateChannel: string;
    deactivateChannel: string;
    activeScope: Scope;
    triggeredByPlayerCollision: boolean;
}

export interface VendingMachineOptions {
    grantAction: "Grant Item" | "Broadcast On Channel";
    requiredItemId: string;
    amountOfRequiredItem: number;
    grantedItemId: string;
    amountOfGrantedItem: number;
    purchaseChannel: string;
    visibleInGame: boolean;
    grantedItemImageUrl: string;
    grantedItemName: string;
    grantedItemDescription: string;
    deactivateOnPurchase: boolean;
    useAdaptiveCost: boolean;
    adaptiveCostIncreasePerPlayer: number;
    allowFunding: boolean;
    fundingScope: Scope;
    useLimitedStock: boolean;
    maxStock: number;
    maxStockScope: Scope;
    attachCostToNameWhenHidden: boolean;
    activeOnStart: boolean;
    activeScope: Scope;
    activateChannel: string;
    deactivateChannel: string;
    allowedPurchaseTeam: string;
    attemptToPurchaseChannel: string;
    onAttemptedPurchaseFailedChannel: string;
    interactionDuration: number;
    matchItemRarity: boolean;
    backgroundColor1: string;
    backgroundColor2: string;
    raysColor: string;
    numberOfRays: number;
    raysWidthFactor: number;
    raysAlpha: number;
    raysAdditive: boolean;
    soundEnabled: boolean;
    showShadow: boolean;
    width: number;
    height: number;
    radius: number;
}

export interface VoiceLineOptions {
    playBehavior: "interrupt" | "queue" | "cancel";
    volume: number;
    playChance: number;
    audioUrl1: string;
    audioUrl2: string;
    audioUrl3: string;
    audioUrl4: string;
    audioUrl5: string;
    audioUrl6: string;
    audioUrl7: string;
    audioUrl8: string;
    activeOnGameStart: boolean;
    playWhenReceivingOnChannel: string;
}

export interface WaypointOptions {
    target: "deviceLocation" | "player" | "flag" | "ball";
    flagColor: "black" | "blue" | "green" | "orange" | "purple" | "red" | "white";
    ballId: string;
    name: string;
    useDeactivateWithinRange: boolean;
    deactivateWithinRange: number;
    startFollowingPlayer: string;
    stopFollowingPlayer: string;
    hideWhenFlagIsInBase: boolean;
    activeOnGameStart: boolean;
    color: string;
    activateChannel: string;
    deactivateChannel: string;
    scope: Scope;
}

export interface WireRepeaterOptions {
    delaySeconds: number;
    team: string;
}

export interface XPGranterOptions {
    amount: number;
    reason: string;
    grantOnChannel: string;
    useIncrementalGrant: boolean;
    incrementalGrantCharacterRequirement: number;
    useMinimumCharacterCount: boolean;
    minimumCharacterCount: number;
}

export interface ZombieDesignerOptions {
    type: string;
    skinId: string;
    weapon: string;
    aimAccuracy: number;
    fireRate: number;
    damageMultiplier: number;
    scale: number;
    randomScaleAddition: number;
    intention: "normal" | "destroy";
    intentionMetadata: string;
    runsFromObstacles: boolean;
    speed: number;
    baseHealth: number;
    baseShield: number;
    showHealthBar: boolean;
    useAdaptiveHealth: boolean;
    adaptiveHealth: number;
    adaptiveShield: number;
    team: string;
    doesRespawn: boolean;
    respawnDurationSeconds: number;
    characterName: string;
    rangeRadius: number;
    dropItem: boolean;
    itemId: string;
    itemAmount: number;
    onKnockoutChannel: string;
    minimumWave: number;
    maximumWave: number;
    defaultWeight: number;
    splits: boolean;
    splitsAmount: number;
    splitsType: string;
    powerScore: number;
}

export interface ZombieInvasionOptions {
    startNewWaveChannel: string;
    onWaveEndChannel: string;
    waveDuration: number;
    powerScore: number;
    powerScoreIncreasePerWave: number;
    powerScoreIncreaseAdditionPerPlayer: number;
    powerScoreIncreaseAdditionPerWavePerPlayer: number;
    globalHealthPercentageIncreasePerPlayer: number;
    globalDamagePercentageIncreasePerPlayer: number;
    targetDeviceId: string;
    targetRadius: number;
}

export interface ZombieSpawnZoneOptions {
    activeOnStart: boolean;
    activateChannel: string;
    deactivateChannel: string;
    width: number;
    height: number;
    rotation: number;
}

export interface ZombieWaveDesignerOptions {
    waveNumber: number;
    waveDuration: number;
    powerScore: number;
    powerScoreAdditionPerPlayer: number;
}

export interface ZoneOptions {
    playerEntersChannel: string;
    playerLeavesChannel: string;
    allowWeaponFire: boolean;
    shape: "rectangle" | "circle";
    visibleInGame: boolean;
    color: string;
    activeOnStart: boolean;
    activateChannel: string;
    deactivateChannel: string;
    allowWeaponDrop: "Do Not Override" | "Yes" | "No";
    allowItemDrop: "Do Not Override" | "Yes" | "No";
    allowResourceDrop: "Do Not Override" | "Yes" | "No";
    droppedItemDecayEnabled: boolean;
    droppedItemDecay: number;
    width: number;
    height: number;
    radius: number;
    rotation: number;
}