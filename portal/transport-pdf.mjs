// Ic Nakliye kayitlarinin PDF hali: tek kayit icin bir sayfa, liste icin
// yatay tablo. Sunucuda uretilir; hem portaldan indirilir hem de yeni kayit
// bildirimine eklenir.
//
// PDF'e yalniz operasyon alanlari girer (TRANSPORT_PDF_FIELDS). Ucret, doviz
// ve odeme finans alanidir; modul ekranlarinda oldugu gibi burada da yer
// almaz. PDF ileride bir surucuye ya da depoya iletilebilir, bu yuzden
// cagiranin yetkisine bakilmaksizin finans alani hic basilmaz.

import PDFDocument from 'pdfkit';
import { readFileSync } from 'node:fs';

export const TRANSPORT_PDF_FIELDS = ['id', 'company', 'customs', 'warehouse', 'deliveryAddress', 'container', 'packages', 'weight', 'source', 'createdAt'];

export const pdfRecord = (row) => Object.fromEntries(TRANSPORT_PDF_FIELDS.filter((key) => row?.[key] !== undefined && row[key] !== null).map((key) => [key, row[key]]));

const BRAND = '#2e2a86';
const TEXT = '#1f1f1f';
const MUTED = '#6b7280';
const LINE = '#d9dce3';
const SOFT = '#f4f4f8';

let assets;
const load = () => {
  if (!assets) {
    const file = (name) => readFileSync(new URL('./prototype/' + name, import.meta.url));
    assets = { regular: file('manrope-0.ttf'), semibold: file('manrope-2.ttf'), bold: file('manrope-3.ttf'), logo: file('ascend_logo_correct.png') };
  }
  return assets;
};

const zone = 'Europe/Istanbul';
export const trDate = (iso) => {
  const time = Date.parse(iso || '');
  return Number.isFinite(time) ? new Intl.DateTimeFormat('tr-TR', { timeZone: zone, day: '2-digit', month: '2-digit', year: 'numeric' }).format(time) : '—';
};
const trDateTime = (date) => new Intl.DateTimeFormat('tr-TR', { timeZone: zone, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
const number = (value, digits = 2) => (value === undefined || value === null || value === '' ? '—' : Number(value).toLocaleString('tr-TR', { maximumFractionDigits: digits }));
// Ekrandaki 'Yuk' sutunuyla ayni: konteynerse 'Konteyner', degilse bos.
const cargo = (r) => (r.container ? 'Konteyner' : '—');
const or = (value) => (value === undefined || value === null || String(value).trim() === '' ? '—' : String(value));

function documentFor(layout, title) {
  const font = load();
  const doc = new PDFDocument({ size: 'A4', layout, margins: { top: 40, bottom: 48, left: 42, right: 42 }, bufferPages: true, info: { Title: title, Author: 'Ascend Lojistik', Creator: 'Ascend Portal' } });
  doc.registerFont('regular', font.regular);
  doc.registerFont('semibold', font.semibold);
  doc.registerFont('bold', font.bold);
  doc.font('regular').fillColor(TEXT);
  return doc;
}

// Ust bant: resmi logo (orani korunur) ve sagda baslik.
function header(doc, title, subtitle) {
  const { left, right, top } = doc.page.margins;
  const width = doc.page.width - left - right;
  doc.image(load().logo, left, top, { fit: [72, 48] });
  doc.font('bold').fontSize(18).fillColor(BRAND).text(title, left + 90, top + 4, { width: width - 90, align: 'right' });
  if (subtitle) doc.font('regular').fontSize(10).fillColor(MUTED).text(subtitle, left + 90, doc.y + 2, { width: width - 90, align: 'right' });
  const y = top + 60;
  doc.moveTo(left, y).lineTo(left + width, y).lineWidth(1.2).strokeColor(BRAND).stroke();
  doc.x = left;
  doc.y = y + 16;
}

// Alt bilgi her sayfaya, sayfalar bittikten sonra yazilir (sayfa sayisi icin).
function footers(doc, generatedAt, generatedBy) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const { left, right, bottom } = doc.page.margins;
    const width = doc.page.width - left - right;
    const y = doc.page.height - bottom + 18;
    // Alt kenar boslugunu gecici kaldirmazsak pdfkit bu satiri yeni sayfaya tasir.
    doc.page.margins.bottom = 0;
    doc.moveTo(left, y - 6).lineTo(left + width, y - 6).lineWidth(0.5).strokeColor(LINE).stroke();
    const note = 'Ascend Lojistik · www.ascendlojistik.com · Oluşturulma: ' + trDateTime(generatedAt) + (generatedBy ? ' · ' + generatedBy : '');
    doc.font('regular').fontSize(8).fillColor(MUTED).text(note, left, y, { width: width - 60, lineBreak: false });
    doc.text('Sayfa ' + (i + 1) + ' / ' + range.count, left + width - 60, y, { width: 60, align: 'right', lineBreak: false });
    doc.page.margins.bottom = bottom;
  }
}

const finish = (doc) => new Promise((resolve, reject) => {
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);
  doc.end();
});

