export PATH=$PATH:/Users/anshulyadav/.local/bin

echo "Starting Render CLI deployment..."

# Set the workspace context
render workspace set tea-d7fmmbosfn5c73d5606g

# Make sure to replace these placeholder strings with the credentials from your .env file!
render services create \
  --name "aydigital-backend" \
  --type "web_service" \
  --repo "https://github.com/anshulyadav32/website-aydigitalinstitute-react" \
  --branch "master" \
  --root-directory "backend" \
  --runtime "node" \
  --build-command "npm install" \
  --start-command "npm start" \
  --plan "free" \
  --env-var "NODE_ENV=production" \
  --env-var "FRONTEND_URL=https://website-aydigitalinstitute-react.vercel.app" \
  --env-var "DB_HOST=db.zsbpizbxgrcokxlkogja.supabase.co" \
  --env-var "DB_PORT=5432" \
  --env-var "DB_NAME=postgres" \
  --env-var "DB_USER=postgres" \
  --env-var "DB_PASSWORD=SuperSecurePass123!" \
  --env-var "DB_SSL=true" \
  --env-var "SUPABASE_URL=https://zsbpizbxgrcokxlkogja.supabase.co" \
  --env-var "SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY" \
  --env-var "SUPABASE_BUCKET=aydigital" \
  --output interactive
