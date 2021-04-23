import { MetaData } from '@common/communication/metadata';
import { expect } from 'chai';
import * as fs from 'fs';
import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as sinon from 'sinon';
import { testingContainer } from '../../test/test-utils';
import { TYPES } from '../types';
import { DatabaseService } from './database.service';

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    let db: Db;
    let client: MongoClient;
    let meta: MetaData;
    let directoryStub: sinon.SinonStub;

    const filenameTest = 'filenameTest';
    const storageTestDir = './test/storage-test/';
    const storageTestPath = '../../test/storage-test/';

    beforeEach(async () => {
        const [container] = await testingContainer();
        directoryStub = sinon.stub(fs, 'unlinkSync').returns();
        databaseService = new DatabaseService();
        databaseService = container.get<DatabaseService>(TYPES.DatabaseService);
        sinon.stub(databaseService, 'getStorageRootPath').returns(storageTestPath);
        sinon.stub(databaseService, 'getStorageDir').returns(storageTestDir);

        mongoServer = new MongoMemoryServer();
        const mongoUri = await mongoServer.getUri();
        client = await MongoClient.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        db = client.db(await mongoServer.getDbName());
        databaseService.collection = db.collection('test');
        meta = { name: 'randomName', tags: ['tag1', 'tag2'], filename: filenameTest, ext: 'image/png' };
        await databaseService.collection.insertOne(meta);
        databaseService.localDrawings = [filenameTest];
    });

    afterEach(async () => {
        if (client) client.close();
        directoryStub.restore();
    });

    it('should connect to the database when start is called', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        expect(databaseService['client']).to.be.undefined;
    });

    it('should not connect to the database when start is called with wrong URL', async () => {
        try {
            await databaseService.start('WRONG URL');
        } catch (error) {
            expect(error.message).to.equal('Database connection error');
        }
    });

    it('should return multer', async () => {
        const metaTest: MetaData = { name: 'meta', tags: ['tag'], filename: 'test', ext: 'image/png' };
        await databaseService.postDrawing(metaTest);
        databaseService.getMulterInstance(storageTestDir);
        expect(databaseService.multerObject).not.to.equal(undefined);
    });

    it('should get all MetaData from DB', async () => {
        try {
            const meta = await databaseService.getMetaData();
            expect(meta.length).to.equal(1);
            expect(meta).to.deep.equals(meta[0]);
        } catch {}
    });

    it('should not find an invalid filename associate to MetaData from DB ', async () => {
        try {
            const invalidMetafilename = { name: 'meta', tags: ['tag'], filename: 'invalidFilename', ext: 'image/png' };
            await databaseService.collection.insertOne(invalidMetafilename);
            const meta = await databaseService.getMetaData();
            expect(meta.length).to.equal(1);
        } catch {}
    });

    it('should not get all MetaData from DB ', async () => {
        await client.close();
        try {
            await databaseService.getMetaData();
        } catch (error) {
            expect(error.message).to.equal('Topology is closed, please connect');
        }
    });

    it('should delete drawing', async () => {
        await databaseService.deleteDrawing(filenameTest);
        const meta = await databaseService.collection.find({}).toArray();
        expect(meta.length).to.equal(0);
    });

    it('should not delete a drawing if get an invalid filename ', async () => {
        try {
            await databaseService.deleteDrawing('invalidFilename');
        } catch {
            const meta = await databaseService.collection.find({}).toArray();
            expect(meta.length).to.equal(1);
        }
    });

    it('should send error message while delete with fs ', async () => {
        directoryStub.throws(new Error());
        try {
            await databaseService.deleteDrawing(filenameTest);
        } catch (error) {
            expect(error.message).to.equal('Impossible de Supprimer');
        }
    });

    it('should add a new drawing', async () => {
        const metaTest: MetaData = { name: 'meta', tags: ['tag'], filename: filenameTest, ext: 'image/png' };
        await databaseService.postDrawing(metaTest);
        const meta = await databaseService.collection.find({}).toArray();
        expect(meta.length).to.equal(2);
        expect(meta.find((x) => x.name === metaTest.name)).to.deep.equals(metaTest);
    });

    it('should not add a new drawing if name is empty', async () => {
        const metaTest: MetaData = { name: '', tags: ['tag'], filename: filenameTest, ext: 'image/png' };
        try {
            await databaseService.postDrawing(metaTest);
        } catch {
            const meta = await databaseService.collection.find({}).toArray();
            expect(directoryStub.called);
            expect(meta.length).to.equal(1);
        }
    });

    it('should not add a new drawing if name is too long', async () => {
        const metaTest: MetaData = { name: 'looonnnnnnnnnngName', tags: ['tag1', 'tag2'], filename: filenameTest, ext: 'image/png' };
        try {
            await databaseService.postDrawing(metaTest);
        } catch {
            const meta = await databaseService.collection.find({}).toArray();
            expect(directoryStub.called);
            expect(meta.length).to.equal(1);
        }
    });

    it('should not add a new drawing if more than 5 tags ', async () => {
        const metaTest: MetaData = { name: 'meta', tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'], filename: filenameTest, ext: 'image/png' };
        try {
            await databaseService.postDrawing(metaTest);
        } catch {
            const meta = await databaseService.collection.find({}).toArray();
            expect(directoryStub.called);
            expect(meta.length).to.equal(1);
        }
    });

    it('should not add a new drawing if at least one tag is too long', async () => {
        const metaTest: MetaData = { name: 'meta', tags: ['looonnnnnnnnnngTag1', 'tag2'], filename: filenameTest, ext: 'image/png' };
        try {
            await databaseService.postDrawing(metaTest);
        } catch {
            const meta = await databaseService.collection.find({}).toArray();
            expect(directoryStub.called);
            expect(meta.length).to.equal(1);
        }
    });

    it('should send error message while adding with fs ', async () => {
        const metaTest: MetaData = { name: '!!', tags: [''], filename: filenameTest, ext: 'image/png' };
        directoryStub.throws(new Error());
        try {
            await databaseService.postDrawing(metaTest);
        } catch (error) {
            expect(error.message).to.equal('Métadonnées non valides');
        }
    });
});
