import Jimp from 'jimp';
import fs from 'fs';
import async from 'async';
import path from 'path';


const config = {
    resultImagePath:path.resolve('static/upload/avatar/cropped')
};

/**
 * создать директорию, если ее нет
 * @param pathToFolder
 */
function tryCreateDir(pathToFolder){
    if(!fs.existsSync(pathToFolder)) {
        pathToFolder.split(path.sep).forEach((dir, index, splits) => {
            const parentDir = splits.slice(0, index).join(path.sep);
            const dirPath = path.resolve(parentDir, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
        });
    }
}


/**
 *
 * @param bitmapPath путь к изначальному файлу
 * @param x =прямоугольник: отступ от левого края
 * @param y =прямоугольник: отступ от верхнего края
 * @param w =прямоугольник: ширина
 * @param h =прямоугольник: высота
 * @param imagePath - путь к результирующему файлу
 * @param imageName - название результирующего файла
 * @returns {Promise.<void>}
 */
module.exports.cropPercentDimToBitmap = async (bitmapPath,x,y,w,h,imagePath,imageName)=>
{
    try
    {
        if((!isNaN(x)) && (!isNaN(y)) && (!isNaN(w)) && (!isNaN(h)))
        {
            let fileDescriptor = await Jimp.read(bitmapPath);
            tryCreateDir(imagePath);
            const fullPathName = path.join(imagePath,imageName);
            const realWidth = fileDescriptor.bitmap.width;
            const realHeight = fileDescriptor.bitmap.height;
            const x_Px = Math.trunc(x * realWidth / 100);//берем целое число, чтобы не выйти за границы при случае, когда выделяется правый верхний край
            const y_Px = Math.trunc(y * realHeight / 100);
            const w_Px = Math.trunc(w * realWidth / 100);
            const h_Px = Math.trunc(h * realHeight / 100);
            //console.log(`selected dimensions: x_offset:${x_Px} px; ${y_Px} px; width: ${w_Px}; height: ${h_Px}`);
            let croppedImage = await fileDescriptor.crop(x_Px, y_Px, w_Px, h_Px);
            let savedImage = await croppedImage.write(fullPathName);
            //console.log(`saved in: ${fullPathName}`);
            return {
                success:1,
                saved: true,
                croppedPath: fullPathName
            }
        }
        else
        {
            return {
                success:0,
                error:"One or several of input parameters are incorrect"
            }
        }

    } catch(e){
        return {
            success: 0,
            error:e
        }
    }
};

/**
 *
 * @param base64String - строка с изображением в формате base64
 * @param pathToFolder - путь к папке
 * @param imageName - название изображения
 * @returns {Promise.<void>}
 */
module.exports.cropBase64ToBitmap = async (base64String,pathToFolder,imageName)=>
{
    function asyncWriteFILEBASE64(filePath,buffer) {
        return new Promise((resolve,reject)=>{
            fs.writeFile(filePath,buffer,(error,result)=>{
                if(error)
                {
                    reject(error);
                }
                else
                {
                    resolve(result);
                }
            });
        });
    }
    try {
        let buf = new Buffer(base64String, 'base64');
        //проверяем директорию на существование....
        tryCreateDir(pathToFolder);
        const fullPathName = `${pathToFolder}${path.sep}${imageName}`;
        await asyncWriteFILEBASE64(fullPathName, buf);
        return {
            success:1,
            saved: true,
            savedPath: fullPathName
        }
    }
    catch(e) {
        return {
            success: 0,
            error:e
        }
    }
};