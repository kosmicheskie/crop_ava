import fs from 'fs';
import path from 'path';


export default function getApi(ctx)
{
    const routesRaw = fs.readdirSync('./api').map((item)=>{
        return path.resolve('./api',item);
    });
    let dirArray=[];
    for(let key in routesRaw)
    {
        if(fs.statSync(routesRaw[key]).isDirectory())
        {
            dirArray.push(routesRaw[key]);
        }
    }
    dirArray.forEach((item)=>{
        let row = require(item).default(ctx);
    });
}
