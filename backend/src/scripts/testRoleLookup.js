import 'dotenv/config';
import { getUserRoleByUid } from '../services/userService.js';

const uid = process.argv[2];
console.log('Role:', await getUserRoleByUid(uid));