import * as fs from "fs";
import * as path from "path";

import { WTTInstanceManager } from "./WTTInstanceManager";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

import { questConfig, CaliberInfoStruct } from "./references/questDatabases";

import { ConfigItem, CombinedVariantTypes, variantIDsInterface } from "./references/configConsts";

export class Helpers
{
    private Instance: WTTInstanceManager;
    public colorConverterAPILoaded: boolean;

    public dbQuests: questConfig;
    public dbItems: ConfigItem;
    public dbVariants: CombinedVariantTypes;
    public dbCalibers: CaliberInfoStruct;
    public idToCaliberMap: { [id: string]: string };

    private idDatabasePath = path.resolve(__dirname, "../db/QuestsData/idDatabase.json");
    private variantIdsPath = path.resolve(__dirname, "../db/Ids/variantIds.json");

    public dbQuestIds: Record<string, string> = {};
    public dbVariantIds: variantIDsInterface = {};


    constructor(Instance: WTTInstanceManager)
    {
        this.Instance = Instance;
        this.colorConverterAPILoaded = this.colorConverterAPICheck();

        this.dbQuests = this.loadCombinedQuests('../db/Quests');
        this.dbItems = this.loadCombinedItems('../db/Items');
        this.dbVariants = this.loadCombinedConfigVariants('../db/Variants');
        this.dbCalibers = this.loadCombinedCalibers('../db/Calibers');

        this.dbQuestIds = this.loadIdDatabase();
        this.dbVariantIds = this.loadVariantIds();

        this.idToCaliberMap = Object.entries(this.dbCalibers).reduce((acc, [caliberName, info]) => {
            acc[info.id] = caliberName;
            return acc;
        }, {} as { [id: string]: string });
    }

    private colorConverterAPICheck(): boolean 
    {
        const pluginName = "rairai.colorconverterapi.dll";
        try {
            const pluginList = fs.readdirSync("./BepInEx/plugins").map(plugin => plugin.toLowerCase());
            return pluginList.includes(pluginName);
        } catch {
            return false;
        }
    }

    private loadCombinedConfig<T>(
        subfolder: string,
        mergeStrategy?: (acc: T, current: T) => void
    ): T {
        const folderPath = path.join(__dirname, subfolder);
        const configFiles = fs.readdirSync(folderPath);
        const combinedConfig: T = {} as T;

        configFiles.forEach((file) => {
            const filePath = path.join(folderPath, file);
            const fileContents = fs.readFileSync(filePath, "utf-8");
            const config = JSON.parse(fileContents) as T;

            if (mergeStrategy) {
                mergeStrategy(combinedConfig, config);
            } else {
                Object.assign(combinedConfig, config);
            }
        });

        return combinedConfig;
    }

    private loadCombinedConfigVariants(usePath: string): CombinedVariantTypes {
        return this.loadCombinedConfig<CombinedVariantTypes>(usePath, (combined, config) => {
            for (const variant in config) {
                if (combined[variant]) {
                    const c = combined[variant];
                    const f = config[variant];

                    // Determine original: prefer one with Description, default to combined
                    const [original, copy] =
                        "Description" in f && !("Description" in c) ? [f, c] : [c, f];

                    // Merge Bullets
                    if (copy.Bullets) {
                        original.Bullets = {
                            ...(original.Bullets || {}),
                            ...copy.Bullets
                        };
                    }
                    combined[variant] = original;
                    delete config[variant];
                }
            }

            Object.assign(combined, config);
        });
    }

    private loadCombinedQuests(usePath: string): questConfig {
        return this.loadCombinedConfig<questConfig>(usePath);
    }

    private loadCombinedItems(usePath: string): ConfigItem {
        return this.loadCombinedConfig<ConfigItem>(usePath);
    }

    private loadCombinedCalibers(usePath: string): CaliberInfoStruct {
        return this.loadCombinedConfig<CaliberInfoStruct>(usePath);
    }

    public saveJsonToFile(
        data: any,
        subfolder: string,
        name: string
    ): void {
        const formatted = JSON.stringify(data, (key, value) => value, 2)
            .replace(/\[\s*([\s\S]*?)\s*]/g, match => match.replace(/\s+/g, ' '));

        const filePath = path.join(__dirname, `../db/${subfolder}/${name}.json`);
        
        fs.writeFileSync(filePath, formatted);

        this.Instance.logger.log(`[${this.Instance.modName}] Helpers.saveJsonToFile: Database '${subfolder}/${name}.json' was created`, LogTextColor.GREEN);
    }

    private loadIdDatabase(): Record<string, string>
    {
        this.ensureFileExists(this.idDatabasePath, {});
        const content = fs.readFileSync(this.idDatabasePath, "utf-8");
        return JSON.parse(content);
    }

    // ---------- VARIANT IDS ----------
    private loadVariantIds(): variantIDsInterface
    {
        this.ensureFileExists(this.variantIdsPath, {});
        const content = fs.readFileSync(this.variantIdsPath, "utf-8");
        return JSON.parse(content);
    }

    // ---------- Helper ----------
    private ensureFileExists(filePath: string, defaultContent: object): void
    {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir))
        {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!fs.existsSync(filePath))
        {
            fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 4), "utf-8");
        }
    }

}