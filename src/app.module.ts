import { Module } from 'nest.js';
import { LocalModule } from './local/local.module'

@Module({
    modules: [ LocalModule ]
})
export class ApplicationModule {}