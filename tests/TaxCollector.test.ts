import TaxCollector from '../TaxCollector';
import Specialist from '@civ-clone/core-city/Specialist';
import { existsSync, readFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { expect } from 'chai';
import { join } from 'path';
import { typeNameOf } from '@civ-clone/core-data-object/DataObject';

describe('TaxCollector', (): void => {
  it('should extend Specialist directly', (): void => {
    expect(Object.getPrototypeOf(TaxCollector)).to.equal(Specialist);
  });

  it('should be saved by its own name', (): void => {
    expect(typeNameOf(TaxCollector)).to.equal('TaxCollector');
  });

  it('should be a library that registers nothing', (): void => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    );

    ['main', 'module', 'exports', 'bin'].forEach((field: string): void => {
      expect(packageJson).not.to.have.property(field);
    });
    expect(existsSync(join(process.cwd(), 'index.ts'))).to.be.false;
    expect(existsSync(join(process.cwd(), 'index.js'))).to.be.false;

    // The compiled module, as a plugin loader would load it, in a fresh process: the test runner may load the
    //  TypeScript source instead, and a registry that skips classes it holds can't show a second registration.
    const counts = execFileSync(
      process.execPath,
      [
        '-e',
        [
          "const rules = require('@civ-clone/core-rule/RuleRegistry').instance;",
          "const specialists = require('@civ-clone/core-city/AvailableSpecialistRegistry').instance;",
          "require('./TaxCollector.js');",
          'console.log(JSON.stringify([rules.entries().length, specialists.entries().length]));',
        ].join(' '),
      ],
      { cwd: process.cwd(), encoding: 'utf8' }
    );

    expect(JSON.parse(counts)).to.deep.equal([0, 0]);
  });
});
