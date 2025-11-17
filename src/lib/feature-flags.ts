export const FEATURE_FLAGS = {
  // Keep these disabled by default so master retains the existing flows until
  // the parallel media + zone planning work is fully reconciled.
  mediaAttachments: false,
  drawerMediaTabs: false,
  zonePlanning: false,
};

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export const isFeatureEnabled = (flag: FeatureFlag) => FEATURE_FLAGS[flag];
