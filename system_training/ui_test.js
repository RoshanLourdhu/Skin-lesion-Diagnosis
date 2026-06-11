// ui_test.js
// ui_test.js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8080');
  // Upload test image
  // Directly set the hidden file input
  const input = await page.$('input[type="file"]');
  await input.setInputFiles('d:/College Projects/skin_lesion_project/system_training/test_images/input.jpg');
  // Wait for results to load and verify key data
  await page.waitForTimeout(8000);
  // Verify that key sections are present
  const pageContent = await page.content();
  console.log('Diagnosis present:', /Melanoma/.test(pageContent));
  console.log('Confidence present:', /\d+\.\d%/.test(pageContent));
  console.log('Risk level present:', /Risk Level|HIGH|LOW|MEDIUM/.test(pageContent));
  console.log('Wolfram metrics present:', /Severity Score|Risk Index|Circularity/.test(pageContent));
  console.log('Clinical report present:', /Clinical Report/.test(pageContent));
  // Capture full dashboard
  await page.screenshot({ path: 'dashboard.png', fullPage: true });
  // Capture Wolfram Clinical Intelligence panel
  const wolfram = await page.$('text=Wolfram Clinical Intelligence');
  if (wolfram) {
    const parent = await wolfram.evaluateHandle(el => el.closest('div'));
    await parent.screenshot({ path: 'wolfram_panel.png' });
  }
  // Capture AI Clinical Report (assumed contains "Clinical Report")
  const report = await page.$('text=Clinical Report');
  if (report) {
    const parent = await report.evaluateHandle(el => el.closest('div'));
    await parent.screenshot({ path: 'clinical_report.png' });
  }
  // Capture Segmentation section (assumed contains "Segmentation")
  const seg = await page.$('text=Segmentation');
  if (seg) {
    const parent = await seg.evaluateHandle(el => el.closest('div'));
    await parent.screenshot({ path: 'segmentation.png' });
  }
  // Capture Grad-CAM section (assumed contains "Grad-CAM")
  const grad = await page.$('text=Grad-CAM');
  if (grad) {
    const parent = await grad.evaluateHandle(el => el.closest('div'));
    await parent.screenshot({ path: 'gradcam.png' });
  }
  // Capture Depth Analysis section (contains "Depth")
  const depth = await page.$('text=Depth');
  if (depth) {
    const parent = await depth.evaluateHandle(el => el.closest('div'));
    await parent.screenshot({ path: 'depth_analysis.png' });
  }
  // Trigger PDF export (assumes button with text "Export PDF")
  const exportBtn = await page.$('text=Export PDF');
  if (exportBtn) {
    await exportBtn.click();
    await page.waitForTimeout(3000);
    // Capture screenshot after export (could show toast or generated view)
    await page.screenshot({ path: 'pdf_export.png', fullPage: true });
  }
  await browser.close();
})();
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8080');
  // Directly set the hidden file input without waiting for a file chooser event
  const fileInput = await page.$('input[type="file"]');
  await fileInput.setInputFiles('d:/College Projects/skin_lesion_project/system_training/test_images/input.jpg');
  // Wait for analysis to complete by checking for key result elements
  await page.waitForSelector('text=AI DIAGNOSIS', { timeout: 15000 });
  await page.waitForSelector('text=Confidence', { timeout: 15000 });
  await page.waitForSelector('text=Risk Level', { timeout: 15000 });
  await page.waitForSelector('text=Wolfram Clinical Intelligence', { timeout: 15000 });
  await page.waitForSelector('text=Clinical Report', { timeout: 15000 });
  // Wait for the Diagnosis panel to show a label (simple heuristic: wait for text "Melanoma" or any label)
  await page.waitForTimeout(5000); // give backend time
  // Capture full dashboard screenshot
  await page.screenshot({ path: 'dashboard.png', fullPage: true });
  await browser.close();
})();
