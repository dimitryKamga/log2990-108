import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GRID_MIN_SQUARESIZE } from '@app/classes/constants/draw-constants';
import { ShortcutKeys } from '@app/classes/enums/draw-enums';
import { GridService } from './grid.service';

// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('GridService', () => {
    let service: GridService;
    let gridCtxStub: CanvasRenderingContext2D;
    let setGridSpy: jasmine.Spy<any>;
    let clearGridSpy: jasmine.Spy<any>;
    let incrementSpacingSpy: jasmine.Spy<any>;
    let decrementSpacingSpy: jasmine.Spy<any>;

    const width = 100;
    const height = 100;

    beforeEach(() => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        gridCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        TestBed.configureTestingModule({});
        service = TestBed.inject(GridService);

        service.gridCtx = gridCtxStub;
        service.gridCanvas = new CanvasTestHelper().canvas;
        setGridSpy = spyOn(service, 'setGrid').and.callThrough();
        clearGridSpy = spyOn<any>(service, 'clearGridCanvas').and.callThrough();
        incrementSpacingSpy = spyOn<any>(service, 'incrementShortcutSpacing').and.callThrough();
        decrementSpacingSpy = spyOn<any>(service, 'decrementShortcutSpacing').and.callThrough();

        service.isEnabled = true;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear the whole grid canvas', () => {
        service['clearGridCanvas'](service.gridCtx);
        const pixelBuffer = new Uint32Array(service.gridCtx.getImageData(0, 0, service.gridCanvas.width, service.gridCanvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it('should increment by 5 the spacing of a grid ', () => {
        const spacing = 300;
        const expected = 305;
        service.squareSize = spacing;
        service['incrementShortcutSpacing']();
        expect(service.squareSize).not.toEqual(expected);
    });
    it('should increment by 5 the spacing of a grid ', () => {
        const spacing = 8;
        const expectedResult = 10;
        service.squareSize = spacing;
        service['incrementShortcutSpacing']();
        expect(service.squareSize).toEqual(expectedResult);
    });

    it('should decrement by 5 the spacing of a grid ', () => {
        const spacing = 57;
        const expected = 55;
        service.squareSize = spacing;
        service['decrementShortcutSpacing']();
        expect(service.squareSize).toEqual(expected);
    });
    it('should decrement by 5 the spacing of a grid ', () => {
        const spacing = 50;
        const expected = 45;
        service.squareSize = spacing;
        service['decrementShortcutSpacing']();
        expect(service.squareSize).toEqual(expected);
    });

    it('should decrement by 5 the spacing of a grid ', () => {
        const spacing = 2;
        service.squareSize = spacing;
        service['decrementShortcutSpacing']();
        expect(service.squareSize).not.toBeGreaterThan(GRID_MIN_SQUARESIZE);
    });

    it('should set grid enabler ', () => {
        service.setGridEnabler();
        expect(service.isEnabled).toBeFalse();
    });

    it('#keyboardHandler should not call increment spacing by 5 the value of squareSize', () => {
        service.keyboardHandler(ShortcutKeys.MINUS);
        expect(incrementSpacingSpy).not.toHaveBeenCalled();
        expect(decrementSpacingSpy).toHaveBeenCalled();
        expect(setGridSpy).toHaveBeenCalled();
    });

    it('#keyboardHandler should call increment spacing by 5 the value of squareSize', () => {
        service.keyboardHandler(ShortcutKeys.PLUS);
        expect(incrementSpacingSpy).toHaveBeenCalled();
    });

    it('#keyboardHandler should not call increment spacing by 5 the value of squareSize', () => {
        service.keyboardHandler(ShortcutKeys.EQUAL);
        expect(incrementSpacingSpy).toHaveBeenCalled();
    });

    it('should increment the squaresize by 1 ', () => {
        const value = 41;
        service.changeSquareSize(value);
        expect(setGridSpy).toHaveBeenCalled();
        expect(clearGridSpy).toHaveBeenCalled();
    });
    it('should increment the squaresize by 1 ', () => {
        const value = 4;
        service.changeSquareSize(value);
        expect(setGridSpy).not.toHaveBeenCalled();
    });

    it('should increment the opacity by 1 ', () => {
        const value = 41;
        service.changeOpacity(value);
        expect(setGridSpy).toHaveBeenCalled();
    });
    it('should increment the opacity by 1 ', () => {
        const value = 108;
        service.changeOpacity(value);
        expect(setGridSpy).not.toHaveBeenCalled();
    });

    it('should handle grid by activating it ', () => {
        service.gridHandler();
        expect(setGridSpy).toHaveBeenCalled();
    });
    it('should handle grid by deactivating it ', () => {
        service.isEnabled = false;
        service.gridHandler();
        expect(setGridSpy).not.toHaveBeenCalled();
    });
});
