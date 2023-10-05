
import { inject } from '@angular/core';
import { rxMethod, selectSignal, signalStore, withHooks, withMethods, withSignals, withState } from '@ngrx/signal-store';
import { debounceTime, pipe, switchMap, tap } from 'rxjs';
import { resetPage, setLang, setPokemonTypeId, withLanguageFeature, withPaginationFeature, withTypesFeature } from './features';
import { PokemonCollection } from './poke.models';
import { PokeService, PokemonQuery } from './poke.service';
import { signalPipe, stripUndefinedValues } from './utils';

type PokeState = {
  collection: PokemonCollection;
  search: string;
}

export const PokeStore = signalStore(
  withLanguageFeature(),
  withTypesFeature(),
  withPaginationFeature(),
  withState<PokeState>({
    collection: { count: 0, items: [] },
    search: '',
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
  withMethods(({ $update, page }) => {
    const pokeService = inject(PokeService);

    return ({
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
        $update(setLang(selectedLang), resetPage());
      },
      setTypeId(typeId: number | undefined) {
        $update(setPokemonTypeId(typeId), resetPage());
      },
      setSearch(search: string) {
        $update({ search }, resetPage());
      },
    });
  }),
  withHooks({
    onInit(store) {
      store.loadPokemons(store.pokemonQuery);
    },
  })
);
