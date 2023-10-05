
import { inject } from '@angular/core';
import { rxMethod, selectSignal, signalStore, withHooks, withMethods, withSignals, withState } from '@ngrx/signal-store';
import { debounceTime, pipe, switchMap, tap } from 'rxjs';
import { setLang, setPokemonTypeId, withLanguageFeature, withTypesFeature } from './features';
import { PokemonCollection } from './poke.models';
import { PokeService, PokemonQuery } from './poke.service';
import { signalPipe, stripUndefinedValues } from './utils';

type PokeState = {
  collection: PokemonCollection;
  page: number;
  search: string;
}

export const PokeStore = signalStore(
  withLanguageFeature(),
  withTypesFeature(),
  withState<PokeState>({
    collection: { count: 0, items: [] },
    page: 1,
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
        $update(setLang(selectedLang), { page: 1 });
      },
      setTypeId(typeId: number | undefined) {
        $update(setPokemonTypeId(typeId), { page: 1 });
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
      store.loadPokemons(store.pokemonQuery);
    },
  })
);
