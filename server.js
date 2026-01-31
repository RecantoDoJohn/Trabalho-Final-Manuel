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


// gerar pdf - função reutilizável
async function gerarPdf(res, view, data, nomeArquivo) {
  try {
    console.log("-> gerarPdf: renderizando view =", view);

    const html = await new Promise((resolve, reject) => {
      res.render(view, data, (err, renderedHtml) => {
        if (err) return reject(err);
        resolve(renderedHtml);
      });
    });

    console.log("-> gerarPdf: HTML gerado, tamanho =", html.length);

    console.log("-> gerarPdf: abrindo chromium...");
    const browser = await chromium.launch(); // se quiser ver UI: { headless: false }
    const page = await browser.newPage();

    page.on("console", msg => console.log("PAGE LOG:", msg.text()));

    await page.setContent(html, { waitUntil: "networkidle" });

    console.log("-> gerarPdf: gerando pdf...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    console.log("-> gerarPdf: pdf gerado, bytes =", pdfBuffer.length);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${nomeArquivo}"`);
    return res.send(pdfBuffer);

  } catch (err) {
    console.error("ERRO dentro do gerarPdf:", err);
    return res.status(500).send("Erro ao gerar PDF (gerarPdf).");
  }
}

// relatorio artistas / amigos
app.get('/relatorioArtistas', async (req, res) => {
  try {
    const amigos = await Amigo.findAll({
      order: [['id', 'ASC']],
      include: [{ model: Jogo, as: 'jogos' }]
    });
    return res.render('amigos/relatorioArtistas', { amigos });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Erro ao gerar relatório.');
  }
});

app.get('/relatorioArtistas.pdf', async (req, res) => {
  try {
    const amigos = await Amigo.findAll({
      order: [['id', 'ASC']],
      include: [{ model: Jogo, as: 'jogos' }]
    });

    return gerarPdf(res, 'amigos/relatorioArtistas', { amigos }, 'relatorio-artistas.pdf');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Erro ao gerar PDF.');
  }
});

// relatorio musicas / jogos
app.get('/relatorioMusicas', async (req, res) => {
  try {
    const jogos = await Jogo.findAll({
      order: [['id', 'ASC']],
      include: [{ model: Amigo, as: 'dono', required: false }]
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

    const jogos = await Jogo.findAll({
      order: [['id', 'ASC']],
      include: [{ model: Amigo, as: 'dono', required: false }]
    });

    return gerarPdf(res, 'jogos/relatorioMusicas', { jogos }, 'relatorio-musicas.pdf');
  } catch (err) {
    console.error("ERRO NA ROTA:", err);
    return res.status(500).send('Erro ao gerar PDF.');
  }
});

// relatorio playlists / emprestimos
app.get('/relatorioPlaylists', async (req, res) => {
  const emprestimos = await Emprestimo.findAll({
    order: [['id', 'ASC']],
    include: [
      { model: Jogo, as: 'jogo' },
      { model: Amigo, as: 'amigo' }
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