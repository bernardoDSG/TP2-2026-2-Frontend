import { ThemeService } from '../../services/theme.service';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-entity-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './entity-menu.html',
  styleUrl: './entity-menu.css',
})
export class EntityMenu {
  protected readonly theme = inject(ThemeService);
}