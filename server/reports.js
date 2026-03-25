const express = require('express');
const router = express.Router();

const reports = [];
const MAX_REPORTS = 500;

setInterval(() => {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000);
  while (reports.length > 0 && reports[0].timestamp < cutoff) {
    reports.shift();
  }
}, 60 * 60 * 1000);

router.post('/', (req, res) => {
  const { roomId, reason, details } = req.body;

  if (!reason) {
    return res.status(400).json({
      error: 'A reason is needed to submit a report.'
    });
  }

  if (reports.length >= MAX_REPORTS) reports.shift();

  const report = {
    id: reports.length + 1,
    roomId: roomId || 'unknown',
    reason,
    details: details || '',
    timestamp: Date.now(),
    reviewed: false
  };

  reports.push(report);
  console.log(`[REPORT] #${report.id} | Reason: ${reason}`);

  res.status(201).json({
    message: 'Thank you. Your report has been received.',
    id: report.id
  });
});

router.get('/', (req, res) => {
  res.json({ total: reports.length, reports: reports.slice(-50).reverse() });
});

module.exports = router;
