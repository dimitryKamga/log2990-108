import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TagFilterService } from '@app/services/modals/tag-filter/tag-filter.service';
import { TagFilterComponent } from './tag-filter.component';
// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('TagFilterComponent', () => {
    let component: TagFilterComponent;
    let fixture: ComponentFixture<TagFilterComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TagFilterComponent],
            providers: [TagFilterService],
            imports: [MatSnackBarModule, MatInputModule, MatChipsModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TagFilterComponent);
        component = fixture.componentInstance;
        component.tagsChanged = new EventEmitter<Set<string>>();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('addTag should add valid tag', () => {
        const input = fixture.nativeElement.querySelector('input');
        const event = { input: input as HTMLInputElement, value: 'tag' } as MatChipInputEvent;
        const spySnack = spyOn(component['snack'], 'open');

        component.addTag(event);
        expect(component['tags'].has('TEST')).toEqual(false);
        expect(component['tagName']).not.toEqual('');
        expect(spySnack).not.toHaveBeenCalled();
    });

    it('addTag should show error, max number of tags reached', () => {
        const input = fixture.nativeElement.querySelector('input');
        const event = { input: input as HTMLInputElement, value: 'tag' } as MatChipInputEvent;
        const tags = new Set<string>();
        tags.add('test1');
        tags.add('test2');
        tags.add('test3');
        tags.add('test4');
        tags.add('test5');
        tags.add('test6');

        component['tags'] = tags;
        const spySnack = spyOn(component['snack'], 'open');
        component.addTag(event);
        expect(spySnack).toHaveBeenCalledWith('Vous ne pouvez pas ajouter plus de 6 étiquettes', '', { duration: 2000, panelClass: ['warning'] });
    });

    it('addTag should show error, tag name invalid', () => {
        const input = fixture.nativeElement.querySelector('input');
        const event = { input: input as HTMLInputElement, value: '' } as MatChipInputEvent;
        const spySnack = spyOn(component['snack'], 'open');

        component.addTag(event);
        expect(component['tags'].has('!!!')).toEqual(false);
        expect(spySnack).toHaveBeenCalledWith('Étiquette invalide', '', { duration: 2000, panelClass: ['warning'] });
    });

    it('removeTag should remove a tag', () => {
        const tagFilterServiceSpy = spyOn(component['tagFilterService'], 'removeTag');
        const tags = component['tags'];
        component.removeTag('test');
        expect(tagFilterServiceSpy).toHaveBeenCalledWith('test', tags);
    });

    it('addTag should not add invalid tag if input is false', () => {
        const input = fixture.nativeElement.querySelector('f');
        const event = { input: input as HTMLInputElement, value: 'tag' } as MatChipInputEvent;
        const tags = new Set<string>();
        tags.add('test1');
        tags.add('test2');

        component['tags'] = tags;
        component.addTag(event);
        expect(event.input).toBeFalsy();
    });
});
