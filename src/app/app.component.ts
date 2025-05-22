import { Component } from '@angular/core';
import { SameGameComponent } from "./samegame/samegame.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SameGameComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'same-game';
}
