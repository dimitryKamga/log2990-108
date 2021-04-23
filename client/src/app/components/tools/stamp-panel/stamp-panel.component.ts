import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { FACTOR_5 } from '@app/classes/constants/draw-constants';
import { StampChoiceLabels, StampIconsPath } from '@app/classes/enums/draw-enums';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-stamp-panel',
    templateUrl: './stamp-panel.component.html',
    styleUrls: ['./stamp-panel.component.scss'],
})
export class StampPanelComponent implements OnInit, OnDestroy {
    @Input() stampChoice: StampChoiceLabels;
    @Output() valueChange: EventEmitter<StampChoiceLabels>;

    stampSize: number;
    stampAngle: number;
    stampIconsPath: string[];
    stampChoices: string[];
    name: string;
    stampForm: FormGroup;

    private destroyed: Subject<boolean>;

    constructor(private stampService: StampService, private readonly formBuilder: FormBuilder) {
        this.initialize();
    }

    private initialize(): void {
        this.valueChange = new EventEmitter<StampChoiceLabels>();
        this.destroyed = new Subject();
        this.stampIconsPath = Object.values(StampIconsPath);
        this.stampChoices = Object.values(StampChoiceLabels);
        this.name = this.stampService.name;
        this.stampForm = this.formBuilder.group({
            sizeFormField: [this.stampService.stampAttributes.size, [Validators.required]],
            stampChoiceFormField: [this.stampService.stampAttributes.stampChoice, [Validators.required]],
            angleFormField: [{ value: this.stampService.stampAttributes.angle.getValue(), disabled: true }, [Validators.required]],
        });
        this.stampService.stampForm = this.stampForm;
    }

    ngOnInit(): void {
        this.stampSize = this.stampService.getSize() / FACTOR_5;
        this.stampChoice = this.stampService.getStampChoice();
        this.stampService
            .getAngle()
            .pipe(takeUntil(this.destroyed))
            .subscribe((angle: number) => {
                this.stampAngle = angle;
            });
    }

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
        this.destroyed.unsubscribe();
    }

    setSize(size: number): void {
        this.stampForm.patchValue({
            sizeFormField: size,
        });
        this.stampService.setSize(size);
    }

    setStampChoice(event: MatButtonToggleChange): void {
        this.stampForm.patchValue({
            stampChoiceFormField: event.value as StampChoiceLabels,
        });
        this.valueChange.emit(event.value as StampChoiceLabels);
        this.stampService.setStampChoice(event.value as StampChoiceLabels);
    }

    setAngle(angle: number): void {
        this.stampForm.patchValue({
            angleFormField: angle,
        });

        this.stampService.setAngle(angle);
    }
}