// Tek kayit: her kayit kendi sayfasinda, etiket / deger satirlari.
function recordPage(doc, r) {
  header(doc, 'İç Nakliye Kaydı', r.id + ' · ' + trDate(r.createdAt));
  const { left, right } = doc.page.margins;
  const width = doc.page.width - left - right;
  const labelWidth = 130;
  const rows = [
    ['Kayıt no', r.id],
    ['Kayıt tarihi', trDate(r.createdAt)],
    ['Firma', or(r.company)],
    ['Gümrük', or(r.customs)],
    ['Depo', or(r.warehouse)],
    ['Konteyner', r.container ? 'Evet' : 'Hayır'],
    ['Kap', number(r.packages, 0)],
    ['Kilo', r.weight == null ? '—' : number(r.weight) + ' kg'],
    ['Teslim adresi', or(r.deliveryAddress)],
  ];
  if (r.source) rows.push(['Kaynak', r.source]);
  for (const [index, [label, value]] of rows.entries()) {
    doc.font('regular').fontSize(11);
    const height = Math.max(doc.heightOfString(value, { width: width - labelWidth - 20 }), 14) + 14;
    const y = doc.y;
    if (index % 2 === 0) doc.rect(left, y, width, height).fill(SOFT);
    doc.font('semibold').fontSize(10).fillColor(MUTED).text(label, left + 10, y + 7, { width: labelWidth - 10 });
    doc.font(label === 'Kayıt no' ? 'bold' : 'regular').fontSize(11).fillColor(TEXT).text(value, left + labelWidth + 10, y + 7, { width: width - labelWidth - 20 });
    doc.x = left;
    doc.y = y + height;
  }
}

// Liste: yatay A4 tablo. Baslik satiri her sayfada tekrarlanir; uzun adres
// satiri kesilmez, satir yuksekligi icerige gore buyur.
function listPages(doc, records, subtitle) {
  header(doc, 'İç Nakliye Kayıtları', subtitle);
  const { left, right } = doc.page.margins;
  const width = doc.page.width - left - right;
  const columns = [
    { label: 'Kayıt', width: 82, value: (r) => r.id + '\n' + trDate(r.createdAt) },
    { label: 'Firma', width: 150, value: (r) => or(r.company) },
    { label: 'Gümrük', width: 110, value: (r) => or(r.customs) },
    { label: 'Depo', width: 90, value: (r) => or(r.warehouse) },
    { label: 'Kap', width: 44, align: 'right', value: (r) => number(r.packages, 0) },
    { label: 'Kilo', width: 64, align: 'right', value: (r) => number(r.weight) },
    { label: 'Yük', width: 62, value: cargo },
  ];
  const used = columns.reduce((sum, c) => sum + c.width, 0);
  columns.push({ label: 'Teslim adresi', width: width - used, value: (r) => or(r.deliveryAddress) });
  const pad = 5;
  const bottom = () => doc.page.height - doc.page.margins.bottom;

  const headRow = () => {
    const y = doc.y;
    doc.rect(left, y, width, 20).fill(BRAND);
    let x = left;
    for (const c of columns) {
      doc.font('semibold').fontSize(8.5).fillColor('#ffffff').text(c.label.toLocaleUpperCase('tr-TR'), x + pad, y + 6, { width: c.width - pad * 2, align: c.align || 'left', lineBreak: false });
      x += c.width;
    }
    doc.y = y + 20;
  };
  headRow();
  for (const [index, r] of records.entries()) {
    doc.font('regular').fontSize(9);
    const height = Math.max(...columns.map((c) => doc.heightOfString(c.value(r), { width: c.width - pad * 2 }))) + pad * 2;
    if (doc.y + height > bottom()) {
      doc.addPage();
      doc.y = doc.page.margins.top;
      headRow();
    }
    const y = doc.y;
    if (index % 2 === 1) doc.rect(left, y, width, height).fill(SOFT);
    let x = left;
    for (const c of columns) {
      doc.font(c.label === 'Kayıt' ? 'semibold' : 'regular').fontSize(9).fillColor(TEXT).text(c.value(r), x + pad, y + pad, { width: c.width - pad * 2, align: c.align || 'left' });
      x += c.width;
    }
    doc.moveTo(left, y + height).lineTo(left + width, y + height).lineWidth(0.4).strokeColor(LINE).stroke();
    doc.y = y + height;
  }
  const packages = records.reduce((sum, r) => sum + (Number(r.packages) || 0), 0);
  const weight = records.reduce((sum, r) => sum + (Number(r.weight) || 0), 0);
  if (doc.y + 24 > bottom()) { doc.addPage(); doc.y = doc.page.margins.top; }
  doc.font('semibold').fontSize(9.5).fillColor(TEXT)
    .text('Toplam: ' + records.length + ' kayıt · ' + number(packages, 0) + ' kap · ' + number(weight) + ' kg', left, doc.y + 10, { width, align: 'right' });
}

// records: yetkiden gecmis kayitlar (records() ciktisi). mode 'record' her
// kayda bir sayfa, 'list' tek tablo uretir.
export async function renderTransportPdf(records, { mode = 'record', generatedAt = new Date(), generatedBy = '', subtitle = '' } = {}) {
  const rows = (records || []).map(pdfRecord);
  if (!rows.length) throw Error('PDF için kayıt yok');
  if (mode === 'list') {
    const doc = documentFor('landscape', 'İç Nakliye Kayıtları');
    listPages(doc, rows, subtitle || rows.length + ' kayıt');
    footers(doc, generatedAt, generatedBy);
    return finish(doc);
  }
  const doc = documentFor('portrait', rows.length === 1 ? 'İç Nakliye Kaydı ' + rows[0].id : 'İç Nakliye Kayıtları');
  rows.forEach((r, index) => {
    if (index) doc.addPage();
    recordPage(doc, r);
  });
  footers(doc, generatedAt, generatedBy);
  return finish(doc);
}
