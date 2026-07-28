import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  isAuth = this.auth.isAuthenticated;
  userInitial = computed(() => {
    const u = this.auth.currentUser();
    return u ? (u.full_name || u.email).charAt(0).toUpperCase() : '';
  });

  constructor(private auth: AuthService) {}

  logout(): void {
    this.auth.logout().subscribe();
  }
}
