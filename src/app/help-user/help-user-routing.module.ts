import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HelpUserPage } from './help-user.page';

const routes: Routes = [
  {
    path: '',
    component: HelpUserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpUserPageRoutingModule {}
