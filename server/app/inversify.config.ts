import { Container } from 'inversify';
import { Application } from './app';
import { DatabaseController } from './controllers/database.controller';
import { Server } from './server';
import { DatabaseService } from './services/database.service';
import { TYPES } from './types';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);
    container.bind(TYPES.DatabaseController).to(DatabaseController);
    container.bind(TYPES.DatabaseService).to(DatabaseService);
    return container;
};
