import { defineConfig } from "cypress";
import * as settings from './test-settings.json';

var browser = "";
import axios from 'axios';

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {

            on('before:run', async (details) => {
                browser = details.browser.displayName;
            });

            on('task', {
                log(message) {
                  console.log(message)
                  return null
                }
            });
        }
    }
})
