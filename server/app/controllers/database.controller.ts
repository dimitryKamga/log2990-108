import { STORAGE_DIR } from '@app/constants';
import { HttpStatus } from '@app/http-status';
import { DatabaseService } from '@app/services/database.service';
import { TYPES } from '@app/types';
import { MetaData } from '@common/communication/metadata';
import { Request, Response, Router } from 'express';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import * as multer from 'multer';
import * as path from 'path';

@injectable()
export class DatabaseController {
    router: Router;
    upload: multer.Multer;

    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {
        this.upload = this.databaseService.getMulterInstance(STORAGE_DIR);
        this.configureRouter();
        this.databaseService.start();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/metaDatas', (req: Request, res: Response) => {
            this.databaseService
                .getMetaData()
                .then((metaData: MetaData[]) => {
                    res.json(metaData).status(HttpStatus.OK);
                })
                .catch((error: Error) => {
                    res.status(HttpStatus.NOT_FOUND).send(error.message);
                });
        });

        this.router.post('/postDrawing', this.upload.single('image'), (req: Request, res: Response) => {
            req.body.filename = req.file.filename;
            let tags: string[];
            let metaName: string;
            !req.body.tags ? (tags = Array(0)) : (tags = req.body.tags);
            if (!Array.isArray(tags)) tags = [tags];
            req.body.name ? (metaName = req.body.name) : (metaName = 'null');
            const meta: MetaData = { name: metaName, tags, filename: req.body.filename, ext: req.body.ext };
            this.databaseService
                .postDrawing(meta)
                .then(() => {
                    res.sendStatus(HttpStatus.NO_CONTENT);
                })
                .catch((error: Error) => {
                    res.status(HttpStatus.NOT_FOUND).send(error.message);
                });
        });

        this.router.get('/getDrawing/:filename', (req: Request, res: Response) => {
            this.databaseService.localDrawings = fs.readdirSync(this.databaseService.getStorageDir());
            if (this.databaseService.localDrawings.includes(req.params.filename)) {
                res.sendFile(req.params.filename, { root: path.join(__dirname, this.databaseService.getStorageRootPath()) });
                res.status(HttpStatus.OK).contentType('image/png');
            } else {
                const error = new Error('Aucun dessin trouvé');
                res.status(HttpStatus.NOT_FOUND).send(error.message);
            }
        });

        this.router.delete('/deleteDrawing/:filename', (req: Request, res: Response) => {
            this.databaseService
                .deleteDrawing(req.params.filename)
                .then(() => {
                    res.sendStatus(HttpStatus.NO_CONTENT).status(HttpStatus.NO_CONTENT);
                })
                .catch((error: Error) => {
                    res.status(HttpStatus.NOT_FOUND).send(error.message);
                });
        });
    }
}
