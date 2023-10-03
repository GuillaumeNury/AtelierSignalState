export interface PokemonCollection {
  count: number
  items: Pokemon[];
}

export interface Pokemon {
  id: number;
  name: string;
  description: string;
  image: string;
}

export interface PokemonType {
  id: number;
  name: string;
}
