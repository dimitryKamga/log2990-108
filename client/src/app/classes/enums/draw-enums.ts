export enum ResizerLocation {
    NONE = 0,
    RIGHT = 1,
    CORNER = 2,
    BOTTOM = 3,
}

export enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
    BACK = 3,
    FORWARD = 4,
}

export enum ShortcutKeys {
    PENCIL = 'c',
    SPRAY = 'a',
    RECTANGLE = '1',
    ELLIPSE = '2',
    LINE = 'l',
    POLYGON = '3',
    BUCKET = 'b',
    ERASER = 'e',
    RECTANGLE_SELECTION = 'r',
    ELLIPSE_SELECTION = 's',
    EYE_DROPPER = 'i',
    TEXT = 't',
    STAMP = 'd',
    LASSO = 'v',
    NEW_DRAWING = 'o',
    CARROUSEL = 'g',
    SAVE = 's',
    EXPORT_DRAWING = 'e',
    SELECT_ALL = 'a',
    UNDO = 'z',
    REDO = 'Z',
    GRID = 'g',
    PLUS = '+',
    MINUS = '-',
    EQUAL = '=',
    MAGNETISM = 'm',
    DELETE = 'delete',
    COPY = 'c',
    PASTE = 'v',
    CUT = 'x',
}

// Ligne
export enum Quad {
    TOP_RIGHT = 0,
    TOP_LEFT = 1,
    BOTTOM_LEFT = 2,
    BOTTOM_RIGHT = 3,
}

export enum Angles {
    _0 = 0,
    _45 = 1,
    _90 = 2,
    _135 = 3,
    _180 = 4,
    _225 = 5,
    _270 = 6,
    _315 = 7,
}

export enum LimitAngle {
    _0 = 0,
    _22_5 = 22.5,
    _67_5 = 67.5,
    _90 = 90,
}

export enum ShapeStyle {
    BORDER = 0,
    FILL = 1,
    BORDER_FILL = 2,
}

export enum ColorType {
    PRIMARY = 'Primary',
    SECONDARY = 'Secondary',
}

// Étampe
export enum StampChoiceLabels {
    FIRST_CHOICE = 'rire',
    SECOND_CHOICE = "clin d'oeil",
    THIRD_CHOICE = 'dubitatif',
    FOURTH_CHOICE = 'choqué',
    FITH_CHOICE = 'chat',
}

export enum StampIconsPath {
    FIRST_PATH = '../../assets/stamp-icons/laughing.svg',
    SECOND_PATH = '../../assets/stamp-icons/wink.svg',
    THIRD_PATH = '../../assets/stamp-icons/dubious.svg',
    FOURTH_PATH = '../../assets/stamp-icons/shocked.svg',
    FITH_PATH = '../../assets/stamp-icons/cat.svg',
}

// Selection
export enum SelectionMode {
    RECTANGLE = 'rectangle',
    ELLIPSE = 'ellipse',
    LASSO = 'lasso',
}

// Text

export enum KeyValues {
    ARROW_LEFT = 'ArrowLeft',
    ARROW_UP = 'ArrowUp',
    ARROW_RIGHT = 'ArrowRight',
    ARROW_DOWN = 'ArrowDown',
    BACKSPACE = 'Backspace',
    DELETE = 'Delete',
    ESCAPE = 'Escape',
    ALT = 'Alt',
    ENTER = 'Enter',
}
export enum ControlPointId {
    BOTTOM_LEFT = 1,
    LEFT = 2,
    TOP_LEFT = 3,
    TOP = 4,
    TOP_RIGHT = 5,
    RIGHT = 6,
    BOTTOM_RIGHT = 7,
    BOTTOM = 8,
}
