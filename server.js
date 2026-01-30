// Arquivo: server.js (completo)
const { chromium } = require('playwright');
const express = require('express');
const path = require('path');
const { Amigo, Jogo, Emprestimo } = require('./models');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => res.redirect('/amigos'));

// relatorio de amigos em pdf

app.get('/relatorioAmigos', async (req, res) => {
  try {
    const amigos = await Amigo.findAll({
      order: [['id', 'ASC']],
      include: [{ model: Jogo, as: 'jogos' }]
    });
    res.render('amigos/relatorioAmigos', { amigos });
    res.status(200).send('Rota de relatório de amigos funcionando.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao gerar relatório.');
  }
});

// gerar PDF
app.get('/relatorioAmigos.pdf', async (req, res) => {
  try {
    const amigos = await Amigo.findAll({
      order: [['id', 'ASC']],
      include: [{ model: Jogo, as: 'jogos' }]
    });

    // Renderiza EJS -> HTML (sem enviar pro navegador ainda)
    const html = await new Promise((resolve, reject) => {
      res.render('amigos/relatorioAmigos', { amigos }, (err, renderedHtml) => {
        if (err) return reject(err);
        resolve(renderedHtml);
      });
    });

    // HTML -> PDF
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    // Resposta como PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="relatorio-amigos.pdf"');
    return res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    return res.status(500).send('Erro ao gerar PDF.');
  }
});

// AMIGOS
app.get('/amigos', async (req, res) => {
 const amigos = await Amigo.findAll({ order: [['id', 'ASC']] });
 res.render('amigos/index', { amigos });
});

app.get('/amigos/novo', (req, res) => res.render('amigos/novo'));
app.post('/amigos/novo', async (req, res) => {
 const { nome, email } = req.body;
 await Amigo.create({ nome, email });
 res.redirect('/amigos');
});

app.get('/amigos/editar/:id', async (req, res) => {
 const amigo = await Amigo.findByPk(req.params.id);
 if (!amigo) return res.status(404).send('Amigo não encontrado.');
 res.render('amigos/editar', { amigo });
});

app.post('/amigos/editar/:id', async (req, res) => {
 const { nome, email } = req.body;
 await Amigo.update({ nome, email }, { where: { id: req.params.id } });
 res.redirect('/amigos');
});

app.post('/amigos/excluir/:id', async (req, res) => {
 await Amigo.destroy({ where: { id: req.params.id } });
 res.redirect('/amigos');
});

// JOGOS
app.get('/jogos', async (req, res) => {
 const jogos = await Jogo.findAll({
 include: [{ model: Amigo, as: 'dono' }],
 order: [['id', 'ASC']]
 })
 res.render('jogos/index', { jogos });
});

app.get('/jogos/novo', async (req, res) => {
 const amigos = await Amigo.findAll({ order: [['nome', 'ASC']] });
 res.render('jogos/novo', { amigos });
});

app.post('/jogos/novo', async (req, res) => {
 const { titulo, plataforma, amigoId } = req.body;
 await Jogo.create({ titulo, plataforma, amigoId: Number(amigoId) });
 res.redirect('/jogos');
});

app.get('/jogos/editar/:id', async (req, res) => {
 const jogo = await Jogo.findByPk(req.params.id);
 if (!jogo) return res.status(404).send('Jogo não encontrado.');
 const amigos = await Amigo.findAll({ order: [['nome', 'ASC']] });
 res.render('jogos/editar', { jogo, amigos });
});

app.post('/jogos/editar/:id', async (req, res) => {
 const { titulo, plataforma, amigoId } = req.body;
 await Jogo.update({ titulo, plataforma, amigoId: Number(amigoId) }, { where: { id: req.params.id }
});
 res.redirect('/jogos');
});

app.post('/jogos/excluir/:id', async (req, res) => {
 await Jogo.destroy({ where: { id: req.params.id } });
 res.redirect('/jogos');
});

// EMPRESTIMOS
app.get('/emprestimos', async (req, res) => {
 const emprestimos = await Emprestimo.findAll({
 include: [{ model: Jogo, as: 'jogo' }, { model: Amigo, as: 'amigo' }],
 order: [['id', 'ASC']]
 });
 res.render('emprestimos/index', { emprestimos });
});

app.get('/emprestimos/novo', async (req, res) => {
 const jogos = await Jogo.findAll({ order: [['titulo', 'ASC']] });
 const amigos = await Amigo.findAll({ order: [['nome', 'ASC']] });
 res.render('emprestimos/novo', { jogos, amigos });
});

app.post('/emprestimos/novo', async (req, res) => {
 const { jogoId, amigoId, dataInicio, dataFim } = req.body;
 await Emprestimo.create({
 jogoId: Number(jogoId),
 amigoId: Number(amigoId),
 dataInicio,
 dataFim: dataFim || null
 });
 res.redirect('/emprestimos');
});

app.post('/emprestimos/excluir/:id', async (req, res) => {
 await Emprestimo.destroy({ where: { id: req.params.id } });
 res.redirect('/emprestimos');
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));