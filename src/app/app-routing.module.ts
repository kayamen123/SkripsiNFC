import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'nfc',
    loadChildren: () => import('./nfc/nfc.module').then( m => m.NfcPageModule)
  },
  {
    path: 'regis',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'nfc-pinjam',
    loadChildren: () => import('./nfc-pinjam/nfc-pinjam.module').then( m => m.NfcPinjamPageModule)
  },
  {
    path: 'nfc-pengembalian',
    loadChildren: () => import('./nfc-pengembalian/nfc-pengembalian.module').then( m => m.NfcPengembalianPageModule)
  },
  {
    path: 'admin-cms',
    loadChildren: () => import('./admin-cms/admin-cms.module').then( m => m.AdminCmsPageModule)
  },
  {
    path: 'admin-cms-book',
    loadChildren: () => import('./admin-cms-book/admin-cms-book.module').then( m => m.AdminCmsBookPageModule)
  },
  {
    path: 'help-user',
    loadChildren: () => import('./help-user/help-user.module').then( m => m.HelpUserPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
