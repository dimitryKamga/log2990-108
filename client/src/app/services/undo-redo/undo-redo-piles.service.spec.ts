import { TestBed } from '@angular/core/testing';
import { LineAttributes } from '@app/classes/interfaces/tools-attributes';
import { Vec2 } from '@app/classes/vec2';
import { UndoRedoPilesService } from './undo-redo-piles.service';

describe('UndoRedoActionsService', () => {
    let service: UndoRedoPilesService;
    let lineAttributes: LineAttributes;

    beforeEach(() => {
        const mousePosition: Vec2 = { x: 10, y: 10 };
        const mousePosition3: Vec2 = { x: 11, y: 11 };
        lineAttributes = {
            name: 'line',
            segment: { firstPoint: mousePosition, lastPoint: mousePosition3 },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [],
            isJunction: true,
            endLine: 'round',
            thickness: 5,
            isDoubleClicked: true,
            isLastPoint: false,
            savedSegment: [{ firstPoint: mousePosition, lastPoint: mousePosition3 }],
            dotRadius: 5,
        };
        TestBed.configureTestingModule({});
        service = TestBed.inject(UndoRedoPilesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set selected tool', () => {
        service.setSelectedTool(true);
        service.handlePiles(lineAttributes);
        expect(service.redoPile.length).toEqual(0);
    });
    it('should reset redo pile', () => {
        service.setSelectedTool(true);
        service.redoPile.push(lineAttributes);
        service.handlePiles(lineAttributes);
        expect(service.redoPile.length).toEqual(0);
    });

    it('should reset', () => {
        service.reset();
        expect(service.redoPile.length).toEqual(0);
        expect(service.undoPile.length).toEqual(0);
    });
});
