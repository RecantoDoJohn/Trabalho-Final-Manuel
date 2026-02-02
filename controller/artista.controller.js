import { Artista, Musica } from '../models/index.js';
import gerarPdf from '../utils/gerarPDF.js';

export default class ArtistaController {
    constructor (app) {

        // relatorio artistas / amigos
        app.get('/relatorioArtistas', async (req, res) => {
          try {
            const amigos = await Artista.findAll({
              order: [['id', 'ASC']],
              include: [{model:Musica, as:"musicas", required: false }]
            });
            return res.render('amigos/relatorioArtistas', { amigos });
          } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao gerar relatório.');
          }
        });
        
        app.get('/relatorioArtistas.pdf', async (req, res) => {
          try {
            const artistas = await Artista.findAll({
              order: [['id', 'ASC']],
              include: [{model:Musica, as:"musicas"}]
            });
            console.log(artistas)
            return gerarPdf(res, 'amigos/relatorioArtistas', { artistas }, 'relatorio-artistas.pdf');
          } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao gerar PDF.');
          }
        });
        
        // AMIGOS
        app.get('/amigos', async (req, res) => {
         const amigos = await Artista.findAll({ order: [['id', 'ASC']] });
         res.render('amigos/index', { amigos });
        });
        
        app.get('/amigos/novo', (req, res) => res.render('amigos/novo'));
        
        app.post('/amigos/novo', async (req, res) => {
         const { nome, email } = req.body;
         await Artista.create({ nome, email });
         res.redirect('/amigos');
        });
        
        app.get('/amigos/editar/:id', async (req, res) => {
         const amigo = await Artista.findByPk(req.params.id);
         if (!amigo) return res.status(404).send('Artista não encontrado.');
         res.render('amigos/editar', { amigo });
        });
        
        app.post('/amigos/editar/:id', async (req, res) => {
         const { nome } = req.body;
         await Artista.update({ nome }, { where: { id: req.params.id } });
         res.redirect('/amigos');
        });
        
        app.post('/amigos/excluir/:id', async (req, res) => {
         await Artista.destroy({ where: { id: req.params.id } });
         res.redirect('/amigos');
        });
    }
}