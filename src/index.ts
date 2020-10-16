import { Archiver } from './archiver';

exports = module.exports = new Archiver();
exports.archiver = exports;

exports.Archiver = Archiver;

const archiver = new Archiver();

export { Archiver, archiver };
