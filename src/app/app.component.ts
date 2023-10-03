import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { PokeService } from './poke.service';
import { PokemonType } from './poke.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'atelier-signal-state';

  #pokeService = inject(PokeService);

  pokemonTypes$ = this.#pokeService.getTypes();
  pokemons$ = this.#pokeService.getPokemons();
  languages$ = this.#pokeService.getLanguages();

  selectedLang: string = 'en';
  selectedType: PokemonType | null = null;
}
