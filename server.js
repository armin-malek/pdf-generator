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

let browserPromise;
let template;

console.log("NODE_ENV", process.env.NODE_ENV);
if (process.env.NODE_ENV == "PRODUCTION") {
  template = fs.readFileSync("./index.ejs").toString();
}

// تابعی برای راه‌اندازی مرورگر و مدیریت کرش‌های احتمالی
async function launchBrowser() {
  console.log("Launching browser...");
  browserPromise = puppeteer.launch({
    headless: NODE_ENV == "PRODUCTION" ? true : false,
    // headless: true,
    executablePath:
      NODE_ENV == "PRODUCTION"
        ? undefined
        : "C:\\Users\\Armin\\AppData\\Local\\Chromium\\Application\\chrome.exe",
    defaultViewport: { width: 640, height: 480 },
    args: [
      "--autoplay-policy=user-gesture-required",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-breakpad",
      "--disable-client-side-phishing-detection",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-dev-shm-usage",
      "--disable-domain-reliability",
      "--disable-extensions",
      "--disable-features=AudioServiceOutOfProcess",
      "--disable-hang-monitor",
      "--disable-ipc-flooding-protection",
      "--disable-notifications",
      "--disable-offer-store-unmasked-wallet-cards",
      "--disable-popup-blocking",
      "--disable-print-preview",
      "--disable-prompt-on-repost",
      "--disable-renderer-backgrounding",
      "--disable-setuid-sandbox",
      "--disable-speech-api",
      "--disable-sync",
      "--hide-scrollbars",
      "--ignore-gpu-blacklist",
      "--metrics-recording-only",
      "--mute-audio",
      "--no-default-browser-check",
      "--no-first-run",
      "--no-pings",
      "--no-sandbox",
      "--no-zygote",
      "--password-store=basic",
      "--use-gl=swiftshader",
      "--use-mock-keychain",
      "--disable-site-isolation-trials",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--disable-translat",
      "--process-per-site",
      "--process-per-tab",
      "--disable-features=site-per-process",
      "--disable-background-timer-throttling",
      "--disable-ipc-flooding-protection",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-logging",
    ],
    slowMo: 0,
  });

  const browser = await browserPromise;
  // const page = await browser.newPage();
  // page.pdf({ format: "A4" });

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

    const JSONValidationTimeStart = Date.now();

    const validationResult = requestBodySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "اطلاعات نامعتبر است",
        details: validationResult.error.errors,
      });
    }
    res.setHeader("JsonValidation-TIME", Date.now() - JSONValidationTimeStart);

    const browser = await browserPromise;

    const page = await browser.newPage();
    const filePath = path.join(__dirname, "out.html");

    if (process.env.NODE_ENV != "PRODUCTION") {
      template = (await fs.promises.readFile("./index.ejs")).toString();
    }

    const renderTimeStart = Date.now();
    await fs.promises.writeFile(
      filePath,
      ejs.render(template, { ...req.body, numberToOrdinal: numberToOrdinal })
    );
    res.setHeader("RENDER-TIME", Date.now() - renderTimeStart);

    const naigationTimeStart = Date.now();

    // await page.goto(`file://${filePath}`, { waitUntil: "networkidle2" });
    await page.goto(`file://${filePath}`, { waitUntil: "load" });
    // await page.setContent(
    //   ejs.render(template, { ...req.body, numberToOrdinal: numberToOrdinal })
    // );
    res.setHeader("NAVIGATION-TIME", Date.now() - naigationTimeStart);

    const PdfPrintTimeStart = Date.now();
    await page.emulateMediaType("print");
    const pdfPath = path.join(__dirname, "/tmp/", `${uuidV4()}.pdf`);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      path: pdfPath,
    });

    res.setHeader("PdfPrint-TIME", Date.now() - PdfPrintTimeStart);

    if ((process.env.NODE_ENV = "PRODUCTION")) {
      await page.close();
    }

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
