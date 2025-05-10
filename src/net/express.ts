import config from "$config";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import PluginManager from '../plugins/manager';
import { publicPath } from "../consts";
import { success } from "../utils";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/assets/map', express.static(publicPath));

app.listen(config.apiPort, () => success("Api server online"));

PluginManager.trigger("onExpress", null, app);

export default app;