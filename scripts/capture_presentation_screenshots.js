import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'https://campusresolve-theta.vercel.app';
const SCREENSHOT_DIR = path.resolve('d:\\FSD PROJECT\\docs\\screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  try {
    // -------------------------------------------------------------
    // Screenshot 1: Landing Page Hero & UGC Statutory Header
    // -------------------------------------------------------------
    console.log('1. Navigating to Landing Page...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    const ss1Path = path.join(SCREENSHOT_DIR, '01_landing_hero.png');
    await page.screenshot({ path: ss1Path, fullPage: false });
    console.log('✓ Saved:', ss1Path);

    // -------------------------------------------------------------
    // Screenshot 2: Public Ticket Tracking Widget
    // -------------------------------------------------------------
    console.log('2. Capturing Public Tracking Widget...');
    // Scroll down to tracker section
    const trackerInput = await page.$('input[placeholder*="CR-2026-"]');
    if (trackerInput) {
      await trackerInput.click();
      await trackerInput.type('CR-2026-1001', { delay: 50 });
      // Find button to track
      const trackBtn = await page.$('button[type="submit"]') || await page.$('form button');
      if (trackBtn) {
        await trackBtn.click();
        await sleep(2500);
      }
    }
    const ss2Path = path.join(SCREENSHOT_DIR, '02_public_tracking.png');
    // Scroll element into view and take screenshot
    await page.evaluate(() => {
      const el = document.querySelector('input[placeholder*="CR-2026-"]');
      if (el) el.closest('section')?.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await sleep(1000);
    await page.screenshot({ path: ss2Path, fullPage: false });
    console.log('✓ Saved:', ss2Path);

    // -------------------------------------------------------------
    // Screenshot 3: Clean Login Portal
    // -------------------------------------------------------------
    console.log('3. Navigating to Login Page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);
    const ss3Path = path.join(SCREENSHOT_DIR, '03_login_clean.png');
    await page.screenshot({ path: ss3Path, fullPage: false });
    console.log('✓ Saved:', ss3Path);

    // -------------------------------------------------------------
    // Screenshot 4: Student Dashboard
    // -------------------------------------------------------------
    console.log('4. Logging in as Student (hk5119164@gmail.com)...');
    await page.type('input[type="email"]', 'hk5119164@gmail.com', { delay: 30 });
    await page.type('input[type="password"]', 'password123', { delay: 30 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
    await sleep(3000);
    console.log('Current URL after student login:', page.url());

    const ss4Path = path.join(SCREENSHOT_DIR, '04_student_dashboard.png');
    await page.screenshot({ path: ss4Path, fullPage: false });
    console.log('✓ Saved:', ss4Path);

    // -------------------------------------------------------------
    // Screenshot 5: Grievance Registration Form
    // -------------------------------------------------------------
    console.log('5. Navigating to New Complaint Page...');
    await page.goto(`${BASE_URL}/student/new-complaint`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Pre-fill some fields to look great in demo screenshot
    const titleInput = await page.$('input[placeholder*="title"], input[name="title"]');
    if (titleInput) {
      await titleInput.type('Fluorescent Light Blinking Erratically in CS Lab 304', { delay: 20 });
    }

    // Click quick location badge if available
    const locationPills = await page.$$('button[type="button"]');
    for (const pill of locationPills) {
      const text = await page.evaluate(el => el.textContent, pill);
      if (text && text.includes('Lab 304')) {
        await pill.click();
        break;
      }
    }

    const descInput = await page.$('textarea');
    if (descInput) {
      await descInput.type('The overhead fluorescent tube light near terminal 12 is flickering at high frequency, causing visual fatigue during ongoing compiler lab sessions.', { delay: 10 });
    }

    await sleep(1000);
    const ss5Path = path.join(SCREENSHOT_DIR, '05_report_form.png');
    await page.screenshot({ path: ss5Path, fullPage: false });
    console.log('✓ Saved:', ss5Path);

    // -------------------------------------------------------------
    // Screenshot 6: 3-Stage Real-Time Status Timeline
    // -------------------------------------------------------------
    console.log('6. Navigating to Student Complaints List & Detail...');
    await page.goto(`${BASE_URL}/student/complaints`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2500);

    // Find first complaint link / card
    const complaintLink = await page.$('a[href*="/student/complaints/"]');
    if (complaintLink) {
      await complaintLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
      await sleep(2500);
    } else {
      // Direct navigation fallback
      await page.goto(`${BASE_URL}/student/complaints`, { waitUntil: 'networkidle2' });
    }

    const ss6Path = path.join(SCREENSHOT_DIR, '06_timeline_detail.png');
    await page.screenshot({ path: ss6Path, fullPage: false });
    console.log('✓ Saved:', ss6Path);

    // -------------------------------------------------------------
    // Logout student and login as Admin
    // -------------------------------------------------------------
    console.log('7. Logging out and logging in as Admin...');
    // Clear storage/cookies
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
    await page.evaluate(() => localStorage.clear());

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);
    await page.type('input[type="email"]', 'harshitkulkarni608@gmail.com', { delay: 30 });
    await page.type('input[type="password"]', 'password123', { delay: 30 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
    await sleep(3500);
    console.log('Admin URL after login:', page.url());

    // -------------------------------------------------------------
    // Screenshot 7: Admin Analytics & Overview
    // -------------------------------------------------------------
    console.log('7. Capturing Admin Dashboard Analytics...');
    const ss7Path = path.join(SCREENSHOT_DIR, '07_admin_analytics.png');
    await page.screenshot({ path: ss7Path, fullPage: false });
    console.log('✓ Saved:', ss7Path);

    // -------------------------------------------------------------
    // Screenshot 8: Admin Master Queue & Filter Grid
    // -------------------------------------------------------------
    console.log('8. Capturing Admin Master Queue Table...');
    await page.evaluate(() => {
      const table = document.querySelector('table') || document.querySelector('.overflow-x-auto');
      if (table) table.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1500);
    const ss8Path = path.join(SCREENSHOT_DIR, '08_admin_queue.png');
    await page.screenshot({ path: ss8Path, fullPage: false });
    console.log('✓ Saved:', ss8Path);

    // -------------------------------------------------------------
    // Screenshot 9: Admin UGC Grievance Dossier / Detail
    // -------------------------------------------------------------
    console.log('9. Navigating to Admin Complaint Detail for UGC Dossier...');
    const adminDetailLink = await page.$('a[href*="/admin/complaints/"]');
    if (adminDetailLink) {
      await adminDetailLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
      await sleep(2500);
    }
    const ss9Path = path.join(SCREENSHOT_DIR, '09_ugc_dossier.png');
    await page.screenshot({ path: ss9Path, fullPage: false });
    console.log('✓ Saved:', ss9Path);

    // -------------------------------------------------------------
    // Screenshot 10: Global Command Palette (Ctrl+K)
    // -------------------------------------------------------------
    console.log('10. Triggering Command Palette (Ctrl+K)...');
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyK');
    await page.keyboard.up('Control');
    await sleep(1500);

    // Type query if palette opened
    await page.keyboard.type('Lab', { delay: 50 });
    await sleep(1000);
    const ss10Path = path.join(SCREENSHOT_DIR, '10_command_palette.png');
    await page.screenshot({ path: ss10Path, fullPage: false });
    console.log('✓ Saved:', ss10Path);

    console.log('\n=== ALL 10 PRESENTATION SCREENSHOTS CAPTURED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

capture();
