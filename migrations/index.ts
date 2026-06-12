import * as migration_20260524_135927_initial from './20260524_135927_initial';
import * as migration_20260526_162656_case_studies_drop_custom_status from './20260526_162656_case_studies_drop_custom_status';
import * as migration_20260528_180745_add_products from './20260528_180745_add_products';
import * as migration_20260528_204729_add_expertises_sectors from './20260528_204729_add_expertises_sectors';
import * as migration_20260528_223718_add_team from './20260528_223718_add_team';
import * as migration_20260530_083756_add_reassurance_settings from './20260530_083756_add_reassurance_settings';
import * as migration_20260603_132552_add_about_settings from './20260603_132552_add_about_settings';
import * as migration_20260605_095433_products_slug_text from './20260605_095433_products_slug_text';
import * as migration_20260606_234139_add_insights_hub_methodologie from './20260606_234139_add_insights_hub_methodologie';
import * as migration_20260607_192832_add_product_hero_image from './20260607_192832_add_product_hero_image';
import * as migration_20260607_201500_add_visits from './20260607_201500_add_visits';
import * as migration_20260612_103000_add_site_hub_settings from './20260612_103000_add_site_hub_settings';

export const migrations = [
  {
    up: migration_20260524_135927_initial.up,
    down: migration_20260524_135927_initial.down,
    name: '20260524_135927_initial',
  },
  {
    up: migration_20260526_162656_case_studies_drop_custom_status.up,
    down: migration_20260526_162656_case_studies_drop_custom_status.down,
    name: '20260526_162656_case_studies_drop_custom_status',
  },
  {
    up: migration_20260528_180745_add_products.up,
    down: migration_20260528_180745_add_products.down,
    name: '20260528_180745_add_products',
  },
  {
    up: migration_20260528_204729_add_expertises_sectors.up,
    down: migration_20260528_204729_add_expertises_sectors.down,
    name: '20260528_204729_add_expertises_sectors',
  },
  {
    up: migration_20260528_223718_add_team.up,
    down: migration_20260528_223718_add_team.down,
    name: '20260528_223718_add_team',
  },
  {
    up: migration_20260530_083756_add_reassurance_settings.up,
    down: migration_20260530_083756_add_reassurance_settings.down,
    name: '20260530_083756_add_reassurance_settings',
  },
  {
    up: migration_20260603_132552_add_about_settings.up,
    down: migration_20260603_132552_add_about_settings.down,
    name: '20260603_132552_add_about_settings',
  },
  {
    up: migration_20260605_095433_products_slug_text.up,
    down: migration_20260605_095433_products_slug_text.down,
    name: '20260605_095433_products_slug_text',
  },
  {
    up: migration_20260606_234139_add_insights_hub_methodologie.up,
    down: migration_20260606_234139_add_insights_hub_methodologie.down,
    name: '20260606_234139_add_insights_hub_methodologie',
  },
  {
    up: migration_20260607_192832_add_product_hero_image.up,
    down: migration_20260607_192832_add_product_hero_image.down,
    name: '20260607_192832_add_product_hero_image',
  },
  {
    up: migration_20260607_201500_add_visits.up,
    down: migration_20260607_201500_add_visits.down,
    name: '20260607_201500_add_visits',
  },
  {
    up: migration_20260612_103000_add_site_hub_settings.up,
    down: migration_20260612_103000_add_site_hub_settings.down,
    name: '20260612_103000_add_site_hub_settings',
  },
];
