import * as migration_20260524_135927_initial from './20260524_135927_initial';
import * as migration_20260526_162656_case_studies_drop_custom_status from './20260526_162656_case_studies_drop_custom_status';

export const migrations = [
  {
    up: migration_20260524_135927_initial.up,
    down: migration_20260524_135927_initial.down,
    name: '20260524_135927_initial',
  },
  {
    up: migration_20260526_162656_case_studies_drop_custom_status.up,
    down: migration_20260526_162656_case_studies_drop_custom_status.down,
    name: '20260526_162656_case_studies_drop_custom_status'
  },
];
