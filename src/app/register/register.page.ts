import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Capacitor } from '@capacitor/core';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { WordLibrary } from '../model/wordLibrary';

import { RegisterServiceService } from '../service/register-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  @ViewChild('filePicker', { static: false }) filePickerRef: ElementRef<HTMLInputElement>;
  registerForm: FormGroup;
  isSubmitted = false;
  passConf = true;
  userLib: any;
  test = '16';
  test2 = '17';
  hasil3: string;
  hasil4: string;
  asciiValue = 255;
  pValue: string;
  cValue: string;
  string_join = '';
  hasil: string[] = [];
  hasil2: string[] = [];
  hasil5: string[] = [];
  hasil6: string[] = [];
  isDesktop: boolean;
  hideTab = false;
  asciiNum: number;
  trust = false;
  dic: any ;
  dictionary: WordLibrary[] = [];
  dictionary1: WordLibrary[] = [];
  dictionary2: WordLibrary[] = [];
  dictionary3: WordLibrary[] = []
  wordLib: WordLibrary[];
  word = 'Goblog Banget Anjing';
  compress: string[];
  word_split: string[];
  dataUrl: any = null;
  dataUrl1: any;
  photo: SafeResourceUrl = 'https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png';
  constructor(
    public formBuilder: FormBuilder,
    public rgsSrv: RegisterServiceService,
    public router: Router,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private sanitizer: DomSanitizer,
    private storage: AngularFireStorage,
    private alertCtrl: AlertController,
    private platform: Platform
  ) { 
  }

  ngOnInit() {
  }

  

  ionViewDidEnter() {
    this.platform.backButton.subscribeWithPriority(15, () => {
      this.backButtonAlert();
    })
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      role: ['', [Validators.required]],
      mobile_phone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      password: ['',[Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(8)]]
    })
    if((this.platform.is('mobile') && this.platform.is('hybrid')) || 
    this.platform.is('desktop')){
      this.isDesktop = true;
    }
    this.LoadingPage();
  }

  get errorControl() {
    return this.registerForm.controls;
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

  submitForm() {
    this.isSubmitted = true;

    
      if (!this.registerForm.valid || this.registerForm.value.password != this.registerForm.value.password_confirmation) {
        this.passConf = false;
        return false;
      } else {
      if(this.dataUrl == null) {
        this.alertUrl();
        return false;
      } else {
        for(let x = 0; x <= this.userLib.length; x++) {
            if(x != this.userLib.length && this.userLib.length != 0) {
              if(this.registerForm.value.name == this.userLib[x].name) {
                this.alertSame();
                return false
              } else if(this.registerForm.value.email == this.userLib[x].email) {
                this.alertSame();
                return false
              }
            } else {
              this.upload();
            }
          }
        }
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
    this.dataUrl = image.dataUrl;
    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
  }
  
  onFileChoose(event: Event){
    const file = (event.target as HTMLInputElement).files[0];
    const pattern = /image-*/;
    const reader = new FileReader();

    if(!file.type.match(pattern)){
      console.log('File Format not supported');
      return;
    }

    reader.onload = () => {
      this.photo = reader.result.toString();
      this.dataUrl = reader.result.toString();
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

  async LoadingPage (){
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
      duration: 1000
    });

    await loading.present();
    this.rgsSrv.getAllUserLibrary().snapshotChanges().pipe(
      map(changes =>
          changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
      )
    ).subscribe(data => {
      this.userLib = data;
      loading.dismiss();
      this.hideTab = true;
    })
  }

  async upload(){
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
    });
    await loading.present();
    const file = this.dataURLtoFile(this.dataUrl, 'file');
    const filePath = 'books/'+this.registerForm.value.name;
    const upload = this.storage.upload(filePath, file).then(() => {
      const ref = this.storage.ref(filePath);
      const downloadURL = ref.getDownloadURL().subscribe(url => {
        this.dataUrl1 = url;
        loading.dismiss();
        this.presentLoading();
      });   
    });
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
    });

    await loading.present();
    this.registerForm.value.password_confirmation = null;
    this.passConf = true;
    this.registerForm.addControl('imageUrl', new FormControl(this.photo, Validators.required));
    this.rgsSrv.createUserLibrary(this.registerForm.value, this.dataUrl1).then(res => {
      loading.dismiss();
      this.registerForm.reset();
      this.isSubmitted = false;
      this.photo = 'https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png';
      this.dataUrl = null;
      this.router.navigate(['/login']);
    }).catch(error => console.log(error));    
  }

  onChange() {
    this.passConf = true;
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

  async alertSame(){
    const alert = await this.alertCtrl.create({
        message: 'Name or Email Already Exist',
        buttons: [{
            text: 'Ok',
            role: 'cancel'
        }]
    });
    
    await alert.present();
  }

  async alertUrl(){
    const alert = await this.alertCtrl.create({
        message: 'Please Add your profile Image',
        buttons: [{
            text: 'Ok',
            role: 'cancel'
        }]
    });
    
    await alert.present();
  }
}
