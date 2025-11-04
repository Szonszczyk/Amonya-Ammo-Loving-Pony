import * as fs from "fs";
import * as path from "path";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { WTTInstanceManager } from "./WTTInstanceManager";
import { ModConfig, ConfigItem, traderIDs, VariantType, CombinedVariantTypes, findSlotWithName, variantIDsInterface } from "./references/configConsts";
import { ammoInfo, weaponsPerCategory } from "./references/questDatabases";

export class BulletGeneration
{
    private Instance: WTTInstanceManager;
    private modConfig: ModConfig;
    private variantIds: variantIDsInterface = {};

    constructor()
    {
    }

    public preSptLoad(Instance: WTTInstanceManager, config: ModConfig): void
    {
        this.Instance = Instance;
        this.modConfig = config;
        this.variantIds = this.Instance.helpers.dbVariantIds;
    }
    public generateBullets(
        weaponDB: weaponsPerCategory,
        ammoDB: ammoInfo
    ): {
        generatedItems: ConfigItem;
        quests: Record<string, string[]>;
    } {
        const generatedItems: ConfigItem = {};
        const quests: Record<string, string[]> = {};
        const newIds: variantIDsInterface = {};
        const variantTypes: CombinedVariantTypes = this.Instance.helpers.dbVariants;
        for (const variantName in variantTypes) {

            if (!this.modConfig.bullets[variantName]) continue;

            const variant = variantTypes[variantName];
            const bulletNamesInVariant = Object.keys(variant.Bullets).join(" | ");

            if (!this.variantIds[variantName]) this.variantIds[variantName] = {};
            const bulletsIds = this.variantIds[variantName];

            for (const ammoName in variant.Bullets) {
                const ammo = Object.values(ammoDB).filter(ammo => ammo.Name === ammoName)[0];
                if (!ammo) continue;
                
                const copiedItem = this.Instance.database.templates.items[ammo.ID];
                if (!copiedItem) continue;

                const caliberInfo = this.Instance.helpers.dbCalibers[ammo.Caliber];
                const variantShortName = `${caliberInfo.shortName} ${variant.ShortName}`;
                const copiedItemHandbook = this.Instance.database.templates.handbook.Items.filter(item => item.Id === ammo.ID)[0];

                if (!bulletsIds[ammo.ID]) {
                    bulletsIds[ammo.ID] = this.Instance.hashUtil.generate();
                    if (!newIds[variantName]) newIds[variantName] = {};
                    newIds[variantName][ammo.ID] = bulletsIds[ammo.ID];
                }
                const id = bulletsIds[ammo.ID];

                const newBullet: ConfigItem = {};
                newBullet[id] = {
                    itemTplToClone: ammo.ID,
                    overrideProperties: {
                        BackgroundColor: this.Instance.helpers.colorConverterAPILoaded ? variant.Color : "violet",
                        Tracer: this.Instance.helpers.colorConverterAPILoaded ? true : false,
                        TracerColor: this.Instance.helpers.colorConverterAPILoaded ? variant.Color : "green"
                    },
                    parentId: copiedItem._parent,
                    handbookParentId: copiedItemHandbook.ParentId,
                    locales: {
                        en: {
                            name: `<b><color=${variant.Color}>${ammo.Name} ${variantName} Variant</color></b>`,
                            shortName: variantShortName,
                            description: [
                                `<align="center">${variant.FlavourText}`,
                                ``,
                                `<color=${variant.Color}><b>${variantName} Variant</b></color>`,
                                `${variant.Description}`,
                                `<i>${variant.Explanation}</i>`,
                                `${bulletNamesInVariant.replace(ammo.Name, `<b>${ammo.Name}</b>`)}`,
                                "", 
                                `Can be used only in <b>${caliberInfo.name}</b> caliber weapon of types:`,
                                `${variant.Weapons.join(", ")}</align>`
                            ].join('\n')
                        }
                    },
                    fleaPriceRoubles: Math.ceil(this.calculateValue(ammo.Price, variant.Price) * 2),
                    handbookPriceRoubles: Math.ceil(this.calculateValue(ammo.Price, variant.Price)), 
                    clearClonedProps: false,
                    addtoInventorySlots: [],
                    addtoModSlots: false,
                    modSlot: [],
                    ModdableItemWhitelist: "",
                    ModdableItemBlacklist: "",
                    addtoTraders: false,
                    traderId: traderIDs["PEACEKEEPER"],
                    traderItems: [],
                    barterScheme: [],
                    loyallevelitems: 1,
                    addtoBots: false,
                    addtoStaticLootContainers: false,
                    StaticLootContainers: "",
                    Probability: 0,
                    masteries: false,
                    masterySections: {},
                    addweaponpreset: false,
                    weaponpresets: [],
                    addtoHallOfFame: false,
                    addtoSpecialSlots: false
                };
                if (!quests[variant.Bullets[ammoName]]) quests[variant.Bullets[ammoName]] = [];
                quests[variant.Bullets[ammoName]].push(id);
                this.addAmmoToMagazinesAndWeapons(weaponDB, id, newBullet, ammo.Caliber, variant);
                this.changeNormalProperties(newBullet, id, copiedItem, variant);
                Object.assign(generatedItems, newBullet);
            }
        }

        
        if (Object.keys(newIds).length > 0) this.Instance.helpers.saveJsonToFile(this.variantIds, "Ids", "variantIds");
        //fs.writeFileSync(path.join(__dirname, "../db/Cache/generatedBullets.json"), JSON.stringify(generatedItems, null, 2));
        return { generatedItems, quests };
    }

