import { readFileSync } from 'node:fs';
import path from 'node:path';

export type CharacterEntity = {
  id: number;
  slug: string;
  name: string;
  crew?: string;
  position?: string;
  fruit?: string | null;
};

export type VersionedCard = {
  id: number;
  category: 'character' | 'item' | 'fruit' | 'sword' | 'boat';
  refId?: number;
  slug: string;
  title: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  image: string;
  description?: string;
  abilities?: string[];
  bounty?: number;
  unlock:
    | { kind: 'episode'; episodeId: number }
    | { kind: 'arc'; arcId: number }
    | { kind: 'event'; eventId: number };
};

type CardsV2Data = {
  characters: CharacterEntity[];
  cards: VersionedCard[];
};

const catalogDir = path.join(__dirname, '../../data/catalog');

let cache: CardsV2Data | null = null;

function loadData() {
  if (!cache) {
    const filePath = path.join(catalogDir, 'cards-v2.json');
    cache = JSON.parse(readFileSync(filePath, 'utf8')) as CardsV2Data;
  }

  return cache;
}

export function getCharactersV2Data() {
  return loadData().characters;
}

export function getCardsV2Data() {
  return loadData().cards;
}

export function getCharacterV2ById(characterId: number) {
  return getCharactersV2Data().find(character => character.id === characterId);
}

export function getCardsV2ByCharacterId(characterId: number) {
  return getCardsV2Data().filter(
    card => card.category === 'character' && card.refId === characterId,
  );
}
