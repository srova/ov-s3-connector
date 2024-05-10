/*
 * files.js: Instance methods for working with files from AWS S3
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var base = require('../../core/storage'),
    driver = require('../../index'),
    through = require('through2'),
    storage = driver.storage,
    _ = require('lodash');



function ovGetFinalName(self, container, file) {
    return container + '____' + file;
}


//
// ### function removeFile (container, file, callback)
// #### @container {string} Name of the container to destroy the file in
// #### @file {string} Name of the file to destroy.
// #### @callback {function} Continuation to respond to when complete.
// Destroys the `file` in the specified `container`.
//
exports.removeFile = function(container, file, callback) {
    var self = this;

    if (container instanceof storage.Container) {
        container = container.name;
    }

    if (file instanceof storage.File) {
        file = file.name;
    }

    self.s3.deleteObject({
        Bucket: self.ovConfig.ovBucket,
        Key: ovGetFinalName(self, container, file)
    }, function(err, data) {
        return err
            ? callback(err)
            : callback(null, !!data.DeleteMarker);
    });
};

exports.upload = function(options) {
    var self = this;

    // check for deprecated calling with a callback
    if (typeof arguments[arguments.length - 1] === 'function') {
        self.emit('log::warn', 'storage.upload no longer supports calling with a callback');
    }

    console.log('******');
    console.log(JSON.stringify(options));
    console.log('******');

    var key = null;
    if (_.isObject(options.remote)) {
        key = options.remote instanceof base.File ? options.remote.name : options.remote;
    } else {
        key = options.remote;
    }

    var container = options.container instanceof base.Container ? options.container.name : options.container;

    var s3Options = {
        Bucket: self.ovConfig.ovBucket,
        Key: ovGetFinalName(self, container, key)
    };

    if (options.cacheControl) {
        s3Options.CacheControl = options.cacheControl;
    }

    if (options.contentType) {
        s3Options.ContentType = options.contentType;
    }

    // use ACL until a more obvious permission generalization is available
    if (options.acl) {
        s3Options.ACL = options.acl;
    }

    // add AWS specific options
    if (options.cacheControl) {
        s3Options.CacheControl = options.cacheControl;
    }

    if (options.ServerSideEncryption) {
        s3Options.ServerSideEncryption = options.ServerSideEncryption;
    }

    var proxyStream = through(),
        writableStream = self.s3Stream.upload(s3Options);

    // we need a proxy stream so we can always return a file model
    // via the 'success' event
    writableStream.on('uploaded', function(details) {
        proxyStream.emit('success', new storage.File(self, details));
    });

    writableStream.on('error', function(err) {
        proxyStream.emit('error', err);
    });

    writableStream.on('data', function(chunk) {
        proxyStream.emit('data', chunk);
    });

    proxyStream.pipe(writableStream);

    return proxyStream;
};

exports.download = function(options) {
    var self = this;

    var key = null;
    if (_.isObject(options.remote)) {
        key = options.remote instanceof base.File ? options.remote.name : options.remote;
    } else {
        key = options.remote;
    }

    var container = options.container instanceof base.Container ? options.container.name : options.container;

    return self.s3.getObject({
        Bucket: self.ovConfig.ovBucket,
        Key: ovGetFinalName(self, container, key)
    }).createReadStream();

};

exports.getFile = function(container, file, callback) {
    var containerName = container instanceof base.Container ? container.name : container,
        self = this;

    self.s3.headObject({
        Bucket: self.ovConfig.ovBucket,
        Key: ovGetFinalName(self, containerName, file)
    }, function(err, data) {
        return err
            ? callback(err)
            : callback(null, new storage.File(self, _.extend(data, {
                container: container,
                name: file
            })));
    });
};

exports.getFiles = function(container, options, callback) {

    // not used
    callback('Not IMPLEMENTED yet');
};

