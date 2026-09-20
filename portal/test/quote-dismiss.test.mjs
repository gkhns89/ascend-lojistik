import test from 'node:test';
import assert from 'node:assert/strict';
import { createTenantStore } from '../tenant-store.mjs';
import { quoteService } from '../quotes.mjs';

const password = 'AscendDemo!2026';
const principal = (store, username) => {
  const session = store.login(username, password);
  return store.principal({ headers: { cookie: 'ascend_sid=' + session.token } });
};

const request = {
  company: 'Istenmeyen Talep', person: 'Kisi', email: 'k@example.com', phone: '555',
  direction: 'İthalat', mode: 'Kara', originCountry: 'Almanya', originCity: 'Berlin',
  originAddress: 'Street 1', destinationCountry: 'Türkiye', destinationCity: 'İstanbul',
  destinationAddress: 'Street 2', goods: 'Parts', packages: '2', gross: '200', net: '180',
  dimensions: '100 x 100 x 100', readyDate: '2099-10-01', incoterm: 'FCA',
};

test('administrators can remove a quote request; staff cannot', async () => {
  const store = await createTenantStore();
  try {
    const quotes = quoteService(store);
    const { id } = quotes.intake(request);
    assert.ok(quotes.list(principal(store, 'yonetici.demo')).some((r) => r.id === id));

    // Operasyon rolu kaldiramaz.
    await assert.rejects(
      async () => quotes.dismiss(principal(store, 'personel.demo'), { id }),
      /Yetkisiz/,
    );
    assert.ok(quotes.list(principal(store, 'yonetici.demo')).some((r) => r.id === id));

    const admin = principal(store, 'yonetici.demo');
    quotes.dismiss(admin, { id });
    assert.equal(quotes.list(admin).some((r) => r.id === id), false);

    // Silinen kayit denetim gunlugunde iz birakir.
    const entries = store.database.db
      .prepare("SELECT detail FROM audit WHERE action='quote.dismissed'")
      .all()
      .map((row) => JSON.parse(row.detail));
    assert.ok(entries.some((e) => e.id === id && e.company === request.company));
  } finally {
    store.close();
  }
});

test('removing an unknown request fails and an empty id is refused', async () => {
  const store = await createTenantStore();
  try {
    const quotes = quoteService(store);
    const admin = principal(store, 'yonetici.demo');
    await assert.rejects(async () => quotes.dismiss(admin, { id: 'TEK-YOK' }), /bulunamadı/);
    await assert.rejects(async () => quotes.dismiss(admin, {}), /kimliği gerekli/);
  } finally {
    store.close();
  }
});
