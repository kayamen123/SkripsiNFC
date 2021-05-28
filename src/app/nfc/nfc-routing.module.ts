import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NfcWritePage } from '../nfc-write/nfc-write.page';

import { NfcPage } from './nfc.page';

const routes: Routes = [
  {
    path: '',
    component: NfcPage
  },
  {
    path: 'nfc-write',
    component: NfcWritePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NfcPageRoutingModule {}
