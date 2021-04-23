import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BucketService } from '@app/services/tools/bucket/bucket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-bucket-panel',
    templateUrl: './bucket-panel.component.html',
    styleUrls: ['./bucket-panel.component.scss'],
})
export class BucketPanelComponent implements OnInit, OnDestroy {
    bucketForm: FormGroup;
    name: string;
    tolerance: number;
    private destroyed: Subject<boolean>;

    constructor(private bucketService: BucketService, private readonly formBuilder: FormBuilder) {
        this.initialize();
    }

    private initialize(): void {
        this.name = this.bucketService.name;
        this.destroyed = new Subject();
        this.bucketForm = this.formBuilder.group({
            toleranceFormField: [this.bucketService.bucketAttributes.tolerance.getValue(), [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.bucketService
            .getTolerance()
            .pipe(takeUntil(this.destroyed))
            .subscribe((tolerance: number) => {
                this.tolerance = tolerance;
            });
    }

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
        this.destroyed.unsubscribe();
    }

    setTolerance(tolerance: number): void {
        this.bucketForm.patchValue({
            toleranceFormField: tolerance,
        });

        this.bucketService.setTolerance(tolerance);
    }
}
