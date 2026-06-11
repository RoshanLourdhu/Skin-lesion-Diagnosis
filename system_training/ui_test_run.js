const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8080');

  // Directly set the hidden file input (no need to wait for filechooser)
  const input = await page.$('input[type="file"]');
  if (!input) {
    console.error('File input not found');
    await browser.close();
    process.exit(1);
  }
  await input.setInputFiles('d:/College Projects/skin_lesion_project/system_training/test_images/input.jpg');

  // Wait for analysis to complete – give generous timeout
  await page.waitForTimeout(8000);

  // Helper to log presence of key strings
  const content = await page.content();
  console.log('Diagnosis present:', /Melanoma|Nevus|Basal|Squamous/i.test(content));
  console.log('Confidence present:', /\d+\.\d%/.test(content));
  console.log('Risk level present:', /Risk Level|HIGH|LOW|MEDIUM/i.test(content));
  console.log('Wolfram metrics present:', /Severity Score|Risk Index|Circularity/.test(content));
  console.log('Clinical report present:', /Clinical Report/.test(content));

  // Capture screenshots for visual confirmation (optional)
  await page.screenshot({ path: 'dashboard.png', fullPage: true });

  await browser.close();
})();
