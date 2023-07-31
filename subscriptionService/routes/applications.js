var express = require('express');
var router = express.Router();
var SubscriptionController = require('../controllers/SubscriptionController.js');

router.patch('/:applicationId/webhooks', SubscriptionController.create);
router.delete('/:applicationId/webhooks/:uri', SubscriptionController.delete);
router.get('/:applicationId/webhooks', SubscriptionController.getStatuses);

module.exports = router;