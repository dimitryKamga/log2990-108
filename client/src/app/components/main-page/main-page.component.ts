import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShortcutKeys } from '@app/classes/enums/draw-enums';
import { ModalService } from '@app/services/modals/modal.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit, OnDestroy {
    readonly title: string = 'Bienvenue sur Polydessin';
    continueDrawing: boolean;

    constructor(private router: Router, private shortcutsHandlerService: ShortcutsHandlerService, private modalService: ModalService) {
        this.continueDrawingStatus();
    }

    editor(): void {
        localStorage.clear();
        this.router.navigate(['/editor']);
    }

    continue(): void {
        this.router.navigate(['/editor']);
    }

    continueDrawingStatus(): void {
        localStorage.length > 0 ? (this.continueDrawing = true) : (this.continueDrawing = false);
    }

    openCarrouselModal(): void {
        this.modalService.openCarrouselModal();
    }

    ngOnInit(): void {
        this.shortcutsHandlerService.isShortcutKeyEnabled = false;
    }

    ngOnDestroy(): void {
        this.shortcutsHandlerService.isShortcutKeyEnabled = true;
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === ShortcutKeys.GRID) {
            event.preventDefault();
            this.openCarrouselModal();
        }
    }
}
