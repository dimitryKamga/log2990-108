import { TestBed } from '@angular/core/testing';
import { PREVIEWS_COLOR_NUMBER } from '@app/classes/constants/draw-constants';
import { ColorType } from '@app/classes/enums/draw-enums';
import { ColorService } from './color.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
describe('ColorService', () => {
    let service: ColorService;
    const white = '#ffffff';
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ColorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add color to history', () => {
        const length = 10;
        service.addColorToHistory(white);
        expect(service.colors.length).toEqual(length);
    });

    it('should not add color to history', () => {
        const length = 10;
        service.colors.length = PREVIEWS_COLOR_NUMBER;
        service.addColorToHistory(white);
        expect(service.colors.length).toEqual(length);
    });

    it('should add color to history', () => {
        const value = 10;
        const length = 9;
        service.colors.length = length;
        service.addColorToHistory(white);
        expect(service.colors.length).toEqual(value);
    });

    it('should set primary color', () => {
        service.setPrimaryColor(white, 1);
        expect(service.primaryColor).not.toEqual(white);
    });

    it('should set secondary color', () => {
        service.setSecondaryColor(white, 1);
        expect(service.secondaryColor).not.toEqual(white);
    });

    it('should set primary opacity', () => {
        service.setOpacity(1, ColorType.PRIMARY);
        expect(service.primaryOpacity).toEqual(1);
    });

    it('should set second opacity', () => {
        service.setOpacity(1, ColorType.SECONDARY);
        expect(service.secondaryOpacity).toEqual(1);
    });

    it('should get  and set rgba color', () => {
        service.primaryColor = 'rgba(255,255,0,1)';
        const color = {
            RED: 255,
            GREEN: 255,
            BLUE: 0,
            ALPHA: 255,
        };
        const rgba = service.getRgba(service.primaryColor);

        expect(rgba).toEqual(color);
    });
});
