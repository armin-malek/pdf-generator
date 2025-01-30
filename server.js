require("dotenv").config();
const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const { v4: uuidV4 } = require("uuid");

const NODE_ENV = process.env.NODE_ENV;

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;

if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}

const template = fs.readFileSync("./template.ejs").toString();

let browserPromise = puppeteer.launch({
  headless: NODE_ENV == "PRODUCTION" ? true : false,
  executablePath:
    NODE_ENV == "PRODUCTION"
      ? undefined
      : "C:\\Users\\Armin\\AppData\\Local\\Chromium\\Application\\chrome.exe",
  defaultViewport: { width: 1920, height: 1080 },
}); // Launch browser once and keep it running

app.use(express.json());
app.post("/download-pdf", async (req, res) => {
  try {
    const time = Date.now();
    const browser = await browserPromise;
    const page = await browser.newPage();
    // await page.goto(`file://${filePath}`, { waitUntil: "load" });
    await page.setContent(ejs.render(template, req.body));

    const pdfPath = path.join(__dirname, "/tmp/", `${uuidV4()}.pdf`);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      path: pdfPath,
    });
    await page.close();

    // res.setHeader("Content-Disposition", 'attachment; filename="download.pdf"');
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("CPU-TIME", Date.now() - time);
    res.status(200).sendFile(pdfPath, (err) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      fs.unlink(pdfPath, (err) => {
        // log any error
        if (err) {
          console.log(err);
        }
      });
    });

    // fs.writeFileSync("./out.pdf", pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
