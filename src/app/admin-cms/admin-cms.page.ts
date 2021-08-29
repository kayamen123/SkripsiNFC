import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ViewEncapsulation } from '@angular/core';
import { RegisterServiceService } from '../service/register-service.service';
import { map } from 'rxjs/operators';
import { LoadingController, ModalController } from '@ionic/angular';
import { ModalEditUserComponent } from '../modal/modal-edit-user/modal-edit-user.component';
import { Router } from '@angular/router';

export interface Data {
  movies: string;
}

@Component({
  selector: 'app-admin-cms',
  templateUrl: './admin-cms.page.html',
  styleUrls: ['./admin-cms.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminCmsPage implements OnInit {

  public data: Data;
  public columns: any;
  public rows: any;
  profileStatus = false;
  name: string;
  role: string;
  dateNow: any;
  isDateSame = false;
  status = false;
  userLib: any;
  hideTab = false;

  constructor(
    private http: HttpClient,
    private rgsSrv: RegisterServiceService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private router: Router
  ) {
    this.columns = [
      { name: 'Name' },
      { name: 'email' }
    ];
  }

  ngOnInit() {
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('roles');
    if(this.name == null) {
      this.router.navigate(['/login']);
    }
    console.log("Name :",this.name);
    console.log("Role :",this.role);
    if(this.role == 'admin') {
      this.status = true;
    }
      //do stuff with images
      this.presentLoading();
  }


  IonViewDidEnter() {
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('roles');
    if(this.name == null) {
      this.router.navigate(['/login']);
    }
    console.log("Name :",this.name);
    console.log("Role :",this.role);
    if(this.role == 'admin') {
      this.status = true;
    }
      //do stuff with images
      this.presentLoading();
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
    });
    await loading.present();
    this.rgsSrv.getAllUserLibrary().snapshotChanges().pipe(
      map(changes =>
          changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      )
    ).subscribe(data => {
      this.userLib = data;
      console.log(this.userLib);
      console.log(this.userLib.length);
      this.rows = data;
      this.hideTab = true;
      loading.dismiss();
    })
  }

  logout(){
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  
  profile(){
    this.router.navigate(['/profile']);
  }
  inputBook(){
    this.router.navigate(['/nfc']);
  }
  nfcPinjam(){
    this.router.navigate(['/nfc-pinjam']);
  }
  adminBook(){
    this.router.navigate(['/admin-cms-book']);
  }
  editModal(e) {
    if(e.type === 'click') {
      this.presentModal(e.row);
    }
  }

  async presentModal(data) {
    const modal = await this.modalCtrl.create({
      component: ModalEditUserComponent,
      componentProps: { selectedUser: data }
    });

    modal.onDidDismiss().then(resultData => {
      console.log(resultData.data , resultData.role);
      if(resultData.data != null) {
        this.updateUser(resultData);
      }
      this.presentLoading();
    })

    return await modal.present();
  }

  async updateUser(event) {
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
    });
    await loading.present();
    this.rgsSrv.updateUserLibrary(event.data.key,event.data).then(res3 => {
      console.log(res3);
      loading.dismiss();
    }).catch(error => console.log(error));
  }
}
