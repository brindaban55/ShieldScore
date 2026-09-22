# ShieldScore — Zero-Knowledge Proving Architecture & Production Deployment

## The Role of the Proof Server
Zero-knowledge SNARK proof generation requires computing intensive polynomial arithmetic and Fast Fourier Transforms (FFTs) across elliptic curve groups.

### Local Development vs Production Vercel Deployment

| Environment | How Proving Works | Do Users Need Docker? |
| :--- | :--- | :---: |
| **Local Development** | Docker container (`midnightntwrk/proof-server:latest`) runs on `http://localhost:6300` | Only the developer running local scripts |
| **Production Vercel** | Frontend deployed to Vercel connects to a hosted prover instance (e.g. Railway or Fly.io) or client-side wallet | **NO** — Regular users never run Docker |

## Production Deployment on Vercel
1. Build command: `npm run build --prefix frontend`
2. Output directory: `frontend/dist`
3. Environment variables:
   - `VITE_INDEXER_URL=https://indexer.preview.midnight.network/api/v4/graphql`
   - `VITE_NODE_URL=https://rpc.preview.midnight.network`
   - `VITE_PROOF_SERVER=https://prover.shieldscore.fi`
