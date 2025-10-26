# Backend (Node.js + TypeScript + Express + Prisma + Google Vision)

## Local (Docker Compose)
```bash
docker-compose up --build
```
> Put your Google service account JSON beside `docker-compose.yml` as `service-account.json` (file is volume-mounted into the container).

## Environment
- `DATABASE_URL` e.g. `postgresql://postgres:password@db:5432/visiondb`
- `GOOGLE_APPLICATION_CREDENTIALS` is already `/app/service-account.json` inside container.
- `PORT` default 8080

## Cloud Run
1. Build image:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/vision-backend
```
2. Deploy (example):
```bash
gcloud run deploy vision-backend   --image gcr.io/PROJECT_ID/vision-backend   --region asia-east1 --platform managed   --set-env-vars PORT=8080,DATABASE_URL=YOUR_CLOUDSQL_CONNSTRING   --allow-unauthenticated
```
3. Prefer using **Workload Identity** or **Secret Manager** for service account credential rather than baking JSON in image.
```bash
# If you must provide a key file:
gcloud run services update vision-backend   --add-cloudsql-instances=PROJECT:REGION:INSTANCE   --set-env-vars GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json
```
