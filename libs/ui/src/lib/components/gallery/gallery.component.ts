import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ui-gallery',
  templateUrl: './gallery.component.html',
  styles: [],
})
export class GalleryComponent implements OnInit {

  @Input() images: string[];
  @Input() mainImageSrc: string;

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  constructor() {
  }

  ngOnInit(): void {
    if(this.images && this.mainImageSrc) {
      this.images.unshift(this.mainImageSrc);
    }
  }
}
