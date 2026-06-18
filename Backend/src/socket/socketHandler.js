export default (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join rooms based on role
    socket.on('joinDoctorRoom', (doctorId) => {
      socket.join(`doctor_${doctorId}`);
      console.log(`Doctor joined room: doctor_${doctorId}`);
    });

    socket.on('joinQueueRoom', ({ doctorId, date }) => {
      const room = `queue_${doctorId}_${date}`;
      socket.join(room);
      console.log(`Client joined queue room: ${room}`);
    });

    socket.on('joinPatientRoom', (patientId) => {
      socket.join(`patient_${patientId}`);
      console.log(`Patient joined room: patient_${patientId}`);
    });

    socket.on('joinAdminRoom', () => {
      socket.join('admin');
      console.log('Admin joined admin room');
    });

    // Doctor updates
    socket.on('callNext', (data) => {
      io.to(`queue_${data.doctorId}_${data.date}`).emit('tokenCalled', data);
    });

    socket.on('updateTokenStatus', (data) => {
      io.to(`queue_${data.doctorId}_${data.date}`).emit('statusUpdated', data);
      io.to('admin').emit('queueUpdate', data);
    });

    socket.on('emergencyAlert', (data) => {
      io.to(`doctor_${data.doctorId}`).emit('emergencyAlert', data);
      io.to('admin').emit('emergencyAlert', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};
