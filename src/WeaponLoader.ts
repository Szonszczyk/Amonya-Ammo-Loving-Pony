import { WTTInstanceManager } from "./WTTInstanceManager";
import { ModConfig } from "./references/configConsts";
import
{
    weaponCategoriesAllowed,
    weaponCategoriesNames,
    calibersAllowed,
    weaponsDatabase,
    keyedStringArrays,
    weaponsPerCategory,
    copiesExceptions,
    weaponsExceptions
} from "./references/questDatabases";

export class WeaponLoader
{
    private Instance: WTTInstanceManager;
    private config: ModConfig;
    public weapons: weaponsDatabase;
    public weaponsPerCaliber: keyedStringArrays;
    public weaponsBasedOnCaliberAndCategory: weaponsPerCategory;
    public weaponsOnlyPerCaliberAndCategory: weaponsPerCategory = {};

    public preSptLoad(Instance: WTTInstanceManager, config: ModConfig): void 
    {
        this.Instance = Instance;
        this.config = config;
    }

    public postDBLoad(): void 
    {
        this.findAllWeaponsIDs();
        this.sortBasedOnCaliberAndCategory(this.weapons);
    }

    private findAllWeaponsIDs(): void
    {
        // base/copies weapons database
        const weapons: weaponsDatabase = {};

        // weapons per caliber database
        const weaponsPerCaliber: keyedStringArrays = {};

        const items = this.Instance.database.templates.items;
        const copies: { name: string, id: string, caliber: string, category: string, baseId: string }[] = [];
        for (const id in items) {
            const item = items[id];
            if (weaponCategoriesAllowed.includes(item._parent) && !weaponsExceptions.includes(id)) {
                if(!item._props.shotgunDispersion || item._props.shotgunDispersion == 0) item._props.shotgunDispersion = 5;
                const category = weaponCategoriesNames[item._parent];
                const caliberResolved = this.resolveWeaponCaliber(id, item);
                if (calibersAllowed.includes(caliberResolved)) {
                    const caliber = this.Instance.helpers.idToCaliberMap[caliberResolved];

                    // database of only caliber weapons based on category - for bullet variants
                    if (!this.weaponsOnlyPerCaliberAndCategory[caliber]) this.weaponsOnlyPerCaliberAndCategory[caliber] = {};
                    if (!this.weaponsOnlyPerCaliberAndCategory[caliber][category]) this.weaponsOnlyPerCaliberAndCategory[caliber][category] = {
                        names: [],
                        ids: []
                    };
                    this.weaponsOnlyPerCaliberAndCategory[caliber][category].ids.push(id)

                    const name = this.Instance.database.locales.global.en[`${id} Name`];
                    if (name.includes("Variant</color></b>") || (name.includes("(") && !copiesExceptions.includes(name)) || this.config.weaponCopies[id]) {
                        copies.push({
                            name: name,
                            id: id,
                            caliber: caliber,
                            category: category,
                            baseId: this.config.weaponCopies[id] ? this.config.weaponCopies[id] : "N/A"
                        });
                    } else {
                        weapons[id] = {
                            id: id,
                            name: name,
                            shortName: this.Instance.database.locales.global.en[`${id} ShortName`],
                            caliber: caliber,
                            category: category,
                            copies: []
                        }
                    }
                    if (!weaponsPerCaliber[caliber]) weaponsPerCaliber[caliber] = [];
                    weaponsPerCaliber[caliber].push(id);
                }
            }
        }
        for (const copy of copies) {
            if (copy.baseId != "N/A") {
                weapons[copy.baseId].copies.push(copy.id);
                continue;
            } 
            for (const id in weapons) {
                const weapon = weapons[id];
                if (copy.name.includes(weapon.name)) {
                    weapon.copies.push(copy.id);
                    break;
                }
            }
        }
        this.weapons = weapons;
        this.weaponsPerCaliber = weaponsPerCaliber;
    }

    private resolveWeaponCaliber(id: string, item: any): string
    {
        switch(id) {
            case "5cdeb229d7f00c000e7ce174":
                return "Caliber127x108";
        }
        if (item._props.ammoCaliber == "Caliber9x18PMM") return "Caliber9x18PM";
        return item._props.ammoCaliber;
    }

    private sortBasedOnCaliberAndCategory(
        weaponsDB: weaponsDatabase
    ): void {
        const weapons: weaponsPerCategory = {};
        for (const ID in weaponsDB) {
            const weapon = weaponsDB[ID];
            const category = weapon.category;
            const caliber = weapon.caliber;
            if (!weapons[caliber]) {
                weapons[caliber] = {};
            }
            if (!weapons[caliber][category]) {
                weapons[caliber][category] = {
                    names: [],
                    ids: []
                }
            }
            weapons[caliber][category].names.push(weapon.shortName);
            weapons[caliber][category].ids.push(ID);
            weapons[caliber][category].ids = weapons[caliber][category].ids.concat(weapon.copies);
        }
        this.weaponsBasedOnCaliberAndCategory = weapons;
    }
}