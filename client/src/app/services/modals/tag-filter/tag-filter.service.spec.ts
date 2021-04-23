import { TestBed } from '@angular/core/testing';
import { TagFilterService } from './tag-filter.service';

describe('TagFilterService', () => {
    let service: TagFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TagFilterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('addTag should add valid tag', () => {
        const stringSet = new Set<string>();
        const tag = 'tag1';
        const ret = service.addTag(tag, stringSet);
        expect(stringSet.has(tag.toUpperCase())).toEqual(true);
        expect(ret).toEqual(true);
    });

    it('addTag should not add invalid tag', () => {
        const stringSet = new Set<string>();
        const returnValue = service.addTag('!!!', stringSet);
        expect(stringSet.has('!!!')).toEqual(false);
        expect(returnValue).toEqual(false);
    });

    it('removeTag should remove tag', () => {
        const stringSet = new Set<string>();
        stringSet.add('tag');
        expect(stringSet.has('tag')).toEqual(true);
        service.removeTag('tag', stringSet);
        expect(stringSet.has('tag')).toEqual(false);
    });
});
