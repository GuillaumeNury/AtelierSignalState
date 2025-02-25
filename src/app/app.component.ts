import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { combineLatest, EMPTY, pipe, switchMap, tap } from 'rxjs';
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
  withMethods((store, service = inject(PokeService)) => {
    const loadTypes = (lang: string) => {
      return service.getTypes({ lang }).pipe(
        tap(types => patchState(store, { types })),
      );
    };

    const _loadPokemons = (query: PokemonQuery | null) => {
      if (!query) {
        return EMPTY;
      }

      return service.getPokemons(query).pipe(
        tap(collection => patchState(store, { pokemons: collection.items, pokemonCount: collection.count }))
      );
    };

    function _setLang(selectedLang: string) {
      patchState(store, { selectedLang });

      return combineLatest([
        loadTypes(selectedLang),
        _loadPokemons(store._pokemonQuery())
      ]);
    }

    return ({
      setLang: rxMethod<string>(
        pipe(switchMap(_setLang))
      ),
      _loadLangs: rxMethod<void>(
        pipe(
          switchMap(() => service.getLanguages()),
          tap(langs => patchState(store, { langs })),
          switchMap(langs => _setLang(langs[0]))
        )
      ),
      _loadPokemons: rxMethod<PokemonQuery | null>(
        pipe(switchMap(query => _loadPokemons(query))),
      ),
      setSearch: rxMethod<string>(
        pipe(
          tap(search => patchState(store, { search })),
          tap(() => _loadPokemons(store._pokemonQuery())),
        )
      ),
      toggleType: rxMethod<PokemonType | null>(
        pipe(
          tap((type) => patchState(store, { selectedType: type === store.selectedType() ? null : type })),
          switchMap(() => _loadPokemons(store._pokemonQuery())),
        )
      ),
    });
  }),
  withHooks((store) => ({
    onInit() {
      store._loadLangs();
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
