import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ImgurData } from '@common/communication/imgurdata';
import { MetaData } from '@common/communication/metadata';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class IndexService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/database';
    private readonly UPLOAD_BASE_URL: string = 'https://api.imgur.com/3/image';
    private readonly CLIENT_ID: string = '307d0081c03c455';

    
    constructor(private http: HttpClient) {}

    getMetaData(): Observable<MetaData[]> {
        return this.http.get<MetaData[]>(this.BASE_URL + '/metaDatas/');
    }

    getDrawing(filename: string): Observable<Blob> {
        return this.http.get<Blob>(this.BASE_URL + '/getDrawing/' + filename, { responseType: 'blob' as 'json' });
    }

    postDrawing(formData: FormData): Observable<void> {
        return this.http.post<void>(this.BASE_URL + '/postDrawing', formData);
    }

    deleteDrawing(filename: string): Observable<string> {
        return this.http.delete<string>(this.BASE_URL + '/deleteDrawing/' + filename);
    }

    uploadDrawing(imgurData: ImgurData): Observable<string> {
        return this.http.post(
            this.UPLOAD_BASE_URL,
            {
                image: imgurData.image,
                name: imgurData.name,
                type: imgurData.ext,
            },
            {
                responseType: 'text',
                headers: {
                    Authorization: 'Client-ID ' + this.CLIENT_ID,
                },
            },
        );
    }
}
