import { exec } from 'child_process';

exec('node server/index.js')

export default {
  '/api/': {
    target: 'http://localhost:3000',
  }
}
