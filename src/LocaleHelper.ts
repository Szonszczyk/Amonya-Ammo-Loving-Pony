import * as fs from "fs";
import * as path from "path";
import { WTTInstanceManager } from "./WTTInstanceManager";
import { ConfigItem, ModConfig } from "./references/configConsts";
import {
	questConfig, weaponsPerCategory, ammoInfo,
	weaponsDatabase
} from "./references/questDatabases";

export class LocaleHelper
{
    private Instance: WTTInstanceManager;
    private config: ModConfig;
    private locale: {[key: string]: string} = {};
	private caliberDescription: {[key: string]: string} = {};
	private categoryDescription: {[key: string]: string} = {};
	private collectorDescription: {[key: string]: string} = {};
	public ammoDatabase: ammoInfo = {};

    public preSptLoad(Instance: WTTInstanceManager, config: ModConfig): void
    {
        this.Instance = Instance;
        this.config = config;
    }

	public createDescriptionsForWeaponsUsedInKillCondition(
		categoryWeapons: weaponsPerCategory,
		weapons: weaponsDatabase
	): void {
		for (const caliberID in categoryWeapons) {
			const caliber = categoryWeapons[caliberID];
			this.caliberDescription[caliberID] = "";
			this.categoryDescription[caliberID] = "";

			for (const categoryID in caliber) {
				const category = caliber[categoryID];
				this.caliberDescription[caliberID] += `· <b>${categoryID}</b>: ${category.names.join(", ")}\n`;

				this.categoryDescription[caliberID] += `· <b>${categoryID}</b>: `;
				for (const weaponID of category.ids) {
					if (this.Instance.database.locales.global.en[`${weaponID} ShortName`]) {
						this.categoryDescription[caliberID] += `${this.Instance.database.locales.global.en[`${weaponID} ShortName`]}, `;
					}
				}
				this.categoryDescription[caliberID] = this.categoryDescription[caliberID].slice(0, -2);
				this.categoryDescription[caliberID] += "\n";
			}
		}

		const categories = Object.keys(categoryWeapons);
		for (const category of categories) {
			const weaponsForCollector = Object.values(weapons).filter(weapon => weapon.caliber === category);
			this.collectorDescription[category] = "";
			for (const weapon of weaponsForCollector) {
				this.collectorDescription[category] += `· <b>${weapon.name}</b>: `;
				for (const copy of weapon.copies) {
					if (this.Instance.database.locales.global.en[`${copy} ShortName`]) {
						this.collectorDescription[category] += `${this.Instance.database.locales.global.en[`${copy} ShortName`]}, `
					}
				}
				this.collectorDescription[category] = this.collectorDescription[category].slice(0, -2);
				this.collectorDescription[category] += "\n";
			}
		}
	}

	public ammoDatabaseMaker(): void
	{
		const questDatabase: questConfig = this.Instance.helpers.dbQuests;
		for (const questID in questDatabase) {
            const questConfig = questDatabase[questID];
			for (const unlock of questConfig.Unlocks) {
				const item = this.Instance.database.templates.items[unlock];
				if (!item) continue;
				this.ammoDatabase[unlock] = {
					Name: this.Instance.database.locales.global.en[`${unlock} Name`],
					ShortName: this.Instance.database.locales.global.en[`${unlock} ShortName`],
					ID: unlock,
					Caliber: this.Instance.helpers.idToCaliberMap[item._props.Caliber],
					Price: Math.ceil(this.Instance.database.templates.handbook.Items.filter(item => item.Id === unlock)[0].Price * this.config.ammoPrice.multiplier),
					DMG: item._props.ProjectileCount > 1 ? `${item._props.ProjectileCount}x${item._props.Damage}` : item._props.Damage,
					PEN: item._props.PenetrationPower
				};
			}
		}
	}

	public addGeneratedBullets(
		generatedItems: ConfigItem
	): void {
		for (const bulletID in generatedItems) {
			const item = this.Instance.database.templates.items[bulletID];
			this.ammoDatabase[bulletID] = {
				Name: this.Instance.database.locales.global.en[`${bulletID} Name`],
				ShortName: this.Instance.database.locales.global.en[`${bulletID} ShortName`],
				ID: bulletID,
				Caliber: this.Instance.helpers.idToCaliberMap[item._props.Caliber],
				Price: Math.ceil(this.Instance.database.templates.handbook.Items.filter(item => item.Id === bulletID)[0].Price * this.config.ammoPrice.multiplier),
				DMG: item._props.ProjectileCount > 1 ? `${item._props.ProjectileCount}x${item._props.Damage}` : item._props.Damage,
				PEN: item._props.PenetrationPower
			};
		}
	}

