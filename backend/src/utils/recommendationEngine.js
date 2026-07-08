const User = require('../models/User');

const getRecommendations = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return [];
    }

    // Find users with same branch, year, or skills
    const recommendations = await User.aggregate([
      {
        $match: {
          _id: { $ne: user._id },
          isActive: true,
          role: 'student',
          blockedUsers: { $nin: [user._id] }
        }
      },
      {
        $addFields: {
          score: {
            $add: [
              { $cond: [{ $eq: ['$profile.branch', user.profile.branch] }, 3, 0] },
              { $cond: [{ $eq: ['$profile.year', user.profile.year] }, 2, 0] },
              {
                $multiply: [
                  {
                    $size: {
                      $setIntersection: [
                        '$profile.skills',
                        user.profile.skills
                      ]
                    }
                  },
                  1
                ]
              },
              {
                $multiply: [
                  {
                    $size: {
                      $setIntersection: [
                        '$profile.hobbies',
                        user.profile.hobbies
                      ]
                    }
                  },
                  1
                ]
              }
            ]
          }
        }
      },
      {
        $sort: { score: -1, createdAt: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          password: 0,
          __v: 0,
          blockedUsers: 0,
          isEmailVerified: 0
        }
      }
    ]);

    return recommendations;
  } catch (error) {
    console.error('Recommendation engine error:', error);
    return [];
  }
};

module.exports = { getRecommendations };