import { AsyncPipe } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { PokemonType } from './poke.models';
import { PokeService } from './poke.service';
import { PokeStore } from './app.store';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [PokeStore],
})
export class AppComponent {
  #pokeService = inject(PokeService);
  store = inject(PokeStore);

  pokemonTypes$ = this.#pokeService.getTypes();
  languages$ = this.#pokeService.getLanguages();

  selectedType: PokemonType | null = null;

  constructor() {
    effect(() => console.log(this.store.pokemonQuery()));
  }
}
