// chart.js
const puppeteer = require('puppeteer');
const fs = require('fs');

async function createChart(pinoData, winstonData, outputFile) {
  // Prepare labels and data arrays from the provided datasets.
  const labels = pinoData.map(d => d.time.toFixed(1)); // assume both datasets use the same time points
  const pinoSizes = pinoData.map(d => d.size);
  const winstonSizes = winstonData.map(d => d.size);

  // Create an HTML string that renders a Chart.js chart.
  // We use Chart.js via a CDN.
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Log File Size Chart</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body { margin: 0; }
        canvas { display: block; }
      </style>
    </head>
    <body>
      <canvas id="myChart" width="800" height="600"></canvas>
      <script>
        const ctx = document.getElementById('myChart').getContext('2d');
        const config = {
          type: 'line',
          data: {
            labels: ${JSON.stringify(labels)},
            datasets: [
              {
                label: 'Pino Log File Size (bytes)',
                data: ${JSON.stringify(pinoSizes)},
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
                tension: 0.1,
              },
              {
                label: 'Winston Log File Size (bytes)',
                data: ${JSON.stringify(winstonSizes)},
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
                tension: 0.1,
              }
            ]
          },
          options: {
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Time (seconds)'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'File Size (bytes)'
                }
              }
            }
          }
        };
        new Chart(ctx, config);
      </script>
    </body>
  </html>
  `;

  // Launch Puppeteer and load the HTML content.
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set the content and wait until the network is idle.
  await page.setContent(html, { waitUntil: 'networkidle0' });
  // Wait for the canvas element to be rendered.
  await page.waitForSelector('canvas');

  // Get the canvas element and take its screenshot.
  const canvasElement = await page.$('canvas');
  const screenshotBuffer = await canvasElement.screenshot();

  // Write the screenshot to the output file.
  fs.writeFileSync(outputFile, screenshotBuffer);
  console.log(`Chart saved to ${outputFile}`);

  await browser.close();
}

module.exports = { createChart };
