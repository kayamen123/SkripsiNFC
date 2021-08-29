import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Capacitor } from '@capacitor/core';
import { AlertController, LoadingController, ModalController, Platform, ToastController } from '@ionic/angular';
import { UserLibrary } from 'src/app/model/userLibrary';
import { RegisterServiceService } from 'src/app/service/register-service.service';

@Component({
  selector: 'app-modal-edit-user',
  templateUrl: './modal-edit-user.component.html',
  styleUrls: ['./modal-edit-user.component.scss'],
})
export class ModalEditUserComponent implements OnInit {


  @ViewChild('filePicker', { static: false }) filePickerRef: ElementRef<HTMLInputElement>;
  registerForm: FormGroup;
  @Input() selectedUser: any;
  isDesktop: boolean;
  photo: any;
  isSubmitted = false;
  passConf = true;
  dataUrl: any;
  dataUrl1: any;
  img = new Image();

  constructor(
    private modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    public rgsSrv: RegisterServiceService,
    public router: Router,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private sanitizer: DomSanitizer,
    private storage: AngularFireStorage,
    private alertCtrl: AlertController,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      role: ['', [Validators.required]],
      mobile_phone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      password: ['',[Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ionViewDidEnter() {
    if((this.platform.is('mobile') && this.platform.is('hybrid')) || 
    this.platform.is('desktop')){
      this.isDesktop = true;
    }
    this.registerForm.patchValue({
      name: this.selectedUser.name,
      email: this.selectedUser.email,
      role: this.selectedUser.role,
      mobile_phone: this.selectedUser.mobile,
      password: this.selectedUser.password,
      password_confirmation: this.selectedUser.password
    })
    this.photo = this.selectedUser.imageUrl;
    this.img.src = this.photo;
    this.LoadingPage();
  }

  get errorControl() {
    return this.registerForm.controls;
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onSubmit() {
    this.isSubmitted = true;
    console.log(this.registerForm.value);
    console.log(this.registerForm.value);
      if (!this.registerForm.valid || this.registerForm.value.password != this.registerForm.value.password_confirmation) {
        console.log('Please provide all the required values!')
        this.passConf = false;
        return false;
      } else {
        if(this.dataUrl == undefined) {
          console.log("masuk sini");
          this.presentLoading();
        } else {
           this.upload();
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

  async LoadingPage (){
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Please wait...',
      translucent: true,
      duration: 1500
    });

    await loading.present();

    const {role , data} = await loading.onDidDismiss();
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
    const filePath = 'books/'+this.registerForm.value.name;
    const upload = this.storage.upload(filePath, file).then(() => {
      const ref = this.storage.ref(filePath);
      const downloadURL = ref.getDownloadURL().subscribe(url => {
        console.log(url);
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
    console.log(this.selectedUser.role);
    if(this.dataUrl1 == undefined) {
      this.registerForm.addControl('key', new FormControl(this.selectedUser.key, Validators.required));
      this.registerForm.addControl('imageUrl', new FormControl(this.photo, Validators.required));
    } else {
      this.registerForm.addControl('imageUrl', new FormControl(this.dataUrl1, Validators.required));
      this.registerForm.addControl('key', new FormControl(this.selectedUser.key, Validators.required));
    }    
    loading.dismiss();
    this.modalCtrl.dismiss(this.registerForm.value, 'cancel');
  }

  onChange() {
    this.passConf = true;
  }
}
