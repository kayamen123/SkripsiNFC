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
  dataUrl: any;
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

    // for(let x = 0; x < 2; x++) {
    //   if(x == 0) {
    //     this.word = "aabbwwaba"
    //   } else {
    //     this.word = "aabbwwaba"
    //   }
    //   this.asciiValue = 255;
    //   this.word_split = this.word.split('');
    //   for(let i = 0; i < this.word_split.length; i++) {
    //     if(this.dictionary.length == 0) {
    //       const array: WordLibrary[] = [
    //         {
    //           key: null,
    //           id: this.word_split[i].charCodeAt(0),
    //           name: this.word_split[i]
    //         }]
    //         this.dictionary.push(array[0])
    //     } else if (this.dictionary2.length == 0){
    //       const array: WordLibrary[] = [
    //         {
    //           key: null,
    //           id: this.word_split[i].charCodeAt(0),
    //           name: this.word_split[i]
    //         }]
    //       this.dictionary2.push(array[0]);    
    //     } else {
    //         if(x == 0) {
    //           for(let f = 0; f < this.dictionary.length;f++) {
    //             if(this.dictionary[f].name == this.word_split[i]) {
    //               this.trust = true;
    //                 break;
    //             }
    //           }
    //         } else {
    //           for(let f = 0; f < this.dictionary2.length;f++) {
    //             if(this.dictionary2[f].name == this.word_split[i]) {
    //               this.trust = true;
    //                 break;
    //             }
    //           }
    //       }
    //       if (!this.trust) {
    //         const array1: WordLibrary[] = [
    //           {
    //             key: null,
    //             id: this.word_split[i].charCodeAt(0),
    //             name: this.word_split[i]
    //           }]
    //           if(x == 0) {
    //             this.dictionary.push(array1[0]);
    //           } else {
    //             this.dictionary2.push(array1[0]);
    //           }
    //       }
    //       this.trust = false;
    //     }
    //   }
    //   this.trust = false;
    //   if(x == 0) {
    //     this.dictionary1 = this.dictionary.sort(this.compare);
    //     for(let i = 0; i <= this.word_split.length; i++) {
    //       if(i == 0) {
    //         this.pValue = this.word_split[i];
    //         console.log(this.pValue);
    //         for(let v = 0; v < this.dictionary1.length; v++) {
    //           console.log(this.dictionary1[v].name);
    //           if (this.pValue == this.dictionary1[v].name) {
    //             break;
    //           }
    //         }
    //       } else {
    //         this.cValue = this.word_split[i];
    //         const valueJoin = this.pValue.concat(this.cValue);
    //         console.log(valueJoin);
    //         for(let v = 0; v < this.dictionary1.length; v++) {
    //           if(valueJoin == this.dictionary1[v].name) {
    //             this.pValue = valueJoin;
    //             this.trust = true;
    //             break
    //           } 
    //         }
    //         if(!this.trust) {
    //           this.asciiValue += 1;
    //           const array6: WordLibrary[] = [
    //             {
    //               key: null,
    //               id: this.asciiValue,
    //               name: valueJoin
    //             }]
    //           console.log(this.pValue);
    //           this.dictionary1.push(array6[0]);
    //           for(let d = 0; d < this.dictionary1.length; d++) {
    //             if(this.pValue == this.dictionary1[d].name) {
    //               this.hasil.push(''+this.dictionary1[d].id);
    //               break
    //             }
    //           } 
    //         }
    //         if (this.trust) {
    //           console.log(this.pValue);
    //         } else {
    //           this.pValue = this.cValue;
    //         }
    //         this.trust = false;
    //       }
    //     }
    //     this.dictionary1.splice(this.dictionary1.length-1,this.dictionary1.length)
    //   } else {        
    //     this.dictionary3 = this.dictionary2.sort(this.compare); 
    //     for(let i = 0; i < this.word_split.length; i++) {
    //       if(i == 0) {
    //         this.pValue = this.word_split[i];
    //         console.log(this.pValue);
    //         for(let v = 0; v < this.dictionary3.length; v++) {
    //           console.log(this.dictionary3[v].name);
    //           if (this.pValue == this.dictionary3[v].name) {
    //             break;
    //           }
    //         }
    //       } else {
    //         this.cValue = this.word_split[i];
    //         const valueJoin = this.pValue.concat(this.cValue);
    //         console.log(valueJoin);
    //         for(let v = 0; v < this.dictionary3.length; v++) {
    //           if(valueJoin == this.dictionary3[v].name) {
    //             this.pValue = valueJoin;
    //             this.trust = true;
    //             break
    //           } 
    //         }
    //         if(!this.trust) {
    //           this.asciiValue += 1;
    //           const array6: WordLibrary[] = [
    //             {
    //               key: null,
    //               id: this.asciiValue,
    //               name: valueJoin
    //             }]
    //           console.log(this.pValue);
    //           this.dictionary3.push(array6[0]);
    //           for(let d = 0; d < this.dictionary3.length; d++) {
    //             if(this.pValue == this.dictionary3[d].name) {
    //               this.hasil2.push(''+this.dictionary3[d].id);
    //               break
    //             }
    //           } 
    //         }
    //         if (this.trust) {
    //           console.log(this.pValue);
    //         } else {
    //           this.pValue = this.cValue;
    //         }
    //         this.trust = false;
    //       }
    //     }
    //   }
    // }
    // console.log(this.dictionary1)
    // console.log(this.dictionary2)
    // console.log(this.dictionary3)
    // console.log(this.dictionary)
    // console.log('Hasil BookName: '+this.hasil);
    // console.log('Hasil Description: '+this.hasil2);
    // this.hasil3 = this.hasil.join(',');
    // this.hasil4 = this.hasil2.join(',');
    // console.log(this.hasil3[0]);
    // console.log(this.hasil4);
    // for(let i = 0; i < this.hasil3.length; i++) {
    //   const temp = this.hasil3[i];
    //   //console.log(temp);
    //   if(temp == ',') {
    //     this.hasil5.push(this.string_join);
    //     this.string_join = '';
    //   } else {
    //     const valueStringJoin = this.string_join.concat(temp);
    //     this.string_join = valueStringJoin;
    //   }
    // }
    // this.hasil5.push(this.string_join);
    // console.log('Hasil Decrypt : '+this.hasil5);
    // console.log('Hasil Decrypt : '+this.hasil5[0]);
    // // this.rgsSrv.getDictionaryBook('f4d2b944',null).snapshotChanges().pipe(
    // //   map(changes =>
    // //       changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
    // //   )
    // // ).subscribe(data => {
    // //   this.dic = data;
    // //   console.log(this.dic[0]);
    // //   this.rgsSrv.getDictionaryBook('f4d2b944', this.dic[0].key).snapshotChanges().pipe(
    // //     map(changes =>
    // //         changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
    // //     )
    // //   ).subscribe(data => {
    // //     this.dic = data;
    // //     console.log(this.dic);
    // //   }) 
    // // }) 
    // // this.rgsSrv.getDictionary().snapshotChanges().pipe(
    // //   map(changes =>
    // //       changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
    // //   )
    // // ).subscribe(data => {
    // //   this.wordLib = data[0];
    // //   console.log(data)   
    // //   console.log('Kata yang telah di split : '+this.wordLib[0].name);    
    // //   console.log('Kata yang telah di split : '+this.dictionary[1].name);
    // //   console.log('kata ascii: '+this.wordLib[0].id);
    // //   console.log('kata ascii: '+this.dictionary[1].id);
    // //   console.log('length kata: '+this.word.length);
    // // })

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
    console.log(this.registerForm.value.password);
    console.log(this.registerForm.value.password_confirmation);
    
      if (!this.registerForm.valid || this.registerForm.value.password != this.registerForm.value.password_confirmation) {
        console.log('Please provide all the required values!')
        this.passConf = false;
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
      console.log(this.userLib);
      console.log(this.userLib.length);
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
    console.log(this.registerForm.value)
    this.passConf = true;

    this.registerForm.addControl('imageUrl', new FormControl(this.photo, Validators.required));
    this.rgsSrv.createUserLibrary(this.registerForm.value, this.dataUrl1).then(res => {
      console.log(res);          
      console.log(this.registerForm.value.name);
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
}
