export interface CombatantDto {
  id: string;
  name: string;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  armorClass: number;
  initiative: number;
  avatarUrl?: string | null;
}

export interface CharacterDto {
  id: string;
  name: string;
  className: string;
  level: number;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  armorClass: number;
  speed?: number;
  initiativeBonus?: number;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  skills?: string[] | Record<string, number>;
  equipment: string;
  gold: number;
  backstory: string;
  conditions: string[];
  avatarUrl: string | null;
  lastJoinedRoom?: string | null;
}