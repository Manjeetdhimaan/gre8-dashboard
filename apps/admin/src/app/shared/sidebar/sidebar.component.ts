import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@manjeet-ecommerce/users';

@Component({
  selector: 'admin-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Output() closeMenuEmitter = new EventEmitter();

  constructor( private authService: AuthService ) {}

  closeMenu(){
    this.closeMenuEmitter.emit(null)
  }

  onLogout() {
    this.authService.logout();
  }
}
