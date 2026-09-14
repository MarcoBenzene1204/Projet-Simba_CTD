# Reporting et assistance : TODO backend

Le frontend ne branche pas encore de faux appels pour le reporting, l'analyse IA ou le chatbot. Les controllers backend actuels n'exposent pas ces contrats.

Endpoints à concevoir côté backend avant intégration :

- `GET /api/reporting/dashboard`
- `GET /api/reporting/usage`
- `GET /api/reporting/anomalies`
- `GET /api/reporting/workflows`
- `POST /api/reporting/ai-analysis`
- `POST /api/assistant/chat`

Contraintes à respecter :

- filtrage par collectivité côté backend ;
- permissions explicites pour chaque indicateur ;
- aucune clé LLM dans le frontend ;
- validation du périmètre métier des messages assistant ;
- réponses structurées et versionnées avant création des types TypeScript.