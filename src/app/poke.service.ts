import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { PokemonCollection, PokemonType } from "./poke.models";

export type PokemonQuery = {
  limit?: number;
  page?: number;
  typeId?: number;
  lang?: string;
  search?: string;
}

export type PokemonTypeQuery = {
  lang?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PokeService {
  #httpClient = inject(HttpClient);

  getTypes = (query: PokemonTypeQuery = {}) => this.#httpClient.get<PokemonType[]>('/api/types', { params: query });

  getPokemons = (query: PokemonQuery = {}) => this.#httpClient.get<PokemonCollection>('/api/pokemons', { params: query });

  getLanguages = () => this.#httpClient.get<string[]>('/api/languages');
}
