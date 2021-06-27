import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { async } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Ndef, NdefEvent, NFC } from '@ionic-native/nfc/ngx';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { BookLibrary } from '../model/bookLibrary';
import { RegisterServiceService } from '../service/register-service.service';

import * as moment from 'moment-timezone';
import { SafeResourceUrl } from '@angular/platform-browser';



@Component({
  selector: 'app-nfc-pinjam',
  templateUrl: './nfc-pinjam.page.html',
  styleUrls: ['./nfc-pinjam.page.scss'],
})
export class NfcPinjamPage implements OnInit {


  tagId: any = null;
  currentDate: any = null;
  validDate: any = null;
  tagCheck = false;
  bookInfo: BookLibrary;
  //tagDesc: an
  bookForm: FormGroup;
  bookValidator = true;
  bookStatus = false;
  bookCond = true;
  isSubmitted = false;
  bookLib: any;
  bookCounter = 0;
  momentjs: any = moment;
  photo: SafeResourceUrl = 'https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png';

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

  get errorControl() {
    return this.bookForm.controls;
  }

  submitForm() {
    this.isSubmitted = true;
    console.log(this.bookForm.value.rfid);
    if (!this.bookForm.valid || this.tagId == null || this.tagCheck == false) {
      this.bookValidator = false;
      console.log('Please provide all the required values!')
      return false;
    } else {
      console.log(this.bookForm.value)
      this.currentDate = this.momentjs().format("MMM Do YY");   
      this.validDate = this.momentjs().add(3, 'days').format("MMM Do YY");  
      this.bookForm.addControl('book_name', new FormControl(this.bookInfo.book_name, Validators.required));
      this.bookForm.addControl('userName', new FormControl(localStorage.getItem('name'), Validators.required));
      this.bookForm.addControl('borrow_date', new FormControl(this.currentDate, Validators.required));
      this.bookForm.addControl('valid_date', new FormControl(this.validDate, Validators.required));
      this.rgsSrv.createBorrowUser(this.bookForm.value,localStorage.getItem('name')).then(res => {
        console.log(res);
        this.rgsSrv.createBorrowBook(this.bookForm.value,this.bookForm.value.rfid).then(res => {
          console.log(res);
          this.bookInfo.book_status = false;        
          this.rgsSrv.updateStatusBook2(this.bookInfo.key,this.bookInfo).then(res => {
            console.log(res);
            this.bookForm.reset();
            this.router.navigate(['/profile']);
          }).catch(error => console.log(error));
        }).catch(error => console.log(error));
      }).catch(error => console.log(error));
    }
  }

  onChange() {
    this.bookValidator = true;
    this.bookCond = true;
    this.tagCheck = false;
    this.bookStatus = false;
    console.log(this.bookLib.length);
    console.log(this.bookForm.value.rfid)
    for(let i = 0; i < this.bookLib.length; i++) {
      if(this.bookForm.value.rfid == this.bookLib[i].rfid) {
        this.tagCheck = true;
        if(this.bookLib[i].book_status == false){
          this.bookCond = false;
          break;
        } else {
          // this.tagCheck = true;
          this.bookStatus = true;
          this.bookInfo = this.bookLib[i];
          this.photo = this.bookLib[i].imageUrl
          break;
        }
      }
    }
    if(this.tagCheck == true) {
      console.log(this.bookInfo.book_name);
    } else {
      console.log("masuk");
      this.bookValidator = false;
    } 
  }

  async presentAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Borrow Book',
      message: 'Are you sure want to borrow this Book?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Borrow',
          handler: () => this.submitForm()
        }
      ]
    });
    await alert.present();
  }

  tagListenerSuccess(tagEvent) {
    console.log("coucou");
    this.photo = this.nfc.bytesToString(tagEvent.tag.ndefMessage[0].payload);
    this.bookStatus = true;
    console.log(this.photo);
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