    public initialLocale(
		questID: string,
		config: questConfig,
		caliberInfo: any,
		difficulty: any
	): void {
        const questSuccessMessageTextByDiff = {
			'1': "Great start!",
			'2': "You are good at this.",
			'3': "Good job!",
			'4': "Nicely done!",
			'5': "Wow. That was fast.",
			'6': "Did you find this quest enjoyable? I think so...",
			'7': "Now you can rest for a while... I think.",
			'8': "You are the best!"
		};

        let questDescription = "";
		let questSuccessMessageText = "";

        let questName = `${caliberInfo?.shortName} ${difficulty.Name}`;
		
        switch(config.Difficulty) {
			case "0":
				questName = config.oldID;
				questDescription = `${config.Lore}\n\nUnlock new ammunition by killing enemies and then giving me some things that I need!\n\n<b>Unlocks ammo:</b>\n`;
				questSuccessMessageText = `You completed '${questName}' quest. Welcome!`;
				this.locale[`${questID} startedMessageText`] = `You started '${questName}' quest!`;
				break;
			case 'G1.1':
            case 'G1.2':
			case 'G1.3':
			case 'G1.4':
			case 'G1.5':
			case 'G1.6':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
				this.locale[`${questID} startedMessageText`] = `You started '${questName}' quest. Get kills using ${caliberInfo.name}!`;
				questDescription = `Unlock new ammunition by killing enemies and then giving me some things I need!\n\nUse weapons of <b>${caliberInfo.name}</b> caliber:\n${this.caliberDescription[config.ammoIDs]}\n<b>Unlocks ammo:</b>\n`;
				questSuccessMessageText = `You completed '${questName}' quest. ${questSuccessMessageTextByDiff[config.Difficulty] ? questSuccessMessageTextByDiff[config.Difficulty] : "That was explosive!"} Check new ammo in my inventory: `;
				break;
			case '6':
				this.locale[`${questID} startedMessageText`] = `You started '${questName}' quest. Get kills using different weapons categories!`;
				questDescription = `Unlock new ammunition by killing enemies and then giving me some things I need!\n\nUse weapons of various categories:\n${this.categoryDescription[config.ammoIDs]}\n<b>Unlocks ammo:</b>\n`;
				questSuccessMessageText = `You completed '${questName}' quest. ${questSuccessMessageTextByDiff[config.Difficulty]} Check new ammo in my inventory: `;
				break;
			case '7':
				this.locale[`${questID} startedMessageText`] = `You started '${questName}' quest. Collect kills using different weapons!`;
				questDescription = `Unlock new ammunition by killing enemies and then giving me some things I need!\n\nUse base weapons (or their copies):\n${this.collectorDescription[config.ammoIDs]}\n<b>Unlocks ammo:</b>\n`;
				questSuccessMessageText = `You completed '${questName}' quest. ${questSuccessMessageTextByDiff[config.Difficulty]} Check new ammo in my inventory: `;
				break;
			case '8':
				this.locale[`${questID} startedMessageText`] = `You started '${questName}' quest. Get kills using ${caliberInfo.name}!`;
				questDescription = `You proven your mastery with <b>${caliberInfo.name}</b>. Now you can get some exp while killing using your best ammo!\nGood luck!`;
				if (config.Unlocks.length > 0) {
					questDescription = `You proven your mastery with <b>${caliberInfo.name}</b>! Now you can unlock the best ammo in the game!\n\nUse weapons of caliber <b>${caliberInfo.name}</b>:\n${this.caliberDescription[config.ammoIDs]}\n<b>Unlocks ammo:</b>\n`;
				}
				questSuccessMessageText = `You completed '${questName}' quest. ${questSuccessMessageTextByDiff[config.Difficulty]} ${config.Unlocks.length > 0 ? "Check new ammo in my inventory: ": ""}`;
				break;
		};
        this.locale[`${questID} acceptPlayerMessage`] = `You started '${questName}' quest.`;
		this.locale[`${questID} changeQuestMessageText`] = "";
		this.locale[`${questID} completePlayerMessage`] = `You completed '${questName}' quest.`;
		this.locale[`${questID} declinePlayerMessage`] = "";
		this.locale[`${questID} failMessageText`] = "";
		this.locale[`${questID} name`] = questName;
		this.locale[`${questID} note`] = "";

        for (const unlock of config.Unlocks) {
			const ammo = this.ammoDatabase[unlock];
			const ammoDescription = `${ammo.Name} [${ammo.DMG}/${ammo.PEN}]`;
            questDescription += `· ${ammoDescription}\n`;
	        questSuccessMessageText += `${ammoDescription}, `;
        }
        this.locale[`${questID} successMessageText`] = this.stripHtmlTags(questSuccessMessageText.slice(0, questSuccessMessageText.length-2));
		if (!this.locale[`${questID} description`]) {
			this.locale[`${questID} description`] = questDescription;
		} else {
			this.locale[`${questID} description`] = questDescription + this.locale[`${questID} description`];
		}

		if (config.QuestForStart) {
			if (!this.locale[`${config.QuestForStart} description`]) {
				this.locale[`${config.QuestForStart} description`] = "";
			}
	        if (!this.locale[`${config.QuestForStart} description`].includes("Unlocks quests:")) {
				this.locale[`${config.QuestForStart} description`] += "\n<b>Unlocks quests:</b>\n";
			}
	        this.locale[`${config.QuestForStart} description`] += `· ${questName} (${config.TraderNeeded})\n`
		}
    }

	public addToLocale(
		id: string,
		text: string
	): void {
		this.locale[id] = text;
	}

	public saveLocale(): void
	{
		for (const locale in this.Instance.database.locales.global) {
			this.Instance.database.locales.global[locale] = Object.assign(this.Instance.database.locales.global[locale], this.locale);
		}
	}

	public stripHtmlTags(input: string): string {
		return input.replace(/<[^>]*>/g, '');
	}
}