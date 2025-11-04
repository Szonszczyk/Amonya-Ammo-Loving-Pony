import * as fs from "fs";
import * as path from "path";

import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { ITraderAssort } from "@spt/models/eft/common/tables/ITrader";

import difficultyDatabase from "../db/QuestsData/difficultyDatabase.json";

import { WTTInstanceManager } from "./WTTInstanceManager";
import { LocaleHelper } from "./LocaleHelper";
import { WeaponLoader } from "./WeaponLoader";
import { BulletGeneration } from "./BulletGeneration";
import { CustomItemService } from "./CustomItemService";
import { ModConfig } from "./references/configConsts";
import {
    QuestBarter, BossesNames,
    Quest, questConfig, Reward,
    AFS, defaultAFFKill, AFFBarter,
    visibilityCondition, questAssort
} from "./references/questDatabases";

export class QuestGenerator
{
    private Instance: WTTInstanceManager;
    private config: ModConfig;
    private traderID: string;
    private localeHelper: LocaleHelper = new LocaleHelper();
    private weaponLoader: WeaponLoader = new WeaponLoader();
    private bulletGeneration: BulletGeneration = new BulletGeneration();
    private customItemService: CustomItemService = new CustomItemService();
    public questAssort: questAssort = { "started": {}, "success": {}, "fail": {} };
    public assortDB: ITraderAssort = { "items": [], "barter_scheme": {}, "loyal_level_items": {} };

    private idDatabase: Record<string, string> = {};
    private saveIdDatabase: boolean = false;
    
    public preSptLoad(Instance: WTTInstanceManager, config: ModConfig, traderID: string): void
    {
        this.Instance = Instance;
        this.config = config;
        this.traderID = traderID;
        this.weaponLoader.preSptLoad(this.Instance, this.config);
        this.localeHelper.preSptLoad(this.Instance, this.config);
        this.bulletGeneration.preSptLoad(this.Instance, this.config);
        this.customItemService.preSptLoad(this.Instance, this.config);
    }
    public postDBLoad(): void
    {
        this.weaponLoader.postDBLoad();
        this.localeHelper.ammoDatabaseMaker();
        const { generatedItems, quests } = this.bulletGeneration.generateBullets(this.weaponLoader.weaponsOnlyPerCaliberAndCategory, this.localeHelper.ammoDatabase);
        this.customItemService.addGeneratedItemsToDatabase(generatedItems);
        this.localeHelper.addGeneratedBullets(generatedItems);
        this.idDatabase = this.Instance.helpers.dbQuestIds
        this.startGeneratingQuests(quests);
    }

    public addOtherItems(): void
    {
        this.customItemService.addOtherItemsToDatabase();
    }

