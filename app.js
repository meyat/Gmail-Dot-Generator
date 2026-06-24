/* ============================================================
   DotMail Generator — app.js
   ============================================================ */

// ──────────────────────────────────────────
// State
// ──────────────────────────────────────────
let generatedEmails = [];
let filteredEmails  = [];
let history         = JSON.parse(localStorage.getItem('dotmail_history') || '[]');

// ──────────────────────────────────────────
// DOM References
// ──────────────────────────────────────────
const emailInput       = document.getElementById('emailInput');
const domainSelect     = document.getElementById('domainSelect');
const customDomainGrp  = document.getElementById('customDomainGroup');
const customDomainInput= document.getElementById('customDomainInput');
const generateBtn      = document.getElementById('generateBtn');
const clearBtn         = document.getElementById('clearBtn');
const statsBar         = document.getElementById('statsBar');
const totalCount       = document.getElementById('totalCount');
const uniqueCount      = document.getElementById('uniqueCount');
const dotCount         = document.getElementById('dotCount');
const resultsSection   = document.getElementById('resultsSection');
const resultSubtitle   = document.getElementById('resultSubtitle');
const emailList        = document.getElementById('emailList');
const filterInput      = document.getElementById('filterInput');
const copyAllBtn       = document.getElementById('copyAllBtn');
const exportMenuBtn    = document.getElementById('exportMenuBtn');
const exportMenu       = document.getElementById('exportMenu');
const exportCsvBtn     = document.getElementById('exportCsvBtn');
const exportExcelBtn   = document.getElementById('exportExcelBtn');
const exportPdfBtn     = document.getElementById('exportPdfBtn');
const mailtoBtn        = document.getElementById('mailtoBtn');
const waNumber         = document.getElementById('waNumber');
const waBtn            = document.getElementById('waBtn');
const historyList      = document.getElementById('historyList');
const historyEmpty     = document.getElementById('historyEmpty');
const clearHistoryBtn  = document.getElementById('clearHistoryBtn');
const toast            = document.getElementById('toast');

// ──────────────────────────────────────────
// Core Generator
// ──────────────────────────────────────────

/**
 * Generate all dot-position permutations of a username string.
 * For a string of length n, there are (n-1) positions between characters.
 * Each position can have a dot or not → 2^(n-1) combinations.
 */
function generateDotVariants(username) {
  const chars = username.split('');
  const len   = chars.length;
  if (len === 0) return [];

  const positions = len - 1;          // gaps between characters
  const count     = 1 << positions;   // 2^positions
  const results   = [];

  for (let i = 0; i < count; i++) {
    let variant = chars[0];
    for (let j = 0; j < positions; j++) {
      if (i & (1 << j)) variant += '.';
      variant += chars[j + 1];
    }
    results.push(variant);
  }

  return results;
}

function getSelectedDomain() {
  const val = domainSelect.value;
  if (val === 'custom') {
    const custom = customDomainInput.value.trim();
    if (!custom) return null;
    return custom.startsWith('@') ? custom : '@' + custom;
  }
  return val;
}

function sanitizeUsername(raw) {
  // remove spaces, @, and any domain part if user typed full email
  return raw.toLowerCase().replace(/\s/g, '').split('@')[0].replace(/[^a-z0-9._+-]/g, '');
}

// ──────────────────────────────────────────
// Render
// ──────────────────────────────────────────

function highlightDots(email) {
  // Bold/colorize dot characters in the username part
  const atIdx    = email.indexOf('@');
  const username = email.slice(0, atIdx);
  const domain   = email.slice(atIdx);
  const highlighted = username
    .split('')
    .map(c => c === '.' ? `<span class="dot-highlight">.</span>` : c)
    .join('');
  return highlighted + domain;
}

