/*
 * index.js: Top-level include for the AWS module.
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

exports.storage = require('./storage');
exports.version = '1.0.0';
exports.Client = require('./client').Client;

exports.createClient = function(options) {
    return require('./storage').createClient(options);
}