    private startGeneratingQuests(
        quests: Record<string, string[]>
    ): void {
        const modList =  Object.values(this.Instance.PreSptModLoader.getImportedModDetails()).map(item => item.name);
        const questDatabase: questConfig = this.Instance.helpers.dbQuests;
        const allQuests: {[key: string]: Quest} = {};
        const caliberWeapons = this.weaponLoader.weaponsPerCaliber;
        //fs.writeFileSync(path.join(__dirname, "../db/Cache/caliberWeapons.json"), JSON.stringify(caliberWeapons, null, 2)); 
        const categoryWeapons = this.weaponLoader.weaponsBasedOnCaliberAndCategory;
        //fs.writeFileSync(path.join(__dirname, "../db/Cache/categoryWeapons.json"), JSON.stringify(categoryWeapons, null, 2)); 
        const weapons = this.weaponLoader.weapons;
        //fs.writeFileSync(path.join(__dirname, "../db/Cache/weapons.json"), JSON.stringify(weapons, null, 2)); 
        this.localeHelper.createDescriptionsForWeaponsUsedInKillCondition(categoryWeapons, weapons);
        for (const questID in questDatabase) {
            const questConfig: questConfig = questDatabase[questID];
            if (questConfig.fromMod && !modList.includes(questConfig.fromMod)) continue;
            
            const oldID = questConfig.oldID;
            const difficulty = difficultyDatabase[questConfig.Difficulty];
            const quest = this.questTemplate(questID, questConfig.Image);
            if (quests[questConfig.oldID]) questConfig.Unlocks = questConfig.Unlocks.concat(quests[questConfig.oldID]);
            this.localeHelper.initialLocale(questID, questConfig, this.Instance.helpers.dbCalibers[questConfig.ammoIDs], difficulty);
            for (const unlock of questConfig.Unlocks) {
                const amountOfAmmo = questConfig.Category === "Assault" ? 200 : (questConfig.Category === "Shotgun" ? 80 : (questConfig.Category === "Pistol" ? 400 : 5));
                this.addReward("Started", unlock, Math.ceil(amountOfAmmo / questConfig.Unlocks.length), quest, questConfig);
                this.addAssortmentUnlock(unlock, quest, questConfig);
                this.questAssort.success[this.resolveHash(`QUESTASSORT${unlock}`)] = questID;
            }
            // add Success rewards
            for (const reward in difficulty.Rewards) {
                const amount = difficulty.Rewards[reward];
                switch(reward) {
                    case "MagicAmmoT1":
                    case "MagicAmmoT2":
                    case "MagicAmmoT3":
                        const magicAmmoIds = {
                            "MagicAmmoT1": "5a583d99d3cdfb3fd289b883",
                            "MagicAmmoT2": "5a583d99d3cdfb3fd289b882",
                            "MagicAmmoT3": "5a583d99d3cdfb3fd289b881"
                        }
                        this.addReward("Success", magicAmmoIds[reward], Number(amount), quest, questConfig);
                    break;
                    case "Experience":
                    case "TraderStanding":
                        const Reward: Reward = {
                            "id": this.resolveHash(`${oldID}SUCCESSREWARD${reward}`),
                            "index": quest.rewards.Success.length,
                            "type": reward,
                            "value": amount
                        };
                        if (reward === "TraderStanding") {
                            Reward.target = this.traderID;
                        }
                        quest.rewards.Success.push(Reward);
                    break;
                }
            }

            if (questConfig.TraderNeeded > 1) {
                const AFSTraderNeeded: AFS = {
                    "compareMethod": ">=",
                    "conditionType": "TraderLoyalty",
                    "dynamicLocale": false,
                    "globalQuestCounterId": "",
                    "id": this.resolveHash(`${oldID}AFSTraderNeeded`),
                    "index": quest.conditions.AvailableForStart.length,
                    "parentId": "",
                    "target": this.traderID,
                    "value": questConfig.TraderNeeded,
                    "visibilityConditions": []
                };
                quest.conditions.AvailableForStart.push(AFSTraderNeeded);
            }
            if (questConfig.QuestForStart) {
                const AFSQuestForStart: AFS = {
                    "availableAfter": 0,
                    "conditionType": "Quest",
                    "dispersion": 0,
                    "dynamicLocale": false,
                    "globalQuestCounterId": "",
                    "id": this.resolveHash(`${oldID}AFSQuestForStart`),
                    "index": quest.conditions.AvailableForStart.length,
                    "parentId": "",
                    "status": [ 4, 5 ],
                    "target": questConfig.QuestForStart,
                    "visibilityConditions": []
                }
                quest.conditions.AvailableForStart.push(AFSQuestForStart);
            }

            const visibilityConditionsIds: string[] = [];

            for (const AFF in difficulty) {
                const AFFValue = difficulty[AFF];
                switch(AFF) {
                    case "Kills":
                    case "Boss":
                    case "PMC":
                        const AFFKillCondition = structuredClone(defaultAFFKill);
                        AFFKillCondition.counter.conditions[0].id = this.resolveHash(`${oldID}AFFKillCondition${AFF}1`);
                        if (questConfig.ammoIDs) AFFKillCondition.counter.conditions[0].weapon = caliberWeapons[questConfig.ammoIDs];
                        AFFKillCondition.counter.id = this.resolveHash(`${oldID}AFFKillCondition${AFF}2`);
                        AFFKillCondition.id = this.resolveHash(`${oldID}AFFKillCondition${AFF}3`);
                        AFFKillCondition.index = quest.conditions.AvailableForFinish.length;
                        AFFKillCondition.value = AFFValue;
                        if (AFF == "Boss") {
                            AFFKillCondition.counter.conditions[0].target = "Savage";
                            AFFKillCondition.counter.conditions[0].savageRole = BossesNames;
                        }
                        if (AFF == "PMC") {
                            AFFKillCondition.counter.conditions[0].target = "AnyPmc";
                        }
                        visibilityConditionsIds.push(AFFKillCondition.id);
                        quest.conditions.AvailableForFinish.push(AFFKillCondition);
                        this.localeHelper.addToLocale(AFFKillCondition.id, `Get ${AFFValue} ${AFF == "Kills" ? "" : `${AFF} `}kills${questConfig.ammoIDs ? ` using '${this.Instance.helpers.dbCalibers[questConfig.ammoIDs].name}' caliber weapons` : ""}`);
                    break;
                    case "Mastery":
                        const totalCount = Object.values(categoryWeapons[questConfig.ammoIDs]).reduce((sum, arr) => sum + arr.ids.length, 0);
                        for (const categoryName in categoryWeapons[questConfig.ammoIDs]) {
                            const category = categoryWeapons[questConfig.ammoIDs][categoryName];
                            const AFFKillCondition = structuredClone(defaultAFFKill);
                            AFFKillCondition.counter.conditions[0].id = this.resolveHash(`${oldID}AFFKillCondition${AFF}${categoryName}1`);
                            AFFKillCondition.counter.conditions[0].weapon = category.ids;
                            AFFKillCondition.counter.id = this.resolveHash(`${oldID}AFFKillCondition${AFF}${categoryName}2`);
                            AFFKillCondition.id = this.resolveHash(`${oldID}AFFKillCondition${AFF}${categoryName}3`);
                            AFFKillCondition.index = quest.conditions.AvailableForFinish.length;
                            AFFKillCondition.value = Math.ceil((category.ids.length / totalCount) * AFFValue);
                            visibilityConditionsIds.push(AFFKillCondition.id);
                            quest.conditions.AvailableForFinish.push(AFFKillCondition);
                            this.localeHelper.addToLocale(AFFKillCondition.id, `Get ${AFFKillCondition.value} kills using weapon category '${categoryName}'`);
                        }
                    break;
                    case "Collector":
                        const weaponsForCollector = Object.values(weapons).filter(weapon => weapon.caliber === questConfig.ammoIDs);
                        for (const weapon of weaponsForCollector) {
                            const AFFKillCondition = structuredClone(defaultAFFKill);
                            AFFKillCondition.counter.conditions[0].id = this.resolveHash(`${oldID}AFFKillCondition${AFF}${weapon.id}1`);
                            AFFKillCondition.counter.conditions[0].weapon = weapon.copies.concat(weapon.id);
                            AFFKillCondition.counter.id = this.resolveHash(`${oldID}AFFKillCondition${AFF}${weapon.id}2`);
                            AFFKillCondition.id = this.resolveHash(`${oldID}AFFKillCondition${AFF}${weapon.id}3`);
                            AFFKillCondition.index = quest.conditions.AvailableForFinish.length;
                            AFFKillCondition.value = Math.ceil((1 / weaponsForCollector.length) * AFFValue);
                            visibilityConditionsIds.push(AFFKillCondition.id);
                            quest.conditions.AvailableForFinish.push(AFFKillCondition);
                            this.localeHelper.addToLocale(AFFKillCondition.id, `Get ${AFFKillCondition.value} kills using weapon '${weapon.name}'`);
                        }
                    break;
                    case "Roubles":
                    case "Antique":
                    case "Valuables":
                    case "Coins":
                    case "Junk":
                    case "Horses":
                    case "Gunpowder":
                    case "Figurines":
                        const AFFBarterCondition: AFFBarter = {
                            "conditionType": "HandoverItem",
                            "dogtagLevel": 0,
                            "dynamicLocale": false,
                            "globalQuestCounterId": "",
                            "id": this.resolveHash(`${oldID}AFFBarterCondition${AFF}`),
                            "index": quest.conditions.AvailableForFinish.length,
                            "isEncoded": false,
                            "maxDurability": 100,
                            "minDurability": 0,
                            "onlyFoundInRaid": ["Roubles", "Coins"].includes(AFF) ? false : true,
                            "parentId": "",
                            "target": QuestBarter[AFF],
                            "value": AFFValue,
                            "visibilityConditions": this.createVisibilityConditions(visibilityConditionsIds, oldID, AFF)
                        };
                        quest.conditions.AvailableForFinish.push(AFFBarterCondition);
                        this.localeHelper.addToLocale(AFFBarterCondition.id, `Handover ${AFFValue} ${AFF == "Roubles" ? "roubles" : `${AFF} items`}`);
                    break;
                }
            }
            allQuests[questID] = quest;
        }
        
        for (const ammoID in this.localeHelper.ammoDatabase) {
            const ammo = this.localeHelper.ammoDatabase[ammoID];
            const id = this.resolveHash(`QUESTASSORT${ammoID}`);
            this.assortDB.items.push({
                "_id": id,
                "_tpl": ammoID,
                "parentId": "hideout",
                "slotId": "hideout",
                "upd": {
                    "UnlimitedCount": this.config.ammoPrice.unlimitedCount,
                    "StackObjectsCount": this.config.ammoPrice.max
                }
            });
            this.assortDB.barter_scheme[id] = [[{
                "_tpl": "5449016a4bdc2d6f028b456f",
                "count": ammo.Price
            }]];
            this.assortDB.loyal_level_items[id] = 1;
        }

        // add junk for gp coins
        for (const barterId of QuestBarter.Junk) {
            const id = this.resolveHash(`GPCOINJUNK${barterId}`)
            this.assortDB.items.push({
                "_id": id,
                "_tpl": barterId,
                "parentId": "hideout",
                "slotId": "hideout",
                "upd": {
                    "UnlimitedCount": this.config.GPBarter.unlimitedCount,
                    "StackObjectsCount": this.config.GPBarter.max
                }
            });
            this.assortDB.barter_scheme[id] = [[{
                "_tpl": "5d235b4d86f7742e017bc88a",  
                "count": this.config.GPBarter.price
            }]];
            this.assortDB.loyal_level_items[id] = this.config.GPBarter.traderLevel;
        }
        this.importQuests(allQuests);
        if (this.saveIdDatabase)
            this.Instance.helpers.saveJsonToFile(this.idDatabase, "QuestsData", "idDatabase"); 
        this.localeHelper.saveLocale()
    }

