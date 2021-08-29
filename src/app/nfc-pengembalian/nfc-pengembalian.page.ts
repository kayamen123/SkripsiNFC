import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { async } from '@angular/core/testing';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Capacitor } from '@capacitor/core';

import { Ndef, NdefEvent, NFC } from '@ionic-native/nfc/ngx';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { RegisterServiceService } from '../service/register-service.service';


import * as moment from 'moment-timezone';
import { map } from 'rxjs/operators';
import { BookLibrary } from '../model/bookLibrary';

@Component({
  selector: 'app-nfc-pengembalian',
  templateUrl: './nfc-pengembalian.page.html',
  styleUrls: ['./nfc-pengembalian.page.scss'],
})
export class NfcPengembalianPage implements OnInit {

  
  photo: SafeResourceUrl = 'https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png';
  borrowLib: any;
  bookLib: any;
  userLib: any;
  borrowUser: any;
  userKey: any;
  bookInfo: BookLibrary;
  tagId: any = null;
  bookForm: FormGroup;
  bookCheck = true;
  bookName: string;
  userBorrow: string;
  borrowDate: any;
  currentDate: any = null;
  momentjs: any = moment;
  dateCount: any;
  key: string;
  borrowValid = false;
  isSubmitted = false;
  dendaValid = false;
  diffDate: any;
  constructor(
    private nfc: NFC, 
    private ndef: Ndef,
    private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public rgsSrv: RegisterServiceService,
    public router: Router,
  ) { 
    this.platform.ready().then(()=>{
      this.checkNFC();
    });
  }

  ngOnInit() {
    this.rgsSrv.getAllBookLibrary().snapshotChanges().pipe(
      map(changes =>
          changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      )
    ).subscribe(data => {
      this.bookLib = data;
      console.log(this.bookLib);
      console.log(this.bookLib.length);
    }) 
     this.bookForm = this.formBuilder.group({
      rfid: ['', [Validators.required]]
    })
  }

  ionViewDidEnter() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate(['/profile']);
    })
  }

  logout(){
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  submitForm() {
    this.isSubmitted = true;
    console.log(this.bookForm.value.rfid);
    if (!this.bookForm.valid || this.tagId == null || this.dendaValid == false) {
      console.log('Please provide all the required values!')
      return false;
    } else {
      this.currentDate = this.momentjs().format("MMM Do YY");   
      this.bookForm.addControl('book_name', new FormControl(this.bookName, Validators.required));
      this.bookForm.addControl('userName', new FormControl(this.userBorrow, Validators.required));
      this.bookForm.addControl('borrow_date', new FormControl(this.borrowDate, Validators.required));
      this.bookForm.addControl('return_date', new FormControl(this.currentDate, Validators.required));
      this.rgsSrv.createHistoryBook(this.bookForm.value,this.bookForm.value.userName).then(res => {
        console.log(res);
        console.log(this.bookForm.value.userName);
        this.rgsSrv.returnBookLibrary(this.userKey, this.bookForm.value.userName).then(res => {
          console.log(res);
          this.rgsSrv.returnBookLibrary(this.key, this.bookForm.value.rfid).then(res => {
            console.log(res);
            this.rgsSrv.updateStatusBook1(this.key,this.bookInfo).then(res => {
              console.log(res);
              this.bookForm.reset();
              this.router.navigate(['/profile']);
            }).catch(error => console.log(error));
          }).catch(error => console.log(error));
        }).catch(error => console.log(error));
      }).catch(error => console.log(error));
    }
  }

  onChange() {
    this.bookCheck = true;
    this.diffDate = 0;
    this.borrowValid = false;
    this.dendaValid = false;
    this.rgsSrv.getAllBorrowBook(this.tagId).snapshotChanges().pipe(
      map(changes =>
          changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      )
    ).subscribe(data => {
      this.borrowLib = data;
      console.log(this.borrowLib);
      console.log(this.borrowLib.length);
      if(this.borrowLib == 0){
        this.bookCheck = false;
      } else {
        this.userBorrow = this.borrowLib[0].userName;
        this.bookName = this.borrowLib[0].book_name;
        this.borrowDate = this.borrowLib[0].borrow_date;
        this.key = this.borrowLib[0].key;
        this.currentDate = this.momentjs().format("MMM Do YY"); 
        var admission = moment(this.borrowLib[0].valid_date, 'MMM Do YY'); 
        var discharge = moment(this.currentDate, 'MMM Do YY');
        this.diffDate = discharge.diff(admission, 'days');
        console.log("Beda tanggal:",this.diffDate);
        this.rgsSrv.getAllBorrowBook(this.userBorrow).snapshotChanges().pipe(
          map(changes =>
              changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
          )
        ).subscribe(data => {
          this.borrowUser = data;   
          console.log(this.borrowUser);
          console.log(this.borrowUser.length);
          for(let i = 0; i < this.borrowUser.length; i++) {
            if(this.bookForm.value.rfid == this.borrowUser[i].rfid) {
                this.userKey = this.borrowUser[i].key;
            }
          }
        })
        for(let i = 0; i < this.bookLib.length; i++) {
          if(this.bookForm.value.rfid == this.bookLib[i].rfid) {
              this.bookInfo = this.bookLib[i];
          }
        }
        if (this.diffDate < 0) {
          this.diffDate = 0;
          this.dendaValid = true;
        } else {
          this.dendaValid = true;
        }
      }
    }) 
  }
  
  async presentAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Return Book',
      message: 'Are you sure want to return this Book?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Return',
          handler: () => this.submitForm()
        }
      ]
    });
    await alert.present();
  }

  async checkNFC(){
    await this.nfc.enabled().then(() => {
      this.addListenNFC();
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

  async addListenNFC(){
    console.log('enter into a addListenNFC');
    this.tagId = "";
    //this.tagDesc = "";

    this.nfc.addTagDiscoveredListener(() => {
      console.log('successfully attached ndef listener');
    }, async (err) => {
      console.log('error attaching ndef listener', err);

      let toast = this.toastCtrl.create({
        message: err,
        duration: 1000,
        position: 'bottom'
      });

      return (await toast).present();

    }).subscribe(async (event) => {
      console.log('received ndef message. the tag contains: ', event);
      console.log('decode tag id', this.nfc.bytesToHexString(event.tag.id));

      this.tagId = "";
      //this.tagDesc = "";

      let tagid = await this.nfc.bytesToHexString(event.tag.id);
      this.tagId = tagid;

      // if(event.tag.ndefMessage){
      //   let payload = event.tag.ndefMessage[0].payload;
      //   let tagContent = await this.nfc.bytesToString(payload).substring(3);
      //   this.tagDesc = tagContent;
      // }

      let toast = this.toastCtrl.create({
        message: this.nfc.bytesToHexString(event.tag.id),
        duration: 5000,
        position: 'bottom'
      });
      (await toast).present();
      this.cdr.detectChanges();
    });
  }
}
