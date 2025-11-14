export const FEATURE_FLAGS = {
  mediaAttachments: true,
  drawerMediaTabs: true,
  zonePlanning: true,
};

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export const isFeatureEnabled = (flag: FeatureFlag) => FEATURE_FLAGS[flag];
