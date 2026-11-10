# Kilitlenen yönetici için kurtarma

- **Commit:** `16f9c59`

`PORTAL_RECOVERY=true` verilince açılışta tek aktif yöneticiye 15 dakikalık
sıfırlama belirteci üretilir ve dağıtım günlüğüne yazılır. Yeni parola
`control-center.html` üzerinden belirlenir. İş bitince değişken silinmeli;
23 Eylül'de silindiği doğrulandı.