    private questTemplate(id: string, image: string): Quest
    {
        const quest: Quest = {
			"_id": id,
			"acceptPlayerMessage": `${id} acceptPlayerMessage`,
			"canShowNotificationsInGame": true,
			"changeQuestMessageText": `${id} changeQuestMessageText`,
			"completePlayerMessage": `${id} completePlayerMessage`,
			"conditions": {
				"AvailableForFinish": [],
				"AvailableForStart": [],
				"Fail": [],
			},
			"declinePlayerMessage": `${id} declinePlayerMessage`,
		    "description": `${id} description`,
		    "failMessageText": `${id} failMessageText`,
		    "image": `/files/quest/icon/${image}`,
		    "instantComplete": false,
		    "isKey": false,
		    "location": "any",
		    "name": `${id} name`,
		    "note": `${id} note`,
		    "restartable": false,
		    "rewards": {
		      "Fail": [],
		      "Started": [],
		      "Success": []
			},
			"secretQuest": false,
		    "side": "Pmc",
		    "startedMessageText": `${id} startedMessageText`,
		    "successMessageText": `${id} successMessageText`,
		    "traderId": this.traderID,
		    "type": "Elimination"
		};
        return quest;
    }

    private resolveHash(ID: string): string {
        if (!this.idDatabase[ID]) {
            this.saveIdDatabase = true;
            this.idDatabase[ID] = this.Instance.hashUtil.generate();
        }
        return this.idDatabase[ID];
    }

