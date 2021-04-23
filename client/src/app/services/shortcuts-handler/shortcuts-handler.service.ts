import { Injectable } from '@angular/core';
import { FEATURES_SIDEBAR, TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { ShortcutKeys } from '@app/classes/enums/draw-enums';
import { FeaturesSidebar, ToolLabels } from '@app/classes/interfaces/toolbar-interfaces';
import { Observable, Subject } from 'rxjs';
// tslint:disable:label-position | raison: pour appliquer un break sur des if a partir d'un label

@Injectable({
    providedIn: 'root',
})
export class ShortcutsHandlerService {
    private featuresSidebar: FeaturesSidebar;
    private toolLabel: Subject<string>;
    private toolLabels: ToolLabels;
    private shiftKey: Map<string, string>;
    private keysMap: Map<string, string>;
    private ctrlKey: Map<string, string>;

    isShortcutKeyEnabled: boolean;

    constructor() {
        this.initialize();
        this.initializeMap();
    }

    private initialize(): void {
        this.toolLabel = new Subject<string>();
        this.isShortcutKeyEnabled = true;
        this.toolLabels = TOOL_LABELS;
        this.featuresSidebar = FEATURES_SIDEBAR;
    }

    private initializeMap(): void {
        this.shiftKey = new Map();
        this.shiftKey.set(ShortcutKeys.REDO, this.featuresSidebar.REDO_LABEL);

        this.keysMap = new Map();
        this.keysMap.set(ShortcutKeys.PENCIL, this.toolLabels.PENCIL);
        this.keysMap.set(ShortcutKeys.SPRAY, this.toolLabels.SPRAY);
        this.keysMap.set(ShortcutKeys.RECTANGLE, this.toolLabels.RECTANGLE);
        this.keysMap.set(ShortcutKeys.ELLIPSE, this.toolLabels.ELLIPSE);
        this.keysMap.set(ShortcutKeys.LINE, this.toolLabels.LINE);
        this.keysMap.set(ShortcutKeys.POLYGON, this.toolLabels.POLYGON);
        this.keysMap.set(ShortcutKeys.BUCKET, this.toolLabels.BUCKET);
        this.keysMap.set(ShortcutKeys.ERASER, this.toolLabels.ERASER);
        this.keysMap.set(ShortcutKeys.RECTANGLE_SELECTION, this.toolLabels.RECTANGLE_SELECTION);
        this.keysMap.set(ShortcutKeys.ELLIPSE_SELECTION, this.toolLabels.ELLIPSE_SELECTION);
        this.keysMap.set(ShortcutKeys.EYE_DROPPER, this.toolLabels.EYE_DROPPER);
        this.keysMap.set(ShortcutKeys.TEXT, this.toolLabels.TEXT);
        this.keysMap.set(ShortcutKeys.STAMP, this.toolLabels.STAMP);
        this.keysMap.set(ShortcutKeys.LASSO, this.toolLabels.LASSO);
        this.keysMap.set(ShortcutKeys.GRID, this.featuresSidebar.GRID);
        this.keysMap.set(ShortcutKeys.MAGNETISM, this.featuresSidebar.MAGNETISM);

        this.ctrlKey = new Map();
        this.ctrlKey.set(ShortcutKeys.NEW_DRAWING, this.featuresSidebar.NEW_DRAWING_LABEL);
        this.ctrlKey.set(ShortcutKeys.CARROUSEL, this.featuresSidebar.CARROUSEL_LABEL);
        this.ctrlKey.set(ShortcutKeys.SAVE, this.featuresSidebar.SAVE_LABEL);
        this.ctrlKey.set(ShortcutKeys.EXPORT_DRAWING, this.featuresSidebar.EXPORT_DRAWING_LABEL);
        this.ctrlKey.set(ShortcutKeys.SELECT_ALL, this.featuresSidebar.SELECT_ALL_LABEL);
        this.ctrlKey.set(ShortcutKeys.UNDO, this.featuresSidebar.UNDO_LABEL);
        this.ctrlKey.set(ShortcutKeys.COPY, this.featuresSidebar.COPY);
        this.ctrlKey.set(ShortcutKeys.PASTE, this.featuresSidebar.PASTE);
        this.ctrlKey.set(ShortcutKeys.CUT, this.featuresSidebar.CUT);
    }

    onKeyDown(event: KeyboardEvent): void {
        let shortcut: string | undefined;
        if (event.shiftKey || event.ctrlKey) event.preventDefault();
        if (!this.isShortcutKeyEnabled) return;
        key: {
            if (event.ctrlKey) {
                if (event.shiftKey) {
                    shortcut = this.shiftKey.get(event.key.toString());
                    break key;
                }
                shortcut = this.ctrlKey.get(event.key.toString());
            } else {
                shortcut = this.keysMap.get(event.key.toString());
            }
        }
        if (shortcut) {
            this.toolLabel.next(shortcut);
        }
    }

    getShortcut(): Observable<string> {
        return this.toolLabel.asObservable();
    }
}
