import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';

import { BannerComponent } from './components/banner/banner.component';
import { SliderComponent } from './components/slider/slider.component';
import { GalleryComponent } from './components/gallery/gallery.component';

@NgModule({
  imports: [CommonModule, ButtonModule, GalleriaModule],
  declarations: [BannerComponent, SliderComponent, GalleryComponent],
  exports: [BannerComponent, SliderComponent, GalleryComponent]
})
export class UiModule {}
