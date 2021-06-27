import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NfcPengembalianPage } from './nfc-pengembalian.page';

const routes: Routes = [
  {
    path: '',
    component: NfcPengembalianPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NfcPengembalianPageRoutingModule {}
