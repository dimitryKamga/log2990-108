import { expect } from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { testingContainer } from '../../test/test-utils';
import { TYPES } from '../types';
import { DatabaseService } from './database.service';
import { STORAGE_DIR, STORAGE_PATH } from '@app/constants';

describe('Database service', () => {
    let databaseService: DatabaseService;
    let existsSyncStub: sinon.SinonStub;

    beforeEach(async () => {
        existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
        const [container] = await testingContainer();
        databaseService = new DatabaseService();
        databaseService = container.get<DatabaseService>(TYPES.DatabaseService);
    });

    afterEach(async () => {
        existsSyncStub.restore();
    });

    it('should start by creating folder ', async () => {
        try {
            await databaseService.start();
            expect(existsSyncStub.called)
        } catch (error) {}
    });

    it('should send error on creating folder ', async () => {
        existsSyncStub.throws(new Error());
        try {
            await databaseService.start();
        } catch (error) {}
    });

    it('should getStorageRootPath', async () => {
        expect(databaseService.getStorageRootPath() as string).to.equal(STORAGE_PATH);
    });

    it('should getStorageDir', async () => {
        expect(databaseService.getStorageDir() as string).to.equal(STORAGE_DIR);
    });

});
