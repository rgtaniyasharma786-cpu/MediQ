import Queue from '../models/queue.model.js';
import Doctor from '../models/doctor.model.js';


export const getPatientPerDay = async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const data = await Promise.all(days.map(async (day) => {
      const [total, emergency, completed] = await Promise.all([
        Queue.countDocuments({ date: day, status: { $ne: 'cancelled' } }),
        Queue.countDocuments({ date: day, isEmergency: true, status: { $ne: 'cancelled' } }),
        Queue.countDocuments({ date: day, status: 'completed' }),
      ]);
      return { date: day.slice(5), total, emergency, completed };
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const getAverageWaitTime = async (req, res) => {
  try {
    const completed = await Queue.find({
      status: 'completed',
      calledAt: { $exists: true },
    }).select('appointedAt calledAt completedAt');

    const len = completed.length || 1;

    const avgWait = completed.reduce((acc, q) => {
      if (q.calledAt && q.appointedAt) {
        return acc + (new Date(q.calledAt) - new Date(q.appointedAt)) / 60000;
      }
      return acc;
    }, 0) / len;

    const avgConsult = completed.reduce((acc, q) => {
      if (q.completedAt && q.calledAt) {
        return acc + (new Date(q.completedAt) - new Date(q.calledAt)) / 60000;
      }
      return acc;
    }, 0) / len;

    res.json({
      avgWaitMinutes: Math.max(0, Math.round(avgWait)),
      avgConsultMinutes: Math.max(0, Math.round(avgConsult)),
      totalCompleted: completed.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const getStatusDistribution = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [waiting, ongoing, completed, cancelled, emergency] = await Promise.all([
      Queue.countDocuments({ date: today, status: 'waiting' }),
      Queue.countDocuments({ date: today, status: 'ongoing' }),
      Queue.countDocuments({ date: today, status: 'completed' }),
      Queue.countDocuments({ date: today, status: 'cancelled' }),
      Queue.countDocuments({ date: today, isEmergency: true }),
    ]);
    res.json({ waiting, ongoing, completed, cancelled, emergency });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const getPatientBySpecialization =  async (req, res) => {
  try {
    // Use MongoDB aggregation to avoid N+1 queries
    const result = await Queue.aggregate([
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorData',
        },
      },
      { $unwind: '$doctorData' },
      {
        $group: {
          _id: '$doctorData.specialization',
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: 1,
        },
      },
      { $sort: { value: -1 } },
    ]);

    // If no queue data yet, return doctors with 0 counts
    if (result.length === 0) {
      const doctors = await Doctor.find().select('specialization');
      const grouped = doctors.reduce((acc, d) => {
        acc[d.specialization] = (acc[d.specialization] || 0);
        return acc;
      }, {});
      return res.json(
        Object.entries(grouped).map(([name, value]) => ({ name, value }))
      );
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}