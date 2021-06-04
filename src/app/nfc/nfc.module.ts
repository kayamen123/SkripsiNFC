import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NfcPageRoutingModule } from './nfc-routing.module';

import { NfcPage } from './nfc.page';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireDatabaseModule } from '@angular/fire/database';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NfcPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [NfcPage]
})
export class NfcPageModule {}
