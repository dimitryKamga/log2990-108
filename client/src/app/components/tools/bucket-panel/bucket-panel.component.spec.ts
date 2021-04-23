import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MIN_TOLERANCE } from '@app/classes/constants/draw-constants';
import { BucketAttributes } from '@app/classes/interfaces/tools-attributes';
import { BucketService } from '@app/services/tools/bucket/bucket.service';
import { BehaviorSubject, of } from 'rxjs';
import { BucketPanelComponent } from './bucket-panel.component';

// tslint:disable: no-empty | raison:  Pour des interfaces a instructions vides

describe('BucketPanelComponent', () => {
    let component: BucketPanelComponent;
    let fixture: ComponentFixture<BucketPanelComponent>;
    let bucketServiceSpy: jasmine.SpyObj<BucketService>;
    let bucketAttributes: BucketAttributes;

    beforeEach(async(() => {
        bucketServiceSpy = jasmine.createSpyObj('BucketService', ['setTolerance', 'getTolerance']);

        TestBed.configureTestingModule({
            declarations: [BucketPanelComponent],
            imports: [ReactiveFormsModule, FormsModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: BucketService, useValue: bucketServiceSpy }, FormBuilder],
        }).compileComponents();

        bucketAttributes = {
            name: bucketServiceSpy.name,
            mainColor: '',
            secondaryColor: '',
            thickness: 1,
            tolerance: new BehaviorSubject<number>(MIN_TOLERANCE),
            imageData: bucketServiceSpy.canvasImageData,
        };
        bucketServiceSpy.bucketAttributes = bucketAttributes;
        bucketServiceSpy.getTolerance.and.returnValue(of(0));
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BucketPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        spyOn(component, 'ngOnDestroy').and.callFake(() => {});
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set tolerance ', () => {
        const tolerance = 30;
        component.setTolerance(tolerance);
        expect(bucketServiceSpy.setTolerance).toHaveBeenCalled();
    });
});
