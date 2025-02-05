require("dotenv").config();
const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const { v4: uuidV4 } = require("uuid");
const { requestBodySchema } = require("./schema");
const { numberToOrdinal } = require("./lib");

const NODE_ENV = process.env.NODE_ENV;

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;

if (!fs.existsSync("./tmp")) {
  fs.mkdirSync("./tmp");
}

const template = fs.readFileSync("./index.ejs").toString();

let browserPromise;

// تابعی برای راه‌اندازی مرورگر و مدیریت کرش‌های احتمالی
async function launchBrowser() {
  console.log("Launching browser...");
  browserPromise = puppeteer.launch({
    headless: NODE_ENV == "PRODUCTION" ? true : false,
    executablePath:
      NODE_ENV == "PRODUCTION"
        ? undefined
        : "C:\\Users\\Armin\\AppData\\Local\\Chromium\\Application\\chrome.exe",
    defaultViewport: { width: 1920, height: 1080 },
    args: ["--no-sandbox"],
  });

  const browser = await browserPromise;
  const page = await browser.newPage();
  page.pdf({ format: "A4" });

  // اگر مرورگر به هر دلیلی کرش کرد، مجدداً راه‌اندازی شود
  browser.on("disconnected", () => {
    console.error("Browser crashed! Restarting...");
    launchBrowser();
  });

  return browser;
}

// راه‌اندازی اولیه مرورگر
launchBrowser();
app.use(express.json());
app.post("/download-pdf", async (req, res) => {
  try {
    const time = Date.now();

    const validationResult = requestBodySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "اطلاعات نامعتبر است",
        details: validationResult.error.errors,
      });
    }

    const browser = await browserPromise;

    const page = await browser.newPage();
    const filePath = path.join(__dirname, "out.html");
    fs.writeFileSync(
      filePath,
      ejs.render(template, { ...req.body, numberToOrdinal: numberToOrdinal })
    );
    await page.goto(`file://${filePath}`, { waitUntil: "networkidle2" });
    // await page.setContent(
    //   ejs.render(template, { ...req.body, numberToOrdinal: numberToOrdinal })
    // );

    await page.emulateMediaType("print");
    const pdfPath = path.join(__dirname, "/tmp/", `${uuidV4()}.pdf`);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      path: pdfPath,
    });

    //ENABLE IT IT PRODUCTION
    // await page.close();

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
