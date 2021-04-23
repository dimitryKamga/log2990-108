import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Fonts } from '@app/classes/text';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { TextLogicService } from '@app/services/tools/text/text-logic.service';
import { TextService } from '@app/services/tools/text/text.service';

@Component({
    selector: 'app-text-panel',
    templateUrl: './text-panel.component.html',
    styleUrls: ['./text-panel.component.scss'],
})
export class TextPanelComponent implements OnDestroy {
    name: string;
    textSize: number;
    textForm: FormGroup;
    readonly GEORGIA: string = Fonts.GEORGIA;
    readonly TIMES_NEW_ROMAN: string = Fonts.TIMES_NEW_ROMAN;
    readonly ARIAL: string = Fonts.ARIAL;
    readonly VERDANA: string = Fonts.VERDANA;
    readonly COURIER: string = Fonts.COURIER_NEW;

    constructor(
        private textService: TextService,
        private textLogicService: TextLogicService,
        private readonly formBuilder: FormBuilder,
        private shortcutHandlerService: ShortcutsHandlerService,
    ) {
        this.initialize();
    }

    private initialize(): void {
        this.textSize = this.textService.textSize;
        this.name = this.textLogicService.name;
        this.textForm = this.formBuilder.group({
            sizeFormField: [this.textService.textSize, [Validators.required]],
            fontformfield: [this.textService.font, [Validators.required]],
        });
    }

    changeFont(font: string): void {
        this.textForm.patchValue({
            fontFormField: font,
        });
        this.textService.font = font;
        this.textLogicService.setFontStyle();
    }

    changeSize(size: number): void {
        size = Number(size);
        this.textForm.patchValue({
            sizeFormField: size,
        });
        this.textSize = size;
        this.textLogicService.setSize(size);
    }

    setItalic(value: boolean): void {
        this.textLogicService.setItalic(value);
    }

    setBold(isBold: boolean): void {
        this.textLogicService.setBold(isBold);
    }

    setAlignment(align: string): void {
        this.textLogicService.setAlignment(align);
    }

    ngOnDestroy(): void {
        this.textLogicService.generateText();
    }

    onWriting(): void {
        this.shortcutHandlerService.isShortcutKeyEnabled = false;
        this.textService.canWrite = false;
    }

    onConfirm(): void {
        this.textService.canWrite = true;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.stopPropagation();
        }
    }
}
