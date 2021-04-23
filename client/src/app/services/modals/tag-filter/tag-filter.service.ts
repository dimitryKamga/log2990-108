import { Injectable } from '@angular/core';
import { REGEX_TAG } from '@app/classes/constants/regex-expressions';

@Injectable({
    providedIn: 'root',
})
export class TagFilterService {
    private checkTagValidity(tag: string): boolean {
        return REGEX_TAG.test(tag);
    }

    addTag(tag: string, data: Set<string>): boolean {
        if (this.checkTagValidity(tag)) {
            data.add(tag.toUpperCase());
            return true;
        }
        return false;
    }
    removeTag(tag: string, data: Set<string>): void {
        data.delete(tag);
    }
}
