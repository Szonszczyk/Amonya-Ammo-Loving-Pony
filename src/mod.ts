import * as fs from 'fs';
import * as path from "path";

import { DependencyContainer } from "tsyringe";
import { jsonc } from "jsonc";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { IRagfairConfig } from "@spt/models/spt/config/IRagfairConfig";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";

import { WTTInstanceManager } from "./WTTInstanceManager";
import { TraderCreator } from "./TraderCreator";
import { QuestGenerator } from "./QuestGenerator";
import { ModConfig } from "./references/configConsts";

import * as baseJson from "../db/Trader/base.json";

class Amonya
implements IPreSptLoadMod, IPostDBLoadMod
{
	private modName = "Amonya";
	private config: ModConfig;
	private Instance: WTTInstanceManager = new WTTInstanceManager();
	private traderCreator: TraderCreator = new TraderCreator();
	private questGenerator: QuestGenerator = new QuestGenerator();
	

	public preSptLoad(container: DependencyContainer): void
	{
		this.Instance.preSptLoad(container, this.modName);
		this.Instance.modName = this.modName;
		
		this.loadConfig();
		this.resolveConfig();
        this.displayCreditBanner();

		
		this.questGenerator.preSptLoad(this.Instance, this.config, baseJson._id);
		this.traderCreator.preSptLoad(this.Instance, this.config);
	}

	postDBLoad(container: DependencyContainer): void
	{
		this.Instance.postDBLoad(container);
		this.questGenerator.postDBLoad();
		this.traderCreator.postDBLoad();
		this.traderCreator.addTraderToDb(baseJson, this.Instance.database, this.questGenerator.assortDB, this.questGenerator.questAssort, this.Instance.jsonUtil);
		this.questGenerator.addOtherItems()
		this.Instance.database.traders[baseJson._id].questassort = this.questGenerator.questAssort;
		
		this.Instance.logger.log(
			`[${this.modName}] Ammo loving trader and quester 'Amonya' loaded!`,
			LogTextColor.CYAN
		);
	}

	private loadConfig(): void
	{
		const configDir = path.resolve(__dirname, "../config");
		const configPath = path.join(configDir, "config.jsonc");
		const defaultConfigPath = path.join(configDir, "defaultConfig.jsonc");

		// Check if config file exists
		if (!fs.existsSync(configPath))
		{
			this.Instance.logger.log(`[${this.modName}] config.jsonc not found, creating new one using defaultConfig.jsonc...`, LogTextColor.YELLOW);
			fs.copyFileSync(defaultConfigPath, configPath);
		}

		// Load config
		this.config = jsonc.parse(fs.readFileSync(configPath, "utf-8"));
	}

	private resolveConfig(): void
	{
		const ragfairConfig = this.Instance.configServer.getConfig<IRagfairConfig>(ConfigTypes.RAGFAIR);
		let minRefresh = this.config.traderRefreshMin;
        let maxRefresh = this.config.traderRefreshMax;
        const addToFlea = this.config.addTraderToFlea;
        if (minRefresh >= maxRefresh) {
            minRefresh = 1200;
            maxRefresh = 2400;
			this.Instance.logger.log(
				`[${this.modName}] traderRefreshMin must be less than traderRefreshMax. Refresh timers have been reset to default`,
				LogTextColor.RED
			);
        }
        if (maxRefresh <= 2) {
            minRefresh = 1200;
            maxRefresh = 2400;
			this.Instance.logger.log(
				`[${this.modName}] You set traderRefreshMax too low. Refresh timers have been reset to default`,
				LogTextColor.RED
			);
        }
		ragfairConfig.traders[baseJson._id] = addToFlea ? true : false;
	}

    private displayCreditBanner(): void
    {
        this.Instance.logger.log(
            `[${this.modName}] | Developers: Szonszczyk`,
            LogTextColor.GREEN
        );
    }
}

module.exports = { mod: new Amonya() };