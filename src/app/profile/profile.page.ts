import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Ndef, NFC } from '@ionic-native/nfc/ngx';
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
  dateNow: any;
  isDateSame = false;
  photo: SafeResourceUrl = 'https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png';
  status = false;
  bookLib: any;
  dateBook: any;
  bookName: any;
  linkBook: any;
  descBook: any;
  bookBorrow: any;
  historyStatus: boolean = false;
  momentjs: any = moment;
  constructor(
    private nfc: NFC, 
    public rgsSrv: RegisterServiceService,
    private platform: Platform,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { 
    this.platform.ready().then(()=>{
      this.checkNFC();
    });
  }

  ngOnInit() {
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('roles');
    this.photo = localStorage.getItem('imageUrl');
    console.log("Name :",this.name);
    console.log("Role :",this.role);
    if(this.role == 'admin') {
      this.status = true;
    }
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

  async checkNFC(){
    await this.nfc.enabled().then(() => {
        this.nfc.addNdefListener().subscribe(
          async (tagEvent) => {
            this.tagListenerSuccess(tagEvent);
            this.onChange();        
            console.log(this.historyStatus);
            this.cdr.detectChanges();
          });
        //  this.nfc.addTagDiscoveredListener().subscribe((tagEvent) => this.tagWriterSuccess(tagEvent));
    })
    .catch(async (err) => {
      let alert = await this.alertCtrl.create({
        subHeader: 'NFC_DISABLE_ON_PHONE',
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
          },
          {
            text: 'GO_SETTING',
            handler: () => {
              this.nfc.showSettings();
            }
          }
        ]
      });
       return await alert.present();
    });
  }

  tagListenerSuccess(tagEvent) {
    console.log("coucou");
    console.log(tagEvent);
    let nfcBookName = this.nfc.bytesToString(tagEvent.tag.ndefMessage[0].payload).split('');
    nfcBookName.splice(0,3);
    this.bookName = nfcBookName.join("");

    let nfcBookDate = this.nfc.bytesToString(tagEvent.tag.ndefMessage[1].payload).split('');
    nfcBookDate.splice(0,3);
    this.dateBook = nfcBookDate.join("");

    let nfcBookDesc = this.nfc.bytesToString(tagEvent.tag.ndefMessage[2].payload).split('');
    nfcBookDesc.splice(0,3);
    this.descBook = nfcBookDesc.join("");

    let nfcBookLink = this.nfc.bytesToString(tagEvent.tag.ndefMessage[3].payload).split('');
    nfcBookLink.splice(0,3);
    this.linkBook = nfcBookLink.join("");
    console.log(this.bookName);

    
}

onChange(){
  this.historyStatus = true;
}

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      duration: 5000
    });
    await loading.present();


    const { role, data } = await loading.onDidDismiss();
  }
  ionViewDidEnter() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.backButtonAlert();
    })
  }

  perpanjang(){
   /* this.rgsSrv.getAllBorrowBook(this.name).snapshotChanges().pipe(
      map(changes =>
          changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      )
    ).subscribe(data => {
      this.bookBorrow = data;
      console.log(this.bookBorrow);
      console.log(this.bookBorrow.length); 
      this.dateNow = moment().format("MMM Do YY");  
      if (this.dateNow == this.bookBorrow[0].valid_date){
        this.isDateSame = true;
        this.bookBorrow[0].valid_date = this.momentjs().add(1, 'days').format("MMM Do YY");
        this.rgsSrv.updateValidDate(this.bookBorrow[0].key, this.bookBorrow[0], this.name).then(res => {
          console.log(res);
        }).catch(error => console.log(error));
      }
      console.log(this.isDateSame);
    }) */

  }

  logout(){
    this.router.navigate(['/regis']);
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
}
