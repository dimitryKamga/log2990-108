import { FeaturesSidebar, ToolLabels } from '@app/classes/interfaces/toolbar-interfaces';

export const FEATURES_SIDEBAR: FeaturesSidebar = {
    AUCUN: 'Aucun',
    NEW_DRAWING_LABEL: 'Nouveau Dessin',
    CARROUSEL_LABEL: 'Carrousel',
    SAVE_LABEL: 'Sauvegarder Dessin',
    EXPORT_DRAWING_LABEL: 'Exporter Dessin',
    SELECT_ALL_LABEL: 'Sélectionner tout',
    UNDO_LABEL: 'Annuler',
    REDO_LABEL: 'Refaire',
    GRID: 'Grille',
    MAGNETISM: 'MAGNÉTISME',
    COPY: 'Copier',
    PASTE: 'Coller',
    CUT: 'Couper',
};

export const TOOL_LABELS: ToolLabels = {
    PENCIL: 'Crayon',
    SPRAY: 'Aérosol',
    RECTANGLE: 'Rectangle',
    ELLIPSE: 'Ellipse',
    LINE: 'Ligne',
    BUCKET: 'Sceau de couleur',
    ERASER: 'Efface',
    RECTANGLE_SELECTION: 'Sélection par Rectangle',
    ELLIPSE_SELECTION: 'Sélection par Ellipse',
    EYE_DROPPER: 'Pipette',
    TEXT: 'Texte',
    STAMP: 'Étampe',
    POLYGON: 'Polygone',
    LASSO: 'Lasso polygonal',
};

export const TOOLS_TABLE: string[] = [
    TOOL_LABELS.PENCIL,
    TOOL_LABELS.SPRAY,
    TOOL_LABELS.RECTANGLE,
    TOOL_LABELS.ELLIPSE,
    TOOL_LABELS.LINE,
    TOOL_LABELS.BUCKET,
    TOOL_LABELS.ERASER,
    TOOL_LABELS.EYE_DROPPER,
    TOOL_LABELS.RECTANGLE_SELECTION,
    TOOL_LABELS.ELLIPSE_SELECTION,
    TOOL_LABELS.TEXT,
    TOOL_LABELS.STAMP,
    TOOL_LABELS.POLYGON,
    TOOL_LABELS.LASSO,
];
