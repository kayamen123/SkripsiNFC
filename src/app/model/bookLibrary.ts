import { SafeResourceUrl } from "@angular/platform-browser";

export class BookLibrary {
    key: string;
    book_name: string;
    rfid: string;
    book_status: boolean;
    date: string;
    description: string;
    imageUrl: SafeResourceUrl;
    constructor(key:string, book_name:string, rfid:string, book_status: boolean, 
        date: string, description: string, imageUrl: SafeResourceUrl) {} 
}