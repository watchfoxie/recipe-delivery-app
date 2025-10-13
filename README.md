# Recipe Delivery App

![Fluxul rețetelor culinare](https://i.imgur.com/qtUPnav.png "Rețete culinare")

**Recipe Delivery App** este o aplicație web full-stack pentru livrarea rețetelor adaptate unei game largi de gusturi culinare, preferințe alimentare și niveluri de experiență. Aplicația va oferi utilizatorilor instrucțiuni pas cu pas pentru gătit. De asemenea, va include conturi de utilizator, evaluarea rețetelor și funcționalitate de partajare socială.

Proiectul _Recipe Delivery App_ folosește [Nx](https://nx.dev) pentru a orchestra aplicațiile `api` (NestJS) și `web`, împreună cu testele end-to-end `api-e2e`. Secțiunile de mai jos descriu rulările recomandate și modul în care puteți folosi mecanismul `affected` și graful de dependențe pentru a rula doar ceea ce s-a modificat.

## Rulări Nx recomandate

- `nx build @recipe-delivery-app/api` – construiește API-ul NestJS cu Webpack și copiază activele (i18n, assets) în `apps/api/dist`.
- `nx serve @recipe-delivery-app/api` – pornește API-ul pentru dezvoltare; include `db:migration:run` înainte de start.
- `nx test @recipe-delivery-app/api` – execută testele unitare Jest ale API-ului.
- `nx e2e @recipe-delivery-app/api-e2e` – rulează testele contractuale Jest; declanșează `prepare:e2e`, iar apoi așteaptă instanța NestJS disponibilă.
- `nx run @recipe-delivery-app/api:prepare:e2e` – pregătește baza de date (migrații + seed) pentru rulările e2e.
- `nx run @recipe-delivery-app/api:db:migration:run` / `...:revert` / `...:generate -- --name=<Name>` / `...:seed` – comenzi utilitare pentru migrații și seed.
- `nx run @recipe-delivery-app/api-e2e:e2e:ci` – țintă agregată pentru pipeline (build + pregătire DB + e2e).

## Analiză a schimbărilor (`affected`)

Folosește `affected` pentru a executa doar țintele afectate de modificări:

```powershell
nx affected -t build,test,e2e
```

Puteți explora graful proiectelor cu:

```powershell
nx graph
```

## Beneficiile Nx Cloud

Workspace-ul este conectat la Nx Cloud (`nxCloudId` setat în `nx.json`), permițând cache distribuit și Distributed Task Execution (DTE). Atunci când rulați comenzile de mai sus local sau în CI, rezultatele sunt memorate și re-folosite pentru execuțiile ulterioare, reducând substanțial timpul total de feedback.

## Resurse suplimentare

- [Documentația Nx](https://nx.dev)
- [Nx Console (VS Code / JetBrains)](https://nx.dev/getting-started/editor-setup)
- [Ghiduri pentru integrarea în CI](https://nx.dev/ci)
