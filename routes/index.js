//TODO здесь назначаются и привязываются ВСЕ роуты!
/**
 * Для вызывающего кода:
 * Сначала подключаем все мидлвары, затем - все роуты
 */
import fs from 'fs';
import path from 'path';
//api connecting
export default function getRoutes(ctx,api){
    const routesRaw = fs.readdirSync('./routes').map((item)=>{
        return path.resolve('./routes',item);
    });
    let dirArray=[];
    for(let key in routesRaw)
    {
        if(fs.statSync(routesRaw[key]).isDirectory())
        {
            dirArray.push(routesRaw[key]);
        }
    }
    //получаем роуты для всего приложения
    dirArray.forEach((item)=>{
        let row = require(item).default(ctx,api);
    });
};
