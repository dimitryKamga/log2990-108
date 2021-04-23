import { Injectable } from '@angular/core';
import { Directions } from '@app/classes/enums/select-enums';
import { Vec2 } from '@app/classes/vec2';
import { GridService } from '@app/services/grid/grid.service';

@Injectable({
    providedIn: 'root',
})
export class MagnetService {
    isEnabled: boolean;
    anchor: Directions;

    constructor(private gridService: GridService) {
        this.initialize();
    }
    private initialize(): void {
        this.isEnabled = false;
        this.anchor = Directions.CENTER;
    }

    enableMagnet(isEnabled: boolean): void {
        this.isEnabled = isEnabled;
    }

    setMagnet(): void {
        this.isEnabled = !this.isEnabled;
    }

    nearestIntersection(point: Vec2): Vec2 {
        const s = this.gridService.squareSize;
        const pointToAdd = {
            x: Math.round(point.x / s) * s,
            y: Math.round(point.y / s) * s,
        };
        return pointToAdd;
    }
}
