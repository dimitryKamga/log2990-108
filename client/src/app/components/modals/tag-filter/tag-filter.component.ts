import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAX_TAGS_ALLOWED } from '@app/classes/constants/draw-constants';
import { TagFilterService } from '@app/services/modals/tag-filter/tag-filter.service';

@Component({
    selector: 'app-tag-filter',
    templateUrl: './tag-filter.component.html',
    styleUrls: ['./tag-filter.component.scss'],
})
export class TagFilterComponent {
    tags: Set<string>;
    tagName: string;
    input: FormControl;

    readonly keyCodeSeparator: number[] = [ENTER, COMMA];

    @ViewChild('tagInput') protected tagInput: ElementRef;

    @Output()
    tagsChanged: EventEmitter<Set<string>>;

    constructor(private snack: MatSnackBar, private tagFilterService: TagFilterService) {
        this.initialize();
    }

    private initialize(): void {
        this.tagsChanged = new EventEmitter<Set<string>>();
        this.tags = new Set<string>();
        this.tagName = '';
        this.input = new FormControl();
    }

    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        this.tagName = event.value;

        if (this.tags.size < MAX_TAGS_ALLOWED) {
            const isTagValid = this.tagFilterService.addTag(this.tagName, this.tags);
            if (isTagValid) {
                if (input) {
                    input.value = '';
                }
                this.tagsChanged.emit(this.tags);
            } else {
                this.snack.open('Étiquette invalide', '', { duration: 2000, panelClass: ['warning'] });
            }
        } else {
            this.snack.open('Vous ne pouvez pas ajouter plus de 6 étiquettes', '', { duration: 2000, panelClass: ['warning'] });
        }
    }

    removeTag(tag: string): void {
        this.tagFilterService.removeTag(tag, this.tags);
        this.tagsChanged.emit(this.tags);
    }
}
