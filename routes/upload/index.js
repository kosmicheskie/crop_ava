
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import _ from 'lodash';
import moment from 'moment';
import easyimage from 'easyimage';

export default function(ctx,api2) {
    //const app = ctx.asyncRouter;
    const getFileType = (file) => {
        if (file && file.originalname) {
            const res = file.originalname.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
            if (res && res[1]) {
                return res[1];
            }
        }
        return null;
    };
    // @TODO real file name
    // const getFileName = (file) => {
    //   return file.originalname;
    // };
    const config = ctx.config;
    const createDir = (targetDir) => {
        targetDir.split('/').forEach((dir, index, splits) => {
            const parent = splits.slice(0, index).join('/');
            const dirPath = path.resolve(parent, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
        });
    };

   const fileFilter = (req, file, cb) => {
        if (Array.isArray(config.mimeTypes)) {
            if (config.mimeTypes.indexOf(file.mimetype) === -1) {
                return cb('You are not allowed to upload files with this extension');
            }
        }
        return cb(null, true);
    };
    const storage = multer.diskStorage({
        destination(req, file, cb) {
            let path = config.uploadImagesDir;
            if (!fs.existsSync(path)) {
                createDir(path);
            }
            return cb(null, path);
        },
        filename(req, file, cb) {
            // @ TODO: timestamp check
            let fileName;
            fileName = `${Date.now()}_${_.random(0, 1000)}.${getFileType(file)}`;
            const prefix = 'my_file_' ;
            cb(null, `${prefix}${fileName}`);
        }
    });
    const limits = {};
    const upload = multer({
        storage,
        limits,
        fileFilter,
    });
    const api = ctx;
    const app = ctx.asyncRouter;

    app.post('/avatar/upload', upload.single('file'), async (req) => {
        // console.log(req.file);
        const { file } = req;
        const obj = {};
        if(req.body)
        {
            //console.log('request has a req.body');
            //ЕСЛИ есть параметры, обрезаем картинку
            /*easyimage.info(path.resolve(__dirname,file.path)).then(function(file) {
                console.log(file);
            }, function (err) {
                console.log(err);
            });*/
        }


        return {
            name: file.fieldname,
            url: `${config.url}:${config.port}/${file.path.replace(/\\/g, '/')}`,
            path: `/${file.path.replace(/\\/g, '/')}`,
            mimetype: file.mimetype,
            filename: file.originalname,
        };
    });



    var upload2 = multer({ dest: 'uploads/' });
    api.post('/avatar/upload2',upload2.single('avatar'),(req,res,next)=>{
        console.log('route post /upload initiated....');
        //сохранение на диск
        console.log(req);
 //       const { avatar } = req;
        console.log(req.file);
        if(req.params)
        {
            //если передали параметры обрезки
        }
        else
        {
            //передали просто файл без параметров обрезки...
        }
    });
}