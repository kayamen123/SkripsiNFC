import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminCmsBookPageRoutingModule } from './admin-cms-book-routing.module';

import { AdminCmsBookPage } from './admin-cms-book.page';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HttpClientModule } from '@angular/common/http';
import { ModalEditBookComponent } from '../modal/modal-edit-book/modal-edit-book.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminCmsBookPageRoutingModule,
    HttpClientModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule
  ],
  declarations: [AdminCmsBookPage,ModalEditBookComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminCmsBookPageModule {}
