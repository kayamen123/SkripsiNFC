import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NfcWritePageRoutingModule } from './nfc-write-routing.module';

import { NfcWritePage } from './nfc-write.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NfcWritePageRoutingModule
  ],
  declarations: [NfcWritePage]
})
export class NfcWritePageModule {}
