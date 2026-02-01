import Sequelize from 'sequelize';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// models .cjs
const ArtistaModel = require('./artista.cjs');
const MusicaModel = require('./musica.cjs');
const PlaylistModel = require('./playlist.cjs');

const config = require('../config/config.json');

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

// inicializa models
const Artista = ArtistaModel(sequelize, Sequelize.DataTypes);
const Musica = MusicaModel(sequelize, Sequelize.DataTypes);
const Playlist = PlaylistModel(sequelize, Sequelize.DataTypes);

/* ================= ASSOCIAÇÕES ================= */

Artista.hasMany(Musica, {
  foreignKey: 'artistaId',
  as: 'musicas'
});

Musica.belongsTo(Artista, {
  foreignKey: 'artistaId',
  as: 'artista'
});

Musica.belongsToMany(Playlist, {
  through: 'playlist_musica',
  foreignKey: 'musica_id',
  otherKey: 'playlist_id'
});

Playlist.belongsToMany(Musica, {
  through: 'playlist_musica',
  foreignKey: 'playlist_id',
  otherKey: 'musica_id'
});

/* ================= EXPORTS ================= */

export {
  sequelize,
  Artista,
  Musica,
  Playlist
};
