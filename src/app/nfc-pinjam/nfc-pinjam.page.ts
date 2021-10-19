import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { async } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Ndef, NdefEvent, NFC } from '@ionic-native/nfc/ngx';
import { AlertController, LoadingController, NavController, Platform, ToastController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { BookLibrary } from '../model/bookLibrary';
import { RegisterServiceService } from '../service/register-service.service';

import * as moment from 'moment-timezone';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import { WordLibrary } from '../model/wordLibrary';


const { Browser } = Plugins;
@Component({
  selector: 'app-nfc-pinjam',
  templateUrl: './nfc-pinjam.page.html',
  styleUrls: ['./nfc-pinjam.page.scss'],
})
export class NfcPinjamPage implements OnInit {
  tagId: any = null;
  validDate: any = null;
  tagCheck = false;
  bookInfo: BookLibrary;
  name: string;
  role: string;
  status = false;
  profileStatus = false;
  //tagDesc: an
  hasil1: string[] = [];
  hasil2: string[] = [];
  hasil3: string[] = [];
  hasil4: string[] = [];
  hasil5: string[] = [];
  hasil6: string[] = [];
  dictionary: any = [];
  dictionary1: any = [];
  dictionary2: any = [];
  string_join = '';
  bookForm: FormGroup;
  bookValidator = true;
  bookStatus = false;
  bookCond = true;
  isSubmitted = false;
  historyStatus = false;
  bookId = '';
  keyId = '';
  bookLib: any;
  dateBook: string;
  bookName: any;
  linkBook: any;
  descBook: any;
  writterBook: any;
  isbnBook: any;
  bookCounter = 0;
  momentjs: any = moment;
  photo: SafeResourceUrl = 'https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png';
  cover: SafeResourceUrl = ''

  constructor(
    private nfc: NFC, 
    private ndef: Ndef,
    private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private loadingCtrl: LoadingController,
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
    this.bookForm = this.formBuilder.group({
      rfid: ['', [Validators.required]]
    })
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('roles');
    if(this.name == null) {
      this.router.navigate(['/login']);
    }
    if(this.role == 'admin') {
      this.status = true;
    }
    this.cdr.detectChanges();
  }

  IonViewDidEnter() {
    this.platform.backButton.subscribeWithPriority(5, () => {
      this.router.navigate(['/profile']);
    })
    this.bookForm = this.formBuilder.group({
      rfid: ['', [Validators.required]]
    })
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('roles');  
    if(this.name == null) {
      this.router.navigate(['/login']);
    }
    if(this.role == 'admin') {
      this.status = true;
    }
    this.cdr.detectChanges();
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
    this.nfc.addNdefListener(() => {
      console.log('successfully attached ndef listener');
    }, async (err) => {
      console.log('error attaching ndef listener', err);

    }).subscribe(async (event) => {
      this.historyStatus = false;
      this.tagListenerSuccess(event);       
    });
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
  adminUser(){
    this.router.navigate(['/admin-cms']);
  }
  adminBook(){
    this.router.navigate(['/admin-cms-book']);
  }

  tagListenerSuccess(tagEvent) {
    console.log(tagEvent);
    if(this.hasil1.length >= 0) {
      this.hasil1.splice(0,this.hasil1.length);
      this.hasil2.splice(0,this.hasil2.length);
      this.hasil3.splice(0,this.hasil3.length);
      this.hasil4.splice(0,this.hasil4.length);
      this.hasil5.splice(0,this.hasil5.length);
      this.hasil6.splice(0,this.hasil6.length);
      this.dictionary.splice(0, this.dictionary.length);
      this.dictionary1.splice(0, this.dictionary1.length);
      this.dictionary2.splice(0, this.dictionary2.length);
      this.bookName = null;
      this.dateBook = null;
      this.isbnBook = null;
      this.descBook  = null;
      this.writterBook = null;
      this.linkBook = null;
    }


    let nfcBookName = this.nfc.bytesToString(tagEvent.tag.ndefMessage[0].payload).split('');
    nfcBookName.splice(0,3);
    this.bookName = nfcBookName.join("");

    let nfcBookDate = this.nfc.bytesToString(tagEvent.tag.ndefMessage[1].payload).split('');
    nfcBookDate.splice(0,3);
    this.dateBook = nfcBookDate.join("");

    let nfcisbnBook = this.nfc.bytesToString(tagEvent.tag.ndefMessage[2].payload).split('');
    nfcisbnBook.splice(0,3);
    this.isbnBook = nfcisbnBook.join("");

    let nfcdescBook = this.nfc.bytesToString(tagEvent.tag.ndefMessage[3].payload).split('');
    nfcdescBook.splice(0,3);
    this.descBook = nfcdescBook.join("");

    let nfcBookWritter = this.nfc.bytesToString(tagEvent.tag.ndefMessage[4].payload).split('');
    nfcBookWritter.splice(0,3);
    this.writterBook = nfcBookWritter.join("");

    let nfcBookLink = this.nfc.bytesToString(tagEvent.tag.ndefMessage[5].payload).split('');
    nfcBookLink.splice(0,1);
    this.linkBook = nfcBookLink.join("");
    this.photo = "https://"+this.linkBook;
    this.keyId = this.nfc.bytesToHexString(tagEvent.tag.id);
    this.dateBook = this.dateBook.split('T')[0];

    for(let i = 0; i < this.bookName.length; i++) {
      const temp = this.bookName[i];
      if(temp == ',') {
        this.hasil1.push(this.string_join);
        this.string_join = '';
      } else {
        const valueStringJoin = this.string_join.concat(temp);
        this.string_join = valueStringJoin;
      }
    }
    this.hasil1.push(this.string_join);
    this.string_join = '';
    for(let i = 0; i < this.descBook.length; i++) {
      const temp = this.descBook[i];
      if(temp == ',') {
        this.hasil2.push(this.string_join);
        this.string_join = '';
      } else {
        const valueStringJoin = this.string_join.concat(temp);
        this.string_join = valueStringJoin;
      }
    }
    this.hasil2.push(this.string_join);
    this.string_join = '';
    for(let i = 0; i < this.writterBook.length; i++) {
      const temp = this.writterBook[i];
      if(temp == ',') {
        this.hasil3.push(this.string_join);
        this.string_join = '';
      } else {
        const valueStringJoin = this.string_join.concat(temp);
        this.string_join = valueStringJoin;
      }
    }
    this.hasil3.push(this.string_join);
    this.string_join = '';
    this.cdr.detectChanges();
    this.presentLoading();
  }

  async AlertError(){
    const alert = await this.alertCtrl.create({
        message: 'Book not Exist',
        buttons: [{
            text: 'Ok',
            role: 'cancel'
        }]
    });
    
    await alert.present();
  }

 async presentLoading() {
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
    });
    await loading.present();

    this.rgsSrv.getDictionaryBook(this.keyId, null).snapshotChanges().pipe(
      map(changes =>
          changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      )
    ).subscribe(data => {
      this.dictionary = data;
      this.cdr.detectChanges();
      if(data.length == 0) {
        loading.dismiss();
        this.AlertError();
        return;
      }
      this.rgsSrv.getDictionaryBook(this.keyId, this.dictionary[0].key).snapshotChanges().pipe(
        map(changes =>
            changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
        )
      ).subscribe(data => {
        this.dictionary = data;
        this.cdr.detectChanges();
        for(let y = 0; y < this.hasil1.length; y++) {
          for(let x = 0; x < this.dictionary.length; x++) {
            if(this.hasil1[y] == this.dictionary[x].id) {
              this.hasil4.push(this.dictionary[x].name);
            }
          }
        }
        this.bookName = this.hasil4.join("");
        this.rgsSrv.getDescBook(this.keyId, null).snapshotChanges().pipe(
          map(changes =>
              changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
          )
        ).subscribe(data1 => {
          this.dictionary1 = data1;
          this.cdr.detectChanges();
          this.rgsSrv.getDescBook(this.keyId, this.dictionary1[0].key).snapshotChanges().pipe(
            map(changes =>
                changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
            )
          ).subscribe(data1 => {
            this.dictionary1 = data1;
            this.cdr.detectChanges();
            for(let y = 0; y < this.hasil2.length; y++) {
              for(let x = 0; x < this.dictionary1.length; x++) {
                if(this.hasil2[y] == this.dictionary1[x].id) {
                  this.hasil5.push(this.dictionary1[x].name);
                }
              }
            }
            this.descBook = this.hasil5.join("");
            this.rgsSrv.getWritterBook(this.keyId, null).snapshotChanges().pipe(
              map(changes =>
                  changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
              )
            ).subscribe(data2 => {
              this.dictionary2 = data2;
              this.cdr.detectChanges();
              this.rgsSrv.getWritterBook(this.keyId, this.dictionary2[0].key).snapshotChanges().pipe(
                map(changes =>
                    changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
                )
              ).subscribe(data2 => {
                this.dictionary2 = data2;
                this.cdr.detectChanges();
                for(let y = 0; y < this.hasil3.length; y++) {
                  for(let x = 0; x < this.dictionary2.length; x++) {
                    if(this.hasil3[y] == this.dictionary2[x].id) {
                      this.hasil6.push(this.dictionary2[x].name);
                    }
                  }
                }
                this.writterBook = this.hasil6.join("");
                this.onChange();
                loading.dismiss();
                this.cdr.detectChanges();
              }) 
            })
          }) 
        })
      }) 
    })
  }

  onChange(){
    this.historyStatus = true;
  }
}
