import config from "$config";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import PluginManager from '../plugins';
import { publicPath } from "../consts";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/assets/map', express.static(publicPath));

app.listen(config.apiPort);

PluginManager.trigger("onExpress", null, app);

export default app;