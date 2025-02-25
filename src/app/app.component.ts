import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, pipe, switchMap, tap } from 'rxjs';
import { Pokemon, PokemonType } from './poke.models';
import { PokemonQuery, PokeService } from './poke.service';

type PokemonState = {
  types: PokemonType[];
  selectedType: PokemonType | null;
  langs: string[];
  selectedLang: string | null;
  pokemons: Pokemon[];
  pokemonCount:number;
  search: string;
};

const PokemonStore = signalStore(
  withState<PokemonState>({
    types: [],
    selectedType: null,
    langs: [],
    selectedLang: null,
    pokemons: [],
    pokemonCount: 0,
    search: '',
  }),
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
    _loadLangs: rxMethod<void>(
      pipe(
        switchMap(() => service.getLanguages()),
        tap(langs => patchState(store, { langs, selectedLang: langs[0] })),
      )
    ),
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
    setLang(selectedLang: string) {
      patchState(store, { selectedLang });
    },
    setSearch(search: string) {
      patchState(store, { search });
    },
    toggleType(type: PokemonType) {
      patchState(store, { selectedType: type === store.selectedType() ? null : type });
    }
  })),
  withHooks((store) => ({
    onInit() {
      store._loadLangs();
      store._loadTypes(store.selectedLang);
      store._loadPokemons(store._pokemonQuery);
    }
  })),
);

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [PokemonStore],
    imports: [FormsModule]
})
export class AppComponent {
  store = inject(PokemonStore);
}
