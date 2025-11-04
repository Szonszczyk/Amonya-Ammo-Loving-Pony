import { ItemBaseClassMap } from "../references/itemBaseClasses";
//#region Barter
export const QuestBarter: {[barterName: string]: string[]} =
{
    Junk: [
		"573475fb24597737fb1379e1", // Apollo Soyuz cigarettes
		"6389c6463485cf0eeb260715", // Pack of Arseniy buckwheat
		"5e2af51086f7746d3f3c3402", // UZRGM grenade fuze
		"5c1265fc86f7743f896a21c2", // Broken GPhone X smartphone
		"5d1b309586f77425227d1676", // Broken LCD
		"6389c70ca33d8c4cdf4932c6", // Electronic components
		"5672cb724bdc2dc2088b456b", // Geiger-Muller counter
		"57347baf24597738002c6178", // RAM stick
		"590a3d9c86f774385926e510", // Ultraviolet lamp
		"5672cb124bdc2d1a0f8b4568", // AA Battery
		"5909e99886f7740c983b9984", // USB Adapter
		"5672cb304bdc2dc2088b456a", // D Size battery
		"5af0561e86f7745f5f3ad6ac", // Portable Powerbank
		"56742c2e4bdc2d95058b456d", // Zibbo lighter
		"5d1b31ce86f7742523398394", // Round pliers
		"590c2d8786f774245b1f03f3", // Screwdriver
		"590c2b4386f77425357b6123", // Pliers
		"5d40425986f7743185265461", // Nippers
		"5d4042a986f7743185265463", // Flat screwdriver (Long)
		"5d63d33b86f7746ea9275524", // Flat screwdriver
		"62a0a098de7ac8199358053b", // Awl
		"5d1b3f2d86f774253763b735", // Disposable syringe
		"59e361e886f774176c10a2a5", // Bottle of hydrogen peroxide
		"6389c6c7dbfd5e4b95197e68", // Aquapeps water purification tablets
		"5c13cef886f774072e618e82", // Toilet paper
		"5d40412b86f7743cb332ac3a", // Schaman shampoo
		"5e2aef7986f7746d3f3c33f5", // Repellent
        "59e3596386f774176c10a2a2", // PAID AntiRoach spray
        "5e2af02c86f7746d420957d4", // Pack of chlorine
		"59e3556c86f7741776641ac2", // Ox bleach
		"5d4041f086f7743cac3f22a7", // Ortodontox toothpaste
		"59e358a886f7741776641ac3"  // Clin window cleaner
	],
	Antique: [
		"590de71386f774347051a052", // Antique teapot
		"590de7e986f7741b096e5f32", // Antique vase
        "62a091170b9d3c46de5b6cf2", // Axel parrot
        "5bc9c049d4351e44f824d360", // Antique book
        "59e3639286f7741777737013", // Bronze lion
        "59e3658a86f7741776641ac4", // Cat figurine
        "5e54f62086f774219b0f1937", // Raven figurine
        "5bc9c377d4351e3bac12251b", // Old firesteel
        "5c1267ee86f77416ec610f72", // Prokill medallion
        "5bc9c1e2d4351e00367fbcf0"  // Antique axe
	],
	Valuables: [
		"62a09cfe4f842e1bd12da3e4", // Golden egg
		"5bc9bc53d4351e00367fbcee", // Golden rooster
		"5f745ee30acaeb0d490d8c5b", // Veritas
		"6389c88b33a719183c7f63b6", // Ultralink Satellite Internet Station
		"5d235a5986f77443f6329bc6", // Gold skull ring
		"5bc9bdb8d4351e003562b8a1", // Silver Badge
		"59faf7ca86f7740dbe19f6c2", // Roler Submariner gold wrist watch
		"66b37ea4c5d72b0277488439", // Tamatthi kunai knife replica
		"66b37eb4acff495a29492407"  // Viibiin sneaker
	],
	Coins: [
        "5d235b4d86f7742e017bc88a" // GP coin
	],
	Horses: [
		"573478bc24597738002c6175", // Horse figurine
		"60b0f7057897d47c5b04ab94"  // Loot Lord plushie
	],
	Gunpowder: [
		"590c5a7286f7747884343aea", // Gunpowder "Kite"
        "5d6fc78386f77449d825f9dc", // Gunpowder "Eagle"
        "5d6fc87386f77449db3db94e"  // Gunpowder "Hawk"
	],
	Figurines: [
        "655c652d60d0ac437100fed7", // BEAR operative figurine
        "655c669103999d3c810c025b", // Cultist figurine
        "655c67ab0d37ca5135388f4b", // Ded Moroz figurine
        "655c66e40b2de553b618d4b8", // Politician Mutkevich figurine
        "655c67782a1356436041c9c5", // Ryzhy figurine
        "655c673673a43e23e857aebd", // Scav figurine
        "655c663a6689c676ce57af85", // USEC operative figurine
		"66572b8d80b1cd4b6a67847f", // Den figurine
		"66572c82ad599021091c6118", // Killa figurine
		"66572be36a723f7f005a066e", // Reshala figurine
		"66572cbdad599021091c611a"  // Tagilla figurine
	],
	Roubles: [
		"5449016a4bdc2d6f028b456f"
	]
}

