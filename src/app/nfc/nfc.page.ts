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
  //tagDesc: an
  bookForm: FormGroup;
  recordMessage: any = null;
  isDesktop: boolean;
  isSubmitted = false;
  dataUrl: any = null;
  photo: SafeResourceUrl = 'https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png';
  rfCount = 0;

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
        this.checkNFC();
      });
    }

  ngOnInit() {    
    this.bookForm = this.formBuilder.group({
    book_name: ['', [Validators.required, Validators.minLength(2)]],
    rfid: ['', [Validators.required]],
    date: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]]
    })
    this.isDesktop = false;
    if((this.platform.is('mobile') && this.platform.is('hybrid')) || 
    this.platform.is('desktop')){
      this.isDesktop = true;
    }
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
    if (!this.bookForm.valid || this.tagId == null) {
      console.log('Please provide all the required values!')
      return false;
    } else {
      console.log(this.bookForm.value)
      this.bookForm.addControl('book_status', new FormControl(true, Validators.required));
      this.rgsSrv.createBookLibrary(this.bookForm.value, this.dataUrl).then(res => {
        console.log(res);
        this.upload(this.bookForm.value.book_name);
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

  onChange() {
    this.myDate = new Date().toLocaleDateString();
  }

  async checkNFC(){
    await this.nfc.enabled().then(() => {
     // this.addListenNFC();
      this.nfc.addNdefListener().subscribe(
       (tagEvent) => this.tagListenerSuccess(tagEvent),
       (error) => console.log('error'));
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

  tagListenerSuccess(tagEvent) {
      console.log("coucou");
      console.log(tagEvent);
      console.log(this.nfc.bytesToString(tagEvent.tag.ndefMessage[0].payload));
      for(let i = 0; i < tagEvent.tag.ndefMessage[0].payload.length;i++) {
        tagEvent.tag.ndefMessage[0].payload[i] = tagEvent.tag.ndefMessage[0].payload[i+3];
      }
      this.record = this.nfc.bytesToString(tagEvent.tag.ndefMessage[0].payload).split('');
      this.record.splice(tagEvent.tag.ndefMessage[0].payload.length-3,3);
      this.recordMessage = this.record.join("");
      console.log(this.record);
      console.log(this.recordMessage)
      console.log(tagEvent);
  }

 async tagWriterSuccess(tagEvent) {
    if(this.dataUrl == null) {
      let toast = this.toastCtrl.create({
        message: 'need Data URL to Complete it',
        duration: 5000,
        position: 'bottom'
      });
      (await toast).present();
    } else {
      var message = [
        this.ndef.textRecord("hello, world"),
        this.ndef.uriRecord("http://github.com/chariotsolutions/phonegap-nfc")
    ];
    
        // write to the tag
        this.nfc.write(message).then(
          _ => console.log('Wrote message to tag'),
          error => console.log('Write failed', error)
      )
    }
  }
}
