import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
closeNavbar() {
  const navbar = document.getElementById('navbarNav');
  if (navbar?.classList.contains('show')) {
    navbar.classList.remove('show'); // collapse navbar
  }
}

}
