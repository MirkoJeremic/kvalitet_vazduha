import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base: './' -> relativne putanje, pa build radi i na
// korisnik.github.io/naziv-repozitorijuma/ bez dodatnih podešavanja.
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
})
