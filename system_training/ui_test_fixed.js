// ui_test_fixed.js
// Automated verification script using Playwright
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8080');

  // Directly set the hidden file input with a test lesion image
  const input = await page.$('input[type="file"]');
  await input.setInputFiles('d:/College Projects/skin_lesion_project/system_training/test_images/input.jpg');

  // Wait for analysis results – increase timeout to ensure backend processing finishes
  const timeout = 30000; // 30 seconds
  await page.waitForSelector('text=AI DIAGNOSIS', { timeout });
  await page.waitForSelector('text=Diagnosis', { timeout });
  await page.waitForSelector('text=Confidence', { timeout });
  await page.waitForSelector('text=Risk Level', { timeout });
  await page.waitForSelector('text=Wolfram Clinical Intelligence', { timeout });
  await page.waitForSelector('text=Severity Score', { timeout });
  await page.waitForSelector('text=Clinical Report', { timeout });

  console.log('✅ All required UI sections are present');

  // Capture screenshots of the key panels
  await page.screenshot({ path: 'dashboard.png', fullPage: true });
  const wolfram = await page.$('text=Wolfram Clinical Intelligence');
  if (wolfram) {
    const parent = await wolfram.evaluateHandle(el => el.closest('div'));
    await parent.screenshot({ path: 'wolfram_panel.png' });
  }
  const report = await page.$('text=Clinical Report');
  if (report) {
    const parent = await report.evaluateHandle(el => el.closest('div'));
    await parent.screenshot({ path: 'clinical_report.png' });
  }
  const seg = await page.$('text=Segmentation');
  if (seg) {
    const parent = await seg.evaluateHandle(el => el.closest('div'));
    await parent.screenshot({ path: 'segmentation.png' });
  }
  const grad = await page.$('text=Grad-CAM');
  if (grad) {
    const parent = await grad.evaluateHandle(el => el.closest('div'));
    await parent.screenshot({ path: 'gradcam.png' });
  }
  const depth = await page.$('text=Depth');
  if (depth) {
    const parent = await depth.evaluateHandle(el => el.closest('div'));
    await parent.screenshot({ path: 'depth_analysis.png' });
  }
  const exportBtn = await page.$('text=Export PDF');
  if (exportBtn) {
    await exportBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'pdf_export.png', fullPage: true });
  }

  await browser.close();
})();
