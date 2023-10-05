
import { rxMethod, selectSignal, signalStore, withHooks, withMethods, withSignals, withState } from '@ngrx/signal-store';
import { debounceTime, pipe, switchMap, tap } from 'rxjs';
import { PokemonCollection, PokemonType } from './poke.models';
import { PokeService, PokemonQuery } from './poke.service';
import { signalPipe, stripUndefinedValues } from './utils';
import { inject } from '@angular/core';

type PokeState = {
  types: PokemonType[];
  collection: PokemonCollection;
  languages: string[];
  selectedLang: string;
  page: number;
  selectedTypeId: number | undefined;
  search: string;
}

export const PokeStore = signalStore(
  withState<PokeState>({
    types: [],
    collection: { count: 0, items: [] },
    languages: [],
    selectedLang: 'en',
    page: 1,
    search: '',
    selectedTypeId: undefined,
  }),
  withSignals((store) => ({
    pokemonQuery: selectSignal(
      store.page,
      store.selectedTypeId,
      signalPipe(store.search, debounceTime(300), { initialValue: '' }),
      store.selectedLang,
      (page, typeId, search, lang): PokemonQuery => stripUndefinedValues({ page, typeId, search, lang }),
    ),
  })),
  withMethods(({ $update, page, selectedTypeId }) => {
    const pokeService = inject(PokeService);

    return ({
      loadTypes: rxMethod<string>(pipe(
        switchMap(lang => pokeService.getTypes({ lang })),
        tap(types => $update({ types })),
      )),
      loadLanguages: rxMethod<void>(pipe(
        switchMap(() => pokeService.getLanguages()),
        tap(languages => $update({ languages })),
      )),
      loadPokemons: rxMethod<PokemonQuery>(pipe(
        switchMap(query => pokeService.getPokemons(query)),
        tap(collection => $update(s => ({
          collection: page() === 1 ? collection : {
            count: collection.count,
            items: [...s.collection.items, ...collection.items],
          },
        }))),
      )),
      setLang(selectedLang: string) {
        $update({ selectedLang, page: 1 });
      },
      setTypeId(typeId: number | undefined) {
        $update({ selectedTypeId: typeId === selectedTypeId() ? undefined : typeId, page: 1 });
      },
      setSearch(search: string) {
        $update({ search, page: 1 });
      },
      loadMore() {
        $update({ page: page() + 1 });
      },
    });
  }),
  withHooks({
    onInit(store) {
      store.loadLanguages();
      store.loadTypes(store.selectedLang);
      store.loadPokemons(store.pokemonQuery);
    },
  })
);
