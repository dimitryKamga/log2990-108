import { Application } from '@app/app';
import { HttpStatus } from '@app/http-status';
import { DatabaseService } from '@app/services/database.service';
import { TYPES } from '@app/types';
import { MetaData } from '@common/communication/metadata';
import { expect } from 'chai';
import * as fs from 'fs';
import * as multer from 'multer';
import * as supertest from 'supertest';
import { Stubbed, testingContainer } from '../../test/test-utils';

// tslint:disable:no-any | raison pour tester les reponses

describe('DatabaseController', () => {
    let databaseService: Stubbed<DatabaseService>;
    let app: Express.Application;
    let meta: MetaData;
    const storageTestDir = './test/storage-test/';
    const storageTestPath = '../../test/storage-test/';

    beforeEach(async () => {
        meta = { name: 'metaName', tags: ['tag1', 'tag2'], filename: 'filenameTest', ext: 'image/png' };
        const multerTest: multer.Multer = multer({ dest: storageTestDir });
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DatabaseService).toConstantValue({
            getMetaData: sandbox.stub().resolves([meta]),
            deleteDrawing: sandbox.stub().resolves(),
            postDrawing: sandbox.stub().resolves(),
            start: sandbox.stub().resolves(),
            getStorageRootPath: sandbox.stub().returns(storageTestPath),
            getStorageDir: sandbox.stub().returns(storageTestDir),
            getMulterInstance: sandbox.stub().returns(multerTest),
        });
        databaseService = container.get(TYPES.DatabaseService);
        app = container.get<Application>(TYPES.Application).app;
    });

    afterEach(async () => {
        const localDrawings: string[] = fs.readdirSync(storageTestDir);
        for (const filename of localDrawings) {
            if (filename !== 'filenameTest') fs.unlinkSync(storageTestDir + filename);
        }
    });

    it('should return all metadatas on a valid request', async () => {
        return supertest(app)
            .get('/api/database/metaDatas')
            .expect(HttpStatus.OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal([meta]);
            });
    });

    it('should return an error while service fail to get metadatas', async () => {
        databaseService.getMetaData.rejects(new Error('Metadonnés absents'));
        return supertest(app)
            .get('/api/database/metaDatas')
            .expect(HttpStatus.NOT_FOUND)
            .then((response: any) => {
                expect(response.text).to.equal('Metadonnés absents');
            });
    });

    it('should post drawing correctly on a valid request', async () => {
        return supertest(app)
            .post('/api/database/postDrawing')
            .attach('image', storageTestDir + meta.filename)
            .field({ name: meta.name, tags: meta.tags, ext: meta.ext })
            .expect(HttpStatus.NO_CONTENT);
    });

    it('should post drawing correctly with a null name on a valid request', async () => {
        return supertest(app)
            .post('/api/database/postDrawing')
            .attach('image', storageTestDir + meta.filename)
            .field({ name: '', tags: meta.tags, ext: meta.ext })
            .expect(HttpStatus.NO_CONTENT);
    });

    it('should post drawing correctly on a valid request with no tag', async () => {
        meta.tags = [];
        return supertest(app)
            .post('/api/database/postDrawing')
            .attach('image', storageTestDir + meta.filename)
            .field({ name: meta.name, tags: meta.tags, ext: meta.ext })
            .expect(HttpStatus.NO_CONTENT);
    });

    it('should post drawing correctly on a valid request with one tag', async () => {
        meta.tags = ['tags'];
        return supertest(app)
            .post('/api/database/postDrawing')
            .attach('image', storageTestDir + meta.filename)
            .field({ name: meta.name, tags: meta.tags, ext: meta.ext })
            .expect(HttpStatus.NO_CONTENT);
    });

    it('should return an error while service fail to post', async () => {
        databaseService.postDrawing.rejects(new Error('Metadonnés absents'));
        return supertest(app)
            .post('/api/database/postDrawing')
            .attach('image', storageTestDir + meta.filename)
            .field({ name: meta.name, tags: meta.tags, ext: meta.ext })
            .expect(HttpStatus.NOT_FOUND)
            .then((response: any) => {
                expect(response.text).to.equal('Metadonnés absents');
            });
    });

    it('should get drawing correctly on a valid request', async () => {
        return supertest(app)
            .get('/api/database/getDrawing/filenameTest')
            .expect(HttpStatus.OK)
            .then((response: any) => {
                const size = fs.statSync(storageTestDir + meta.filename).size.toString();
                expect(response.header['content-length']).to.equal(size);
            });
    });

    it('should return an error while trying to get drawing with fs ', async () => {
        return supertest(app)
            .get('/api/database/getDrawing/Badfilename')
            .expect(HttpStatus.NOT_FOUND)
            .then((response: any) => {
                expect(response.text).to.equal('Aucun dessin trouvé');
            });
    });

    it('should delete correctly on a valid request', async () => {
        return supertest(app).delete('/api/database/deleteDrawing/filename').send({ filename: meta.filename }).expect(HttpStatus.NO_CONTENT);
    });

    it('should return an error while service fail to delete ', async () => {
        databaseService.deleteDrawing.rejects(new Error('Dessin Absent'));
        return supertest(app)
            .delete('/api/database/deleteDrawing/filename')
            .send({ filename: meta.filename })
            .expect(HttpStatus.NOT_FOUND)
            .then((response: any) => {
                expect(response.text).to.equal('Dessin Absent');
            });
    });
});
