# Toys of the World — starter backend

This is the database-backed foundation for the app.

## What's included
- prisma/schema.prisma — the database schema
- pages/api/toys/index.js — browse published toys, submit new ones (pending review)
- pages/api/toys/moderate.js — approve/reject a pending submission
- pages/index.js — homepage showing published toys

## Before this goes live to the public
- Add real authentication
- Add image upload
- Port the approved visual design into React components
- Multi-language toy content
- Stripe subscriptions for the paid tier
