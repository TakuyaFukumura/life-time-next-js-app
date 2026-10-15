export const GENDERS = ['男性', '女性', 'その他', '未設定'] as const;
export type Gender = typeof GENDERS[number];
