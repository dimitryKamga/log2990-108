import { ClipboardModule } from '@angular/cdk/clipboard';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/components/app/app.component';
import { ColorPickerComponent } from '@app/components/color/color-picker/color-picker.component';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { EditorComponent } from '@app/components/editor/editor.component';
import { GridPanelComponent } from '@app/components/grid-panel/grid-panel.component';
import { MainPageComponent } from '@app/components/main-page/main-page.component';
import { CarrouselComponent } from '@app/components/modals/carrousel/carrousel.component';
import { LoadConfirmationDialogComponent } from '@app/components/modals/carrousel/load-confirmation-dialog/load-confirmation-dialog.component';
import { ExportComponent } from '@app/components/modals/export/export.component';
import { SavingComponent } from '@app/components/modals/saving/saving.component';
import { TagFilterComponent } from '@app/components/modals/tag-filter/tag-filter.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SurfaceResizerComponent } from '@app/components/surface-resizer/surface-resizer.component';
import { ToolPanelComponent } from '@app/components/tool-panel/tool-panel.component';
import { BucketPanelComponent } from '@app/components/tools/bucket-panel/bucket-panel.component';
import { EllipsePanelComponent } from '@app/components/tools/ellipse-panel/ellipse-panel.component';
import { EraserPanelComponent } from '@app/components/tools/eraser-panel/eraser-panel.component';
import { EyedropperPanelComponent } from '@app/components/tools/eye-dropper-panel/eye-dropper-panel.component';
import { LinePanelComponent } from '@app/components/tools/line-panel/line-panel.component';
import { PencilPanelComponent } from '@app/components/tools/pencil-panel/pencil-panel.component';
import { PolygonPanelComponent } from '@app/components/tools/polygon-panel/polygon-panel.component';
import { RectanglePanelComponent } from '@app/components/tools/rectangle-panel/rectangle-panel.component';
import { MagnetismPanelComponent } from '@app/components/tools/select-panel/magnetism-panel/magnetism-panel.component';
import { SelectAllPanelComponent } from '@app/components/tools/select-panel/select-all-panel/select-all-panel.component';
import { SelectEllipsePanelComponent } from '@app/components/tools/select-panel/select-ellipse-panel/select-ellipse-panel.component';
import { SelectRectanglePanelComponent } from '@app/components/tools/select-panel/select-rectangle-panel/select-rectangle-panel.component';
import { SprayPanelComponent } from '@app/components/tools/spray-panel/spray-panel.component';
import { StampPanelComponent } from '@app/components/tools/stamp-panel/stamp-panel.component';
import { ToolSliderComponent } from '@app/components/tools/tool-slider/tool-slider.component';
import { WorkSpaceComponent } from '@app/components/work-space/work-space.component';
import { MaterialModule } from '@app/material.module';
import { ColorPanelComponent } from './components/color/color-panel/color-panel.component';
import { ClipboardComponent } from './components/tools/select-panel/clipboard/clipboard.component';
import { SelectLassoPanelComponent } from './components/tools/select-panel/select-lasso-panel/select-lasso-panel.component';
import { TextPanelComponent } from './components/tools/text-panel/text-panel.component';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        ToolPanelComponent,
        PencilPanelComponent,
        WorkSpaceComponent,
        SurfaceResizerComponent,
        ConfirmationDialogComponent,
        LinePanelComponent,
        EllipsePanelComponent,
        ToolSliderComponent,
        RectanglePanelComponent,
        PolygonPanelComponent,
        ColorPickerComponent,
        EraserPanelComponent,
        CarrouselComponent,
        SavingComponent,
        EyedropperPanelComponent,
        SprayPanelComponent,
        ExportComponent,
        TagFilterComponent,
        LoadConfirmationDialogComponent,
        BucketPanelComponent,
        StampPanelComponent,
        GridPanelComponent,
        TextPanelComponent,
        MagnetismPanelComponent,
        SelectEllipsePanelComponent,
        SelectRectanglePanelComponent,
        ClipboardComponent,
        SelectAllPanelComponent,
        ColorPanelComponent,
        SelectLassoPanelComponent,
    ],
    imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        ClipboardModule,
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        MaterialModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
