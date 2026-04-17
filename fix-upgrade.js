var fs = require('fs');
var path = require('path');

// 1. CREATE FAVICON SVG
var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6ee7b7"/><stop offset="100%" stop-color="#10b981"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="#0a0a0a"/><path d="M7 10c0-1.7 1.3-3 3-3h12c1.7 0 3 1.3 3 3v8c0 1.7-1.3 3-3 3h-3l-3 3-3-3h-3c-1.7 0-3-1.3-3-3v-8z" fill="url(#g)"/><circle cx="12" cy="14" r="1.5" fill="#0a0a0a"/><circle cx="16" cy="14" r="1.5" fill="#0a0a0a"/><circle cx="20" cy="14" r="1.5" fill="#0a0a0a"/></svg>';
fs.writeFileSync(path.join('client', 'public', 'favicon.svg'), svg);
console.log('1. Emerald chat bubble favicon created');

// 2. UPDATE INDEX.HTML
var indexPath = path.join('client', 'index.html');
var html = fs.readFileSync(indexPath, 'utf8');
var c = 0;
var b;

// Add favicon + OG tags after <title>
b = html;
html = html.replace(
  '<title>Someone Today</title>',
  '<title>Someone Today</title>\n\n    <!-- Favicon -->\n    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />\n\n    <!-- Open Graph (link previews on iMessage, Instagram, etc) -->\n    <meta property="og:title" content="Someone Today" />\n    <meta property="og:description" content="A quiet place to talk to a real person. No profiles, no history. Just presence." />\n    <meta property="og:image" content="https://getsomeonetoday.com/og-image.png" />\n    <meta property="og:url" content="https://getsomeonetoday.com" />\n    <meta property="og:type" content="website" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:title" content="Someone Today" />\n    <meta name="twitter:description" content="A quiet place to talk to a real person. No profiles, no history. Just presence." />\n    <meta name="twitter:image" content="https://getsomeonetoday.com/og-image.png" />'
);
if (html !== b) { c++; console.log('2. Favicon link + OG meta tags added'); }

// Update theme-color to match dark theme
b = html;
html = html.replace('content="#faf8f5"', 'content="#0a0a0a"');
if (html !== b) { c++; console.log('3. Theme color updated to dark'); }

// Update meta description
b = html;
html = html.replace('content="A quiet place to meet someone."', 'content="A quiet place to talk to a real person. No profiles, no history. Just presence."');
if (html !== b) { c++; console.log('4. Meta description upgraded'); }

// Add Google Analytics before </head>
b = html;
html = html.replace(
  '</head>',
  '\n    <!-- Google Analytics -->\n    <script async src="https://www.googletagmanager.com/gtag/js?id=REPLACE_WITH_YOUR_GA_ID"></script>\n    <script>\n      window.dataLayer = window.dataLayer || [];\n      function gtag(){dataLayer.push(arguments);}\n      gtag("js", new Date());\n      gtag("config", "REPLACE_WITH_YOUR_GA_ID");\n    </script>\n  </head>'
);
if (html !== b) { c++; console.log('5. Google Analytics script added (placeholder ID)'); }

fs.writeFileSync(indexPath, html);
console.log('\n' + c + ' changes applied to index.html');
console.log('\nALL DONE');
console.log('\nNEXT: Replace REPLACE_WITH_YOUR_GA_ID with your real GA measurement ID');
console.log('(see instructions for how to get it)');
