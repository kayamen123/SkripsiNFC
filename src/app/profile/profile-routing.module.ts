import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NfcPage } from '../nfc/nfc.page';

import { ProfilePage } from './profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  },
  {
    path: 'nfc',
    loadChildren: () => import('../nfc/nfc.module').then(m => m.NfcPageModule)
  },  
  {
    path: 'nfc-pinjam',
    loadChildren: () => import('../nfc-pinjam/nfc-pinjam.module').then( m => m.NfcPinjamPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
