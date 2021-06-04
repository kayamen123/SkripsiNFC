import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NfcPinjamPage } from './nfc-pinjam.page';

const routes: Routes = [
  {
    path: '',
    component: NfcPinjamPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NfcPinjamPageRoutingModule {}
