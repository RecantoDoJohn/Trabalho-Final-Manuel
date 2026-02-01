'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Musica extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.Playlist, {
        through: 'playlist_musica',
        foreignKey: 'musica_id',
        otherKey: 'playlist_id'
      });

      this.belongsTo(models.Artista, {
        foreignKey: 'artista_id'
      });
    }
  }
  Musica.init({
    nome: DataTypes.STRING,
    artistaId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Musica',
  });
  return Musica;
};