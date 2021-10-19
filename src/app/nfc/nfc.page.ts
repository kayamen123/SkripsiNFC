import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { async } from '@angular/core/testing';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Capacitor } from '@capacitor/core';

import { Ndef, NdefEvent, NFC } from '@ionic-native/nfc/ngx';
import { AlertController, LoadingController, NavController, Platform, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { WordLibrary } from '../model/wordLibrary';
import { RegisterServiceService } from '../service/register-service.service';



@Component({
  selector: 'app-nfc',
  templateUrl: './nfc.page.html',
  styleUrls: ['./nfc.page.scss'],
})
export class NfcPage implements OnInit {

 @ViewChild('filePicker', { static: false }) filePickerRef: ElementRef<HTMLInputElement>;
 name: string;
 role: string;
 status = false;
 profileStatus = false;
  tagId: any = null;
  myDate: any = null;
  record: any = null;
  currentDate: any = null;
  beforeCompressBook: any = null;
  beforeCompressWritter: any = null;
  beforeCompressReview: any = null;
  afterCompressBook: any = null;
  afterCompressWritter: any = null;
  afterCompressReview: any = null;
  checkCompress = false;
  //tagDesc: an
  bookForm: FormGroup;
  bookForm2: FormGroup;
  recordMessage: any = null;
  isDesktop: boolean;
  bookId: string;
  book:string;
  isDisabled = false;
  isError = false;
  isStart = 0 ;
  description: string;
  isSubmitted = false;
  dataUrl: any = null;
  dataUrl1: any = null;
  momentjs: any = moment;
  photo: SafeResourceUrl = 'https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png';
  rfCount = 0;
  dicCount = 0;
  test = '16';
  asciiValue = 255;
  pValue: string;
  cValue: string;
  hasil: string[] = [];
  hasil2: string[] = [];
  hasil3: string[] = [];
  asciiNum: number;
  trust = false;
  dictionary: WordLibrary[] = [];
  dictionary1: WordLibrary[] = [];
  dictionary2: WordLibrary[] = [];
  dictionary3: WordLibrary[] = [];
  dictionary4: WordLibrary[] = [];
  dictionary5: WordLibrary[] = [];
  wordLib: WordLibrary[];
  word = '';
  compress: string[];
  word_split: string[];

  constructor(
    private nfc: NFC, 
    private ndef: Ndef,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public rgsSrv: RegisterServiceService,
    public router: Router,
    private sanitizer: DomSanitizer,
    private storage: AngularFireStorage,
    private platform: Platform,
    private loadingCtrl: LoadingController
    ) { 
      this.platform.ready().then(()=>{
        this.writeNFC();
      });
    }

  ngOnInit() {    
    this.bookForm = this.formBuilder.group({
      rfid: ['', [Validators.required]],
      book_name: ['', [Validators.required, Validators.minLength(2)]],
      date: ['', [Validators.required]],
      isbn: ['', [Validators.required , Validators.pattern('^[0-9]+$')]],
      writter: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.isDesktop = false;
    
    if((this.platform.is('mobile') && this.platform.is('hybrid')) || 
    this.platform.is('desktop')) {
      this.isDesktop = true;
    }
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
    this.cdr.detectChanges();
    this.platform.backButton.subscribeWithPriority(5, () => {
      this.router.navigate(['/profile']);
    })
    this.bookForm = this.formBuilder.group({
      rfid: ['', [Validators.required]],
      book_name: ['', [Validators.required, Validators.minLength(2)]],
      date: ['', [Validators.required]],
      isbn: ['', [Validators.required , Validators.pattern('^[0-9]+$')]],
      writter: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.isDesktop = false;
    
    if((this.platform.is('mobile') && this.platform.is('hybrid')) || 
    this.platform.is('desktop')) {
      this.isDesktop = true;
    }
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

  get errorControl() {
    return this.bookForm.controls;
  }

  submitForm() {
    this.isSubmitted = true;
    if (!this.bookForm.valid || this.tagId == null || this.rfCount == 0) {
      this.nfcAlert();
      console.log('Please provide all the required values!')
      return false;
    } else {
      this.bookId = this.bookForm.value.rfid;
      this.presentLoading();
    }
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
    });
    await loading.present();
    this.bookForm.addControl('imageUrl', new FormControl(this.photo, Validators.required));
    this.rgsSrv.refreshBookLibrary(this.bookForm.value.book_name,this.bookId).then(result => {
      this.rgsSrv.refreshDictionary(this.bookId).then(result2 => {
        console.log(result2);
        this.rgsSrv.createBookLibrary(this.bookForm.value, this.dataUrl1).then(res => {
          console.log(res);
          this.rgsSrv.createDictionaryBook(this.dictionary1,this.bookId).then(res1 => {
            console.log(res1);
            this.rgsSrv.createDictionaryDesc(this.dictionary3,this.bookId).then(res2 => {
              console.log(res2);
              this.rgsSrv.createDictionaryWritter(this.dictionary5,this.bookId).then(res3 => {
                console.log(res3);
                loading.dismiss();
                this.bookForm.reset();
                this.router.navigate(['/profile']);
              }).catch(error => console.log(error));
            }).catch(error => console.log(error));
          }).catch(error => console.log(error));
        }).catch(error => console.log(error));
      }).catch(error => console.log(error));
    }).catch(error => console.log(error));

  }

  async getPicture(type: string){
    if(!Capacitor.isPluginAvailable('Camera') || (this.isDesktop && type === 'gallery')){
      this.filePickerRef.nativeElement.click();
      return;
    }
    const image = await Camera.getPhoto({
      quality: 100,
      width: 400,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      saveToGallery: true
    });
    this.dataUrl = image.dataUrl;
    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
    this.upload();
  }
  

  compare( a, b ) {
    if ( a.name < b.name ){
      return -1;
    }
    if ( a.name > b.name ){
      return 1;
    }
    return 0;
  }
  
  onFileChoose(event: Event){
    const file = (event.target as HTMLInputElement).files[0];
    const pattern = /image-*/;
    const reader = new FileReader();
    console.log('File : '+file);

     if(!file.type.match(pattern)){
       console.log('File Format not supported');
       return;
     }

    reader.onload = () => {
    this.photo = reader.result.toString();
      this.dataUrl = reader.result.toString();
      this.upload();
    };
    reader.readAsDataURL(file);
  }

  
  dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type: mime});
  }


  logout(){
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  
  profile(){
    this.router.navigate(['/profile']);
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

  async upload(){
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
    });
    await loading.present();
    const file = this.dataURLtoFile(this.dataUrl, 'file');
    console.log('file :', file);
    const filePath = 'books/'+this.bookForm.value.book_name;
    const upload = this.storage.upload(filePath, file).then(() => {
      const ref = this.storage.ref(filePath);
      const downloadURL = ref.getDownloadURL().subscribe(url => {
        this.dataUrl1 = url;
        loading.dismiss();
      });   
    });
  }

  async nfcAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: 'Please insert all the data!',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async writeNFC() {
    await this.nfc.enabled().then(() => {
      this.addListenNFC();
      this.cdr.detectChanges();
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

  async addListenNFC() {
    this.cdr.detectChanges();
    console.log('enter into a addListenNFC');
    this.tagId = "";
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
      if(this.bookForm.value.book_name == "" 
      || this.bookForm.value.description == "" 
      || this.bookForm.value.isbn == "" 
      || this.bookForm.value.writter == ""
      || this.dataUrl1 == null) {
      this.nfcAlert();
    } else {
          console.log('received ndef message. the tag contains: ', event);
          console.log('decode tag id', this.nfc.bytesToHexString(event.tag.id));
          if(this.dictionary.length > 0) {
            this.dictionary.splice(0,this.dictionary.length);
            this.dictionary1.splice(0,this.dictionary1.length);
            this.dictionary2.splice(0,this.dictionary2.length);
            this.dictionary3.splice(0,this.dictionary3.length);
            this.dictionary4.splice(0,this.dictionary4.length);
            this.dictionary5.splice(0,this.dictionary5.length);
            this.hasil.splice(0,this.hasil.length);
            this.hasil2.splice(0,this.hasil2.length);
            this.hasil3.splice(0,this.hasil3.length);
          }
          this.tagId = "";
          let tagid = await this.nfc.bytesToHexString(event.tag.id);
          this.tagId = tagid;
          for(let x = 0; x < 3; x++) {
            if(x == 0) {
              this.word = this.bookForm.value.book_name;
              this.book = this.bookForm.value.book_name;
            } else if(x == 1) {
              this.word = this.bookForm.value.description;
            } else {
              this.word = this.bookForm.value.writter;
            }
            this.asciiValue = 0;
            this.word_split = this.word.split('');
            for(let i = 0; i < this.word_split.length; i++) {
              if(this.dictionary.length == 0 && x == 0) {
                this.asciiValue += 1;
                const array: WordLibrary[] = [
                  {
                    key: null,
                    id: this.asciiValue,
                    name: this.word_split[i]
                  }]
                  this.dictionary.push(array[0])
              } else if (this.dictionary2.length == 0 && x == 1){
                this.asciiValue += 1;
                const array: WordLibrary[] = [
                  {
                    key: null,
                    id: this.asciiValue,
                    name: this.word_split[i]
                  }]
                this.dictionary2.push(array[0]);
              } else if (this.dictionary4.length == 0 && x == 2) {
                this.asciiValue += 1;
                const array: WordLibrary[] = [
                  {
                    key: null,
                    id: this.asciiValue,
                    name: this.word_split[i]
                  }]
                this.dictionary4.push(array[0]);
              } else {
                  if(x == 0) {
                    for(let f = 0; f < this.dictionary.length;f++) {
                      if(this.dictionary[f].name == this.word_split[i]) {
                        this.trust = true;
                          break;
                      }
                    }
                  } else if(x == 1) {
                    for(let f = 0; f < this.dictionary2.length;f++) {
                        if(this.dictionary2[f].name == this.word_split[i]) {
                          this.trust = true;
                            break;
                        }
                    }
                  } else {
                    for(let f = 0; f < this.dictionary4.length;f++) {
                      if(this.dictionary4[f].name == this.word_split[i]) {
                        this.trust = true;
                          break;
                      }
                    }
                }
                if (!this.trust) {
                    if(x == 0) {
                      this.asciiValue += 1;
                      const array1: WordLibrary[] = [
                        {
                          key: null,
                          id: this.asciiValue,
                          name: this.word_split[i]
                        }]
                      this.dictionary.push(array1[0]);
                    } else if(x == 1) {
                      this.asciiValue += 1;
                      const array1: WordLibrary[] = [
                        {
                          key: null,
                          id: this.asciiValue,
                          name: this.word_split[i]
                        }]
                      this.dictionary2.push(array1[0]);
                    } else {
                      this.asciiValue += 1;
                      const array1: WordLibrary[] = [
                        {
                          key: null,
                          id: this.asciiValue,
                          name: this.word_split[i]
                        }]
                      this.dictionary4.push(array1[0]);
                    }
                }
                this.trust = false;
              }
            }
            this.trust = false;
            if(x == 0) {
              this.dictionary1 = this.dictionary.sort(this.compare);
              for(let i = 0; i <= this.word_split.length; i++) {
                if(i == 0) {
                  this.pValue = this.word_split[i];
                  for(let v = 0; v < this.dictionary1.length; v++) {
                    if (this.pValue == this.dictionary1[v].name) {
                      break;
                    }
                  }
                } else {
                  this.cValue = this.word_split[i];
                  const valueJoin = this.pValue.concat(this.cValue);
                  for(let v = 0; v < this.dictionary1.length; v++) {
                    if(valueJoin == this.dictionary1[v].name) {
                      this.pValue = valueJoin;
                      this.trust = true;
                      break
                    } 
                  }
                  if(!this.trust) {
                    this.asciiValue += 1;
                    const array6: WordLibrary[] = [
                      {
                        key: null,
                        id: this.asciiValue,
                        name: valueJoin
                      }]
                    this.dictionary1.push(array6[0]);
                    for(let d = 0; d < this.dictionary1.length; d++) {
                      if(this.pValue == this.dictionary1[d].name) {
                        this.hasil.push(''+this.dictionary1[d].id);
                        break
                      }
                    } 
                  }
                  if (this.trust) {
                    console.log(this.pValue);
                  } else {
                    this.pValue = this.cValue;
                  }
                  this.trust = false;
                }
              }
              this.dictionary1.splice(this.dictionary1.length-1,this.dictionary1.length);
            } else if (x == 1) {        
              this.dictionary3 = this.dictionary2.sort(this.compare); 
              for(let i = 0; i <= this.word_split.length; i++) {
                if(i == 0) {
                  this.pValue = this.word_split[i];
                  for(let v = 0; v < this.dictionary3.length; v++) {
                    if (this.pValue == this.dictionary3[v].name) {
                      break;
                    }
                  }
                } else {
                  this.cValue = this.word_split[i];
                  const valueJoin = this.pValue.concat(this.cValue);
                  for(let v = 0; v < this.dictionary3.length; v++) {
                    if(valueJoin == this.dictionary3[v].name) {
                      this.pValue = valueJoin;
                      this.trust = true;
                      break
                    } 
                  }
                  if(!this.trust) {
                    this.asciiValue += 1;
                    const array6: WordLibrary[] = [
                      {
                        key: null,
                        id: this.asciiValue,
                        name: valueJoin
                      }]
                    this.dictionary3.push(array6[0]);
                    for(let d = 0; d < this.dictionary3.length; d++) {
                      if(this.pValue == this.dictionary3[d].name) {
                        this.hasil2.push(''+this.dictionary3[d].id);
                        break
                      }
                    } 
                  }
                  if (this.trust) {
                    console.log(this.pValue);
                  } else {
                    this.pValue = this.cValue;
                  }
                  this.trust = false;
                }
              }
              this.dictionary3.splice(this.dictionary3.length-1, this.dictionary3.length);
            } else {
              this.dictionary5 = this.dictionary4.sort(this.compare); 
              for(let i = 0; i <= this.word_split.length; i++) {
                if(i == 0) {
                  this.pValue = this.word_split[i];
                  for(let v = 0; v < this.dictionary5.length; v++) {
                    if (this.pValue == this.dictionary5[v].name) {
                      break;
                    }
                  }
                } else {
                  this.cValue = this.word_split[i];
                  const valueJoin = this.pValue.concat(this.cValue);
                  for(let v = 0; v < this.dictionary5.length; v++) {
                    if(valueJoin == this.dictionary5[v].name) {
                      this.pValue = valueJoin;
                      this.trust = true;
                      break
                    } 
                  }
                  if(!this.trust) {
                    this.asciiValue += 1;
                    const array6: WordLibrary[] = [
                      {
                        key: null,
                        id: this.asciiValue,
                        name: valueJoin
                      }]
                    this.dictionary5.push(array6[0]);
                    for(let d = 0; d < this.dictionary5.length; d++) {
                      if(this.pValue == this.dictionary5[d].name) {
                        this.hasil3.push(''+this.dictionary5[d].id);
                        break
                      }
                    } 
                  }
                  if (this.trust) {
                    console.log(this.pValue);
                  } else {
                    this.pValue = this.cValue;
                  }
                  this.trust = false;
                }
              }
              this.dictionary5.splice(this.dictionary5.length-1, this.dictionary5.length);
            }
          }
          var message = [
            this.ndef.textRecord(this.hasil.join(",")),
            this.ndef.textRecord(this.bookForm.value.date),
            this.ndef.textRecord(this.bookForm.value.isbn),
            this.ndef.textRecord(this.hasil2.join(",")),
            this.ndef.textRecord(this.hasil3.join(",")),
            this.ndef.uriRecord(""+this.dataUrl1),
        ];
          this.nfc.write(message).then(
              async (res) => {
                console.log('Wrote message to tag')
                let toast = this.toastCtrl.create({
                  message: 'Write Success Please Press Submit to Finish the Process',
                  duration: 2000,
                  position: 'bottom'
                });
                (await toast).present();
                this.rfCount = 1;
                this.checkCompress = true;
                this.beforeCompressBook = this.bookForm.value.book_name
                this.beforeCompressWritter = this.bookForm.value.writter
                this.beforeCompressReview = this.bookForm.value.description
                this.afterCompressBook = this.hasil;
                this.afterCompressWritter = this.hasil3;
                this.afterCompressReview = this.hasil2;
                this.cdr.detectChanges();
              },
              async (error) => { 
                console.log('Write failed', error)
                let toast = this.toastCtrl.create({
                  message: 'Write Failed, Please Try Again',
                  duration: 2000,
                  position: 'bottom'
                });
                (await toast).present();
                this.rfCount = 0;
                this.checkCompress = true;
                this.beforeCompressBook = this.bookForm.value.book_name
                this.beforeCompressWritter = this.bookForm.value.writter
                this.beforeCompressReview = this.bookForm.value.description
                this.afterCompressBook = this.hasil;
                this.afterCompressWritter = this.hasil3;
                this.afterCompressReview = this.hasil2;
                this.cdr.detectChanges();
              }
          )
          this.cdr.detectChanges();
      }
    });
  }
}
