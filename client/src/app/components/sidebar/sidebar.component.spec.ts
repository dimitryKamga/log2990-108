// <Richard Medeiros> <Testing Angular component with unsubscribe Error during cleanup of component>.
// https://stackoverflow.com/questions/43350115/testing-angular-component-with-unsubscribe-error-during-cleanup-of-component.

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { ModalService } from '@app/services/modals/modal.service';
import { ToolManagementService } from '@app/services/tool-management/tool-management.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of, Subject } from 'rxjs';

import SpyObj = jasmine.SpyObj;

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (subscribe)

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let modalServiceSpy: SpyObj<ModalService>;
    let fixture: ComponentFixture<SidebarComponent>;
    let toolManagementServiceSpy: SpyObj<ToolManagementService>;
    let matdialogSpy: SpyObj<MatDialog>;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async(() => {
        const obs = new Subject<string>();
        toolManagementServiceSpy = jasmine.createSpyObj('ToolManagementService', ['switchTool', 'getSelectedTool']);
        toolManagementServiceSpy.getSelectedTool.and.returnValue(obs.asObservable());
        modalServiceSpy = jasmine.createSpyObj('ModalService', ['newDrawing', 'openExportModal', 'openSavingModal', 'openCarrouselModal']);
        matdialogSpy = jasmine.createSpyObj('dialog', ['open']);

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['undo', 'redo']);

        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, RouterTestingModule, MatDialogModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [SidebarComponent],
            providers: [
                { provide: ToolManagementService, useValue: toolManagementServiceSpy },
                { provide: ModalService, useValue: modalServiceSpy },
                { provide: MatDialog, useValue: matdialogSpy },
                { provide: UndoRedoService, useValue: undoRedoSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // on test ngOnDestroy puis il ne prends aucun paramètre
    afterEach(() => {
        spyOn(component, 'ngOnDestroy').and.callFake(() => {});
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not switch tool on an invalid event', () => {
        const id = undefined;
        const target = ({
            id,
        } as unknown) as HTMLInputElement;
        const event = ({
            target,
        } as unknown) as InputEvent;
        component.onToolSwitch(event);
        expect(toolManagementServiceSpy.switchTool).not.toHaveBeenCalled();
    });

    it('should switch tool on an valid event', () => {
        const id = TOOL_LABELS.PENCIL;
        const target = ({
            id,
        } as unknown) as HTMLInputElement;
        const event = ({
            target,
        } as unknown) as InputEvent;
        component.onToolSwitch(event);
        expect(toolManagementServiceSpy.switchTool).toHaveBeenCalled();
    });

    it('should include toolLabel', () => {
        toolManagementServiceSpy.getSelectedTool.and.returnValue(of(TOOL_LABELS.PENCIL));
        component.ngOnInit();
        expect(component.currentTool).toEqual(TOOL_LABELS.PENCIL);
    });

    it('should not include tool', () => {
        toolManagementServiceSpy.getSelectedTool.and.returnValue(of('brosse'));
        component.ngOnInit();
        expect(component.currentTool).not.toEqual('brosse');
    });

    it('should call correctly a new drawing', () => {
        component.newDrawing();
        expect(modalServiceSpy.newDrawing).toHaveBeenCalled();
    });
    it('should call open the saving component dialog ', () => {
        component.openSavingModal();
        expect(modalServiceSpy.openSavingModal).toHaveBeenCalled();
    });
    it('should call open the export component dialog ', () => {
        component.openExportModal();
        expect(modalServiceSpy.openExportModal).toHaveBeenCalled();
    });

    it('should call open the carrousel component dialog ', () => {
        component.openCarrouselModal();
        expect(modalServiceSpy.openCarrouselModal).toHaveBeenCalled();
    });

    it('should call router.navigate', () => {
        component.goBack();
        expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('ngAfterViewChecked should set canUndo to true', () => {
        component['undoRedoPiles'].undoPile.length = 2;
        component.ngAfterViewChecked();
        expect(component.canUndo).toEqual(true);
    });

    it('ngAfterViewChecked should set canRedo to true', () => {
        component['undoRedoPiles'].redoPile.length = 2;
        component.ngAfterViewChecked();
        expect(component.canRedo).toEqual(true);
    });

    it('should call undo in the undoredoservice', () => {
        component.undo();
        expect(undoRedoSpy.undo).toHaveBeenCalled();
    });

    it('should call reodo in the undoredoservice', () => {
        component.redo();
        expect(undoRedoSpy.redo).toHaveBeenCalled();
    });
});
