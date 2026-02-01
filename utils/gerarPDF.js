import { chromium } from "playwright";

// gerar pdf - função reutilizável
export default async function gerarPdf(res, view, data, nomeArquivo) {
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