const express = require('express');
const auth = require('../middleware/auth');
const Room = require('../models/Room');

const router = express.Router();

// Apply authentication to all room routes
router.use(auth);

// Create room
router.post('/create', async (req, res) => {
  try {
    const { name, type = 'private', participants = [] } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROOM_NAME',
          message: 'Room name is required'
        }
      });
    }

    // Add creator to participants
    const allParticipants = [req.user.userId, ...participants.filter(p => p !== req.user.userId)];

    const room = new Room({
      name: name.trim(),
      type,
      participants: allParticipants,
      createdBy: req.user.userId,
      admins: [req.user.userId]
    });

    await room.save();

    res.status(201).json({
      success: true,
      data: {
        roomId: room._id,
        name: room.name,
        type: room.type,
        participants: room.participants,
        createdBy: room.createdBy,
        createdAt: room.createdAt
      }
    });

  } catch (error) {
    console.error('Room creation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ROOM_CREATION_ERROR',
        message: 'Failed to create room'
      }
    });
  }
});

// Get user rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({
      participants: req.user.userId,
      isActive: true
    }).select('name type participants createdBy createdAt lastActivity');

    res.json({
      success: true,
      data: rooms
    });

  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_ROOMS_ERROR',
        message: 'Failed to get rooms'
      }
    });
  }
});

// Join room
router.post('/:roomId/join', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found'
        }
      });
    }

    if (room.participants.includes(req.user.userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_PARTICIPANT',
          message: 'User is already a participant'
        }
      });
    }

    room.participants.push(req.user.userId);
    await room.save();

    res.json({
      success: true,
      data: {
        message: 'Successfully joined room',
        roomId: room._id,
        participants: room.participants
      }
    });

  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'JOIN_ROOM_ERROR',
        message: 'Failed to join room'
      }
    });
  }
});

// Leave room
router.post('/:roomId/leave', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found'
        }
      });
    }

    if (!room.participants.includes(req.user.userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_PARTICIPANT',
          message: 'User is not a participant'
        }
      });
    }

    room.participants = room.participants.filter(p => p.toString() !== req.user.userId);
    room.admins = room.admins.filter(a => a.toString() !== req.user.userId);

    // Deactivate room if no participants left
    if (room.participants.length === 0) {
      room.isActive = false;
    }

    await room.save();

    res.json({
      success: true,
      data: {
        message: 'Successfully left room',
        roomId: room._id
      }
    });

  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LEAVE_ROOM_ERROR',
        message: 'Failed to leave room'
      }
    });
  }
});

// Add participant (admin only)
router.post('/:roomId/participants', async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found'
        }
      });
    }

    if (!room.admins.includes(req.user.userId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only room admins can add participants'
        }
      });
    }

    if (room.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_PARTICIPANT',
          message: 'User is already a participant'
        }
      });
    }

    room.participants.push(userId);
    await room.save();

    res.json({
      success: true,
      data: {
        message: 'Participant added successfully',
        participants: room.participants
      }
    });

  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ADD_PARTICIPANT_ERROR',
        message: 'Failed to add participant'
      }
    });
  }
});

// Remove participant (admin only)
router.delete('/:roomId/participants/:userId', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ROOM_NOT_FOUND',
          message: 'Room not found'
        }
      });
    }

    if (!room.admins.includes(req.user.userId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only room admins can remove participants'
        }
      });
    }

    room.participants = room.participants.filter(p => p.toString() !== req.params.userId);
    room.admins = room.admins.filter(a => a.toString() !== req.params.userId);

    await room.save();

    res.json({
      success: true,
      data: {
        message: 'Participant removed successfully',
        participants: room.participants
      }
    });

  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REMOVE_PARTICIPANT_ERROR',
        message: 'Failed to remove participant'
      }
    });
  }
});

module.exports = router;