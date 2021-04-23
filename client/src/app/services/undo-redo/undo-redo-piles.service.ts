import { Injectable } from '@angular/core';
import { MainAttributes } from '@app/classes/interfaces/tools-attributes';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoPilesService {
    undoPile: MainAttributes[];
    redoPile: MainAttributes[];
    selectedTool: Subject<boolean>;
    constructor() {
        this.initialize();
    }

    private initialize(): void {
        this.undoPile = [];
        this.redoPile = [];
        this.selectedTool = new Subject<boolean>();
    }

    setSelectedTool(isSelected: boolean): void {
        this.selectedTool.next(isSelected);
    }

    handlePiles(tool: MainAttributes): void {
        this.undoPile.push(Object.assign({}, tool));

        if (this.redoPile.length) {
            this.redoPile = [];
        }
    }

    reset(): void {
        this.undoPile = [];
        this.redoPile = [];
    }
}
