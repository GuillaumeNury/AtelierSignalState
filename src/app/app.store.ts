
import { inject } from '@angular/core';
import { rxMethod, selectSignal, signalStore, withHooks, withMethods, withSignals, withState } from '@ngrx/signal-store';
import { debounceTime, pipe, switchMap, tap } from 'rxjs';
import { mergeCollection, resetPage, setCollection, setLang, setPokemonTypeId, withCollectionFeature, withLanguageFeature, withPaginationFeature, withTypesFeature } from './features';
import { Pokemon } from './poke.models';
import { PokeService, PokemonQuery } from './poke.service';
import { signalPipe, stripUndefinedValues } from './utils';

type PokeState = {
  search: string;
}

export const PokeStore = signalStore(
  withLanguageFeature(),
  withTypesFeature(),
  withPaginationFeature(),
  withCollectionFeature<Pokemon>(),
  withState<PokeState>({ search: '' }),
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
        tap(collection => $update(
          page() === 1 ? setCollection(collection) : mergeCollection(collection),
        )),
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
