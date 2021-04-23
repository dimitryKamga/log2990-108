import { config } from 'dotenv';
config();

export const MAX_TAGS = 6;

// Regex
// Caracteres alphaNumériques permis min 3 a 15 caracteres sans espace
export const REGEX_TITLE: RegExp = /^[A-Za-z0-9-]{3,15}$/;
// Caracteres alphaNumériques permis min 3 a 10 caracteres sans espace
export const REGEX_TAG: RegExp = /^[A-Za-z0-9]{3,10}$/;

// Constantes de base de données
export const DATABASE_URL: string = process.env.DATABASE_URL as string;
export const DATABASE_NAME: string = process.env.DATABASE_NAME as string;
export const DATABASE_COLLECTION: string = process.env.DATABASE_COLLECTION as string;

// Chemins de fichiers
export const STORAGE_DIR: string = process.env.STORAGE_DIR ? (process.env.STORAGE_DIR as string) : '';
export const STORAGE_PATH: string = process.env.STORAGE_PATH ? (process.env.STORAGE_PATH as string) : '';
