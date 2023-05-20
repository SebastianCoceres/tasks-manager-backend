const PDFDocument = require("pdfkit");
const Moment = require("moment");
const htmlToText = require("html-to-text");

const generarHTML = ({ tasks, start, end, boardName }) => {
  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <title> Programación - ${boardName}</title>
      </head>
      <body>
        <h1>${boardName}</h1>
        <p>Fecha de inicio: ${Moment(start)
          .locale("es")
          .format("DD/MM/YYYY")
          .toString()}</p>
        <p>Fecha de fin: ${Moment(end)
          .locale("es")
          .format("DD/MM/YYYY")
          .toString()}</p>
        <ul>
          ${tasks
            ?.map(
              (task) => `<li>
            <h2>${task.title}</h2>
            <div>${task.content}</div>
          </li>`
            )
            .join("")}
        </ul>
      </body>
    </html>
  `;
};

// Definimos una función para generar el PDF en memoria
async function generarPDF(html) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(14);
    doc.moveDown();
    const text = htmlToText.convert(html, {
      wordwrap: 130,
    });

    doc.text(text);
    doc.end();
  });
}

module.exports = { generarHTML, generarPDF };
