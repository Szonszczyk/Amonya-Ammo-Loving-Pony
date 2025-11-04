import * as fs from "fs";
import * as path from "path";

import { ITraderBase, ITraderAssort } from "@spt/models/eft/common/tables/ITrader";
import { ITraderConfig, UpdateTime } from "@spt/models/spt/config/ITraderConfig";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { Traders } from "@spt/models/enums/Traders";
import { ImageRouter } from "@spt/routers/ImageRouter";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

import * as baseJson from "../db/Trader/base.json";
import { WTTInstanceManager } from "./WTTInstanceManager";
import { ModConfig } from "./references/configConsts";
import{ questAssort } from "./references/questDatabases";

export class TraderCreator
{
    private Instance: WTTInstanceManager;
    private config: ModConfig;

    public preSptLoad(Instance: WTTInstanceManager, config: ModConfig): void
    {
        this.Instance = Instance;
        this.config = config;
        const traderConfig: ITraderConfig = this.Instance.configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);

        this.registerProfileImage();
        this.setTraderUpdateTime(traderConfig);
        Traders[baseJson._id] = baseJson._id;
    }

    public postDBLoad(): void
    {
    	const tables = this.Instance.database;
        this.addTraderToLocales(
            baseJson,
            tables,
            baseJson.name,
            "Amonya",
            baseJson.nickname,
            baseJson.location,
            this.config.mode.normal.enabled ? this.config.mode.normal.description : this.config.mode.nonPony.description
        );
        this.routeImages(this.Instance.imageRouter);
    }
    
    public registerProfileImage(): void
    {
        // Register a route to point to the profile picture - remember to remove the .jpg from it
        const traderPicture = this.config.mode.normal.enabled ? this.config.mode.normal.traderPicture : this.config.mode.nonPony.traderPicture
        this.Instance.imageRouter.addRoute(baseJson.avatar.replace(".jpg", ""), path.resolve(__dirname,`../res/${traderPicture}`));
    }

    public setTraderUpdateTime(traderConfig: ITraderConfig): void
    {
        // Add refresh time in seconds to config
        const traderRefreshRecord: UpdateTime = {
            traderId: baseJson._id,
            seconds: {
                min: this.config.traderRefreshMin,
                max: this.config.traderRefreshMax
            } };

        traderConfig.updateTime.push(traderRefreshRecord);
    }

    /**
     * Add our new trader to the database
     * @param traderDetailsToAdd trader details
     * @param tables database
     * @param jsonUtil json utility class
     */
    // rome-ignore lint/suspicious/noExplicitAny: traderDetailsToAdd comes from base.json, so no type
    public addTraderToDb(
        traderDetailsToAdd: any,
        tables: IDatabaseTables,
        assort: ITraderAssort,
        questassort: questAssort,
        jsonUtil: JsonUtil
    ): void {
        // Add trader to trader table, key is the traders id
        tables.traders[traderDetailsToAdd._id] = {
            assort: assort, // assorts are the 'offers' trader sells, can be a single item (e.g. carton of milk) or multiple items as a collection (e.g. a gun)
            base: jsonUtil.deserialize(jsonUtil.serialize(traderDetailsToAdd)) as ITraderBase, // Deserialise/serialise creates a copy of the json and allows us to cast it as an ITraderBase
            questassort: questassort  // questassort is empty as trader has no assorts unlocked by quests
        };
    }

    /**
     * Create basic data for trader + add empty assorts table for trader
     * @param tables SPT db
     * @param jsonUtil SPT JSON utility class
     * @returns ITraderAssort
     */
    private createAssortTable(): ITraderAssort
    {
        // Create a blank assort object, ready to have items added
        const assortTable: ITraderAssort = {
            nextResupply: 0,
            items: [],
            barter_scheme: {},
            loyal_level_items: {}
        }

        return assortTable;
    }

    /**
     * Add traders name/location/description to the locale table
     * @param baseJson json file for trader (db/base.json)
     * @param tables database tables
     * @param fullName Complete name of trader
     * @param firstName First name of trader
     * @param nickName Nickname of trader
     * @param location Location of trader (e.g. "Here in the cat shop")
     * @param description Description of trader
     */
    public addTraderToLocales(baseJson: any, tables: IDatabaseTables, fullName: string, firstName: string, nickName: string, location: string, description: string)
    {
        // For each language, add locale for the new trader
        const locales = Object.values(tables.locales.global) as Record<string, string>[];
        for (const locale of locales) {
            locale[`${baseJson._id} FullName`] = fullName;
            locale[`${baseJson._id} FirstName`] = firstName;
            locale[`${baseJson._id} Nickname`] = nickName;
            locale[`${baseJson._id} Location`] = location;
            locale[`${baseJson._id} Description`] = description;
        }
    }

    private routeImages(imageRouter: ImageRouter): void {
        let questImageCount = 0;
        const questDir = path.join(__dirname, "../res/quests/");
        
        this.loadFiles(questDir, [".png", ".jpg"], (filePath: string) => {
            imageRouter.addRoute(`/files/quest/icon/${path.basename(filePath, path.extname(filePath))}`, filePath);
            questImageCount++;
        });
        this.Instance.logger.log(
			`[${this.Instance.modName}] Loaded ${questImageCount} quest images`,
			LogTextColor.GREEN
		);
    }
    
    private loadFiles(dirPath: string, extNames: string[], cb: (filePath: string) => void): void {
        if (!fs.existsSync(dirPath)) return;
    
        const dirEntries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of dirEntries) {
            const entryPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
                this.loadFiles(entryPath, extNames, cb); // Recursive call for subdirectories
            } else if (extNames.includes(path.extname(entry.name))) {
                cb(entryPath); // Execute callback for valid files
            }
        }
    }
}