
const puppeteer = require('puppeteer');
const TelegramBot = require("node-telegram-bot-api");

async function delay(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

async function scrapeDataBnb() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("https://ape.bond/bonds");

    await delay(15000);

    const products = [];

    for (let i = 0; i < 3; i++) {
        await page.$$eval('.css-m8vcyk', (divs, i) => {
            if (divs[i]) {
                divs[i].click();
            }
        }, i);


        await delay(5000);

        const url = await page.url();

        const html = await page.content();
        const cheerio = require('cheerio');
        const $ = cheerio.load(html);

        const product = {};
        $('.css-11u4bai').each((index, element) => {
            if (index === i) {
                product.title = $(element).text().trim();
            }
        });

        $('.css-1hsh4tf').each((index, element) => {
            if (index === i) {
                product.description = $(element).text().trim();
            }
        });

      
        const bondAddressRegex = /bondAddress=([^&]*)/;
        const match = url.match(bondAddressRegex);
        if (match && match[1]) {
            product.bondAddress = match[1];
        }

        products.push(product);

        await page.click('body');
        await delay(5000);
    }

    await browser.close();

    return products;
}

async function scrapeDataPolygon() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://ape.bond/bonds');

    await page.waitForSelector('.css-n1829x');
    await page.click('.css-n1829x');

    await delay(10000);

    await page.click('.css-1bmfsy4');
    await delay(10000);

    await page.waitForSelector('.css-11u4bai');

    const data1 = await page.evaluate(() => {
        const spans1 = Array.from(document.querySelectorAll('.css-11u4bai'));
        return spans1.map(span => span.innerText);
    });

    const data2 = await page.evaluate(() => {
        const spans2 = Array.from(document.querySelectorAll('.css-1hsh4tf'));
        return spans2.map(span => span.innerText);
    });

    const products = [];
    data1.forEach((item, index) => {
        products.push({ title: item, description: data2[index] });
    });

    await browser.close();

    return products;
}

async function scrapeDataEtherum() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://ape.bond/bonds');

    await page.waitForSelector('.css-n1829x');
    await page.click('.css-n1829x');

    await delay(10000);

    const elements = await page.$$('.css-1bmfsy4');
    await elements[1].click();

    await delay(10000);

    await page.waitForSelector('.css-11u4bai');

    const data1 = await page.evaluate(() => {
        const spans1 = Array.from(document.querySelectorAll('.css-11u4bai'));
        return spans1.map(span => span.innerText);
    });

    const data2 = await page.evaluate(() => {
        const spans2 = Array.from(document.querySelectorAll('.css-1hsh4tf'));
        return spans2.map(span => span.innerText);
    });

    const products = [];
    data1.forEach((item, index) => {
        products.push({ title: item, description: data2[index] });
    });

    await browser.close();

    return products;
}


const token = "6893144673:AAHZ3BhWEgri-aQ_2FXL3d21VUoFB7n8MWE";
const bot = new TelegramBot(token, { polling: true });


async function sendNotifications() {
    try {
        const productsBnb = await scrapeDataBnb();
        const productsPolygon = await scrapeDataPolygon();
        const productsEth = await scrapeDataEtherum();

        const allProducts = [...productsBnb, ...productsPolygon, ...productsEth];

        allProducts.sort((a, b) => parseFloat(b.description) - parseFloat(a.description));

        let message = "Discount Bond :\n\n";
        allProducts.forEach(product => {
            let prefix = "";
            let url = "";
            if (productsBnb.includes(product)) {
                prefix = "BNB ";
                url = `https://ape.bond/bonds?bondAddress=${product.bondAddress}&bondChain=56`;
            } else if (productsPolygon.includes(product)) {
                prefix = "Polygon ";
                url = `https://ape.bond/bonds?bondAddress=${product.bondAddress}&bondChain=137`;
            } else if (productsEth.includes(product)) {
                prefix = "ETH ";
                url = `https://ape.bond/bonds?bondAddress=${product.bondAddress}&bondChain=1`;
            }
            message += `${prefix} ${product.title} ${product.description} [Buy](${url})\n\n`;
        });

        const channel = "-1002110853840";
        bot.sendMessage(channel, message, { parse_mode: "Markdown" });
    } catch (error) {
        console.error("Error sending notifications:", error);
    }
}

setInterval(sendNotifications, 10 * 60 * 1000);
