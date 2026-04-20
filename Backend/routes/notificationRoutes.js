const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAsUnread,
  markAllRead,
  clearAll
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/:id/unread', markAsUnread);
router.patch('/read-all', markAllRead);
router.delete('/', clearAll);

module.exports = router;
