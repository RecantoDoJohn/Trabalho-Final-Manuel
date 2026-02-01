import gerarPdf from "../utils/gerarPDF.js";
import { Musica, Artista, Playlist } from '../models/index.js';


export default class MusicaController {
    constructor (app) {
        // relatorio musicas / jogos
        app.get('/relatorioMusicas', async (req, res) => {
          try {
            const jogos = await Musica.findAll({
              order: [['id', 'ASC']],
              include: [{ model: Artista, 
                as: 'artista', 
                required: false}]
            });
        
            return res.render('jogos/relatorioMusicas', { jogos });
          } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao gerar relatório.');
          }
        });
        
        // PDF
        app.get('/relatorioMusicas.pdf', async (req, res) => {
          try {
            console.log("ENTROU NA ROTA /relatorioMusicas.pdf");
        
            const musicas = await Musica.findAll({
              order: [['id', 'ASC']],
              include: [{ model: Artista, as: 'artista', required: false }]
            });
        
            return gerarPdf(res, 'jogos/relatorioMusicas', { musicas }, 'relatorio-musicas.pdf');
          } catch (err) {
            console.error("ERRO NA ROTA:", err);
            return res.status(500).send('Erro ao gerar PDF.');
          }
        });
        
        // crud
        
        app.get('/jogos', async (req, res) => {
         const jogos = await Musica.findAll({
         include: [{
          model: Artista,
          as: 'artista'
        },
        {
          model: Playlist,
          through: { attributes: [] } // inclui playlists sem mostrar tabela de junção
        }
        ],
         order: [['id', 'ASC']]
         })
         res.render('jogos/index', { jogos });
        });
        
        app.get('/jogos/novo', async (req, res) => {
         const amigos = await Playlist.findAll({ order: [['titulo', 'ASC']] });
         const artistas = await Artista.findAll({ order: [['nome', 'ASC']] })
         res.render('jogos/novo', { amigos, artistas : artistas});
        });
        
        app.post('/jogos/novo', async (req, res) => {

         const playlist = await Playlist.findByPk(req.body.playlistId);
         const musica = await Musica.create(req.body);

         musica.addPlaylist(playlist)
         res.redirect('/jogos');
        });
        
        app.get('/jogos/editar/:id', async (req, res) => {
         const jogo = await Musica.findByPk(req.params.id);
         if (!jogo) return res.status(404).send('Jogo não encontrado.');
         const amigos = await Artista.findAll({ order: [['nome', 'ASC']] });
         res.render('jogos/editar', { jogo, amigos });
        });
        
        app.post('/jogos/editar/:id', async (req, res) => {
         const { nome, artistaId } = req.body;
         await Musica.update({ nome, artistaId: Number(amigoId) }, { where: { id: req.params.id }
        });
         res.redirect('/jogos');
        });
        
        app.post('/jogos/excluir/:id', async (req, res) => {
         await Musica.destroy({ where: { id: req.params.id } });
         res.redirect('/jogos');
        });
    }   
}