import { chromium } from 'playwright';
import fs from 'fs';

const TARGET_URL = 'https://backend-gold-omega-57.vercel.app/';

async function runPerformanceAudit() {
  console.log('--- STARTING PERFORMANCE AUDIT ---');
  const browser = await chromium.launch({ headless: true });
  const runs = [];

  for (let run = 1; run <= 3; run++) {
    console.log(`\nStarting Run #${run}...`);
    const context = await browser.newContext();
    const page = await context.newPage();

    const networkRequests = [];
    page.on('response', async res => {
      try {
        const headers = res.headers();
        const status = res.status();
        const url = res.url();
        const size = headers['content-length'] ? parseInt(headers['content-length'], 10) : 0;
        networkRequests.push({ url, status, size, contentType: headers['content-type'] || 'unknown' });
      } catch (e) {}
    });

    const client = await context.newCDPSession(page);
    await client.send('Performance.enable');

    const startTs = Date.now();
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    const duration = Date.now() - startTs;

    // Extract Navigation and Paint timings from browser
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const paints = performance.getEntriesByType('paint') || [];
      const fp = paints.find(p => p.name === 'first-paint')?.startTime || 0;
      const fcp = paints.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      
      const domNodes = document.querySelectorAll('*').length;
      
      // Calculate max DOM depth
      let maxDepth = 0;
      function findDepth(node, depth) {
        if (!node) return;
        if (depth > maxDepth) maxDepth = depth;
        for (let child of node.children) {
          findDepth(child, depth + 1);
        }
      }
      findDepth(document.documentElement, 1);

      const mem = performance.memory ? {
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize
      } : null;

      // Resources summary
      const resources = performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        initiatorType: r.initiatorType,
        duration: Math.round(r.duration),
        transferSize: r.transferSize,
        decodedBodySize: r.decodedBodySize
      }));

      return {
        timing: {
          dnsTime: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
          tcpTime: Math.round(nav.connectEnd - nav.connectStart),
          ttfb: Math.round(nav.responseStart - nav.requestStart),
          downloadTime: Math.round(nav.responseEnd - nav.responseStart),
          domInteractive: Math.round(nav.domInteractive),
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
          loadComplete: Math.round(nav.loadEventEnd),
          firstPaint: Math.round(fp),
          firstContentfulPaint: Math.round(fcp)
        },
        dom: {
          nodes: domNodes,
          maxDepth
        },
        memory: mem,
        resources
      };
    });

    // Categorize resource transfer sizes
    let totalTransfer = 0;
    let jsTransfer = 0;
    let cssTransfer = 0;
    let imgTransfer = 0;
    let fontTransfer = 0;

    for (const r of metrics.resources) {
      totalTransfer += r.transferSize || 0;
      if (r.initiatorType === 'script' || r.name.endsWith('.js')) jsTransfer += r.transferSize || 0;
      else if (r.initiatorType === 'css' || r.name.endsWith('.css')) cssTransfer += r.transferSize || 0;
      else if (r.initiatorType === 'img' || /\.(png|jpg|jpeg|svg|webp|ico)/i.test(r.name)) imgTransfer += r.transferSize || 0;
      else if (r.initiatorType === 'font' || /\.(woff|woff2|ttf|otf)/i.test(r.name)) fontTransfer += r.transferSize || 0;
    }

    const runResult = {
      run,
      durationMs: duration,
      timing: metrics.timing,
      dom: metrics.dom,
      memory: metrics.memory,
      network: {
        totalRequests: networkRequests.length,
        totalTransferBytes: totalTransfer,
        jsTransferBytes: jsTransfer,
        cssTransferBytes: cssTransfer,
        imgTransferBytes: imgTransfer,
        fontTransferBytes: fontTransfer
      },
      resourcesCount: metrics.resources.length
    };

    runs.push(runResult);
    console.log(`  -> TTFB: ${metrics.timing.ttfb}ms, FCP: ${metrics.timing.firstContentfulPaint}ms, DOMContentLoaded: ${metrics.timing.domContentLoaded}ms, JS Size: ${(jsTransfer / 1024).toFixed(1)} KB`);

    await context.close();
  }

  await browser.close();

  // Compute averages
  const avg = {
    ttfb: Math.round(runs.reduce((s, r) => s + r.timing.ttfb, 0) / runs.length),
    firstPaint: Math.round(runs.reduce((s, r) => s + r.timing.firstPaint, 0) / runs.length),
    fcp: Math.round(runs.reduce((s, r) => s + r.timing.firstContentfulPaint, 0) / runs.length),
    domContentLoaded: Math.round(runs.reduce((s, r) => s + r.timing.domContentLoaded, 0) / runs.length),
    loadComplete: Math.round(runs.reduce((s, r) => s + r.timing.loadComplete, 0) / runs.length),
    domNodes: Math.round(runs.reduce((s, r) => s + r.dom.nodes, 0) / runs.length),
    jsTransferKB: (runs[0].network.jsTransferBytes / 1024).toFixed(1),
    totalTransferKB: (runs[0].network.totalTransferBytes / 1024).toFixed(1)
  };

  const perfReport = {
    targetUrl: TARGET_URL,
    timestamp: new Date().toISOString(),
    runsCount: runs.length,
    averages: avg,
    runs
  };

  fs.writeFileSync('qa/performance_results.json', JSON.stringify(perfReport, null, 2), 'utf8');
  console.log('\n--- PERFORMANCE AUDIT COMPLETE. Saved qa/performance_results.json ---');
}

runPerformanceAudit().catch(err => {
  console.error('Performance audit fatal error:', err);
  process.exit(1);
});
