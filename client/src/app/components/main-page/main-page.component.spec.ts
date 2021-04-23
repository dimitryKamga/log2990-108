import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MainPageComponent } from '@app/components/main-page/main-page.component';
import { ModalService } from '@app/services/modals/modal.service';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let modalServiceSpy: jasmine.SpyObj<ModalService>;

    beforeEach(async(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        modalServiceSpy = jasmine.createSpyObj('ModalService', ['openCarrouselModal']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule, MatSnackBarModule, BrowserAnimationsModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: ModalService, useValue: modalServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'Bienvenue sur Polydessin'", () => {
        expect(component.title).toEqual('Bienvenue sur Polydessin');
    });
    it('should call router.navigate', () => {
        component.editor();
        component.continue();
        expect(routerSpy.navigate).toHaveBeenCalledTimes(2);
    });

    it('continueDrawingStatus should be false when there is nothing on canvas ', () => {
        localStorage.clear();
        component.continueDrawingStatus();
        expect(component.continueDrawing).toBeFalse();
    });

    it('continueDrawingStatus should be true when there is something on canvas ', () => {
        localStorage.setItem('data', new CanvasTestHelper().canvas.toDataURL());
        component.continueDrawingStatus();
        expect(component.continueDrawing).toBeTruthy();
    });

    it('should call open the carrousel component dialog ', () => {
        component.openCarrouselModal();
        expect(modalServiceSpy.openCarrouselModal).toHaveBeenCalled();
    });

    it('should open carrousel on main page', () => {
        const event = new KeyboardEvent('keydown', { key: 'g', ctrlKey: true });
        const spy = spyOn(component, 'openCarrouselModal');
        component.onKeyDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should open carrousel on main page', () => {
        const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
        const spy = spyOn(component, 'openCarrouselModal');
        component.onKeyDown(event);
        expect(spy).not.toHaveBeenCalled();
    });
});
