# Deployment Guide

This guide covers how to deploy the Habit Tracker app to production environments.

## Deployment Options

### Option 1: Expo Application Services (EAS) - Recommended

EAS is the official Expo deployment platform for React Native apps.

#### Prerequisites
- Expo account (sign up at expo.dev)
- EAS CLI installed globally

#### Setup EAS
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Initialize EAS in your project
eas build:configure
```

#### Build for Production
```bash
# Build for both platforms
eas build --platform all

# Build for specific platform
eas build --platform ios
eas build --platform android
```

#### Submit to App Stores
```bash
# Submit to both stores
eas submit --platform all

# Submit to specific store
eas submit --platform ios
eas submit --platform android
```

### Option 2: Docker Production Deployment

For web deployment or custom hosting solutions.

#### Production Dockerfile
Create a separate production Dockerfile:

```dockerfile
# Production Dockerfile (Dockerfile.prod)
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Build and Deploy
```bash
# Build production image
docker build -f Dockerfile.prod -t habit-tracker-prod .

# Run production container
docker run -p 80:80 habit-tracker-prod
```

### Option 3: Cloud Platform Deployment

#### Vercel (Web)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create habit-tracker-app

# Deploy
git push heroku main
```

## Backend Deployment (Convex)

### Production Convex Setup
```bash
# Deploy to production
npx convex deploy

# Set production environment variables
npx convex env set VARIABLE_NAME value
```

### Environment Configuration
1. Create production Convex project
2. Update environment variables
3. Configure authentication (if using)
4. Set up monitoring

## Pre-Deployment Checklist

### Code Quality
- [ ] Run tests: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] No console errors or warnings

### Configuration
- [ ] Update app version in `app.json`
- [ ] Configure production API endpoints
- [ ] Set up environment variables
- [ ] Update app icons and splash screens

### Backend
- [ ] Deploy Convex to production
- [ ] Verify database schema
- [ ] Test API endpoints
- [ ] Configure authentication

### App Store Requirements

#### iOS (App Store)
- [ ] Apple Developer account ($99/year)
- [ ] App Store screenshots
- [ ] Privacy policy
- [ ] App description and keywords
- [ ] Proper app icons (all sizes)

#### Android (Google Play)
- [ ] Google Play Console account ($25 one-time)
- [ ] Signed APK/AAB
- [ ] Store listing assets
- [ ] Content rating
- [ ] Privacy policy

## Environment Variables

Create production environment variables:

```bash
# Convex
CONVEX_DEPLOYMENT=prod:your-production-deployment-id

# App Configuration
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://your-production-api.com
```

## Monitoring and Analytics

### Expo Analytics
```bash
# Enable Expo analytics
expo install expo-analytics
```

### Error Tracking
Consider integrating:
- Sentry for error tracking
- Amplitude or Mixpanel for user analytics
- Firebase Analytics

## Performance Optimization

### Bundle Size
```bash
# Analyze bundle size
npx expo customize metro.config.js

# Enable tree shaking and minification
```

### Image Optimization
- Use `expo-image` for better performance
- Optimize asset sizes
- Use appropriate image formats (WebP, AVIF)

## Security Considerations

- [ ] Secure API endpoints
- [ ] Implement proper authentication
- [ ] Validate user inputs
- [ ] Use HTTPS for all communications
- [ ] Regular dependency updates

## Continuous Integration/Deployment

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: eas build --platform all --non-interactive
```

## Rollback Strategy

### EAS Rollback
```bash
# List previous builds
eas build:list

# Promote previous build
eas build:resign --build-id [BUILD_ID]
```

### Docker Rollback
```bash
# Tag previous working version
docker tag habit-tracker-prod:latest habit-tracker-prod:rollback

# Deploy previous version
docker run -p 80:80 habit-tracker-prod:rollback
```

## Post-Deployment

1. **Verify Functionality**
   - Test core features
   - Check analytics
   - Monitor error rates

2. **User Communication**
   - Update app store descriptions
   - Notify users of new features
   - Gather feedback

3. **Monitoring**
   - Set up alerts
   - Monitor performance metrics
   - Track user adoption

## Support and Maintenance

- Regular updates for dependencies
- Monitor app store reviews
- Respond to user feedback
- Plan feature updates
- Security patch management

For more detailed information, refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [Convex Documentation](https://docs.convex.dev/)
- [React Native Documentation](https://reactnative.dev/)