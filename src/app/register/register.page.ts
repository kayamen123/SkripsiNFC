import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Capacitor } from '@capacitor/core';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
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
  isDesktop: boolean;
  dataUrl: any;
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
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      role: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      password: ['',[Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(8)]]
    })
    if((this.platform.is('mobile') && this.platform.is('hybrid')) || 
    this.platform.is('desktop')){
      this.isDesktop = true;
    }
  }

  ionViewDidEnter() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.backButtonAlert();
    })
  }

  get errorControl() {
    return this.registerForm.controls;
  }

  submitForm() {
    this.isSubmitted = true;
    console.log(this.registerForm.value.password);
    console.log(this.registerForm.value.password_confirmation);
      if (!this.registerForm.valid || this.registerForm.value.password != this.registerForm.value.password_confirmation) {
        console.log('Please provide all the required values!')
        this.passConf = false;
        return false;
      } else {
        this.presentLoading();
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
    console.log(this.dataUrl);
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
      console.log(this.dataUrl);
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
    console.log(nDepan);
        const file = this.dataURLtoFile(this.dataUrl, 'file');
        console.log('file :', file);
        const filePath = 'photos/'+nDepan+'.jpg';
        const ref = this.storage.ref(filePath)
        const task = ref.put(file);
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
    });

    await loading.present();
    this.registerForm.value.password_confirmation = null;
    console.log(this.registerForm.value)
    this.passConf = true;

    this.rgsSrv.createUserLibrary(this.registerForm.value, this.dataUrl).then(res => {
      console.log(res);          
      console.log(this.registerForm.value.name);
      this.upload(this.registerForm.value.name);
      loading.dismiss();
      this.registerForm.reset();
      this.isSubmitted = false;
      this.photo = 'https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png';
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
}
