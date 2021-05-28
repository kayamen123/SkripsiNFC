import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'nfc-write',
    pathMatch: 'full'
  },
  {
    path: 'nfc',
    loadChildren: () => import('./nfc/nfc.module').then( m => m.NfcPageModule)
  },
  {
    path: 'nfc-write',
    loadChildren: () => import('./nfc-write/nfc-write.module').then( m => m.NfcWritePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
