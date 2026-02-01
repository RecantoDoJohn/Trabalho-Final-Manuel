import { Musica, Artista, Playlist } from '../models/index.js';
import gerarPdf from "../utils/gerarPDF.js";
import { chromium } from 'playwright';

export default class PlaylistController {
    constructor (app) {

        // relatorio playlists / emprestimos
        app.get('/relatorioPlaylists', async (req, res) => {
          const emprestimos = await Playlist.findAll({
            order: [['id', 'ASC']],
            include: [
              { model: Musica, as: 'jogo' },
              { model: Artista, as: 'amigo' }
            ]
          });
        
          return res.render('emprestimos/relatorioPlaylists', { emprestimos });
        });
        
        
        // Relatório Playlists (PDF)
        app.get('/relatorioPlaylists.pdf', async (req, res) => {
          try {
            const browser = await chromium.launch();
            const page = await browser.newPage();
        
            await page.goto('http://localhost:3000/relatorioPlaylists', { waitUntil: 'networkidle' });
        
            const pdfBuffer = await page.pdf({
              format: 'A4',
              printBackground: true
            });
        
            await browser.close();
        
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="relatorio-playlists.pdf"');
            return res.send(pdfBuffer);
        
          } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao gerar PDF.');
          }
        });
        
        // PlayList CRUD
        app.get('/emprestimos', async (req, res) => {
         const emprestimos = await Playlist.findAll({
         include: [{ model: Musica, as: 'jogo' }, { model: Artista, as: 'amigo' }],
         order: [['id', 'ASC']]
         });
         res.render('emprestimos/index', { emprestimos });
        });
        
        app.get('/emprestimos/novo', async (req, res) => {
         const jogos = await Musica.findAll({ order: [['nome', 'ASC']] });
         const amigos = await Artista.findAll({ order: [['nome', 'ASC']] });
         res.render('emprestimos/novo', { jogos, amigos });
        });
        
        app.post('/emprestimos/novo', async (req, res) => {
         const { jogoId, amigoId, dataInicio, dataFim } = req.body;
         await Playlist.create({
         jogoId: Number(jogoId),
         amigoId: Number(amigoId),
         dataInicio,
         dataFim: dataFim || null
         });
         res.redirect('/emprestimos');
        });
        
        app.post('/emprestimos/excluir/:id', async (req, res) => {
         await Playlist.destroy({ where: { id: req.params.id } });
         res.redirect('/emprestimos');
        });
    }
}

