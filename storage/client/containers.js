/*
 * containers.js: Instance methods for working with containers from AWS S3
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var async = require('async'),
    driver = require('../../index'),
    _ = require('lodash');
    storage = driver.storage;

//
// ### function getContainers (callback)
// #### @callback {function} Continuation to respond to when complete.
// Gets all AWS S3 containers for this instance.
//
exports.getContainers = function(callback) {

    //lista Disctinct dei prefissi dei file


    var self = this;
    self.s3.listObjects({
        Bucket: self.ovConfig.ovBucket
    }, function(err, data) {
        if (err) {
            callback(err);
        } else {
            console.log('****************************************');
            console.log(data);
            console.log('****************************************');
            data = _.map(data.Contents, function(d) {
                var index = d.Key.indexOf('___');
                if (index > 0) {
                    return {
                        Key: d.Key.substring(0, index)
                    }
                } else {
                    return null;
                }
            });
            data = _.filter(data, function(d) { return d; });
            data = _.uniq(data, function(d) { return d.Key; });
            console.log('****************************************');
            console.log(data);
            console.log('****************************************');

            var containers = _.map(data, function(container) {
                return new (storage.Container)(self, container);
            });

            callback(err, containers);

        }
    });


};

//
// ### function getContainer (container, callback)
// #### @container {string|storage.Container} Name of the container to return
// #### @callback {function} Continuation to respond to when complete.
// Responds with the AWS S3 container for the specified
// `container`.
//
exports.getContainer = function(container, callback) {
    //lista dei file filtrati per prefix


    var containerName = container instanceof storage.Container ? container.name : container,
        self = this;

    callback(null, new (storage.Container)(self, {name: containerName}));

    // self.s3.listObjects({
    //     Bucket: self.ovConfig.ovBucket
    // }, function(err, data) {
    //     if (err) {
    //         callback(err);
    //     } else {
    //         console.log(data);
    //         //data = _.filter(data, function(d) { retuen d})
    //         callback(null, new (storage.Container)(self, data));
    //     }
    //
    // });
};

//
// ### function createContainer (options, callback)
// #### @options {string|Container} Container to create in AWS S3.
// #### @callback {function} Continuation to respond to when complete.
// Creates the specified `container` in AWS S3 account associated
// with this instance.
//
exports.createContainer = function(options, callback) {

    //rendere dummy


    var containerName = options instanceof storage.Container ? options.name : options,
        self = this;

    self.s3.listObjects({
        Bucket: self.ovConfig.ovBucket
    }, function(err, data) {
        if (err) {
            self.s3.createBucket({
                Bucket: self.ovConfig.ovBucket,
                CreateBucketConfiguration: {
                    LocationConstraint: self.ovConfig.ovLocationConstraint,
                }
            }, function(err) {
                return err
                    ? callback(err)
                    : callback(null, new (storage.Container)(self, options));
            });
        } else {
            callback(null, new (storage.Container)(self, {name: containerName}));
        }
        // return err
        //     ? callback(err)
        //     : callback(null, new (storage.Container)(self, data));
    });




    //console.log('####################### ' + JSON.stringify(options));


};

//
// ### function destroyContainer (container, callback)
// #### @container {string} Name of the container to destroy
// #### @callback {function} Continuation to respond to when complete.
// Destroys the specified `container` and all files in it.
//
exports.destroyContainer = function(container, callback) {
    // not used
    callback('Not IMPLEMENTED yet');

};
