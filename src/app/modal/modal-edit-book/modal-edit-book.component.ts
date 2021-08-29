import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { async } from '@angular/core/testing';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Capacitor } from '@capacitor/core';

import { Ndef, NdefEvent, NFC } from '@ionic-native/nfc/ngx';
import { AlertController, LoadingController, ModalController, NavController, Platform, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { BookLibrary } from 'src/app/model/bookLibrary';
import { WordLibrary } from '../../model/wordLibrary';
import { RegisterServiceService } from '../../service/register-service.service';

@Component({
  selector: 'app-modal-edit-book',
  templateUrl: './modal-edit-book.component.html',
  styleUrls: ['./modal-edit-book.component.scss'],
})
export class ModalEditBookComponent implements OnInit {


  @ViewChild('filePicker', { static: false }) filePickerRef: ElementRef<HTMLInputElement>;
  @Input() selectedBook: any;
  tagId: any = null;
  myDate: any = null;
  record: any = null;
  currentDate: any = null;
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
  asciiValue = 26;
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
    private modalCtrl: ModalController,
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
    console.log(this.selectedBook);
    this.bookForm.patchValue({
      rfid: this.selectedBook.rfid,
      book_name: this.selectedBook.book_name,
      date: this.selectedBook.date,
      isbn: this.selectedBook.isbn,
      writter: this.selectedBook.writter,
      description: this.selectedBook.description 
    })
    console.log(this.bookForm.value);
    this.bookId = this.bookForm.value.rfid;
    this.dataUrl1 = this.selectedBook.imageUrl;
    this.myDate = this.selectedBook.date
    this.photo = "https://"+this.dataUrl1;
    console.log(this.bookId);
  }

  onChange() {
    this.myDate = this.momentjs().format("MMM Do YY");
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }


  IonViewDidEnter() {
    this.isDesktop = false;
    if((this.platform.is('mobile') && this.platform.is('hybrid')) || 
    this.platform.is('desktop')){
      this.isDesktop = true;
    }
    this.cdr.detectChanges();
  }

  get errorControl() {
    return this.bookForm.controls;
  }

  submitForm() {
    this.isSubmitted = true;
    if (!this.bookForm.valid) {
      this.nfcAlert();
      console.log('Please provide all the required values!')
      return false;
    } else {
      console.log(this.bookForm.value)
      this.bookId = this.bookForm.value.rfid;
      console.log(this.bookId);
      console.log(this.description);
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
    this.modalCtrl.dismiss(this.bookForm.value, 'cancel');
    // this.rgsSrv.refreshBookLibrary(this.bookForm.value.book_name,this.bookId).then(result => {
    //   console.log(result);
    //   this.rgsSrv.refreshDictionary(this.bookId).then(result2 => {
    //     console.log(result2);
    //     this.rgsSrv.createBookLibrary(this.bookForm.value, this.dataUrl1).then(res => {
    //       console.log(res);
    //       this.rgsSrv.createDictionaryBook(this.dictionary1,this.bookId).then(res1 => {
    //         console.log(res1);
    //         this.rgsSrv.createDictionaryDesc(this.dictionary3,this.bookId).then(res2 => {
    //           console.log(res2);
    //           this.rgsSrv.createDictionaryWritter(this.dictionary5,this.bookId).then(res3 => {
    //             console.log(res3);
    //             loading.dismiss();
    //             this.modalCtrl.dismiss(null, 'cancel');
    //             this.bookForm.reset();
    //             this.router.navigate(['/profile']);
    //           }).catch(error => console.log(error));
    //         }).catch(error => console.log(error));
    //       }).catch(error => console.log(error));
    //     }).catch(error => console.log(error));
    //   }).catch(error => console.log(error));
    // }).catch(error => console.log(error));

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

    // if(!file.type.match(pattern)){
    //   console.log('File Format not supported');
    //   return;
    // }

    reader.onload = () => {
    //  this.photo = reader.result.toString();
      this.dataUrl = reader.result.toString();
      console.log(this.dataUrl);
    //  console.log('Photo2:'+this.photo)
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

  async upload(){
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
    });
    await loading.present();
    console.log(this.dataUrl);
    const file = this.dataURLtoFile(this.dataUrl, 'file');
    console.log('file :', file);
    const filePath = 'books/'+this.bookForm.value.book_name;
    /* const ref = this.storage.ref(filePath)
    const task = ref.put(file);*/
    const upload = this.storage.upload(filePath, file).then(() => {
      const ref = this.storage.ref(filePath);
      const downloadURL = ref.getDownloadURL().subscribe(url => {
        console.log(url);
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
      let TagId = await this.nfc.bytesToHexString(event.tag.id);
      if(this.bookForm.value.book_name == "" 
      || this.bookForm.value.description == "" 
      || this.bookForm.value.isbn == "" 
      || this.bookForm.value.writter == ""
      || this.dataUrl1 == null) {
      this.nfcAlert()
    } else if (TagId != this.bookId) {

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
          //this.tagDesc = "";
          this.rfCount += 1;  
          let tagid = await this.nfc.bytesToHexString(event.tag.id);
          this.tagId = tagid;
          for(let x = 0; x < 3; x++) {
            if(x == 0) {
              this.dicCount = 0;
              this.word = this.bookForm.value.book_name;
              this.book = this.bookForm.value.book_name;
            } else if(x == 1) {
              this.dicCount = 0;
              console.log("Diccount-1:"+this.dicCount);
              this.word = this.bookForm.value.description;
            } else {
              this.dicCount = 0;
              console.log("Diccount-2:"+this.dicCount);
              this.word = this.bookForm.value.writter;
            }
            this.asciiValue = 26;
            this.word_split = this.word.split('');
            for(let i = 0; i < this.word_split.length; i++) {
              if(this.dictionary.length == 0 && x == 0) {
                this.dicCount += 1;
                const array: WordLibrary[] = [
                  {
                    key: null,
                    id: this.dicCount,
                    name: this.word_split[i]
                  }]
                  this.dictionary.push(array[0])
              } else if (this.dictionary2.length == 0 && x == 1){
                this.dicCount += 1;
                const array: WordLibrary[] = [
                  {
                    key: null,
                    id: this.dicCount,
                    name: this.word_split[i]
                  }]
                this.dictionary2.push(array[0]);    
              } else if (this.dictionary4.length == 0 && x == 2) {
                this.dicCount += 1;
                const array: WordLibrary[] = [
                  {
                    key: null,
                    id: this.dicCount,
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
                      this.dicCount += 1;
                      const array1: WordLibrary[] = [
                        {
                          key: null,
                          id: this.dicCount,
                          name: this.word_split[i]
                        }]
                      this.dictionary.push(array1[0]);
                    } else if(x == 1) {
                      this.dicCount += 1;
                      const array1: WordLibrary[] = [
                        {
                          key: null,
                          id: this.dicCount,
                          name: this.word_split[i]
                        }]
                      this.dictionary2.push(array1[0]);
                    } else {
                      this.dicCount += 1;
                      const array1: WordLibrary[] = [
                        {
                          key: null,
                          id: this.dicCount,
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
              this.dictionary1.splice(this.dictionary1.length-1,this.dictionary1.length);
            } else if (x == 1) {        
              this.dictionary3 = this.dictionary2.sort(this.compare); 
              for(let i = 0; i <= this.word_split.length; i++) {
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
              this.dictionary3.splice(this.dictionary3.length-1, this.dictionary3.length);
            } else {
              this.dictionary5 = this.dictionary4.sort(this.compare); 
              for(let i = 0; i <= this.word_split.length; i++) {
                if(i == 0) {
                  this.pValue = this.word_split[i];
                  console.log(this.pValue);
                  for(let v = 0; v < this.dictionary5.length; v++) {
                    console.log(this.dictionary5[v].name);
                    if (this.pValue == this.dictionary5[v].name) {
                      break;
                    }
                  }
                } else {
                  this.cValue = this.word_split[i];
                  const valueJoin = this.pValue.concat(this.cValue);
                  console.log(valueJoin);
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
                    console.log(this.pValue);
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
          console.log(this.dictionary1)
          console.log(this.dictionary2)
          console.log(this.dictionary3)
          console.log(this.dictionary)
          console.log(this.dictionary4)
          console.log(this.dictionary5)
          console.log('Hasil BookName: '+this.hasil);
          console.log('Hasil Description: '+this.hasil2);
          console.log('Hasil Writter', this.hasil3);
          var message = [
            this.ndef.textRecord(this.hasil.join(",")),
            this.ndef.textRecord(this.bookForm.value.date),
            this.ndef.textRecord(this.bookForm.value.isbn),
            this.ndef.textRecord(this.hasil2.join(",")),
            this.ndef.textRecord(this.hasil3.join(",")),
            this.ndef.uriRecord(""+this.dataUrl1),
        ];
        
            // write to the tag
            this.nfc.write(message).then(
              res => {
                console.log('Wrote message to tag')
                this.rfCount +=1;
              },
              error => { 
                console.log('Write failed', error)
                this.isError = true;
              }
          )
          

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
          this.rfCount = 0;
        }

        if(this.isError == true) {
          let toast = this.toastCtrl.create({
            message: 'Write Failed, Please Try Again',
            duration: 5000,
            position: 'bottom'
          });
          (await toast).present();
          this.cdr.detectChanges();
          this.isError = false;
        }
      }
    });
  }
}
