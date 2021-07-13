import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { async } from '@angular/core/testing';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Capacitor } from '@capacitor/core';

import { Ndef, NdefEvent, NFC } from '@ionic-native/nfc/ngx';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
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
  tagId: any = null;
  myDate: any = null;
  record: any = null;
  currentDate: any = null;
  //tagDesc: an
  bookForm: FormGroup;
  bookForm2: FormGroup;
  recordMessage: any = null;
  isDesktop: boolean;
  isSubmitted = false;
  dataUrl: any = null;
  momentjs: any = moment;
  photo: SafeResourceUrl = 'https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png';
  rfCount = 0;
  test = '16';
  asciiValue = 255;
  pValue: string;
  cValue: string;
  hasil: string[] = [];
  hasil2: string[] = [];
  asciiNum: number;
  trust = false;
  dictionary: WordLibrary[] = [];
  dictionary1: WordLibrary[] = [];
  dictionary2: WordLibrary[] = [];
  dictionary3: WordLibrary[] = []
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
    ) { 
      this.platform.ready().then(()=>{
        this.cdr.detectChanges();
        this.writeNFC();
      });
    }

  ngOnInit() {    
    this.bookForm = this.formBuilder.group({
      rfid: ['', [Validators.required]],
      book_name: ['', [Validators.required, Validators.minLength(2)]],
      date: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.isDesktop = false;
    
    if((this.platform.is('mobile') && this.platform.is('hybrid')) || 
    this.platform.is('desktop')){
      this.isDesktop = true;
    }
  }

  onChange() {
    this.myDate = this.momentjs().format("MMM Do YY");
  }

  IonViewDidEnter() {
    this.platform.backButton.subscribeWithPriority(15, () => {
      this.router.navigate(['/profile']);
    })
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
      console.log(this.bookForm.value)
      this.bookForm.addControl('imageUrl', new FormControl(this.photo, Validators.required));
      this.rgsSrv.createBookLibrary(this.bookForm.value, this.dataUrl).then(res => {
        console.log(res);
       // this.upload(this.bookForm.value.book_name);
        this.bookForm.reset();
        this.router.navigate(['/profile']);
      }).catch(error => console.log(error));
    }
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
    console.log('Image :'+ image)
    this.dataUrl = image.dataUrl;
    console.log(this.dataUrl);
    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
    console.log('Photo1:'+this.photo)
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
      console.log(this.dataUrl);
      console.log('Photo2:'+this.photo)
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

  upload(nDepan: string){
    console.log(this.dataUrl);
        const file = this.dataURLtoFile(this.dataUrl, 'file');
        console.log('file :', file);
        const filePath = 'books/'+nDepan;
        const ref = this.storage.ref(filePath)
        const task = ref.put(file);
  }

  async nfcAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: 'Please insert Book Title and Description!',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async writeNFC(){
    this.cdr.detectChanges();
    await this.nfc.enabled().then(() => {
     if(this.bookForm.value.book_name != null && this.bookForm.value.description != null) {
         this.addListenNFC();    
       /* this.nfc.addNdefListener().subscribe(
          (tagEvent) => this.tagListenerSuccess(tagEvent),
          (error) => console.log('error'));*/
        //  this.nfc.addTagDiscoveredListener().subscribe((tagEvent) => this.tagWriterSuccess(tagEvent));
     }
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
      this.rfCount += 1;  
      let tagid = await this.nfc.bytesToHexString(event.tag.id);
      this.tagId = tagid;
      for(let x = 0; x < 2; x++) {
        if(x == 0) {
          this.word = this.bookForm.value.book_name
        } else {
          this.word = this.bookForm.value.description
        }
        this.word_split = this.word.split('');
        for(let i = 0; i < this.word_split.length; i++) {
          if(this.dictionary.length == 0 || this.dictionary2.length == 0) {
            this.asciiNum = 1;
            const array: WordLibrary[] = [
              {
                key: null,
                id: this.word_split[i].charCodeAt(0),
                name: this.word_split[i]
              }]
            if(x == 0) {
              this.dictionary.push(array[0])
            } else {
              this.dictionary2.push(array[0]);
            }
            
          } else {
            for(let f = 0; f < this.dictionary.length;f++) {
              if(x == 0) {
                if(this.dictionary[f].name == this.word_split[i]) {
                  this.trust = true;
                    break;
                }
              } else {
                if(this.dictionary2[f].name == this.word_split[i]) {
                  this.trust = true;
                    break;
                }
              }
            }
            if (!this.trust) {
              this.asciiNum += 1;
              const array1: WordLibrary[] = [
                {
                  key: null,
                  id: this.word_split[i].charCodeAt(0),
                  name: this.word_split[i]
                }]
                if(x == 0) {
                  this.dictionary.push(array1[0]);
                } else {
                  this.dictionary2.push(array1[0]);
                }
            }
            this.trust = false;
          }
        }
        this.trust = false;
        if(x == 0) {
          this.dictionary1 = this.dictionary.sort(this.compare);
          for(let i = 0; i < this.word_split.length; i++) {
            if(i == 0) {
              this.pValue = this.word_split[i];
              console.log(this.pValue);
              for(let v = 0; v < this.dictionary1.length; v++) {
                console.log(this.dictionary1[v].name);
                if (this.pValue == this.dictionary1[v].name) {
                  break;
                }
              }
            } else {
              this.cValue = this.word_split[i];
              const valueJoin = this.pValue.concat(this.cValue);
              console.log(valueJoin);
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
                console.log(this.pValue);
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
        } else {        
          this.dictionary3 = this.dictionary2.sort(this.compare); 
          for(let i = 0; i < this.word_split.length; i++) {
            if(i == 0) {
              this.pValue = this.word_split[i];
              console.log(this.pValue);
              for(let v = 0; v < this.dictionary3.length; v++) {
                console.log(this.dictionary3[v].name);
                if (this.pValue == this.dictionary3[v].name) {
                  break;
                }
              }
            } else {
              this.cValue = this.word_split[i];
              const valueJoin = this.pValue.concat(this.cValue);
              console.log(valueJoin);
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
                console.log(this.pValue);
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
        }
      }
      console.log('Hasil BookName: '+this.hasil);
      console.log('Hasil Description: '+this.hasil2);
 /*     var message = [
        this.ndef.textRecord( this.hasil.join(",")),
        this.ndef.textRecord(this.bookForm.value.date),
        this.ndef.textRecord( this.hasil2.join(",")),
        this.ndef.uriRecord("http://github.com/chariotsolutions/phonegap-nfc")
    ];
    
        // write to the tag
        this.nfc.write(message).then(
          _ => console.log('Wrote message to tag'),
          error => console.log('Write failed', error)
      )*/
      

      // if(event.tag.ndefMessage){
      //   let payload = event.tag.ndefMessage[0].payload;
      //   let tagContent = await this.nfc.bytesToString(payload).substring(3);
      //   this.tagDesc = tagContent;
      // }
      if (this.rfCount == 1) {
        let toast = this.toastCtrl.create({
        message: 'NFC has been readed',
        duration: 5000,
        position: 'bottom'
      });
      (await toast).present();
      this.cdr.detectChanges();
    } else {
      let toast = this.toastCtrl.create({
        message: 'NFC has been updated',
        duration: 5000,
        position: 'bottom'
      });
      (await toast).present();
      this.cdr.detectChanges();
    }
    });
  }
}
