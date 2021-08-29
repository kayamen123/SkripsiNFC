import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HelpUserPageRoutingModule } from './help-user-routing.module';

import { HelpUserPage } from './help-user.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HelpUserPageRoutingModule
  ],
  declarations: [HelpUserPage]
})
export class HelpUserPageModule {}
