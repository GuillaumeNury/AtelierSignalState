export type PokemonCollection = {
  count: number
  items: Pokemon[];
}

export type Pokemon = {
  id: number;
  name: string;
  description: string;
  image: string;
}

export type PokemonType = {
  id: number;
  name: string;
}