export const BossesNames: string[] = [
	"bossKilla",
	"bossTagilla",
	"bossBully",
	"bossKojaniy",
	"bossGluhar",
	"bossSanitar",
	"bossKnight",
	"followerBigPipe",
	"followerBirdEye",
	"bossBoar",
	"bossKolontay",
	"bosszryachiy",
	"bosspartisan"
]

//#region CaliberInfo

export const weaponCategoriesAllowed: string[] = [
	ItemBaseClassMap["ASSAULT_CARBINE"],
	ItemBaseClassMap["ASSAULT_RIFLE"],
	ItemBaseClassMap["GRENADE_LAUNCHER"],
	ItemBaseClassMap["HANDGUN"],
	ItemBaseClassMap["MACHINEGUN"],
	ItemBaseClassMap["MARKSMAN_RIFLE"],
	ItemBaseClassMap["SHOTGUN"],
	ItemBaseClassMap["SNIPER_RIFLE"],
	ItemBaseClassMap["REVOLVER"],
	ItemBaseClassMap["SMG"]
];

export const weaponCategoriesNames: {[key:string]: string} = {
	[ItemBaseClassMap["ASSAULT_CARBINE"]]: "Assault carbines",
	[ItemBaseClassMap["ASSAULT_RIFLE"]]: "Assault rifles",
	[ItemBaseClassMap["SNIPER_RIFLE"]]: "Bolt-action rifles",
	[ItemBaseClassMap["MARKSMAN_RIFLE"]]: "DMRs",
	[ItemBaseClassMap["MACHINEGUN"]]: "LMGs",
	[ItemBaseClassMap["SMG"]]: "SMGs",
	[ItemBaseClassMap["HANDGUN"]]: "Pistols",
	[ItemBaseClassMap["SHOTGUN"]]: "Shotguns",
	[ItemBaseClassMap["REVOLVER"]]: "Revolvers",
	[ItemBaseClassMap["GRENADE_LAUNCHER"]]: "Grenade launchers"
};

export const allCategoriesNames = Object.values(weaponCategoriesNames);

export interface CaliberInfoStruct
{
    [caliberName: string]: {
        name: string;
        id: string;
        shortName: string;
    }
}

export function findCaliberWithID(
    obj: CaliberInfoStruct,
    searchString: string
): { key: string; data: { name: string; id: string; shortName: string } } | null {
    for (const [key, data] of Object.entries(obj)) {
        if (data.id === searchString) {
            return { key, data };
        }
    }
    return null;
}
//#region Weapons
export const copiesExceptions: string[] = [
	"Makarov PM (t) 9x18PM pistol",
	"HK MP5 9x19 submachine gun (Navy 3 Round Burst)",
	"Mosin 7.62x54R bolt-action rifle (Sniper)",
	"Mosin 7.62x54R bolt-action rifle (Infantry)"
];

export const weaponsExceptions: string[] = [
	"5ae083b25acfc4001a5fc702",
	"657857faeff4c850222dff1b",
	"639c3fbbd0446708ee622ee9"
]; 

export const calibersAllowed: string[] = [
	"Caliber556x45NATO",
	"Caliber9x18PM",
	"Caliber12g",
	"Caliber762x54R",
	"Caliber545x39",
	"Caliber9x19PARA",
	"Caliber762x25TT",
	"Caliber762x39",
	"Caliber9x39",
	"Caliber9x18PMM",
	"Caliber762x51",
	"Caliber366TKM",
	"Caliber9x21",
	"Caliber20g",
	"Caliber46x30",
	"Caliber127x55",
	"Caliber57x28",
	"Caliber1143x23ACP",
	"Caliber40x46",
	"Caliber23x75",
	"Caliber762x35",
	"Caliber86x70",
	"Caliber9x33R",
	"Caliber68x51",
	"Caliber127x33",
	"Caliber127x108",
	"Caliber127x99"
];

export interface weaponsDatabase
{
	[weaponID: string]: {
		id: string,
		name: string;
		shortName: string;
		caliber: string;
		category: string;
		copies: string[];
	}
}

export interface weaponsPerCategory
{
	[calibersAllowed: string]: {
		[category: string]: {
			names: string[];
			ids: string[];
		}
	}
}

export interface keyedStringArrays
{
	[key: string]: string[]
}


