// Arquivo: server.js (ES Modules)

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import MusicaController from './controller/musica.controller.js';
import PlaylistController from './controller/playlist.controller.js';
import ArtistaController from './controller/artista.controller.js';


const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// config view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// rota inicial
app.get('/', (req, res) => res.redirect('/amigos'));

// controllers
new MusicaController(app);
new PlaylistController(app);
new ArtistaController(app);


// servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
