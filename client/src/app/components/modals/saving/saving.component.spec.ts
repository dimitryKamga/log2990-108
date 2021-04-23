import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExportFormats } from '@app/classes/enums/export-enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SavingService } from '@app/services/modals/saving/saving.service';
import { TagFilterService } from '@app/services/modals/tag-filter/tag-filter.service';
import { BehaviorSubject } from 'rxjs';
import { SavingComponent } from './saving.component';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('SavingComponent', () => {
    let component: SavingComponent;
    let fixture: ComponentFixture<SavingComponent>;
    let savingServiceSpy: jasmine.SpyObj<SavingService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<SavingComponent>>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['isCanvasBlank']);
        dialogRefSpy = jasmine.createSpyObj('dialogRef', ['close']);
        savingServiceSpy = jasmine.createSpyObj('SavingService', ['']);
        savingServiceSpy.isTitleValid = new BehaviorSubject<boolean>(false);
        savingServiceSpy.currentFormat = new BehaviorSubject<ExportFormats>(ExportFormats.PNG);

        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, MatGridListModule, MatSnackBarModule, HttpClientModule],
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [SavingComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: SavingService, useValue: savingServiceSpy },
                { provide: DrawingService, useValue: drawingServiceSpy },
                SavingService,
                TagFilterService,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SavingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' should call resetSubscribers', () => {
        const resetSubsSpy = spyOn(component['saveService'], 'resetSubscribers');
        component.resetSubscribers();
        expect(resetSubsSpy).toHaveBeenCalled();
    });

    it('setTitle should set a correct title', () => {
        const savingSpy = spyOn(component['saveService'], 'checkTitle');
        component.setTitle(({
            target: {
                value: 'title',
            } as HTMLInputElement,
        } as unknown) as InputEvent);
        expect(savingSpy).toHaveBeenCalled();
    });

    it('setTitle shoud not set title when target is null', () => {
        const savingSpy = spyOn(component['saveService'], 'checkTitle');
        component.setTitle(({
            target: null,
        } as unknown) as InputEvent);
        expect(savingSpy).not.toHaveBeenCalled();
    });
    it(' should set a valid format', () => {
        component.setFormat('PNG');
        expect(component['saveService'].currentFormat.value).toEqual(ExportFormats.PNG);
    });

    it(' should not set a format if get invalid format', () => {
        component['saveService'].currentFormat.next(ExportFormats.PNG);
        component.setFormat('none');
        expect(component['saveService'].currentFormat.value).toEqual(ExportFormats.PNG);
    });

    it('addTag should add valid tag', () => {
        const spySnack = spyOn(component['snack'], 'open');
        component.addTag('test');
        expect(component['tags'].has('TEST')).toEqual(true);
        expect(component['tagName']).toEqual('');
        expect(spySnack).not.toHaveBeenCalled();
    });

    it('addTag should show error, max number of tags reached', () => {
        const tags = new Set<string>();
        tags.add('test1');
        tags.add('test2');
        tags.add('test3');
        tags.add('test4');
        tags.add('test5');
        tags.add('test6');

        component['tags'] = tags;
        const spySnack = spyOn(component['snack'], 'open');
        component.addTag('test8');
        expect(spySnack).toHaveBeenCalledWith('Vous ne pouvez pas ajouter plus de 6 étiquettes', '', { duration: 2000, panelClass: ['warning'] });
    });

    it('addTag should show error, tag name invalid', () => {
        const spySnack = spyOn(component['snack'], 'open');
        component.addTag('##');
        expect(component['tags'].has('##')).toEqual(false);
        expect(spySnack).toHaveBeenCalledWith('Étiquette invalide', '', { duration: 2000, panelClass: ['warning'] });
    });

    it('removeTag should remove a tag', () => {
        const savingSpy = spyOn(component['tagFilterService'], 'removeTag');
        component['tags'].add('test1');
        component['tags'].add('test2');
        component.removeTag('test1');
        expect(savingSpy).toHaveBeenCalled();
    });

    it('save not should save if title is not valid', () => {
        component['isTitleValid'] = false;
        const spySnack = spyOn(component['snack'], 'open');
        const spyPost = spyOn<any>(component, 'post');
        component.save();
        expect(spySnack).toHaveBeenCalledWith('Titre invalide , tentez une nouvelle fois.', '', { duration: 2000, panelClass: ['warning'] });
        expect(spyPost).not.toHaveBeenCalled();
    });

    it('save should post Image if title is valid', () => {
        component['isTitleValid'] = true;
        const savingSpy = spyOn(component['saveService'], 'sendDrawing');
        const spyPost = spyOn<any>(component, 'post').and.callThrough();
        component.save();
        expect(spyPost).toHaveBeenCalled();
        expect(dialogRefSpy.close).toHaveBeenCalledTimes(1);
        expect(savingSpy).toHaveBeenCalled();
    });
});
