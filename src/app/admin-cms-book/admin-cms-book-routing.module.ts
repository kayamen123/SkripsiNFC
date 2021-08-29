import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminCmsBookPage } from './admin-cms-book.page';

const routes: Routes = [
  {
    path: '',
    component: AdminCmsBookPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminCmsBookPageRoutingModule {}
