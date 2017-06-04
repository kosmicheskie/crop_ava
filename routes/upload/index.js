
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import _ from 'lodash';
import moment from 'moment';
//import easyimage from 'easyimage';
import Jimp from 'jimp';
import pify from 'pify';
import Cropper from '../../api/image_cropper/index';

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
    const getFileName = (file) => {
       return file.originalname;
    };
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
            //fileName = `${Date.now()}_${_.random(0, 1000)}_${getFileName(file)}_.${getFileType(file)}`;
            fileName = getFileName(file);
            const prefix = `${Date.now()}_${_.random(0,1000)}` ;
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

    const CROPPER = new Cropper();
    CROPPER.init();
    app.post('/avatar/upload', upload.single('file'), async (req) => {
        const { file } = req;
        const obj = {};
        if((req.body)&&(file))
        {
            if((req.body.xPercent)&&(req.body.yPercent)&&(req.body.wPercent)&&(req.body.hPercent))
            {
                req.body.xPercent = Number(req.body.xPercent);
                if(isNaN(req.body.xPercent))
                {
                    return{
                        error:`bad parameter:<xPercent>:${req.body.xPercent}`
                    }
                }
                req.body.yPercent = Number(req.body.yPercent);
                if(isNaN(req.body.yPercent))
                {
                    return{
                        error:`bad parameter:<yPercent>:${req.body.yPercent}`
                    }
                }
                req.body.wPercent = Number(req.body.wPercent);
                if(isNaN(req.body.wPercent))
                {
                    return{
                        error:`bad parameter:<wPercent>:${req.body.wPercent}`
                    }
                }
                req.body.hPercent = Number(req.body.hPercent);
                if(isNaN(req.body.hPercent))
                {
                    return{
                        error:`bad parameter:<hPercent>:${req.body.hPercent}`
                    }
                }


                const result = await CROPPER.cropPercentDimToBitmap(file.path,req.body.xPercent,req.body.yPercent,req.body.wPercent,req.body.hPercent);
                if(result.saved==true)
                {
                    return {
                        name: file.fieldname,
                        url: `${config.url}:${config.port}/${file.path.replace(/\\/g, '/')}`,
                        path: `/${file.path.replace(/\\/g, '/')}`,
                        mimetype: file.mimetype,
                        filename: file.originalname,
                        cropped: result.cropped
                    };
                }
                else
                {
                    return 'БУЭЭЭЭЭЭ!!!!';
                }

            }




        }
        else {
            console.log('request does not have a req.body!!!');
        }



        return {
            name: file.fieldname,
            url: `${config.url}:${config.port}/${file.path.replace(/\\/g, '/')}`,
            path: `/${file.path.replace(/\\/g, '/')}`,
            mimetype: file.mimetype,
            filename: file.originalname,
        };
    });





    /*const upload64 = pify(multer().single('avatar'));
    api.post('/avatar/upload/base64',upload64(async (req,res,next)=>{
        try {
            console.log('route post /upload initiated....');
            if (req.body.avatar) {
                let result = await CROPPER.cropBase64ToBitmap(req.body.avatar, config.uploadImagesDir);
                console.log(result);
                //res.end(result);
                return {result: result};

            }
            else {
                return {result: new Error('error writing file!!!')};
            }
        }
        catch (e)
        {
            return e;
        }
    }));*/
    //const upload64 = pify(multer().single('avatar'));
    const upload64 = multer({storage:multer.memoryStorage({})});

    app.post('/avatar/upload/base64',upload.single('avatar'),async (req,res,next)=>{

            console.log('route post /upload initiated....');
            if (req.body.avatar) {
                let result = await CROPPER.cropBase64ToBitmap(req.body.avatar, config.uploadImagesDir);
                console.log(result);
                //res.end(result);
                return {result: result};

            }
            else {
                return {result: new Error('error writing file!!!')};
            }


    });


    api.post('/avatar/upload/base641',upload64.single('avatar'),(req,res,next)=> {
        console.log('route post /upload initiated....');
        if (req.body.avatar) {
            console.log('has body avatar!!!');
            CROPPER.cropBase64ToBitmap2(req.body.avatar, config.uploadImagesDir,(err)=>{
                if(err)
                    return next('bad result of saving file...');
                else
                    res.send('saved');
            });


        }
        else {
            res.end('error');
        }
    });

}