import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CarrouselAttributes } from '@app/classes/interfaces/tools-attributes';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CarrouselService } from '@app/services/modals/carrousel/carrousel.service';
import { MetaData } from '@common/communication/metadata';

// tslint:disable: no-magic-numbers | raison : on voudrait tester des indices de tableau > 2
// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('CarrouselService', () => {
    let service: CarrouselService;
    let carrouselAttributes: CarrouselAttributes;
    let drawingResizerServiceSpy: jasmine.SpyObj<DrawingResizerService>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let metaData: MetaData;
    let metasFiltered: MetaData[];
    let imageIndexes: number[];

    beforeEach(() => {
        drawingResizerServiceSpy = jasmine.createSpyObj('DrawingResizerService', ['resizeBaseCanvas']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['isCanvasBlank', 'drawImage', 'autoSave']);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['drawImage']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: DrawingResizerService, useValue: drawingResizerServiceSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        service = TestBed.inject(CarrouselService);

        carrouselAttributes = {
            name: 'carrousel',
            image: 'drawing',
            mainColor: 'white',
            thickness: 1,
            secondaryColor: '',
        };

        metaData = { name: 'metaDatas', tags: ['tag', 'tag2'], filename: 'filename', ext: '' };
        service['drawingService'].baseCtx = baseCtxSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onNext should set imageIndex', () => {
        metasFiltered = [metaData, metaData, metaData];
        imageIndexes = [7, 1, 8];
        service.onNext(imageIndexes, metasFiltered);
        expect(imageIndexes).toEqual([1, 8, 9]);
    });

    it('onNext should set imageIndex to metaFiltered ', () => {
        metasFiltered = [metaData, metaData, metaData, metaData];
        imageIndexes = [11, 13, 2];
        service.onNext(imageIndexes, metasFiltered);
        expect(imageIndexes).toEqual([13, 2, 3]);
    });

    it('onNext should verify imageIndex[0] ', () => {
        metasFiltered = [metaData, metaData, metaData];
        imageIndexes = [0, 1, 2];

        service.onNext(imageIndexes, metasFiltered);
        expect(imageIndexes).toEqual([1, 2, 0]);
    });

    it('onPrevious should verify imageIndex[0]', () => {
        metasFiltered = [metaData, metaData, metaData, metaData];
        imageIndexes = [9, 10, 5];
        service.onPrevious(imageIndexes, metasFiltered);
        expect(imageIndexes).toEqual([8, 9, 10]);
    });

    it('onPrevious should set imageIndex', () => {
        metasFiltered = [metaData, metaData, metaData];
        imageIndexes = [3, 6, 9];
        service.onPrevious(imageIndexes, metasFiltered);
        expect(imageIndexes).toEqual([2, 3, 6]);
    });

    it('pevios should set imageIndex at metasFiltered.length', () => {
        metasFiltered = [metaData, metaData, metaData, metaData];
        imageIndexes = [0, 1, 2];

        service.onPrevious(imageIndexes, metasFiltered);
        expect(imageIndexes[0]).toBe(metasFiltered.length - 1);
    });

    it('loadImageOnCanvas should load Image', async () => {
        const canvas = document.createElement('canvas').toDataURL();
        const canvasBlob = await (await fetch(canvas)).blob();

        const img = URL.createObjectURL(canvasBlob);
        carrouselAttributes.image = img;

        const imgTest = new Image();
        let spy: jasmine.Spy;
        service.loadImageOnCanvas(carrouselAttributes);
        spy = spyOn<any>(service, 'drawDrawing');
        imgTest.dispatchEvent(new Event('load'));
        expect(spy).toBeTruthy();
    });
});
