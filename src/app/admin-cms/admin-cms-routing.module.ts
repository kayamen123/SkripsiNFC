import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminCmsPage } from './admin-cms.page';

const routes: Routes = [
  {
    path: '',
    component: AdminCmsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminCmsPageRoutingModule {}
