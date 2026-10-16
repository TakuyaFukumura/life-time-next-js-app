export const LIFE_EVENT_CATEGORIES = ['仕事', '家族', '学業', '資産形成'] as const;
export type LifeEventCategory = (typeof LIFE_EVENT_CATEGORIES)[number];
