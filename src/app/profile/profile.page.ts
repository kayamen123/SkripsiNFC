import { ThrowStmt } from '@angular/compiler';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { RegisterServiceService } from '../service/register-service.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  name: string;
  role: string;
  phone: string;
  email: string;
  status = false;
  profileStatus = false;
  dateNow: any;
  isDateSame = false;
  photo: any = 'https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png';

  bookLib: any;
  dateBook: any;
  bookName: any;
  linkBook: any;
  descBook: any;
  bookBorrow: any;
  historyStatus: boolean = false;
  momentjs: any = moment;
  img = new Image();
  constructor(
    public rgsSrv: RegisterServiceService,
    private platform: Platform,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { 
  }

  ngOnInit() {
    this.presentLoading();
   /* this.presentLoading().then(() => {
      this.rgsSrv.getAllBookLibrary().snapshotChanges().pipe(
        map(changes =>
            changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
        )
      ).subscribe(data => {
        this.bookLib = data;
        console.log(this.bookLib);
        console.log(this.bookLib.length);
      })
      this.rgsSrv.getAllBorrowBook(this.name).snapshotChanges().pipe(
        map(changes =>
            changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
        )
      ).subscribe(data => {
        this.bookBorrow = data;
        console.log(this.bookBorrow);
        console.log(this.bookBorrow.length);
        if(this.bookBorrow.length != 0) {
          this.historyStatus = true;
        }
      })
    });*/

  }

  async presentLoading (){
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
      duration: 1500
    });

    await loading.present();

    const {role , data} = await loading.onDidDismiss();
    this.helpAlert();
    this.profileStatus = true;
  }

  ionViewDidEnter() {
    this.platform.backButton.subscribeWithPriority(15, () => {
      this.backButtonAlert();
    })
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('roles');
    this.photo = localStorage.getItem('imageUrl');
    this.phone = localStorage.getItem('phone');
    this.email = localStorage.getItem('email');
    if(this.name == null) {
      this.router.navigate(['/login']);
    }
    console.log("Name :",this.name);
    console.log("Role :",this.role);
    console.log("Photo: ",this.photo);
    if(this.role == 'admin') {
      this.status = true;
    }
      //do stuff with images
      this.img.src = this.photo;
  }

  // perpanjang(){
  //  /* this.rgsSrv.getAllBorrowBook(this.name).snapshotChanges().pipe(
  //     map(changes =>
  //         changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
  //     )
  //   ).subscribe(data => {
  //     this.bookBorrow = data;
  //     console.log(this.bookBorrow);
  //     console.log(this.bookBorrow.length); 
  //     this.dateNow = moment().format("MMM Do YY");  
  //     if (this.dateNow == this.bookBorrow[0].valid_date){
  //       this.isDateSame = true;
  //       this.bookBorrow[0].valid_date = this.momentjs().add(1, 'days').format("MMM Do YY");
  //       this.rgsSrv.updateValidDate(this.bookBorrow[0].key, this.bookBorrow[0], this.name).then(res => {
  //         console.log(res);
  //       }).catch(error => console.log(error));
  //     }
  //     console.log(this.isDateSame);
  //   }) */

  // }

  logout(){
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  
  inputBook(){
    this.router.navigate(['/nfc']);
  }
  nfcPinjam(){
    this.router.navigate(['/nfc-pinjam']);
  }
  adminUser(){
    this.router.navigate(['/admin-cms']);
  }
  adminBook(){
    this.router.navigate(['/admin-cms-book']);
  }

  async backButtonAlert(){
    const alert = await this.alertCtrl.create({
       message: 'Do you want to exit?',
       buttons: [{
           text: 'Cancel',
           role: 'cancel'
       }, {
         text: 'Exit',
         handler: () => {
           navigator['app'].exitApp();
         }
       }]
    });
    
    await alert.present();
 }
 async helpAlert(){
  const alert = await this.alertCtrl.create({
     message: 'Do you know how to use this App?',
     buttons: [{
         text: 'Yes',
         role: 'cancel'
     }, {
       text: 'No',
       handler: () => {
         this.router.navigate(['/help-user']);
       }
     }]
  });
  
  await alert.present();
}
}
