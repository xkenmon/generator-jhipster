const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const shelljs = require('shelljs');
const expect = require('chai').expect;
const expectedFiles = require('./utils/expected-files');

describe('JHipster upgrade generator', function() {
    this.timeout(200000);
    describe('default application', () => {
        before(done => {
            let workingDirectory;
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .withOptions({ skipInstall: true, skipChecks: true, 'from-cli': true })
                .inTmpDir(dir => {
                    /* eslint-disable-next-line no-console */
                    console.log(`Generating JHipster application in directory: ${dir}`);
                    // Save directory, in order to run the upgrade generator in the same directory
                    workingDirectory = dir;
                })
                .withPrompts({
                    baseName: 'jhipster',
                    clientFramework: 'angularX',
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    cacheProvider: 'ehcache',
                    enableHibernateCache: true,
                    databaseType: 'sql',
                    devDatabaseType: 'h2Memory',
                    prodDatabaseType: 'mysql',
                    useSass: false,
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    buildTool: 'maven',
                    rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                    skipClient: false,
                    skipUserManagement: false,
                    serverSideOptions: []
                })
                .on('end', () => {
                    helpers
                        .run(path.join(__dirname, '../generators/upgrade'))
                        .withOptions({ 'from-cli': true, force: true, silent: true })
                        .inTmpDir(() => {
                            /* eslint-disable-next-line no-console */
                            console.log('Upgrading the JHipster application');
                            process.chdir(workingDirectory);
                        })
                        .on('end', done);
                });
        });

        it('creates expected files for default configuration', () => {
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.maven);
            assert.file(expectedFiles.client);
        });

        it('generates expected number of commits', () => {
            const commitsCount = shelljs.exec('git rev-list --count HEAD', { silent: false }).stdout.replace('\n', '');
            // Expecting 5 commits in history (because we used `force` option):
            //   - master: initial commit
            //   - jhipster_upgrade; initial generation
            //   - master: block-merge commit of jhipster_upgrade
            //   - jhipster_upgrade: new generation in jhipster_upgrade
            //   - master: merge commit of jhipster_upgrade
            expect(commitsCount).to.equal('5');
        });
    });
});
