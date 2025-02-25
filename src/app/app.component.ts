import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PokemonStore } from './app.store';

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
