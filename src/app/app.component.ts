import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PokemonType } from './poke.models';
import { PokeService } from './poke.service';

@Component({
    selector: 'app-root',
    imports: [AsyncPipe],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
  #pokeService = inject(PokeService);

  pokemonTypes$ = this.#pokeService.getTypes();
  pokemons$ = this.#pokeService.getPokemons();
  languages$ = this.#pokeService.getLanguages();

  selectedLang: string = 'en';
  selectedType: PokemonType | null = null;
}
