import config from "$config";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import PluginManager from '../plugins';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/assets/map', express.static('public'));

app.listen(config.apiPort);

PluginManager.trigger("onExpress", app);

export default app;