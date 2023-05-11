import { Route } from '@angular/router';

import { CartComponent } from './pages/cart/cart.component';
import { ThanksComponent } from './pages/thanks/thanks.component';

export const ordersRoutes: Route[] = [
  {
    path: 'cart', component: CartComponent
  },
  {
    path: 'success', component: ThanksComponent
  }
];
