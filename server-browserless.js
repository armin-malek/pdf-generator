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

if (process.env.NODE_ENV == "PRODUCTION") {
  template = fs.readFileSync("./index-inline.ejs").toString();
}

// تابعی برای راه‌اندازی مرورگر و مدیریت کرش‌های احتمالی
async function launchBrowser() {
  try {
    console.log("Launching browser...");
    const launchArgs = JSON.stringify({
      // args: [`--window-size=1920,1080`, `--user-data-dir=/tmp/chrome/data-dir`],
      args: [`--window-size=1920,1080`],
      headless: true,
      // stealth: true,
      timeout: 30000,
      keepalive: 300000,
    });

    browserPromise = puppeteer.connect({
      // headless: NODE_ENV == "PRODUCTION" ? true : false,
      browserWSEndpoint: `ws://browserless-o0kcc8o480c0wkoowsk4csgc.193.105.234.156.sslip.io?token=u0cxaanZ8df524FMZ0nVQO2mg0irtGmB&launch=${launchArgs}`,
      defaultViewport: { width: 1920, height: 1080 },
      acceptInsecureCerts: true,
      // browserURL:
      //   "http://browserless-o0kcc8o480c0wkoowsk4csgc.193.105.234.156.sslip.io",

      // args: ["--no-sandbox"],
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
  } catch (error) {
    console.log(error);
  }
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

    if (process.env.NODE_ENV != "PRODUCTION") {
      template = (await fs.promises.readFile("./index.ejs")).toString();
    }

    fs.writeFileSync(
      filePath,
      ejs.render(template, { ...req.body, numberToOrdinal: numberToOrdinal })
    );
    // await page.goto(`file://${filePath}`, { waitUntil: "networkidle2" });
    await page.setContent(
      ejs.render(template, { ...req.body, numberToOrdinal: numberToOrdinal })
    );

    await page.emulateMediaType("print");
    const pdfPath = path.join(__dirname, "/tmp/", `${uuidV4()}.pdf`);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      path: pdfPath,
    });

    // Allow this browser to run for 1 minute, then shut down if nothing connects to it.
    // Defaults to the overall timeout set on the instance, which is 5 minutes if not specified.
    // const cdp = await page.createCDPSession();
    // const { error, browserWSEndpoint } = await cdp.send(
    //   "Browserless.reconnect",
    //   {
    //     timeout: 60000,
    //   }
    // );

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
