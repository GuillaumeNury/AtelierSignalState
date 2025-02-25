import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, pipe, switchMap, tap } from 'rxjs';
import { Pokemon, PokemonType } from './poke.models';
import { PokemonQuery, PokeService } from './poke.service';
import { withLangSupport } from './feature/with-lang.feature';

type PokemonState = {
  types: PokemonType[];
  selectedType: PokemonType | null;
  pokemons: Pokemon[];
  pokemonCount:number;
  search: string;
};

export const PokemonStore = signalStore(
  withState<PokemonState>({
    types: [],
    selectedType: null,
    pokemons: [],
    pokemonCount: 0,
    search: '',
  }),
  withLangSupport(),
  withComputed(store => ({
    canShowMore: computed(() => store.pokemons().length !== store.pokemonCount()),
    _pokemonQuery: computed((): PokemonQuery | null => {
      const selectedLang = store.selectedLang();
      if (!selectedLang) {
        return null
      }

      const query: PokemonQuery = { lang: selectedLang, search: store.search() };
      const selectedType = store.selectedType();

      if (selectedType) {
        query.typeId = selectedType.id;
      }

      return query;
    })
  })),
  withMethods((store, service = inject(PokeService)) => ({
    _loadTypes: rxMethod<string | null>(
      pipe(
        filter(lang => lang !== null),
        switchMap(lang => service.getTypes({ lang })),
        tap(types => patchState(store, { types })),
      )
    ),
    _loadPokemons: rxMethod<PokemonQuery | null>(
      pipe(
        filter(query => query !== null),
        switchMap(query => service.getPokemons(query)),
        tap(collection => patchState(store, { pokemons: collection.items, pokemonCount: collection.count })),
      )
    ),
    setSearch(search: string) {
      patchState(store, { search });
    },
    toggleType(type: PokemonType) {
      patchState(store, { selectedType: type === store.selectedType() ? null : type });
    }
  })),
  withHooks((store) => ({
    onInit() {
      store._loadTypes(store.selectedLang);
      store._loadPokemons(store._pokemonQuery);
    }
  })),
);