function renderEmailList(emails) {
  emailList.innerHTML = '';
  if (!emails.length) {
    emailList.innerHTML = '<li class="empty-state"><span class="empty-icon">🔍</span><p>Tidak ada email yang cocok.</p></li>';
    return;
  }

  const fragment = document.createDocumentFragment();
  emails.forEach((email, idx) => {
    const li = document.createElement('li');
    li.className = 'email-item';
    li.style.animationDelay = `${Math.min(idx * 12, 200)}ms`;
    li.innerHTML = `
      <span class="index">${String(idx + 1).padStart(3, '0')}</span>
      <span class="email-text">${highlightDots(email)}</span>
      <button class="copy-single" data-email="${email}" title="Salin email ini">⎘</button>
    `;
    fragment.appendChild(li);
  });
  emailList.appendChild(fragment);

  // Event delegation for copy buttons
  emailList.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-single');
    if (btn) copyToClipboard(btn.dataset.email);
  });
}

function updateStats(emails, username) {
  const positions = username.length - 1;
  totalCount.textContent  = emails.length;
  uniqueCount.textContent = new Set(emails).size;
  dotCount.textContent    = positions;
}

// ──────────────────────────────────────────
// Main Generate Action
// ──────────────────────────────────────────

function generate() {
  const rawInput = emailInput.value.trim();
  if (!rawInput) {
    showToast('⚠ Masukkan username email terlebih dahulu', 'error');
    emailInput.focus();
    return;
  }

  const username = sanitizeUsername(rawInput);
  if (username.length < 1) {
    showToast('⚠ Username tidak valid', 'error');
    return;
  }

  const domain = getSelectedDomain();
  if (!domain) {
    showToast('⚠ Masukkan custom domain', 'error');
    customDomainInput.focus();
    return;
  }

  // Generate
  const variants = generateDotVariants(username);
  generatedEmails = variants.map(v => v + domain);
  filteredEmails  = [...generatedEmails];

  // Update UI
  updateStats(generatedEmails, username);
  renderEmailList(filteredEmails);
  resultSubtitle.textContent = `${generatedEmails.length} variasi untuk "${username + domain}"`;
  filterInput.value = '';

  statsBar.style.display    = 'flex';
  resultsSection.style.display = 'block';

  // Scroll to results
  setTimeout(() => resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

  // Save to history
  addToHistory(username + domain, generatedEmails.length);

  showToast(`✓ ${generatedEmails.length} email berhasil digenerate!`, 'success');
}

// ──────────────────────────────────────────
// Filter
// ──────────────────────────────────────────

filterInput.addEventListener('input', () => {
  const q = filterInput.value.toLowerCase();
  filteredEmails = generatedEmails.filter(e => e.includes(q));
  renderEmailList(filteredEmails);
});

// ──────────────────────────────────────────
// Copy
// ──────────────────────────────────────────

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('✓ Disalin ke clipboard!', 'success');
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('✓ Disalin ke clipboard!', 'success');
  }
}

copyAllBtn.addEventListener('click', () => {
  if (!filteredEmails.length) return showToast('Belum ada email untuk disalin', 'error');
  copyToClipboard(filteredEmails.join('\n'));
});

// ──────────────────────────────────────────
// Export
// ──────────────────────────────────────────

exportMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  exportMenu.classList.toggle('open');
});

document.addEventListener('click', () => exportMenu.classList.remove('open'));

// CSV
exportCsvBtn.addEventListener('click', () => {
  if (!filteredEmails.length) return showToast('Tidak ada email untuk diekspor', 'error');
  const csv = 'No,Email\n' + filteredEmails.map((e, i) => `${i + 1},"${e}"`).join('\n');
  downloadFile('dotmail-export.csv', csv, 'text/csv;charset=utf-8;');
  showToast('✓ CSV berhasil diunduh', 'success');
  exportMenu.classList.remove('open');
});

