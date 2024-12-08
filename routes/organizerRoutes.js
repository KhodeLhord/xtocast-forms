import express from 'express';
import { getOrganizerWithFormByUuid, updateStatusByUuid } from '../controllers/organizerController.js';

const router = express.Router();

// Route to get an organizer by UUID
router.get('/organizer/:uuid', getOrganizerWithFormByUuid);

// Route to update the status of an organizer by UUID
router.put('/organizer/:uuid/status', updateStatusByUuid);


export default router;
