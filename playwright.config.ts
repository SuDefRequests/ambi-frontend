import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',fullyParallel:true,workers:2,timeout:30000,use:{baseURL:process.env.KIOSK_URL||'http://localhost:3001',headless:true,viewport:{width:1920,height:1080}},reporter:'list'});
