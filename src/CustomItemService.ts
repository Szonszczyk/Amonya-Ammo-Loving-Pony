import * as fs from "fs";
import * as path from "path";
import { NewItemFromCloneDetails } from "@spt/models/spt/mod/NewItemDetails";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { WTTInstanceManager } from "./WTTInstanceManager";

import { ConfigItem, traderIDs, currencyIDs } from "./references/configConsts";

export class CustomItemService
{
    private Instance: WTTInstanceManager;
    private modConfig: any;

    constructor()
    {
    }

    public preSptLoad(Instance: WTTInstanceManager, config: any): void 
    {
        this.Instance = Instance;
        this.modConfig = config;
    }

    public addGeneratedItemsToDatabase(generatedItems: ConfigItem): void
    {
        this.addItemsToDatabase(generatedItems);
    }

    public addOtherItemsToDatabase(): void
    {
        
        this.addItemsToDatabase(this.Instance.helpers.dbItems);

        this.addMoHsToSpecialSlots();

        /*
        //remove magazine from secure containers
        const secureContainersIds = [
            "544a11ac4bdc2d470e8b456a",
            "5857a8b324597729ab0a0e7d",
            "5857a8bc2459772bad15db29",
            "665ee77ccf2d642e98220bca",
            "5c093ca986f7740a1867ab12",
            "664a55d84a90fc2c8a6305c9",
            "59db794186f77448bc595262"
        ];

        for (const secureContainersId of secureContainersIds) {
            for (const grid of this.Instance.database.templates.items[secureContainersId]._props.Grids) {
                grid._props.filters[0].ExcludedFilter = grid._props.filters[0].ExcludedFilter.filter(e => e != "5448bc234bdc2d3c308b4569")
            }
        }*/
    }

    private addMoHsToSpecialSlots(): void
    {
        const items = this.Instance.database.templates.items;
        const pocketsIds = ["a8edfb0bce53d103d3f62b9b", "627a4e6b255f7527fb05a0f6", "65e080be269cbd5c5005e529"];
        const MoHIds = ["b83f49e7b2ec6ee88d5d89e1", "b83f49e7b2ec6ee88d5d89e2", "b83f49e7b2ec6ee88d5d89e3"];
        for (const pocket of pocketsIds) {
            if (items[pocket] !== undefined) {
                for (let specialslots in items[pocket]._props.Slots) {
                    for (const MoH of MoHIds) {
                        items[pocket]._props.Slots[specialslots]._props.filters[0].Filter.push(MoH);
                    }
                }
            }
        }
    }


    private addItemsToDatabase(items: ConfigItem): void
    {
        let numItemsAdded = 0;

        const airdropLoot = this.Instance.configServer.configs["spt-airdrop"].loot;
        const blacklist = this.Instance.configServer.configs["spt-trader"].fence.blacklist;
        const flea = this.Instance.configServer.configs["spt-ragfair"].dynamic.blacklist.custom;

        for (const itemId in items) {
            const itemConfig = items[itemId];

            const { exampleCloneItem, finalItemTplToClone } = this.createExampleCloneItem(itemConfig, itemId);

            this.Instance.customItem.createItemFromClone(exampleCloneItem);
            this.processTraders(itemConfig, itemId);

            // Add to fence blacklist
            blacklist.push(itemId);

            // Add to flea blacklist
            flea.push(itemId);

            // Add to airdrop blacklist
            for(const loot in airdropLoot) {
                airdropLoot[loot].itemBlacklist.push(itemId);
            }
            numItemsAdded++;
        }

        if (numItemsAdded > 0) 
        {
            this.Instance.logger.log(
                `[${this.Instance.modName}] Loaded ${numItemsAdded} custom items`,
                LogTextColor.GREEN
            );
        }
        else
        {
            this.Instance.logger.log(
                `[${this.Instance.modName}] No custom items loaded`,
                LogTextColor.GREEN
            );
        }

    }


    /**
   * Creates an example clone item with the provided item configuration and item ID.
   *
   * @param {any} itemConfig - The configuration of the item to clone.
   * @param {string} itemId - The ID of the item.
   * @return {{ exampleCloneItem: NewItemFromCloneDetails, finalItemTplToClone: string }} The created example clone item and the final item template to clone.
   */
    private createExampleCloneItem(
        itemConfig: ConfigItem[string],
        itemId: string
    ): {
            exampleCloneItem: NewItemFromCloneDetails;
            finalItemTplToClone: string;
        } 
    {

        const finalItemTplToClone = itemConfig.itemTplToClone;

        const exampleCloneItem: NewItemFromCloneDetails = {
            itemTplToClone: finalItemTplToClone,
            overrideProperties: itemConfig.overrideProperties ? itemConfig.overrideProperties : undefined,
            parentId: itemConfig.parentId,
            newId: itemId,
            fleaPriceRoubles: itemConfig.fleaPriceRoubles,
            handbookPriceRoubles: itemConfig.handbookPriceRoubles,
            handbookParentId: itemConfig.handbookParentId,
            locales: itemConfig.locales
        };

        if (this.Instance.debug)
        {
            console.log(`Cloning item ${finalItemTplToClone} for itemID: ${itemId}`);
        }
        return { exampleCloneItem, finalItemTplToClone };
    }

     /**
   * Processes traders based on the item configuration.
   *
   * @param {any} itemConfig - The configuration of the item.
   * @param {string} itemId - The ID of the item.
   * @return {void} This function does not return a value.
   */

     private processTraders(
        itemConfig: ConfigItem[string],
        itemId: string
    ): void {
        const tables = this.Instance.database;
        if (!itemConfig.addtoTraders) return;

        const { traderId, traderItems, barterScheme } = itemConfig;

        const traderIdFromMap = traderIDs[traderId];
        const finalTraderId = traderIdFromMap || traderId;
        const trader = tables.traders[finalTraderId];

        for (const item of traderItems) {
            const newItem = {
                _id: itemId,
                _tpl: itemId,
                parentId: "hideout",
                slotId: "hideout",
                upd: {
                    UnlimitedCount: item.unlimitedCount,
                    StackObjectsCount: item.stackObjectsCount
                }
            };

            trader.assort.items.push(newItem);
        }
        trader.assort.barter_scheme[itemId] = [barterScheme];
        trader.assort.loyal_level_items[itemId] = itemConfig.loyallevelitems;
    }

}