//#region Quests

export interface questConfig
{
	ammoIDs: string,
	Unlocks: string[],
	Image: string,
	Lore: string,
	Difficulty: string,
	Category: string,
	TraderNeeded: number,
	oldID: string,
	QuestForStart: string,
	fromMod: string
}

export interface Quest
{
	_id: string,
	acceptPlayerMessage: string,
	canShowNotificationsInGame: boolean,
	changeQuestMessageText: string,
	completePlayerMessage: string,
	conditions: {
		AvailableForFinish: (AFFKill | AFFBarter)[],
		AvailableForStart: AFS[],
		Fail: [],
	},
	declinePlayerMessage: string,
	description: string,
	failMessageText: string,
	image: string,
	instantComplete: boolean,
	isKey: boolean,
	location: string,
	name: string,
	note: string,
	restartable: boolean,
	rewards: {
		Fail: [],
		Started: Reward[],
		Success: Reward[]
	},
	secretQuest: boolean,
	side: string,
	startedMessageText: string,
	successMessageText: string,
	traderId: string,
	type: string,
}

export interface Reward
{
	findInRaid?: boolean,
	id: string,
	index: number,
	items?: [{
		_id: string,
		_tpl: string,
		upd?: {
			StackObjectsCount: number
		}
	}],
	loyaltyLevel?: number,
	target?: string,
	traderId?: string,
	type: string,
	value?: string
}

export interface AFS
{
	availableAfter?: number,
	compareMethod?: string,
	conditionType: string,
	dispersion?: number,
	dynamicLocale: boolean,
	globalQuestCounterId: string,
	id: string,
	index: number,
	parentId: string,
	target: string,
	status?: number[]
	value?: string,
	visibilityConditions: string[]
}

export interface AFFKill
{
	completeInSeconds: number,
	conditionType: string,
	counter: {
		conditions: [{
			bodyPart: string[],
			compareMethod: string,
			conditionType: string,
			daytime: {
				from: number,
				to: number
			},
			distance: {
				compareMethod: string,
				value: number
			},
			dynamicLocale: boolean,
			enemyEquipmentExclusive: string[],
			enemyEquipmentInclusive: string[],
			enemyHealthEffects: string[],
			id: string,
			resetOnSessionEnd: boolean,
			savageRole: string[],
			target: string,
			value: number,
			weapon: string[],
			weaponCaliber: string[],
			weaponModsExclusive: string[],
			weaponModsInclusive: string[]
		}],
		id: string
    },
    doNotResetIfCounterCompleted: boolean,
    dynamicLocale: boolean,
    globalQuestCounterId: string,
    id: string,
    index: number,
    oneSessionOnly: boolean,
    parentId: string,
    type: string,
    value: number,
    visibilityConditions: visibilityCondition[]
}

export const defaultAFFKill: AFFKill = {
	"completeInSeconds": 0,
	"conditionType": "CounterCreator",
	"counter": {
		"conditions": [{
			"bodyPart": [],
			"compareMethod": ">=",
			"conditionType": "Kills",
			"daytime": {
				"from": 0,
				"to": 0
			},
			"distance": {
				"compareMethod": ">=",
				"value": 0
			},
			"dynamicLocale": false,
			"enemyEquipmentExclusive": [],
			"enemyEquipmentInclusive": [],
			"enemyHealthEffects": [],
			"id": "",
			"resetOnSessionEnd": false,
			"savageRole": [],
			"target": "Any",
			"value": 1,
			"weapon": [],
			"weaponCaliber": [],
			"weaponModsExclusive": [],
			"weaponModsInclusive": []
		}],
		"id": ""
	},
	"doNotResetIfCounterCompleted": false,
	"dynamicLocale": false,
	"globalQuestCounterId": "",
	"id": "",
	"index": 0,
	"oneSessionOnly": false,
	"parentId": "",
	"type": "Elimination",
	"value": 0,
	"visibilityConditions": []
};


export interface AFFBarter
{
	conditionType: string,
	dogtagLevel: number,
	dynamicLocale: boolean,
	globalQuestCounterId: string,
	id: string,
	index: number,
	isEncoded: boolean,
	maxDurability: number,
	minDurability: number,
	onlyFoundInRaid: boolean,
	parentId: string,
	target: string[],
	value: number,
	visibilityConditions: visibilityCondition[]
}

export interface visibilityCondition
{
	conditionType: string,
	id: string,
	target: string
}

export interface questAssort
{
	started: {[key: string]: string},
	success: {[key: string]: string},
	fail: {[key: string]: string}
}

export interface ammoInfo
{
	[key: string]: {
		Name: string,
		ShortName: string,
		ID: string,
		Caliber: string,
		Price: number,
		DMG: (string | number),
		PEN: number
	}
}