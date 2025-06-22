import { defineNitroPlugin } from 'nitropack/runtime/plugin';
import { initScheduler, fetchAndSave } from '../services/scheduler.service';

export default defineNitroPlugin(() => {
  initScheduler();
  fetchAndSave(); 
});