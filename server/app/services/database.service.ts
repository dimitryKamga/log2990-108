import { DATABASE_COLLECTION, DATABASE_NAME, DATABASE_URL, MAX_TAGS, REGEX_TAG, REGEX_TITLE, STORAGE_DIR, STORAGE_PATH } from '@app/constants';
import { MetaData } from '@common/communication/metadata';
import * as fs from 'fs';
import { injectable } from 'inversify';
import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import * as multer from 'multer';
import 'reflect-metadata';

@injectable()
export class DatabaseService {
    client: MongoClient;
    collection: Collection<MetaData>;
    multerObject: multer.Multer;
    localDrawings: string[];

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    start(url: string = DATABASE_URL): void {
        !fs.existsSync(this.getStorageDir()) ? fs.mkdirSync(this.getStorageDir()) : (this.localDrawings = fs.readdirSync(this.getStorageDir()));
        MongoClient.connect(url, this.options)
            .then((client: MongoClient) => {
                this.client = client;
                this.collection = client.db(DATABASE_NAME).collection(DATABASE_COLLECTION);
            })
            .catch((error: Error) => {
                console.log((error.message = 'Database connection error'));
            });
    }

    getStorageRootPath(): string {
        return STORAGE_PATH;
    }

    getStorageDir(): string {
        return STORAGE_DIR;
    }

    getMulterInstance(directory: string): multer.Multer {
        this.multerObject = multer({ dest: directory });
        return this.multerObject;
    }

    async postDrawing(metaData: MetaData): Promise<void> {
        if (this.checkMetaData(metaData)) {
            await this.collection.insertOne(metaData);
        } else {
            try {
                fs.unlinkSync(this.getStorageDir() + metaData.filename);
            } catch (error) {
                throw new Error('Métadonnées non valides');
            }
        }
    }

    async getMetaData(): Promise<MetaData[]> {
        this.localDrawings = fs.readdirSync(this.getStorageDir());
        const metadatas: MetaData[] = [];
        return this.collection
            .find({})
            .toArray()
            .then((metaDatas: MetaData[]) => {
                for (const meta of metaDatas) {
                    if (this.localDrawings.includes(meta.filename)) {
                        metadatas.push(meta);
                    }
                }
                return metadatas;
            });
    }

    async deleteDrawing(newFilename: string): Promise<void> {
        this.localDrawings = fs.readdirSync(this.getStorageDir());
        if (this.localDrawings.includes(newFilename)) {
            await this.collection.findOneAndDelete({ filename: newFilename });
            try {
                fs.unlinkSync(this.getStorageDir() + newFilename);
            } catch (error) {
                throw new Error('Impossible de Supprimer');
            }
        } else throw new Error('Dessin Absent');
    }

    checkName(name: string): boolean {
        return REGEX_TITLE.test(name);
    }

    checkTags(tags: string[]): boolean {
        let validTagList = true;
        let tagCtr = 0;
        tags.forEach((tag) => {
            if (!REGEX_TAG.test(tag)) {
                validTagList = false;
            }
            tagCtr++;
        });
        return validTagList && tagCtr <= MAX_TAGS;
    }

    checkMetaData(metaData: MetaData): boolean {
        const containsValidTitle = this.checkName(metaData.name);
        const containsCorrectTags = this.checkTags(metaData.tags);
        return containsValidTitle && containsCorrectTags;
    }
}
