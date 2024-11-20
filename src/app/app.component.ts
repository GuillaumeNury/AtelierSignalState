import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PokeStore } from './app.store';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [PokeStore],
})
export class AppComponent {
  store = inject(PokeStore);
}
