
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import _ from 'lodash';
import moment from 'moment';
//import easyimage from 'easyimage';
import Jimp from 'jimp';

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
        if((req.body)&&(file))
        {
            console.log('request has a req.body');
            //считываем файл...
            //TODO real configurable file path
            let fileDescriptor = await Jimp.read(/*path.resolve(__dirname,file.path)*/file.path);
            console.log(`image height: ${fileDescriptor.bitmap.height}`);//высота
            console.log(`image width: ${fileDescriptor.bitmap.width}`);//ширина
            //если есть параметр сжатия изображения(указанная ширина) и параметры кропа
            if((req.body.selectedWidth)&&(req.body.xPercent)&&(req.body.yPercent)&&(req.body.wPercent)&&(req.body.hPercent))
            {
                const selWidth = Number(req.body.selectedWidth);
                const realWidth = fileDescriptor.bitmap.width;
                const realHeight = fileDescriptor.bitmap.height;
                if(isNaN(selWidth))
                {
                    return{
                        error:`bad parameter:<selWidth>:${req.body.selectedWidth}`
                    }
                }
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
                //вычисляем, какие размеры изображения были при отсылке с клиента
                let selHeight=Math.round(selWidth*realHeight/realWidth);//вычисляем указанную высоту, округляя до целых
                //let selHeight=selWidth*realHeight/realWidth;//вычисляем указанную высоту(точно)
                console.log(`selected dimensions: width: ${selWidth}; height: ${selHeight}`);
                //обрезаем
                //await fileDescriptor.crop()
                console.log('ready to crop...');
                //для процентной обрезки вычисляем кроп-значение отношения реального изображения к уменьшенному
                //поскольку обрезаем реальное а не масштабированное изображение
                const cropFactor = realWidth / selWidth;
                console.log(`crop factor is: ${cropFactor}`);
                //const x_Px = Math.trunc(req.body.xPercent*cropFactor*selWidth/100);//берем целое число, чтобы не выйти за границы при случае, когда выделяется правый верхний край
                const x_Px = Math.trunc(req.body.xPercent*realWidth/100);//берем целое число, чтобы не выйти за границы при случае, когда выделяется правый верхний край
                //console.log(`x_px:${x_Px}`);
                const y_Px = Math.trunc(req.body.yPercent*realHeight/100);
                const w_Px = Math.trunc(req.body.wPercent*realWidth/100);
                const h_Px = Math.trunc(req.body.hPercent*realHeight/100);
                let croppedImage = await fileDescriptor.crop(x_Px,y_Px,w_Px,h_Px);
                let savedImage = croppedImage.write("cropped.jpg");
                return {
                    saved:true
                }
            }


           /* Jimp.read(/!*path.resolve(__dirname,file.path)*!/file.path,(err,fileq)=>{
                if (err) throw err;
                console.log(`image height: ${fileq.bitmap.height}`);//высота
                console.log(`image width: ${fileq.bitmap.width}`);//ширина
                fileq.resize(256, 256)            // resize
                    .quality(60)                 // set JPEG quality
                    .greyscale()                 // set greyscale
                    .write(path.resolve(__dirname,"lena-small-bw.jpg")); // save
            });*/
            //ЕСЛИ есть параметры, обрезаем картинку
            /*easyimage.info(path.resolve(__dirname,file.path)).then(function(file) {
                console.log(file);
            }, function (err) {
                console.log(err);
            });*/


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