// Excel (XLSX)
exportExcelBtn.addEventListener('click', () => {
  if (!filteredEmails.length) return showToast('Tidak ada email untuk diekspor', 'error');
  const data = [['No', 'Email'], ...filteredEmails.map((e, i) => [i + 1, e])];
  const ws   = XLSX.utils.aoa_to_sheet(data);

  // Column widths
  ws['!cols'] = [{ wch: 6 }, { wch: 45 }];

  // Header style
  ['A1', 'B1'].forEach(cell => {
    if (ws[cell]) {
      ws[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '6366F1' } },
      };
    }
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Emails');
  XLSX.writeFile(wb, 'dotmail-export.xlsx');
  showToast('✓ Excel berhasil diunduh', 'success');
  exportMenu.classList.remove('open');
});

// PDF
exportPdfBtn.addEventListener('click', () => {
  if (!filteredEmails.length) return showToast('Tidak ada email untuk diekspor', 'error');
  exportMenu.classList.remove('open');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW  = doc.internal.pageSize.getWidth();
  const margin = 18;
  let   y      = margin;

  // Header background
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageW, 30, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('DotMail Generator — Export', margin, 19);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString('id-ID')}  |  Total: ${filteredEmails.length} emails`, margin, 26);

  y = 40;

  // Table header
  doc.setFillColor(230, 231, 253);
  doc.rect(margin - 2, y - 5, pageW - margin * 2 + 4, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 80);
  doc.text('No.', margin, y);
  doc.text('Email Address', margin + 16, y);
  y += 6;

  // Rows
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 60);

  filteredEmails.forEach((email, i) => {
    if (y > 280) {
      doc.addPage();
      y = margin;

      // Repeat header on new page
      doc.setFillColor(230, 231, 253);
      doc.rect(margin - 2, y - 5, pageW - margin * 2 + 4, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 80);
      doc.text('No.', margin, y);
      doc.text('Email Address', margin + 16, y);
      y += 6;
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 60);
    }

    if (i % 2 === 1) {
      doc.setFillColor(245, 245, 255);
      doc.rect(margin - 2, y - 4, pageW - margin * 2 + 4, 6, 'F');
    }

    doc.text(String(i + 1).padStart(3, '0'), margin, y);
    doc.text(email, margin + 16, y);
    y += 6;
  });

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(`Halaman ${p} / ${pages}`, pageW - margin, 290, { align: 'right' });
    doc.text('DotMail Generator', margin, 290);
  }

  doc.save('dotmail-export.pdf');
  showToast('✓ PDF berhasil diunduh', 'success');
});

function downloadFile(filename, content, mimeType) {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ──────────────────────────────────────────
// Share — mailto
// ──────────────────────────────────────────

mailtoBtn.addEventListener('click', () => {
  if (!filteredEmails.length) return showToast('Tidak ada email', 'error');
  const to  = filteredEmails[0];
  const bcc = filteredEmails.slice(1).join(',');
  const subject = encodeURIComponent('Halo dari DotMail Generator');
  let url = `mailto:${to}?subject=${subject}`;
  if (bcc) url += `&bcc=${bcc}`;
  window.location.href = url;
});

// ──────────────────────────────────────────
// Share — WhatsApp
// ──────────────────────────────────────────

waBtn.addEventListener('click', () => {
  if (!filteredEmails.length) return showToast('Tidak ada email untuk dibagikan', 'error');

  let num = waNumber.value.trim().replace(/[\s\-().]/g, '');
  if (!num) return showToast('⚠ Masukkan nomor WhatsApp terlebih dahulu', 'error');

  // Normalize to 62xxx
  if (num.startsWith('0'))       num = '62' + num.slice(1);
  else if (num.startsWith('+'))  num = num.slice(1);
  else if (!num.startsWith('62')) num = '62' + num;

  const body = `*DotMail Generator*\n\nBerikut daftar variasi email:\n\n` +
    filteredEmails.slice(0, 50).map((e, i) => `${i + 1}. ${e}`).join('\n') +
    (filteredEmails.length > 50 ? `\n...dan ${filteredEmails.length - 50} lainnya` : '') +
    `\n\nTotal: ${filteredEmails.length} email`;

  const url = `https://wa.me/${num}?text=${encodeURIComponent(body)}`;
  window.open(url, '_blank');
});

