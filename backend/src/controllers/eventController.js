const { Event, User, Notification } = require('../models');
const { Op } = require('sequelize');

// @desc    Create event (admin only)
// @route   POST /api/events/create
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, category, maxAttendees } = req.body;

    // Get user's college
    const user = await User.findByPk(req.user.id);

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      category: category || 'other',
      maxAttendees,
      createdBy: req.user.id,
      collegeId: user.collegeId,
      attendees: []
    });

    // Notify all students (find users with role 'user' or student)
    const students = await User.findAll({
      where: {
        role: 'user',
        status: 'active'
      },
      attributes: ['id']
    });

    // Create notifications
    const notifications = students.map(student => ({
      userId: student.id,
      senderId: req.user.id,
      type: 'event',
      title: 'New Event Created',
      message: `${title} on ${new Date(date).toLocaleDateString()}`,
      data: { eventId: event.id }
    }));

    await Notification.bulkCreate(notifications);

    // Emit socket events for real-time notifications (if socket is set up)
    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      students.forEach(student => {
        io.to(`user:${student.id}`).emit('new-notification', {
          type: 'EVENT',
          title: 'New Event',
          message: title
        });
      });
    } catch (socketError) {
      console.log('Socket not available for notifications');
    }

    // Fetch created event with creator details
    const createdEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        }
      ]
    });

    res.status(201).json({
      success: true,
      event: createdEvent
    });
  } catch (error) {
    console.error('❌ Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const { category, upcoming } = req.query;
    let whereClause = { isDeleted: false, isActive: true };

    if (category) {
      whereClause.category = category;
    }

    if (upcoming === 'true') {
      whereClause.date = { [Op.gte]: new Date() };
    }

    // Get user's college
    const user = await User.findByPk(req.user.id);
    
    // Filter by college
    whereClause.collegeId = user.collegeId;

    const events = await Event.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        }
      ],
      order: [['date', 'ASC']]
    });

    // Add attendance status
    const eventsWithStatus = events.map(event => {
      const eventData = event.toJSON();
      eventData.isAttending = event.attendees?.includes(req.user.id) || false;
      return eventData;
    });

    res.json({
      success: true,
      events: eventsWithStatus
    });
  } catch (error) {
    console.error('❌ Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get events'
    });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        }
      ]
    });

    if (!event || event.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const eventData = event.toJSON();
    eventData.isAttending = event.attendees?.includes(req.user.id) || false;

    res.json({
      success: true,
      event: eventData
    });
  } catch (error) {
    console.error('❌ Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event'
    });
  }
};

// @desc    Attend event
// @route   POST /api/events/:id/attend
// @access  Private
const attendEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event || event.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const attendees = event.attendees || [];
    const isAttending = attendees.includes(req.user.id);

    if (isAttending) {
      // Cancel attendance
      event.attendees = attendees.filter(id => id !== req.user.id);
      event.attendeesCount = event.attendees.length;
      await event.save();

      res.json({
        success: true,
        message: 'Attendance cancelled',
        isAttending: false
      });
    } else {
      // Check max attendees
      if (event.maxAttendees && event.attendeesCount >= event.maxAttendees) {
        return res.status(400).json({
          success: false,
          message: 'Event is full'
        });
      }

      // Add attendance
      event.attendees = [...attendees, req.user.id];
      event.attendeesCount = event.attendees.length;
      await event.save();

      res.json({
        success: true,
        message: 'You are now attending this event',
        isAttending: true
      });
    }
  } catch (error) {
    console.error('❌ Attend event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to attend event'
    });
  }
};

// @desc    Update event (admin only)
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event || event.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update fields
    const { title, description, date, venue, category, maxAttendees, isActive } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (venue) event.venue = venue;
    if (category) event.category = category;
    if (maxAttendees !== undefined) event.maxAttendees = maxAttendees;
    if (isActive !== undefined) event.isActive = isActive;

    await event.save();

    // Notify attendees about update
    const attendees = event.attendees || [];
    if (attendees.length > 0) {
      const notifications = attendees.map(attendeeId => ({
        userId: attendeeId,
        senderId: req.user.id,
        type: 'event',
        title: 'Event Updated',
        message: `${event.title} has been updated`,
        data: { eventId: event.id }
      }));

      await Notification.bulkCreate(notifications);
    }

    // Fetch updated event with creator details
    const updatedEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        }
      ]
    });

    res.json({
      success: true,
      event: updatedEvent
    });
  } catch (error) {
    console.error('❌ Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
};

// @desc    Delete event (admin only)
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event || event.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.isDeleted = true;
    await event.save();

    // Notify attendees about cancellation
    const attendees = event.attendees || [];
    if (attendees.length > 0) {
      const notifications = attendees.map(attendeeId => ({
        userId: attendeeId,
        senderId: req.user.id,
        type: 'event',
        title: 'Event Cancelled',
        message: `${event.title} has been cancelled`,
        data: { eventId: event.id }
      }));

      await Notification.bulkCreate(notifications);
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  attendEvent,
  updateEvent,
  deleteEvent
};