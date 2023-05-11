import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'admin-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  isSideBarOpen = true;

  ngOnInit() {
    if(window.innerWidth < 600) {
      this.isSideBarOpen = false;
    }
  }

  toggleSideBar() {
    this.isSideBarOpen = !this.isSideBarOpen;
  }
}
