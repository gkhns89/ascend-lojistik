# React Faz 5: monorepo

- **Öncelik:** Düşük
- **Kim:** karar
- **Boyut:** büyük
- **Kaynak:** hafıza `portal-rewrite-plan.md`

## Karar

Site ve portal `apps/site`, `apps/portal` altında tek çalışma alanına
taşınsın mı? Bugün `packages/ui/tokens.css` iki taraf arasında paylaşılıyor ve
bu yeterli. Taşımanın getirisi ancak daha fazla ortak bileşen olursa doğar.
