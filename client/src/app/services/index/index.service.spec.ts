import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ImgurData } from '@common/communication/imgurdata';
import { MetaData } from '@common/communication/metadata';
import { IndexService } from './index.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (subscribe)

describe('IndexService', () => {
    let httpMock: HttpTestingController;
    let service: IndexService;
    let baseUrl: string;
    let uploadBaseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(IndexService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['BASE_URL'];
        uploadBaseUrl = service['UPLOAD_BASE_URL'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should should return expected MetaDatas safely', () => {
        const meta: MetaData = { name: '', tags: [''], filename: '', ext: '' };

        service.getMetaData().subscribe((response: MetaData[]) => {
            expect(response).toEqual([meta]);
        }, fail);

        const req = httpMock.expectOne(baseUrl + '/metaDatas/');
        expect(req.request.method).toBe('GET');
        req.flush([meta]);
    });
    it('should return expected image (HttpClient called once)', () => {
        const expectedBlob: Blob = new Blob();

        service.getDrawing('filename').subscribe((response: Blob) => {
            expect(response.size).toEqual(expectedBlob.size, 'blob check');
        }, fail);

        const req = httpMock.expectOne(baseUrl + '/getDrawing/' + 'filename');
        expect(req.request.method).toBe('GET');
        req.flush(expectedBlob);
    });

    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        const meta: MetaData = { name: 'test', tags: ['tag1', 'tag2'], filename: 'null', ext: 'image/png' };

        const formData = new FormData();
        formData.append('name', meta.name);
        meta.tags.forEach((tag: string) => {
            formData.append('tags', tag);
        });
        formData.append('ext', meta.ext);
        formData.append('image', 'blob');
        service.postDrawing(formData).subscribe(() => {}, fail);
        const req = httpMock.expectOne(baseUrl + '/postDrawing');
        expect(req.request.method).toBe('POST');
        req.flush(meta);
    });

    it('should not return any message when sending a DELETE request (HttpClient called once)', () => {
        service.deleteDrawing('filename').subscribe(() => {}, fail);
        const req = httpMock.expectOne(baseUrl + '/deleteDrawing/' + 'filename');
        expect(req.request.method).toBe('DELETE');
        req.flush('filename');
    });

    it('should not return any message when sending a POST request (HttpClient called once) for upload', () => {
        const imgurData: ImgurData = { name: 'test', image: '', ext: 'image/png' };
        service.uploadDrawing(imgurData).subscribe(() => {}, fail);
        const req = httpMock.expectOne(uploadBaseUrl);
        expect(req.request.method).toBe('POST');
        req.flush(imgurData);
    });
});
