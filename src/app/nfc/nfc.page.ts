import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { async } from '@angular/core/testing';
import { Ndef, NdefEvent, NFC } from '@ionic-native/nfc/ngx';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';


@Component({
  selector: 'app-nfc',
  templateUrl: './nfc.page.html',
  styleUrls: ['./nfc.page.scss'],
})
export class NfcPage implements OnInit {

  tagId: any;
  //tagDesc: any;

  constructor(
    private nfc: NFC, 
    private ndef: Ndef,
    private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    public navCtrl: NavController
    ) { 
      this.platform.ready().then(()=>{
        this.checkNFC();
      });
    }

  ngOnInit() {

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

      let tagid = await this.nfc.bytesToHexString(event.tag.id);
      this.tagId = tagid;

      // if(event.tag.ndefMessage){
      //   let payload = event.tag.ndefMessage[0].payload;
      //   let tagContent = await this.nfc.bytesToString(payload).substring(3);
      //   this.tagDesc = tagContent;
      // }

      let toast = this.toastCtrl.create({
        message: this.nfc.bytesToHexString(event.tag.id),
        duration: 5000,
        position: 'bottom'
      });
      (await toast).present();
      this.cdr.detectChanges();
    });
  }


}