    private addAmmoToMagazinesAndWeapons(
        weaponDB: weaponsPerCategory,
        id: string,
        itemConfig: ConfigItem,
        caliber: string,
        variant: VariantType
    ): void {
        let weaponsIDs: string[] = [];
        const useCategory: string[] = variant.Weapons[0] === "ALL" ? Object.keys(weaponDB[caliber]) : variant.Weapons;
        for (const category of useCategory) {
            if (weaponDB[caliber][category]) weaponsIDs = weaponsIDs.concat(weaponDB[caliber][category].ids);
        }
        weaponsIDs = [...new Set(weaponsIDs)];
        let magazinesIDs: string[] = [];
        for (const weaponID of weaponsIDs) {
            const item = this.Instance.database.templates.items[weaponID];
            if (item._props.Chambers) {
                for (const chamber of item._props.Chambers) {
                    if (!chamber._props.filters[0].Filter.includes(id)) chamber._props.filters[0].Filter.push(id);
                }
            }
            const magazineSlot = findSlotWithName(item._props.Slots, "mod_magazine");
            if (magazineSlot) magazinesIDs = magazinesIDs.concat(magazineSlot._props.filters[0].Filter);
        }
        magazinesIDs = [...new Set(magazinesIDs)];
        for (const magazineIDs of magazinesIDs) {
            const item = this.Instance.database.templates.items[magazineIDs];
            if (!item || !item._props) continue;
            if (item._props.Slots.length > 0) {
                for (const slot of item._props.Slots) {
                    if (!slot._props.filters[0].Filter.includes(id)) slot._props.filters[0].Filter.push(id);
                }
            }
            item._props.Cartridges[0]._props.filters[0].Filter.push(id);
        }
    }

    private changeNormalProperties(
        itemConfig: ConfigItem,
        id: string,
        copiedItem: any,
        variant: VariantType
    ): void {

        const integerProps = [
            "PenetrationPower",
            "Damage",
            "ArmorDamage",
            "ProjectileCount",
            "ammoAccr",
            "ammoRec",
            "buckshotBullets"
        ];
        for (const prop in variant.props) {
            let oldItemPropValue = copiedItem._props[prop];
            let newValue: any;
            if (typeof variant.props[prop] === 'string' && /^[+-]\d+%?$/.test(variant.props[prop])) {
                newValue = this.calculateValue(oldItemPropValue, variant.props[prop]);
            } else {
                newValue = variant.props[prop];
            }
            itemConfig[id].overrideProperties[prop] = integerProps.includes(prop) ? Math.ceil(newValue) : newValue;
        }
    }

    private calculateValue(first: number, second: string | number): number {
        if (typeof second === 'string' && /^[+-]\d+%?$/.test(second)) {
            const isPercentage = second.endsWith('%');
            const value = parseFloat(second);
    
            if (isPercentage) {
                return +(first + (first * (value / 100))).toFixed(3);
            } else {
                return +(first + value).toFixed(3);
            }
        } else if (typeof second === 'number') {
            return second;
        } else {
            // If invalid string, return first as default or handle differently
            return first;
        }
    }
}
