const { request } = require('@man-cli-test/utils');


module.exports = function () {
  return request({
    url: '/getTemplates'
  })
}