# Eagle Vision Capital Systems — V63 Prime49 Payout Calculator

This build keeps the approved Prime49 page design and replaces the prior volume-only preparation tool with a live Eagle Vision Prime49 payout calculator.

## Calculator schedule
- Minimum monthly processing volume: **$15,000**
- Slider increments: **$5,000**
- Estimated payout: **$20 per month for each $5,000 in qualifying monthly processing volume**
- Examples:
  - $15,000 monthly volume → $60 monthly payout → $720 annual payout
  - $20,000 monthly volume → $80 monthly payout → $960 annual payout
  - $25,000 monthly volume → $100 monthly payout → $1,200 annual payout

## Live values updated together
As the merchant moves the slider, the page updates:
- average monthly card volume
- annual card volume
- estimated monthly Prime49 payout
- estimated annual Prime49 payout
- the right-side payout summary
- the hero statement preview
- hidden values submitted with the Prime49 review form

## Route
`https://eaglevision.biz/prime49/`

## Deployment
Upload the entire contents of this package to Netlify as the next complete site deploy. The Prime49 CSS and JavaScript links include a V63 cache-busting query so returning visitors receive the updated calculator immediately.