    private addAssortmentUnlock(
        unlock: string,
        quest: Quest,
        questConfig: questConfig
    ): void {
        const oldID = questConfig.oldID;
        const AssortmentUnlock: Reward = {
            "id": this.resolveHash(`${oldID}UNLOCK${unlock}1`),
	        "index": quest.rewards.Success.length,
	        "items": [{
                "_id": this.resolveHash(`${oldID}UNLOCK${unlock}2`),
                "_tpl": unlock
            }],
            "loyaltyLevel": 1,
            "target": this.resolveHash(`${oldID}UNLOCK${unlock}2`),
            "traderId": this.traderID,
            "type": "AssortmentUnlock"
        };
        quest.rewards.Success.push(AssortmentUnlock)
    }

    private addReward(
        type: ("Started" | "Success"),
        id: string,
        amount: number,
        quest: Quest,
        questConfig: questConfig
    ): void {
        const oldID = questConfig.oldID;
        const startReward: Reward = {
            "findInRaid": false,
            "id": this.resolveHash(`${oldID}${type}REWARD${id}1`),
            "index": quest.rewards.Started.length,
            "items": [{
                "_id": this.resolveHash(`${oldID}${type}REWARD${id}2`),
                "_tpl": id,
                "upd": {
                    "StackObjectsCount": amount
                }
            }],
            "target": this.resolveHash(`${oldID}${type}REWARD${id}2`),
            "type": "Item",
            "value": String(amount)
        };
        quest.rewards[type].push(startReward);
    }

    private createVisibilityConditions(
        visibilityConditionsIds: string[],
        oldID: string,
        AFF: string
    ): visibilityCondition[] {
        const returnVisibilityConditions: visibilityCondition[] = [];
        for (const condition of visibilityConditionsIds) {
            const returnVisibilityCondition: visibilityCondition = {
                "conditionType": "CompleteCondition",
                "id": this.resolveHash(`${oldID}${AFF}Vis${visibilityConditionsIds.indexOf(condition)}`),
                "target": condition
            };
            returnVisibilityConditions.push(returnVisibilityCondition);
        }
        return returnVisibilityConditions;
    }

    private importQuests(
        allQuests: {[key: string]: Quest}
    ): void {
        let questCount = 0
        for (const quest in allQuests) {
            this.Instance.database.templates.quests[quest] = allQuests[quest];
            questCount++;
        }
        this.Instance.logger.log(
			`[${this.Instance.modName}] Loaded ${questCount} ammo quests`,
			LogTextColor.GREEN
		);
    }
}