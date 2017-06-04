/**
 * Created by alex.matveev on 06.05.2017.
 */
import express from 'express';
import path from 'path';
import fs from 'fs';
import {AsyncRouter} from 'express-async-router';
import {Router} from 'express';
import cors from 'cors';
//import bodyParser from 'body-parser';
//api
//import API from './api';

//middlewares
import getMiddlewares from './middlewares';
//routes
import getRoutes from './routes';


export default class App
{
    constructor(config)
    {
        this.config = config.server;
        this.server = express();
        this.server.config = config.server;
        //this.server.router = Router();
        this.server.asyncRouter = AsyncRouter();
        this.init();
    }
    init()
    {
        //initiating...
        //1. get all Middlewares
        //getMiddlewares(this.server);
        //2. get API instance
        //this.api = new API(this.config);
        this.api = null;
        //3. get all Routes
        getRoutes(this.server,this.api);
        //merging into one piece...
        this.server.use(this.server.asyncRouter);
        //this.server.use(bodyParser.json({}));
        //new api
    }
    run()
    {
        this.server.use(cors());
        this.server.use('/static',express.static(path.join(__dirname,'/static')));
        //console.log(path.join(__dirname, 'static'));
        //this.server.use(express.static(path.join(__dirname, '/static/upload')));
        //console.log(path.join(__dirname, '/static/upload'));
        this.server.get('/', (req, res) => {
            res.send('Welcome to the Server API! To start uploading your images send a post query to the route:.....');
            //res.sendFile(path.join(__dirname,'static/public/index.html'));
            //next();
        });
        this.server.listen(this.config.port,()=>{
            console.log(`your fascinating APP server is listening on port ${this.config.port}`);
        });
    }
}