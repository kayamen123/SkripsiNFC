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
import { Plugins } from '@capacitor/core';


const { Browser } = Plugins;
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
  historyStatus = false;
  bookLib: any;
  dateBook: any;
  bookName: any;
  linkBook: any;
  descBook: any;
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
      Browser.addListener('browserPageLoaded',() => {
        console.log('browserPageLoaded event called');
      });
  
      Browser.addListener('browserFinished', () => {
        console.log('browserFinished event called');
      });
      
      Browser.prefetch({
        urls: ['https://'+this.linkBook]
      })

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

  IonViewDidEnter() {
    this.platform.backButton.subscribeWithPriority(15, () => {
      this.router.navigate(['/profile']);
    })
  }

  async OpenBrowser() {
    await Browser.open({toolbarColor:"#f4dc41", url: 'https://'+this.linkBook});
 }

 async checkNFC(){
  await this.nfc.enabled().then(() => {
      this.addListenNFC();
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

  async addListenNFC(){
    console.log('enter into a addListenNFC');
    //this.tagDesc = "";

    this.nfc.addNdefListener(() => {
      console.log('successfully attached ndef listener');
    }, async (err) => {
      console.log('error attaching ndef listener', err);

    }).subscribe(async (event) => {
      this.tagListenerSuccess(event);
      this.onChange();        
      console.log(this.historyStatus);
      this.cdr.detectChanges();
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
    nfcBookLink.splice(0,1);
    this.linkBook = nfcBookLink.join("");
    console.log(this.bookName);
  }

  onChange(){
    this.historyStatus = true;
  }
}
