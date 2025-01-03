const config = require('smart-config').get('local');
const Promise = require('bluebird');
const fs = require('fs');
const httpError = require('http-errors');
const LocalDb = require('../db/')();
const path = require('path');
const resize = require('../resize');


module.exports = async (key, params) => {
  return getFile(key, params);
};

function getFile(key, params) {
  return new Promise((resolve, reject) => {
    LocalDb.getFile(key).then((filename) => {
      if (filename === false) {
        return reject(httpError(404));
      }
      let fullname = path.join(config.files_path, "/", filename);
      fs.open(fullname, 'r', (err) => {
        if (err) {
          return reject(httpError(err.statusCode, err.message));
        }

        let resizeParams = resize.paramsParse(params.query);
        resizeParams = resize.paramsValidate(resizeParams);

        resize.process(filename, fullname, resizeParams)
          .then((data) => {
            return resolve(data);
          })
          .catch((err) => {
            return reject(err);
          });
      });
    }).catch((err) => {
      return reject(httpError(err.statusCode, err.message));
    });
  });
}
