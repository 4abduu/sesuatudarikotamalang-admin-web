import { formatMonthId, formatPercent, variantText } from "@/lib/format-operasional";
import { formatRupiah } from "@/lib/format";
import type { CreatorMonthlyReport } from "@/lib/types-operasional";

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Membuka jendela baru berisi laporan satu kreator dan memanggil dialog cetak browser
 * (pilih "Simpan sebagai PDF" untuk menyimpan). Semua nilai di-escape sebelum masuk HTML.
 */
export function printCreatorReport(month: string, status: "draf" | "final", c: CreatorMonthlyReport): void {
  const salesRows = c.sales
    .map(
      (s) =>
        `<tr><td>${esc(s.productName)}<br><small>${esc(variantText(s.variantLabel))}</small></td>` +
        `<td class="r">${esc(s.quantity)}</td><td class="r">${esc(formatRupiah(s.price))}</td>` +
        `<td class="r">${esc(formatRupiah(s.revenue))}</td></tr>`
    )
    .join("");
  const stockRows = c.stock
    .map(
      (s) =>
        `<tr><td>${esc(s.productName)}<br><small>${esc(variantText(s.variantLabel))}</small></td>` +
        `<td class="r">${esc(s.stock)}</td></tr>`
    )
    .join("");

  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8">
<title>Laporan ${esc(formatMonthId(month))} - ${esc(c.brandName)}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#2b211a;margin:32px;font-size:13px}
  h1{font-size:20px;margin:0 0 4px} h2{font-size:15px;margin:24px 0 8px}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid #d8cbb2;padding:6px 8px;text-align:left;vertical-align:top}
  th{background:#f2e8d5} .r{text-align:right} small{color:#7a6a5a}
  .meta{color:#7a6a5a;margin-bottom:16px} .box{display:flex;gap:16px;flex-wrap:wrap;margin:12px 0}
  .card{border:1px solid #d8cbb2;border-radius:8px;padding:10px 14px;min-width:150px}
  .card b{display:block;font-size:16px;margin-top:2px} .note{margin-top:20px;color:#7a6a5a;font-size:12px}
  .draft{color:#b5502f;font-weight:bold}
</style></head><body>
<h1>Laporan Bulanan ${esc(formatMonthId(month))}</h1>
<div class="meta">Kreator: <b>${esc(c.brandName)}</b> &middot; Status: <span class="${status === "draf" ? "draft" : ""}">${esc(status === "final" ? "Final" : "Draf (belum final)")}</span></div>
<div class="box">
  <div class="card">Barang terjual<b>${esc(c.itemsSold)} pcs</b></div>
  <div class="card">Omzet<b>${esc(formatRupiah(c.revenue))}</b></div>
  <div class="card">Bagian kreator (${esc(formatPercent(c.sharePercent))})<b>${esc(formatRupiah(c.creatorShare))}</b></div>
  <div class="card">Bagian toko<b>${esc(formatRupiah(c.storeShare))}</b></div>
</div>
<h2>Penjualan</h2>
<table><thead><tr><th>Produk</th><th class="r">Jumlah</th><th class="r">Harga</th><th class="r">Omzet</th></tr></thead>
<tbody>${salesRows || '<tr><td colspan="4">Tidak ada penjualan pada bulan ini.</td></tr>'}</tbody></table>
<h2>Sisa stok</h2>
<table><thead><tr><th>Produk</th><th class="r">Stok</th></tr></thead>
<tbody>${stockRows || '<tr><td colspan="2">Tidak ada data stok.</td></tr>'}</tbody></table>
<p class="note">Laporan hanya mencakup penjualan lewat aplikasi. Penjualan di kasir tidak termasuk.</p>
<script>window.onload=function(){window.print();}</script>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

