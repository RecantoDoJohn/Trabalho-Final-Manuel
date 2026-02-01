import Sequelize from 'sequelize';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const ArtistaModel = require('./artista.cjs');
const MusicaModel = require('./musica.cjs');
const PlaylistModel = require('./playlist.cjs');

// config
const config = require('../config/config.json');
const env = process.env.NODE_ENV || 'development';

const sequelize = new Sequelize(config[env]);

// inicializa models
const Artista = ArtistaModel(sequelize, Sequelize.DataTypes);
const Musica = MusicaModel(sequelize, Sequelize.DataTypes);
const Playlist = PlaylistModel(sequelize, Sequelize.DataTypes);

// exporta para o resto do app
export {
  sequelize,
  Artista,
  Musica,
  Playlist
};