// ──────────────────────────────────────────
// History
// ──────────────────────────────────────────

function addToHistory(email, count) {
  const entry = {
    id:    Date.now(),
    email,
    count,
    time:  new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
  };

  // Avoid duplicate at top
  if (history.length && history[0].email === email) {
    history[0] = entry;
  } else {
    history.unshift(entry);
    if (history.length > 30) history.pop(); // keep max 30 entries
  }

  saveHistory();
  renderHistory();
}

function saveHistory() {
  localStorage.setItem('dotmail_history', JSON.stringify(history));
}

function renderHistory() {
  if (!history.length) {
    historyEmpty.style.display = 'block';
    // Remove old items
    Array.from(historyList.querySelectorAll('.history-item')).forEach(el => el.remove());
    return;
  }
  historyEmpty.style.display = 'none';

  // Rebuild
  const existing = historyList.querySelectorAll('.history-item');
  existing.forEach(el => el.remove());

  history.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.dataset.id = entry.id;
    div.innerHTML = `
      <span class="history-email">${entry.email}</span>
      <div class="history-meta">
        <span class="history-count">${entry.count} email</span>
        <span class="history-time">${entry.time}</span>
      </div>
      <button class="history-delete" data-id="${entry.id}" title="Hapus riwayat ini">✕</button>
    `;
    historyList.appendChild(div);
  });

  // Click to re-generate
  historyList.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.history-delete')) return;
      const entry = history.find(h => h.id == item.dataset.id);
      if (!entry) return;

      // Parse email + domain
      const atIdx   = entry.email.indexOf('@');
      const uname   = entry.email.slice(0, atIdx);
      const domain  = entry.email.slice(atIdx);

      emailInput.value = uname;

      // Set domain dropdown
      const found = Array.from(domainSelect.options).find(o => o.value === domain);
      if (found) {
        domainSelect.value = domain;
        customDomainGrp.style.display = 'none';
      } else {
        domainSelect.value = 'custom';
        customDomainGrp.style.display = 'block';
        customDomainInput.value = domain;
      }

      generate();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Delete single entry
  historyList.querySelectorAll('.history-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      history = history.filter(h => h.id != btn.dataset.id);
      saveHistory();
      renderHistory();
      showToast('Riwayat dihapus', 'success');
    });
  });
}

clearHistoryBtn.addEventListener('click', () => {
  if (!history.length) return;
  if (confirm('Hapus semua riwayat?')) {
    history = [];
    saveHistory();
    renderHistory();
    showToast('✓ Semua riwayat dihapus', 'success');
  }
});

// ──────────────────────────────────────────
// Toast
// ──────────────────────────────────────────

let toastTimer;
function showToast(msg, type = '') {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className   = `toast ${type} show`;
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ──────────────────────────────────────────
// Domain select: custom toggle
// ──────────────────────────────────────────

domainSelect.addEventListener('change', () => {
  const isCustom = domainSelect.value === 'custom';
  customDomainGrp.style.display = isCustom ? 'block' : 'none';
  if (isCustom) customDomainInput.focus();
});

// ──────────────────────────────────────────
// Buttons
// ──────────────────────────────────────────

generateBtn.addEventListener('click', generate);

emailInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generate();
});

customDomainInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generate();
});

clearBtn.addEventListener('click', () => {
  emailInput.value        = '';
  filterInput.value       = '';
  generatedEmails         = [];
  filteredEmails          = [];
  emailList.innerHTML     = '';
  statsBar.style.display      = 'none';
  resultsSection.style.display = 'none';
  emailInput.focus();
});

// ──────────────────────────────────────────
// Init
// ──────────────────────────────────────────

renderHistory();
emailInput.focus();
