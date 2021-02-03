import { Archiver } from './archiver';

exports = module.exports = new Archiver();
exports.archiver = exports;

exports.Archiver = Archiver;

const archiver = new Archiver();

export { Task, Stage } from './types';
export { Archiver, archiver };
