import { SafeResourceUrl } from "@angular/platform-browser";

export class UserLibrary {
    key: string;
    name: string;
    email: string;
    roles: string;
    mobile_phone: string;
    password: string;
    imageUrl: SafeResourceUrl
    constructor(key:string, name:string, email:string, roles:string, mobile_phone:string, password: string, imageUrl: SafeResourceUrl) {}
}