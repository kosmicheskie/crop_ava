import path from 'path';
module.exports = {
  server:{
      port:3000,
      url:`localhost`,
      uploadImagesDir:'./static/upload/avatar/originals',
      uploadCroppedDir:'./static/upload/avatar/cropped',
      uploadBase64Dir:'./static/upload/avatar/base64',
      mimeTypes:['image/jpeg','image/png']
  }
};